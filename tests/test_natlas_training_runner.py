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
        self.saved_paths = []

    def forward(self, input_ids, attention_mask=None, labels=None):
        predictions = self.linear(input_ids.float().unsqueeze(-1)).squeeze(-1)
        targets = labels.float()
        loss = ((predictions - targets) ** 2).mean()
        return SimpleNamespace(loss=loss)

    def save_pretrained(self, path):
        from pathlib import Path

        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        torch.save(self.state_dict(), path / "adapter_state.pt")
        self.saved_paths.append(str(path))


def make_batch(x, y):
    return {
        "input_ids": torch.tensor([[x]], dtype=torch.long),
        "attention_mask": torch.tensor([[1]], dtype=torch.long),
        "labels": torch.tensor([[y]], dtype=torch.long),
    }


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
        ),
        output_dir=tmp_path,
    )

    assert result["epochs_completed"] == 2
    # Three batches per epoch with accumulation of two means two updates/epoch.
    assert result["optimizer_steps"] == 4
    assert any(
        not torch.equal(before, after.detach())
        for before, after in zip(initial_parameters, model.parameters())
    )
    assert (tmp_path / "best_adapter" / "adapter_state.pt").exists()
    assert (tmp_path / "training_metrics.json").exists()

    metrics = json.loads(
        (tmp_path / "training_metrics.json").read_text(encoding="utf-8")
    )
    assert metrics["epochs_completed"] == 2
    assert len(metrics["history"]) == 2


def test_evaluate_loss_does_not_change_parameters_or_gradients():
    model = TinyTrainableModel()
    model.train()
    before = [p.detach().clone() for p in model.parameters()]

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
