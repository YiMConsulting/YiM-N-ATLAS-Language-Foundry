"""Unit tests for the model engine with mocked dependencies (offline, CPU-only)."""

from unittest.mock import MagicMock
import pytest

from inference_service.app.config import InferenceConfig
from inference_service.app.engine import ModelEngine


class DummyTensor:
    """Mock tensor object that supports shape and indexing."""

    def __init__(self, shape):
        self.shape = shape

    def __getitem__(self, item):
        return DummyTensor((1, 5))

    def to(self, device):
        return self


class MockTokenizer:
    """Offline mock tokenizer for unit testing."""

    def __init__(self):
        self.pad_token_id = 0
        self.eos_token_id = 1

    def apply_chat_template(self, messages, tokenize=False, add_generation_prompt=True):
        return f"<mock_chat_template>{messages[0]['content']}</mock_chat_template>"

    def __call__(self, text, return_tensors="pt"):
        return {
            "input_ids": DummyTensor((1, 10)),
            "attention_mask": DummyTensor((1, 10)),
        }

    def decode(self, token_ids, skip_special_tokens=True):
        return "M sugh u dedoo."


class MockModel:
    """Offline mock model for unit testing."""

    def __init__(self):
        self.device = "cpu"
        self.eval_called = False
        self.generate_calls = []

    def eval(self):
        self.eval_called = True
        return self

    def generate(self, **kwargs):
        self.generate_calls.append(kwargs)
        # Return input tokens (10) + output tokens (5)
        return DummyTensor((1, 15))


@pytest.fixture
def test_config():
    return InferenceConfig(
        hf_token="mock_hf_token_test",
        default_max_new_tokens=32,
        max_new_tokens_limit=128,
    )


def test_engine_single_initialization(test_config):
    """Engine must load model and adapter once, ignoring redundant load_model calls."""
    mock_model_loader = MagicMock(return_value=MockModel())
    mock_tok_loader = MagicMock(return_value=MockTokenizer())
    mock_adapter_loader = MagicMock(return_value=MockModel())

    engine = ModelEngine(
        config=test_config,
        model_loader=mock_model_loader,
        tokenizer_loader=mock_tok_loader,
        adapter_loader=mock_adapter_loader,
    )

    assert not engine.is_loaded

    # First load
    engine.load_model()
    assert engine.is_loaded
    assert mock_model_loader.call_count == 1
    assert mock_tok_loader.call_count == 1
    assert mock_adapter_loader.call_count == 1

    # Second load without force_reload should be a no-op
    engine.load_model()
    assert mock_model_loader.call_count == 1
    assert mock_tok_loader.call_count == 1
    assert mock_adapter_loader.call_count == 1

    # Force reload re-invokes loaders
    engine.load_model(force_reload=True)
    assert mock_model_loader.call_count == 2
    assert mock_tok_loader.call_count == 2
    assert mock_adapter_loader.call_count == 2


def test_engine_exact_model_and_adapter_parameters(test_config):
    """Loaders must receive the exact pinned repo IDs and commit SHAs."""
    mock_model_loader = MagicMock(return_value=MockModel())
    mock_tok_loader = MagicMock(return_value=MockTokenizer())
    mock_adapter_loader = MagicMock(return_value=MockModel())

    engine = ModelEngine(
        config=test_config,
        model_loader=mock_model_loader,
        tokenizer_loader=mock_tok_loader,
        adapter_loader=mock_adapter_loader,
    )
    engine.load_model()

    mock_tok_loader.assert_called_once_with(
        "NCAIR1/N-ATLaS",
        revision="e294476928aca9030e924ca27bb8e085e8581273",
        token="mock_hf_token_test",
    )
    mock_model_loader.assert_called_once_with(
        "NCAIR1/N-ATLaS",
        revision="e294476928aca9030e924ca27bb8e085e8581273",
        token="mock_hf_token_test",
    )
    mock_adapter_loader.assert_called_once_with(
        mock_model_loader.return_value,
        "YiMConsulting/n-atlas-tiv-lora-smoke-v1",
        revision="d413bebb74ef3b971eacdd62d6bc10e75654914a",
        token="mock_hf_token_test",
    )


def test_engine_generate_before_load_raises():
    """Generating before load_model must raise RuntimeError."""
    engine = ModelEngine()
    with pytest.raises(RuntimeError, match="Model engine is not loaded"):
        engine.generate("Hello world")


def test_engine_generate_validates_input(test_config):
    """Generating with empty or invalid text must raise ValueError."""
    mock_model = MockModel()
    engine = ModelEngine(
        config=test_config,
        model_loader=lambda *a, **k: mock_model,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: mock_model,
    )
    engine.load_model()

    with pytest.raises(ValueError, match="empty or whitespace-only"):
        engine.generate("")

    with pytest.raises(ValueError, match="empty or whitespace-only"):
        engine.generate("   \n\t  ")

    with pytest.raises(ValueError, match="cannot be None"):
        engine.generate(None)  # type: ignore


