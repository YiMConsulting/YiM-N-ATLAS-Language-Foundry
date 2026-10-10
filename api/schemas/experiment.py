from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field, model_validator


class ExperimentStatus(str, Enum):
    queued = "queued"
    running = "running"
    evaluating = "evaluating"
    completed = "completed"
    failed = "failed"


class AdaptationMethod(str, Enum):
    lora = "lora"
    qlora = "qlora"


class AdaptationConfig(BaseModel):
    method: AdaptationMethod = AdaptationMethod.lora
    rank: int = Field(default=16, gt=0)
    alpha: int = Field(default=32, gt=0)
    dropout: float = Field(default=0.05, ge=0.0, lt=1.0)
    target_modules: list[str] = Field(
        default_factory=lambda: ["q_proj", "v_proj"]
    )

    @model_validator(mode="after")
    def validate_target_modules(self):
        if not self.target_modules:
            raise ValueError("target_modules must contain at least one module")
        return self


class TrainingConfig(BaseModel):
    per_device_batch_size: int = Field(default=4, gt=0)
    gradient_accumulation_steps: int = Field(default=4, gt=0)
    learning_rate: float = Field(default=2e-4, gt=0)
    epochs: int = Field(default=3, gt=0)
    warmup_ratio: float = Field(default=0.0, ge=0.0, lt=1.0)
    weight_decay: float = Field(default=0.0, ge=0.0)
    seed: int = 42


class RuntimeConfig(BaseModel):
    hardware: str = "Tesla T4"
    device: str = "cuda"
    precision: str | None = "bf16"


class EvaluationMetrics(BaseModel):
    loss: float | None = None
    bleu_score: float | None = None
    chrf_score: float | None = None
    exact_match_ratio: float | None = None
    inference_latency_ms: float | None = None
    sanity_check_passed: bool = True
    sample_outputs: list[dict[str, str]] = Field(default_factory=list)


class ExperimentArtifacts(BaseModel):
    adapter_path: str | None = None
    config_path: str | None = None
    metrics_path: str | None = None
    logs_path: str | None = None


class Experiment(BaseModel):
    id: str = Field(..., min_length=1)
    language_code: str = Field(..., min_length=2, max_length=8)
    base_model: str = "NCAIR1/N-ATLaS"
    dataset_ids: list[str] = Field(..., min_length=1)
    split_id: str = Field(..., min_length=1)
    adaptation: AdaptationConfig = Field(default_factory=AdaptationConfig)
    training: TrainingConfig = Field(default_factory=TrainingConfig)
    runtime: RuntimeConfig = Field(default_factory=RuntimeConfig)
    status: ExperimentStatus = ExperimentStatus.queued
    base_results: EvaluationMetrics | None = None
    adapted_results: EvaluationMetrics | None = None
    artifacts: ExperimentArtifacts = Field(default_factory=ExperimentArtifacts)
    git_commit: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime | None = None

    @model_validator(mode="after")
    def validate_status_and_results(self):
        if self.status == ExperimentStatus.completed:
            if self.base_results is None:
                raise ValueError(
                    "Completed experiment must have base_results"
                )
            if self.adapted_results is None:
                raise ValueError(
                    "Completed experiment must have adapted_results"
                )
        return self
