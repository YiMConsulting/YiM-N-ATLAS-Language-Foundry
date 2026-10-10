from types import SimpleNamespace
import pytest
from api.schemas.experiment import AdaptationConfig, AdaptationMethod
from foundry.training.model_setup import attach_lora_adapters


class FakeModel:
    def __init__(self):
        self.config = SimpleNamespace(use_cache=True)

    def named_modules(self):
        return [
            ("", self),
            ("model.layers.0.self_attn.q_proj", object()),
            ("model.layers.0.self_attn.v_proj", object()),
        ]


def test_rejects_missing_target_modules():
    model = FakeModel()
    config = AdaptationConfig(target_modules=["missing_projection"])
    with pytest.raises(ValueError, match="target modules were not found"):
        attach_lora_adapters(model, config)


def test_qlora_is_rejected_until_quantized_loading_exists():
    model = FakeModel()
    config = AdaptationConfig(method=AdaptationMethod.qlora)
    with pytest.raises(NotImplementedError, match="quantized model-loading"):
        attach_lora_adapters(model, config)
