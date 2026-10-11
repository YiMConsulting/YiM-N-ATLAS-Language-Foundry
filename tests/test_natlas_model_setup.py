from types import SimpleNamespace
import sys

import pytest

from api.schemas.experiment import AdaptationConfig, AdaptationMethod
from foundry.training.model_setup import attach_lora_adapters


class FakeModel:
    def __init__(self, *, is_8bit=False, is_4bit=False):
        self.config = SimpleNamespace(use_cache=True)
        self.is_loaded_in_8bit = is_8bit
        self.is_loaded_in_4bit = is_4bit

    def named_modules(self):
        return [
            ("", self),
            ("model.layers.0.self_attn.q_proj", object()),
            ("model.layers.0.self_attn.v_proj", object()),
        ]

    def named_parameters(self):
        return [
            ("base_model.lora_A.weight", SimpleNamespace(requires_grad=True)),
        ]


def install_fake_peft(monkeypatch, events):
    class FakeLoraConfig:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    def prepare_model_for_kbit_training(model):
        events.append("prepare")
        return model

    def get_peft_model(model, config):
        events.append("attach")
        return model

    fake_peft = SimpleNamespace(
        LoraConfig=FakeLoraConfig,
        get_peft_model=get_peft_model,
        prepare_model_for_kbit_training=prepare_model_for_kbit_training,
    )
    monkeypatch.setitem(sys.modules, "peft", fake_peft)


def test_rejects_missing_target_modules():
    model = FakeModel()
    config = AdaptationConfig(target_modules=["missing_projection"])

    with pytest.raises(ValueError, match="target modules were not found"):
        attach_lora_adapters(model, config)


def test_qlora_is_rejected_until_quantized_loading_exists():
    model = FakeModel()
    config = AdaptationConfig(method=AdaptationMethod.qlora)

    with pytest.raises(NotImplementedError, match="4-bit"):
        attach_lora_adapters(model, config)


def test_rejects_4bit_model_for_lora_setup():
    model = FakeModel(is_4bit=True)

    with pytest.raises(NotImplementedError, match="4-bit model loading"):
        attach_lora_adapters(model, AdaptationConfig())


def test_8bit_model_is_prepared_before_lora_attachment(monkeypatch):
    events = []
    install_fake_peft(monkeypatch, events)
    model = FakeModel(is_8bit=True)

    adapted_model = attach_lora_adapters(model, AdaptationConfig())

    assert adapted_model is model
    assert events == ["prepare", "attach"]
    assert model.config.use_cache is False


def test_standard_lora_does_not_use_kbit_preparation(monkeypatch):
    events = []
    install_fake_peft(monkeypatch, events)
    model = FakeModel()

    adapted_model = attach_lora_adapters(model, AdaptationConfig())

    assert adapted_model is model
    assert events == ["attach"]
    assert model.config.use_cache is False
