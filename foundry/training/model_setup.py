"""Model setup and adaptation utilities for N-ATLaS."""
from __future__ import annotations

from typing import Any
from api.schemas.experiment import AdaptationConfig, AdaptationMethod


def attach_lora_adapters(model: Any, adaptation: AdaptationConfig) -> Any:
    """
    Validates target modules and attaches LoRA adapters to the model.
    """
    if adaptation.method == AdaptationMethod.qlora:
        raise NotImplementedError(
            "QLoRA requires a quantized model-loading path. "
            "Use the LoRA method until that path is implemented and tested."
        )

    available_modules = {
        name.rsplit(".", 1)[-1]
        for name, _ in model.named_modules()
        if name
    }
    missing_modules = sorted(
        set(adaptation.target_modules) - available_modules
    )
    if missing_modules:
        raise ValueError(
            "Configured LoRA target modules were not found in the model: "
            f"{missing_modules}"
        )

    try:
        from peft import LoraConfig, get_peft_model
    except ImportError as exc:
        raise RuntimeError(
            "PEFT is required to attach LoRA adapters. "
            "Install the ML dependencies in the training environment."
        ) from exc

    lora_config = LoraConfig(
        r=adaptation.rank,
        lora_alpha=adaptation.alpha,
        lora_dropout=adaptation.dropout,
        target_modules=adaptation.target_modules,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model.config.use_cache = False
    adapted_model = get_peft_model(model, lora_config)
    trainable_parameters = [
        name
        for name, parameter in adapted_model.named_parameters()
        if parameter.requires_grad
    ]
    if not trainable_parameters:
        raise RuntimeError(
            "LoRA attachment produced no trainable parameters."
        )
    if not any("lora_" in name for name in trainable_parameters):
        raise RuntimeError(
            "No trainable LoRA parameters were found after adapter setup."
        )
    return adapted_model