def test_engine_generate_bounds_tokens(test_config):
    """Generation bounds max_new_tokens within default and limit."""
    mock_model = MockModel()
    engine = ModelEngine(
        config=test_config,
        model_loader=lambda *a, **k: mock_model,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: mock_model,
    )
    engine.load_model()

    # Default tokens used when none specified
    res_default = engine.generate("Thank you very much.")
    assert res_default.max_new_tokens == 32  # test_config.default_max_new_tokens
    assert mock_model.generate_calls[-1]["max_new_tokens"] == 32

    # Clamping when request exceeds limit (128)
    res_clamped = engine.generate("Thank you very much.", max_new_tokens=500)
    assert res_clamped.max_new_tokens == 128  # clamped to test_config.max_new_tokens_limit
    assert mock_model.generate_calls[-1]["max_new_tokens"] == 128

    # Non-positive max_new_tokens rejected
    with pytest.raises(ValueError, match="must be positive"):
        engine.generate("Test", max_new_tokens=0)
    with pytest.raises(ValueError, match="must be positive"):
        engine.generate("Test", max_new_tokens=-5)


def test_engine_generation_result_governance_disclaimer(test_config):
    """Result must contain transparency metadata and disclaimer, never claiming validation."""
    mock_model = MockModel()
    engine = ModelEngine(
        config=test_config,
        model_loader=lambda *a, **k: mock_model,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: mock_model,
    )
    engine.load_model()

    result = engine.generate("Peace be with you.")
    assert result.generated_text == "M sugh u dedoo."
    assert result.base_model == "NCAIR1/N-ATLaS"
    assert result.base_revision == "e294476928aca9030e924ca27bb8e085e8581273"
    assert result.adapter_repo == "YiMConsulting/n-atlas-tiv-lora-smoke-v1"
    assert result.adapter_revision == "d413bebb74ef3b971eacdd62d6bc10e75654914a"
    assert result.model_status == "smoke_test_preview"
    assert result.is_smoke_test_preview is True
    assert "NOT been translation-quality validated" in result.disclaimer


def test_engine_model_loading_error_handling(test_config):
    """Model load errors must reset state and raise descriptive RuntimeError."""
    failing_loader = MagicMock(side_effect=ConnectionError("HF Hub unreachable"))
    engine = ModelEngine(
        config=test_config,
        model_loader=failing_loader,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
    )

    with pytest.raises(RuntimeError, match="Model engine initialization failed"):
        engine.load_model()

    assert not engine.is_loaded
    assert engine.model is None
    assert engine.tokenizer is None


def test_engine_generation_error_handling(test_config):
    """Generation errors must raise RuntimeError without fabricating answers."""
    mock_model = MockModel()
    mock_model.generate = MagicMock(side_effect=RuntimeError("CUDA OOM or tensor error"))

    engine = ModelEngine(
        config=test_config,
        model_loader=lambda *a, **k: mock_model,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: mock_model,
    )
    engine.load_model()

    with pytest.raises(RuntimeError, match="Inference generation error"):
        engine.generate("Test sentence")


def test_engine_concurrent_load_model_is_thread_safe(test_config):
    """Multiple concurrent threads attempting load_model must only load once."""
    import concurrent.futures
    import time

    load_call_count = 0

    def slow_model_loader(*args, **kwargs):
        nonlocal load_call_count
        load_call_count += 1
        time.sleep(0.05)
        return MockModel()

    engine = ModelEngine(
        config=test_config,
        model_loader=slow_model_loader,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: MockModel(),
    )

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(engine.load_model) for _ in range(5)]
        for f in futures:
            f.result()

    assert engine.is_loaded
    assert load_call_count == 1


def test_engine_load_failure_recovery(test_config):
    """Engine resets state on failure, and can succeed on a subsequent retry."""
    should_fail = True

    def flakey_loader(*args, **kwargs):
        if should_fail:
            raise ConnectionError("Network blip")
        return MockModel()

    engine = ModelEngine(
        config=test_config,
        model_loader=flakey_loader,
        tokenizer_loader=lambda *a, **k: MockTokenizer(),
        adapter_loader=lambda b, *a, **k: MockModel(),
    )

    # First attempt fails cleanly
    with pytest.raises(RuntimeError):
        engine.load_model()
    assert not engine.is_loaded
    assert engine.model is None

    # Subsequent retry succeeds cleanly
    should_fail = False
    engine.load_model()
    assert engine.is_loaded
    assert engine.model is not None

