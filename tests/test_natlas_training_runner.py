import json
from types import SimpleNamespace

import pytest

torch = pytest.importorskip("torch")

from api.schemas.experiment import TrainingConfig
from foundry.training.runner import evaluate_loss, train_model


class TinyTrainableModel(torch.nn.Module):
    """Small differentiable model for runner unit tests."""

    def __init__(self):
        super().__init__()
        self.linear = torch.nn.Linear(1, 1)

    def forward(self, input_ids, attention_mask=None, labels=None):
        predictions = self.linear(
            input_ids.float().unsqueeze(-1)
        ).squeeze(-1)

        targets = labels.float()
        valid = targets.ne(-100)
        safe_targets = targets.masked_fill(~valid, 0.0)

        loss = (
            ((predictions - safe_targets) ** 2 * valid).sum()
            / valid.sum().clamp_min(1)
        )
        return SimpleNamespace(loss=loss)

    def save_pretrained(self, path):
        from pathlib import Path

        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        torch.save(self.state_dict(), path / "adapter_state.pt")


def make_batch(x, y):
    return {
        "input_ids": torch.tensor([[x]], dtype=torch.long),
        "attention_mask": torch.tensor([[1]], dtype=torch.long),
        "labels": torch.tensor([[y]], dtype=torch.long),
    }


def parameters_changed(before, model):
    return any(
        not torch.equal(old, new.detach())
        for old, new in zip(before, model.parameters())
    )


def test_training_updates_parameters_and_saves_artifacts(tmp_path):
    model = TinyTrainableModel()
    initial_parameters = [
        parameter.detach().clone() for parameter in model.parameters()
    ]

    batches = [
        make_batch(1, 2),
        make_batch(2, 4),
        make_batch(3, 6),
    ]

    result = train_model(
        model=model,
        train_dataloader=batches,
        validation_dataloader=batches,
        config=TrainingConfig(
            epochs=2,
            learning_rate=0.01,
            gradient_accumulation_steps=2,
            warmup_ratio=0.25,
        ),
        output_dir=tmp_path,
    )

    # Three batches per epoch and accumulation of two means two updates/epoch.
    assert result["epochs_completed"] == 2
    assert result["optimizer_steps"] == 4
    assert result["total_optimizer_steps"] == 4
    assert result["warmup_steps"] == 1
    assert parameters_changed(initial_parameters, model)

    assert (tmp_path / "best_adapter" / "adapter_state.pt").exists()
    assert (tmp_path / "training_config.json").exists()
    assert (tmp_path / "training_metrics.json").exists()

    metrics = json.loads(
        (tmp_path / "training_metrics.json").read_text(encoding="utf-8")
    )
    assert metrics["epochs_completed"] == 2
    assert len(metrics["history"]) == 2
    assert "learning_rate" in metrics["history"][0]


def test_training_streams_batches_instead_of_materializing_them(tmp_path):
    model = TinyTrainableModel()
    initial_parameters = [
        parameter.detach().clone() for parameter in model.parameters()
    ]

    class StreamingBatches:
        def __len__(self):
            return 2

        def __iter__(self):
            yield make_batch(1, 10)

            # With accumulation=1, the first optimizer update must already
            # have happened before the second batch is requested.
            assert parameters_changed(initial_parameters, model)

            yield make_batch(2, 20)

    train_model(
        model=model,
        train_dataloader=StreamingBatches(),
        validation_dataloader=[make_batch(1, 10)],
        config=TrainingConfig(
            epochs=1,
            learning_rate=0.01,
            gradient_accumulation_steps=1,
        ),
        output_dir=tmp_path,
    )


def test_evaluate_loss_preserves_parameters_gradients_and_mode():
    model = TinyTrainableModel()
    model.train()

    before = [
        parameter.detach().clone() for parameter in model.parameters()
    ]

    loss = evaluate_loss(model, [make_batch(1, 2)])

    assert isinstance(loss, float)
    assert model.training is True
    assert all(
        torch.equal(old, new.detach())
        for old, new in zip(before, model.parameters())
    )
    assert all(parameter.grad is None for parameter in model.parameters())


def test_training_rejects_empty_training_dataloader(tmp_path):
    model = TinyTrainableModel()

    with pytest.raises(ValueError, match="no batches"):
        train_model(
            model=model,
            train_dataloader=[],
            validation_dataloader=[make_batch(1, 2)],
            config=TrainingConfig(epochs=1),
            output_dir=tmp_path,
        )


def test_validation_rejects_empty_dataloader():
    model = TinyTrainableModel()

    with pytest.raises(ValueError, match="no batches"):
        evaluate_loss(model, [])


def test_training_rejects_one_shot_generator(tmp_path):
    model = TinyTrainableModel()

    def batches():
        yield make_batch(1, 2)

    with pytest.raises(ValueError, match="re-iterable"):
        train_model(
            model=model,
            train_dataloader=batches(),
            validation_dataloader=[make_batch(1, 2)],
            config=TrainingConfig(epochs=1),
            output_dir=tmp_path,
        )


def test_training_rejects_batch_without_supervised_labels(tmp_path):
    model = TinyTrainableModel()
    batch = make_batch(1, 2)
    batch["labels"][:] = -100

    with pytest.raises(ValueError, match="no supervised labels"):
        train_model(
            model=model,
            train_dataloader=[batch],
            validation_dataloader=[make_batch(1, 2)],
            config=TrainingConfig(epochs=1),
            output_dir=tmp_path,
        )
