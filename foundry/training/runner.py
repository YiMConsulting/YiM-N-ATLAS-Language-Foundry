"""Training and checkpoint utilities for N-ATLaS adaptation."""

from __future__ import annotations

import json
import math
import random
from pathlib import Path
from typing import Any, Iterable

from api.schemas.experiment import TrainingConfig


def set_training_seed(seed: int) -> None:
    """Set Python and PyTorch random seeds."""
    random.seed(seed)

    try:
        import torch
    except ImportError as exc:
        raise RuntimeError("PyTorch is required for training.") from exc

    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def _model_device(model: Any) -> Any:
    """Return the device of the model's first parameter."""
    try:
        return next(model.parameters()).device
    except (AttributeError, StopIteration):
        raise ValueError("Model must expose at least one parameter.") from None


def _move_batch_to_device(
    batch: dict[str, Any],
    device: Any,
) -> dict[str, Any]:
    """Move tensor-like batch values to the selected device."""
    return {
        key: value.to(device) if hasattr(value, "to") else value
        for key, value in batch.items()
    }


def _supervised_token_count(batch: dict[str, Any]) -> int:
    """Count labels that contribute to the loss."""
    labels = batch.get("labels")
    if labels is None:
        raise ValueError("Every training and validation batch needs labels.")

    count = int((labels != -100).sum().item())
    if count == 0:
        raise ValueError("Batch contains no supervised labels.")

    return count


def _validate_loss(loss: Any) -> float:
    """Validate that the model returned a finite scalar loss."""
    import torch

    if not torch.is_tensor(loss) or loss.numel() != 1:
        raise ValueError("Model must return a scalar tensor loss.")

    value = float(loss.detach().item())
    if not math.isfinite(value):
        raise ValueError(f"Model returned a non-finite loss: {value}")

    return value


def evaluate_loss(
    model: Any,
    dataloader: Iterable[dict[str, Any]],
    *,
    device: Any | None = None,
) -> float:
    """Calculate supervised-token-weighted loss without gradient updates."""
    import torch

    if device is None:
        device = _model_device(model)

    was_training = bool(model.training)
    model.eval()

    weighted_loss = 0.0
    supervised_tokens = 0

    try:
        with torch.no_grad():
            for batch in dataloader:
                if not batch:
                    raise ValueError("Validation batch cannot be empty.")

                token_count = _supervised_token_count(batch)
                inputs = _move_batch_to_device(batch, device)
                outputs = model(**inputs)
                loss_value = _validate_loss(outputs.loss)

                weighted_loss += loss_value * token_count
                supervised_tokens += token_count
    finally:
        model.train(was_training)

    if supervised_tokens == 0:
        raise ValueError("Validation dataloader produced no batches.")

    return weighted_loss / supervised_tokens


def _get_dataloader_length(dataloader: Any) -> int:
    """Require a sized dataloader so accumulation and warmup are predictable."""
    try:
        count = len(dataloader)
    except TypeError as exc:
        raise ValueError(
            "Training dataloader must implement __len__ and be re-iterable."
        ) from exc

    if count <= 0:
        raise ValueError("Training dataloader produced no batches.")

    if iter(dataloader) is dataloader:
        raise ValueError(
            "Training dataloader must be re-iterable across epochs."
        )

    return count


