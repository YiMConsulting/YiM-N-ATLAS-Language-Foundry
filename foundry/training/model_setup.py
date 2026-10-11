"""Model setup and adaptation utilities for N-ATLaS."""
from __future__ import annotations

from typing import Any

from api.schemas.experiment import AdaptationConfig, AdaptationMethod


def attach_lora_adapters(
    model: Any,
    adaptation: AdaptationConfig,
) -> Any:
    """Validate target modules and attach LoRA adapters to a model.

    Standard models use the normal PEFT LoRA path. Models loaded in 8-bit
    are prepared for k-bit training before LoRA adapters are attached.
    The 4-bit QLoRA path remains unsupported.
    """
    if adaptation.method == AdaptationMethod.qlora:
        raise NotImplementedError(
            "QLoRA requires a tested 4-bit quantized model-loading path. "
            "Use the LoRA method with an ordinary or supported 8-bit model."
        )

    if getattr(model, "is_loaded_in_4bit", False):
        raise NotImplementedError(
            "4-bit model loading is not supported by the current LoRA "
            "setup. Use an ordinary or supported 8-bit model."
        )

    is_loaded_in_8bit = getattr(model, "is_loaded_in_8bit", False)

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
        if is_loaded_in_8bit:
            from peft import prepare_model_for_kbit_training
    except ImportError as exc:
        raise RuntimeError(
            "PEFT is required to attach LoRA adapters. "
            "Install the ML dependencies in the training environment."
        ) from exc

    if is_loaded_in_8bit:
        model = prepare_model_for_kbit_training(model)

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
