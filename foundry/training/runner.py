"""Training and checkpoint utilities for N-ATLaS adaptation."""

from __future__ import annotations

import json
import math
import random
from pathlib import Path
from typing import Any, Iterable



from api.schemas.experiment import TrainingConfig


def set_training_seed(seed: int) -> None:
    """Python and PyTorch seeds for reproducible training."""
    random.seed(seed)

    try:
        import torch
    except ImportError as exc:
        raise RuntimeError("PyTorch is required for training.") from exc

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def _move_batch_to_device(batch: dict[str, Any], device: Any) -> dict[str, Any]:
    """Move tensor values in a batch to the selected device."""
    return {
        key: value.to(device) if hasattr(value, "to") else value
        for key, value in batch.items()
    }


def _model_device(model: Any) -> Any:
    """Return the device of the first model parameter."""
    try:
        return next(model.parameters()).device
    except (AttributeError, StopIteration):
        raise ValueError("Model must expose at least one parameter.") from None


def _validate_loss(loss: Any) -> float:
    """Return a finite scalar loss or raise a clear error."""
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
    """Compute the mean validation loss without gradient updates."""
    import torch

    if device is None:
        device = _model_device(model)

    was_training = bool(model.training)
    model.eval()

    total_loss = 0.0
    batch_count = 0

    try:
        with torch.no_grad():
            for batch in dataloader:
                if not batch:
                    raise ValueError("Validation batch cannot be empty.")

                inputs = _move_batch_to_device(batch, device)
                outputs = model(**inputs)
                loss_value = _validate_loss(outputs.loss)

                total_loss += loss_value
                batch_count += 1
    finally:
        model.train(was_training)

    if batch_count == 0:
        raise ValueError("Validation dataloader produced no batches.")

    return total_loss / batch_count


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
    """Train a model and save its best adapter checkpoint and metrics.

    The dataloaders must be re-iterable, such as PyTorch DataLoaders or lists.
    """
    import torch

    if device is None:
        device = _model_device(model)

    if config.epochs <= 0:
        raise ValueError("epochs must be greater than zero.")

    if config.gradient_accumulation_steps <= 0:
        raise ValueError("gradient_accumulation_steps must be greater than zero.")

    set_training_seed(config.seed)

    trainable_parameters = [
        parameter for parameter in model.parameters() if parameter.requires_grad
    ]
    if not trainable_parameters:
        raise ValueError("Model has no trainable parameters.")

    if optimizer is None:
        optimizer = torch.optim.AdamW(
            trainable_parameters,
            lr=config.learning_rate,
            weight_decay=config.weight_decay,
        )

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    history: list[dict[str, Any]] = []
    best_validation_loss = math.inf
    optimizer_steps = 0

    for epoch in range(config.epochs):
        model.train()
        optimizer.zero_grad(set_to_none=True)

        epoch_loss_total = 0.0
        batch_count = 0
        accumulation_count = 0

        # Materialize this epoch so the final partial accumulation group can
        # be scaled correctly without dropping its optimizer update.
        batches = list(train_dataloader)
        if not batches:
            raise ValueError("Training dataloader produced no batches.")

        for batch_index, batch in enumerate(batches):
            if not batch:
                raise ValueError("Training batch cannot be empty.")

            inputs = _move_batch_to_device(batch, device)
            outputs = model(**inputs)
            loss = outputs.loss
            loss_value = _validate_loss(loss)

            # Scale by the actual size of this accumulation group, including
            # the final partial group.
            group_start = (
                batch_index // config.gradient_accumulation_steps
            ) * config.gradient_accumulation_steps
            group_size = min(
                config.gradient_accumulation_steps,
                len(batches) - group_start,
            )

            (loss / group_size).backward()

            epoch_loss_total += loss_value
            batch_count += 1
            accumulation_count += 1

            should_step = (
                accumulation_count == config.gradient_accumulation_steps
                or batch_index == len(batches) - 1
            )

            if should_step:
                optimizer.step()
                optimizer.zero_grad(set_to_none=True)
                optimizer_steps += 1
                accumulation_count = 0

        validation_loss = evaluate_loss(
            model,
            validation_dataloader,
            device=device,
        )

        epoch_metrics = {
            "epoch": epoch + 1,
            "training_loss": epoch_loss_total / batch_count,
            "validation_loss": validation_loss,
            "optimizer_steps": optimizer_steps,
        }
        history.append(epoch_metrics)

        if validation_loss < best_validation_loss:
            best_validation_loss = validation_loss
            adapter_dir = output_path / "best_adapter"
            adapter_dir.mkdir(parents=True, exist_ok=True)

            if not hasattr(model, "save_pretrained"):
                raise TypeError(
                    "Model must implement save_pretrained() to save an adapter."
                )

            model.save_pretrained(adapter_dir)

            tokenizer = getattr(model, "tokenizer", None)
            if tokenizer is not None and hasattr(tokenizer, "save_pretrained"):
                tokenizer.save_pretrained(adapter_dir)

        # Write progress after each completed epoch so partial runs retain logs.
        metrics_path = output_path / "training_metrics.json"
        metrics_path.write_text(
            json.dumps(
                {
                    "epochs_completed": len(history),
                    "optimizer_steps": optimizer_steps,
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
        "best_validation_loss": best_validation_loss,
        "history": history,
        "adapter_path": str(output_path / "best_adapter"),
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