def train_model(
    model: Any,
    train_dataloader: Iterable[dict[str, Any]],
    validation_dataloader: Iterable[dict[str, Any]],
    config: TrainingConfig,
    output_dir: str | Path,
    *,
    optimizer: Any | None = None,
    device: Any | None = None,
) -> dict[str, Any]:
    """Train a model and save the best adapter checkpoint and metrics.

    The training dataloader must be sized and re-iterable, as with a standard
    PyTorch DataLoader. Batches are streamed rather than materialized in memory.
    """
    import torch

    if config.epochs <= 0:
        raise ValueError("epochs must be greater than zero.")
    if config.gradient_accumulation_steps <= 0:
        raise ValueError(
            "gradient_accumulation_steps must be greater than zero."
        )
    if not 0.0 <= config.warmup_ratio < 1.0:
        raise ValueError("warmup_ratio must be in the range [0, 1).")

    if device is None:
        device = _model_device(model)

    set_training_seed(config.seed)

    trainable_parameters = [
        parameter
        for parameter in model.parameters()
        if parameter.requires_grad
    ]
    if not trainable_parameters:
        raise ValueError("Model has no trainable parameters.")

    if optimizer is None:
        optimizer = torch.optim.AdamW(
            trainable_parameters,
            lr=config.learning_rate,
            weight_decay=config.weight_decay,
        )

    batches_per_epoch = _get_dataloader_length(train_dataloader)
    accumulation_steps = config.gradient_accumulation_steps
    optimizer_steps_per_epoch = math.ceil(
        batches_per_epoch / accumulation_steps
    )
    total_optimizer_steps = config.epochs * optimizer_steps_per_epoch
    warmup_steps = math.ceil(total_optimizer_steps * config.warmup_ratio)

    scheduler = None
    if warmup_steps > 0:
        def warmup_factor(step: int) -> float:
            return min((step + 1) / warmup_steps, 1.0)

        scheduler = torch.optim.lr_scheduler.LambdaLR(
            optimizer,
            lr_lambda=warmup_factor,
        )

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    config_path = output_path / "training_config.json"
    config_path.write_text(
        json.dumps(config.model_dump(mode="json"), indent=2),
        encoding="utf-8",
    )

    history: list[dict[str, Any]] = []
    best_validation_loss = math.inf
    optimizer_steps = 0

    for epoch in range(config.epochs):
        model.train()
        optimizer.zero_grad(set_to_none=True)

        weighted_training_loss = 0.0
        supervised_tokens = 0
        batches_seen = 0

        # Stream batches. Use the known batch count to scale a final partial
        # accumulation group by its actual size instead of dropping it.
        for batch_index, batch in enumerate(train_dataloader):
            if not batch:
                raise ValueError("Training batch cannot be empty.")
            if batch_index >= batches_per_epoch:
                raise RuntimeError(
                    "Training dataloader yielded more batches than __len__."
                )

            token_count = _supervised_token_count(batch)
            inputs = _move_batch_to_device(batch, device)
            outputs = model(**inputs)
            loss = outputs.loss
            loss_value = _validate_loss(loss)

            group_start = (
                batch_index // accumulation_steps
            ) * accumulation_steps
            group_size = min(
                accumulation_steps,
                batches_per_epoch - group_start,
            )

            (loss / group_size).backward()

            weighted_training_loss += loss_value * token_count
            supervised_tokens += token_count
            batches_seen += 1

            should_step = (
                (batch_index + 1) % accumulation_steps == 0
                or batch_index + 1 == batches_per_epoch
            )

            if should_step:
                optimizer.step()
                if scheduler is not None:
                    scheduler.step()
                optimizer.zero_grad(set_to_none=True)
                optimizer_steps += 1

        if batches_seen != batches_per_epoch:
            raise RuntimeError(
                "Training dataloader yielded "
                f"{batches_seen} batches, but __len__ reported "
                f"{batches_per_epoch}."
            )

        validation_loss = evaluate_loss(
            model,
            validation_dataloader,
            device=device,
        )

        epoch_metrics = {
            "epoch": epoch + 1,
            "training_loss": weighted_training_loss / supervised_tokens,
            "validation_loss": validation_loss,
            "optimizer_steps": optimizer_steps,
            "learning_rate": optimizer.param_groups[0]["lr"],
        }
        history.append(epoch_metrics)

        if validation_loss < best_validation_loss:
            if not hasattr(model, "save_pretrained"):
                raise TypeError(
                    "Model must implement save_pretrained() to save an adapter."
                )

            best_validation_loss = validation_loss
            adapter_dir = output_path / "best_adapter"
            adapter_dir.mkdir(parents=True, exist_ok=True)
            model.save_pretrained(adapter_dir)

            tokenizer = getattr(model, "tokenizer", None)
            if tokenizer is not None and hasattr(tokenizer, "save_pretrained"):
                tokenizer.save_pretrained(adapter_dir)

        metrics_path = output_path / "training_metrics.json"
        metrics_path.write_text(
            json.dumps(
                {
                    "epochs_completed": len(history),
                    "optimizer_steps": optimizer_steps,
                    "total_optimizer_steps": total_optimizer_steps,
                    "warmup_steps": warmup_steps,
                    "best_validation_loss": best_validation_loss,
                    "history": history,
                },
                indent=2,
            ),
            encoding="utf-8",
        )

    return {
        "epochs_completed": len(history),
        "optimizer_steps": optimizer_steps,
        "total_optimizer_steps": total_optimizer_steps,
        "warmup_steps": warmup_steps,
        "best_validation_loss": best_validation_loss,
        "history": history,
        "adapter_path": str(output_path / "best_adapter"),
        "config_path": str(config_path),
        "metrics_path": str(output_path / "training_metrics.json"),
    }


def load_adapter(base_model: Any, adapter_path: str | Path) -> Any:
    """Load a saved PEFT adapter into a compatible base model."""
    try:
        from peft import PeftModel
    except ImportError as exc:
        raise RuntimeError(
            "PEFT is required to load a saved adapter."
        ) from exc

    path = Path(adapter_path)
    if not path.is_dir():
        raise FileNotFoundError(f"Adapter directory not found: {path}")

    return PeftModel.from_pretrained(base_model, path)
