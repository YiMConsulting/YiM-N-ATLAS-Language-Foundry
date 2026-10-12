"""Configuration management for the N-ATLaS inference service."""

from __future__ import annotations

import os
import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator

# Immutable pinned defaults
DEFAULT_BASE_MODEL = "NCAIR1/N-ATLaS"
DEFAULT_BASE_REVISION = "e294476928aca9030e924ca27bb8e085e8581273"
DEFAULT_ADAPTER_REPO = "YiMConsulting/n-atlas-tiv-lora-smoke-v1"
DEFAULT_ADAPTER_REVISION = "d413bebb74ef3b971eacdd62d6bc10e75654914a"
DEFAULT_MODEL_STATUS = "smoke_test_preview"

PROHIBITED_MOVING_REVISIONS = {"main", "latest", "master", "head", "nightly", "dev"}
HEX_40_RE = re.compile(r"^[0-9a-fA-F]{40}$")


class InferenceConfig(BaseModel):
    """
    Validated configuration for N-ATLaS base model and adapter inference.
    
    Guarantees:
    - Immutable pinned default revisions for base model and LoRA adapter.
    - Prohibits moving branch/tag references ('main', 'latest') by default.
    - Secrets (HF_TOKEN) read strictly from environment, never hardcoded.
    - Bounded token limits and configurable device/precision settings.
    """

    # Model identifiers and revisions
    base_model: str = Field(
        default_factory=lambda: os.getenv("BASE_MODEL_NAME", DEFAULT_BASE_MODEL),
        description="Hugging Face repository ID for the base model.",
    )
    base_revision: str = Field(
        default_factory=lambda: os.getenv("BASE_MODEL_REVISION", DEFAULT_BASE_REVISION),
        description="Immutable 40-character commit SHA for the base model.",
    )
    adapter_repo: str = Field(
        default_factory=lambda: os.getenv("ADAPTER_REPO", DEFAULT_ADAPTER_REPO),
        description="Hugging Face repository ID for the PEFT LoRA adapter.",
    )
    adapter_revision: str = Field(
        default_factory=lambda: os.getenv("ADAPTER_REVISION", DEFAULT_ADAPTER_REVISION),
        description="Immutable 40-character commit SHA for the LoRA adapter.",
    )
    model_status: str = Field(
        default=DEFAULT_MODEL_STATUS,
        description="Governance status indicator for output transparency.",
    )

    # Revision safety toggle
    allow_unpinned_revision: bool = Field(
        default_factory=lambda: os.getenv("ALLOW_UNPINNED_REVISION", "false").lower() in ("true", "1", "yes"),
        description="Explicit safety override to allow non-SHA revisions (strictly for testing).",
    )

    # Server settings
    host: str = Field(
        default_factory=lambda: os.getenv("INFERENCE_HOST", os.getenv("HOST", "0.0.0.0")),
        description="Network host binding for inference service.",
    )
    port: int = Field(
        default_factory=lambda: int(os.getenv("INFERENCE_PORT", os.getenv("PORT", "8000"))),
        description="Network port binding for inference service.",
    )

    # Generation token limits
    default_max_new_tokens: int = Field(
        default_factory=lambda: int(os.getenv("DEFAULT_MAX_NEW_TOKENS", "64")),
        ge=1,
        le=512,
        description="Default max new tokens generated per request.",
    )
    max_new_tokens_limit: int = Field(
        default_factory=lambda: int(os.getenv("MAX_NEW_TOKENS_LIMIT", "256")),
        ge=1,
        le=1024,
        description="Hard upper ceiling for max_new_tokens across all requests.",
    )
    do_sample: bool = Field(
        default_factory=lambda: os.getenv("DO_SAMPLE", "false").lower() in ("true", "1", "yes"),
        description="Whether to use stochastic sampling during generation.",
    )
    temperature: float = Field(
        default_factory=lambda: float(os.getenv("TEMPERATURE", "0.0")),
        ge=0.0,
        le=2.0,
        description="Sampling temperature (0.0 = deterministic greedy decoding).",
    )

    # Runtime & hardware precision settings
    device: str = Field(
        default_factory=lambda: os.getenv("INFERENCE_DEVICE", "auto"),
        description="Target compute device: 'auto', 'cuda', or 'cpu'.",
    )
    torch_dtype: str = Field(
        default_factory=lambda: os.getenv("TORCH_DTYPE", "float16"),
        description="Precision data type: 'float16', 'bfloat16', or 'float32'.",
    )
    quantization: Optional[str] = Field(
        default_factory=lambda: os.getenv("QUANTIZATION", None),
        description="Optional quantization mode: None, '4bit', or '8bit'.",
    )

    # Credentials
    hf_token: Optional[str] = Field(
        default_factory=lambda: os.getenv("HF_TOKEN", None),
        description="Hugging Face access token for gated model repositories.",
    )

    @field_validator("base_revision", "adapter_revision")
    @classmethod
    def validate_revision_not_moving(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Revision cannot be empty.")
        if trimmed.lower() in PROHIBITED_MOVING_REVISIONS:
            raise ValueError(
                f"Unpinned moving revision '{trimmed}' is prohibited in production configuration. "
                "An immutable 40-character commit SHA is required."
            )
        return trimmed

    @model_validator(mode="after")
    def validate_commit_sha_unless_overridden(self) -> InferenceConfig:
        if not self.allow_unpinned_revision:
            for field_name, rev in (
                ("base_revision", self.base_revision),
                ("adapter_revision", self.adapter_revision),
            ):
                if not HEX_40_RE.match(rev):
                    raise ValueError(
                        f"Field '{field_name}' must be an immutable 40-character hex commit SHA (got '{rev}'). "
                        "Set allow_unpinned_revision=True to override in non-production environments."
                    )

        if self.default_max_new_tokens > self.max_new_tokens_limit:
            raise ValueError(
                f"default_max_new_tokens ({self.default_max_new_tokens}) cannot exceed "
                f"max_new_tokens_limit ({self.max_new_tokens_limit})."
            )

        if self.quantization is not None:
            normalized_q = self.quantization.strip().lower()
            if normalized_q not in ("4bit", "8bit"):
                raise ValueError(
                    f"Unsupported quantization '{self.quantization}'. Allowed options are None, '4bit', or '8bit'."
                )
            self.quantization = normalized_q

        return self

    def require_hf_token(self) -> str:
        """
        Validate and return the Hugging Face access token, raising a descriptive
        error if credentials are required but unavailable.
        """
        token = self.hf_token or os.getenv("HF_TOKEN")
        if not token or not token.strip():
            raise ValueError(
                "Authenticated access required: 'HF_TOKEN' is missing from the environment. "
                f"The base model '{self.base_model}' is gated on Hugging Face."
            )
        return token.strip()
