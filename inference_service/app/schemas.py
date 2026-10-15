"""Pydantic schemas for the N-ATLaS inference service API."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    """Liveness and availability status of the inference service."""

    status: str = Field(default="ok", description="Service operational status.")
    model_loaded: bool = Field(
        default=False,
        description="Whether the base model and adapter weights are loaded in memory.",
    )
    service: str = Field(
        default="natlas-inference-service",
        description="Name of the inference microservice.",
    )
    version: str = Field(default="0.1.0", description="API version.")


class SmokeTestStatusResponse(BaseModel):
    """Detailed metadata and governance status for the smoke-test preview adapter."""

    model_loaded: bool = Field(description="Whether the model is initialized and ready.")
    base_model: str = Field(description="Hugging Face repository ID for the base model.")
    base_revision: str = Field(description="Pinned immutable commit SHA for the base model.")
    adapter_repo: str = Field(description="Hugging Face repository ID for the LoRA adapter.")
    adapter_revision: str = Field(description="Pinned immutable commit SHA for the adapter.")
    model_status: str = Field(description="Governance status indicator (smoke_test_preview).")
    is_smoke_test_preview: bool = Field(
        default=True,
        description="Indicates that output is from an unvalidated diagnostic preview.",
    )
    quality_validated: bool = Field(
        default=False,
        description="Explicit guarantee that translation quality is not validated.",
    )
    disclaimer: str = Field(
        description="Mandatory governance disclaimer for smoke-test outputs.",
    )
    device: str = Field(description="Configured execution device ('auto', 'cuda', 'cpu').")
    torch_dtype: str = Field(description="Precision data type ('float16', 'bfloat16', 'float32').")
    quantization: Optional[str] = Field(
        default=None,
        description="Configured quantization mode (None, '4bit', '8bit').",
    )


class GenerateRequest(BaseModel):
    """Input payload for translation generation."""

    text: str = Field(
        ...,
        description="Source English text to translate into Tiv.",
        max_length=4000,
    )
    max_new_tokens: Optional[int] = Field(
        default=None,
        ge=1,
        le=1024,
        description="Optional upper bound on tokens to generate.",
    )

    @field_validator("text")
    @classmethod
    def validate_non_empty_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Input text cannot be empty or whitespace-only.")
        return value.strip()


class GenerateResponse(BaseModel):
    """Generation output and governance audit metadata."""

    generated_text: str = Field(description="Model generated translation text.")
    prompt: str = Field(description="Exact prompt rendered for generation.")
    base_model: str = Field(description="Base model ID used.")
    base_revision: str = Field(description="Base model revision commit SHA.")
    adapter_repo: str = Field(description="Adapter repository ID used.")
    adapter_revision: str = Field(description="Adapter revision commit SHA.")
    model_status: str = Field(description="Model governance status.")
    is_smoke_test_preview: bool = Field(
        default=True,
        description="Indicates that output is from an unvalidated smoke-test preview.",
    )
    disclaimer: str = Field(description="Governance disclaimer.")
    max_new_tokens: int = Field(description="Number of new tokens budgeted for generation.")
