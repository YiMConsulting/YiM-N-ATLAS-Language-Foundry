"""Unit tests for inference service configuration."""

import pytest
from pydantic import ValidationError

from inference_service.app.config import (
    DEFAULT_BASE_MODEL,
    DEFAULT_BASE_REVISION,
    DEFAULT_ADAPTER_REPO,
    DEFAULT_ADAPTER_REVISION,
    DEFAULT_MODEL_STATUS,
    InferenceConfig,
)


def test_config_pinned_defaults(monkeypatch):
    """Ensure pinned base model and adapter SHAs are active by default."""
    # Ensure no environment pollution
    for key in (
        "BASE_MODEL_NAME",
        "BASE_MODEL_REVISION",
        "ADAPTER_REPO",
        "ADAPTER_REVISION",
        "ALLOW_UNPINNED_REVISION",
        "HF_TOKEN",
    ):
        monkeypatch.delenv(key, raising=False)

    config = InferenceConfig()
    assert config.base_model == "NCAIR1/N-ATLaS"
    assert config.base_model == DEFAULT_BASE_MODEL
    assert config.base_revision == "e294476928aca9030e924ca27bb8e085e8581273"
    assert config.base_revision == DEFAULT_BASE_REVISION
    assert config.adapter_repo == "YiMConsulting/n-atlas-tiv-lora-smoke-v1"
    assert config.adapter_repo == DEFAULT_ADAPTER_REPO
    assert config.adapter_revision == "d413bebb74ef3b971eacdd62d6bc10e75654914a"
    assert config.adapter_revision == DEFAULT_ADAPTER_REVISION
    assert config.model_status == "smoke_test_preview"
    assert config.model_status == DEFAULT_MODEL_STATUS
    assert config.default_max_new_tokens == 64
    assert config.max_new_tokens_limit == 256
    assert config.allow_unpinned_revision is False


@pytest.mark.parametrize("invalid_rev", ["main", "latest", "master", "head", "dev", "v1.0"])
def test_config_rejects_moving_revisions(invalid_rev):
    """Accidental use of moving branch or tag names in base or adapter revision must fail."""
    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(base_revision=invalid_rev)
    assert "prohibited" in str(exc_info.value) or "commit SHA" in str(exc_info.value)

    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(adapter_revision=invalid_rev)
    assert "prohibited" in str(exc_info.value) or "commit SHA" in str(exc_info.value)


def test_config_rejects_non_hex_sha_without_override():
    """Short hashes or arbitrary strings are rejected unless allow_unpinned_revision is set."""
    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(base_revision="abcdef12345")
    assert "must be an immutable 40-character hex commit SHA" in str(exc_info.value)


def test_config_allows_unpinned_revision_when_explicitly_enabled():
    """Explicit override flag allows non-SHA revisions for development/testing."""
    cfg = InferenceConfig(
        base_revision="mock-test-rev",
        adapter_revision="mock-adapter-rev",
        allow_unpinned_revision=True,
    )
    assert cfg.base_revision == "mock-test-rev"
    assert cfg.adapter_revision == "mock-adapter-rev"


def test_config_token_bounds_validation():
    """default_max_new_tokens cannot exceed max_new_tokens_limit."""
    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(default_max_new_tokens=300, max_new_tokens_limit=256)
    assert "cannot exceed" in str(exc_info.value)


def test_config_quantization_validation():
    """Only 4bit, 8bit, or None are allowed for quantization."""
    cfg_none = InferenceConfig(quantization=None)
    assert cfg_none.quantization is None

    cfg_4bit = InferenceConfig(quantization="4bit")
    assert cfg_4bit.quantization == "4bit"

    cfg_8bit = InferenceConfig(quantization="8BIT")
    assert cfg_8bit.quantization == "8bit"

    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(quantization="16bit")
    assert "Unsupported quantization" in str(exc_info.value)


def test_config_missing_hf_token(monkeypatch):
    """Fails clearly when authenticated HF access is required but token is missing."""
    monkeypatch.delenv("HF_TOKEN", raising=False)
    cfg = InferenceConfig(hf_token=None)
    with pytest.raises(ValueError) as exc_info:
        cfg.require_hf_token()
    assert "Authenticated access required" in str(exc_info.value)
    assert "HF_TOKEN" in str(exc_info.value)


def test_config_present_hf_token(monkeypatch):
    """Accepts valid token from environment or config argument."""
    monkeypatch.setenv("HF_TOKEN", "hf_test_secret_token_123")
    cfg = InferenceConfig()
    assert cfg.require_hf_token() == "hf_test_secret_token_123"

    cfg_arg = InferenceConfig(hf_token="hf_direct_token_456")
    assert cfg_arg.require_hf_token() == "hf_direct_token_456"


def test_config_secret_masking():
    """Ensure HF token and INFERENCE_API_KEY are never leaked in repr() or str() output of config."""
    secret = "hf_super_secret_token_xyz987"
    api_sec = "super_secret_api_key_456"
    cfg = InferenceConfig(hf_token=secret, api_key=api_sec)
    assert secret not in repr(cfg)
    assert secret not in str(cfg)
    assert api_sec not in repr(cfg)
    assert api_sec not in str(cfg)


def test_config_quantization_rejects_cpu_device():
    """Quantization requires GPU hardware and fails if device='cpu'."""
    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(quantization="4bit", device="cpu")
    assert "requires GPU hardware" in str(exc_info.value)

    with pytest.raises(ValidationError) as exc_info:
        InferenceConfig(quantization="8bit", device="cpu")
    assert "requires GPU hardware" in str(exc_info.value)


def test_config_cors_origins_defaults_and_env(monkeypatch):
    """CORS origins default to trusted local origins, and accept explicit overrides."""
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    cfg = InferenceConfig()
    assert "http://localhost:3000" in cfg.cors_origins
    assert "http://127.0.0.1:3000" in cfg.cors_origins
    assert "*" not in cfg.cors_origins

    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.com, https://api.example.com")
    cfg_custom = InferenceConfig()
    assert cfg_custom.cors_origins == ["https://app.example.com", "https://api.example.com"]


