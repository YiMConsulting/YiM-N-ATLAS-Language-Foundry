"""
N-ATLAS Language Foundry - Section 11 Experiment Schema
Defines the official data contract for every experiment conducted in the Foundry.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DatasetProvenance(BaseModel):
    dataset_id: str = Field(..., description="Unique dataset identifier, e.g., 'voiceafrica-igala'")
    source_name: str = Field(..., description="Provider or origin repository")
    source_url: Optional[str] = Field(None, description="Direct URL or repository page")
    license_type: str = Field(..., description="e.g., 'CC-BY-4.0', 'OpenRAIL', 'Research-Only'")
    commercial_use_allowed: bool = Field(False, description="Whether commercial use is permitted")
    intended_use_verified: bool = Field(True, description="Whether intended use was validated against license")


class ExperimentHyperparameters(BaseModel):
    adapter_method: str = Field("LoRA", description="Adaptation technique: 'LoRA' or 'QLoRA'")
    rank: int = Field(16, description="LoRA rank dimension (r)")
    alpha: int = Field(32, description="LoRA scaling factor (alpha)")
    dropout: float = Field(0.05, description="LoRA dropout rate")
    learning_rate: float = Field(2e-4, description="Peak learning rate")
    epochs: Optional[int] = Field(3, description="Number of full training epochs")
    steps: Optional[int] = Field(None, description="Max optimization steps if step-based")
    batch_size: int = Field(4, description="Per-device batch size")
    gradient_accumulation_steps: int = Field(4, description="Gradient accumulation steps")
    seed: int = Field(42, description="Random seed for reproducibility")


class EvaluationMetrics(BaseModel):
    loss: Optional[float] = Field(None, description="Evaluation loss on held-out test split")
    bleu_score: Optional[float] = Field(None, description="BLEU score on generation tasks")
    chrf_score: Optional[float] = Field(None, description="chrF / chrF++ score")
    exact_match_ratio: Optional[float] = Field(None, description="Exact match accuracy ratio")
    inference_latency_ms: Optional[float] = Field(None, description="Average token generation latency")
    sanity_check_passed: bool = Field(True, description="Did base model regression sanity check pass?")
    sample_outputs: List[Dict[str, str]] = Field(
        default_factory=list,
        description="List of {prompt, response, expected} sample evaluations"
    )


class HumanReviewSummary(BaseModel):
    total_samples_reviewed: int = Field(..., description="Number of examples reviewed by human evaluator")
    approved_count: int = Field(..., description="Number of samples judged accurate")
    rejected_count: int = Field(..., description="Number of samples judged incorrect")
    needs_correction_count: int = Field(0, description="Number of samples needing typographical or grammatical fix")
    reviewer_role_or_id: str = Field(..., description="Anonymized ID or role of language validator")
    notes: Optional[str] = Field(None, description="Evaluator qualitative observations")


class ExperimentRecord(BaseModel):
    """
    Core metadata record required for every Foundry experiment.
    Direct implementation of Implementation Plan Section 11.
    """
    experiment_id: str = Field(..., description="Unique slug for the experiment, e.g., 'igala-lora-v1'")
    language: str = Field("Igala", description="Target laboratory language name")
    language_code: str = Field("igl", description="ISO 639-3 language code")
    base_model: str = Field("NCAIR1/N-ATLaS", description="Base model checkpoint identifier")
    
    # Data Provenance & Split
    dataset_ids: List[str] = Field(..., description="List of registered datasets utilized")
    dataset_licenses: List[DatasetProvenance] = Field(..., description="Provenance and license breakdown per source")
    data_version: str = Field(..., description="SHA256 checksum or git manifest reference of the processed dataset")
    train_size: int = Field(..., description="Number of training records")
    validation_size: int = Field(..., description="Number of validation records")
    test_size: int = Field(..., description="Number of held-out test records")
    
    # Training Configuration
    hyperparameters: ExperimentHyperparameters = Field(..., description="LoRA/QLoRA hyperparameters")
    hardware: str = Field(..., description="Execution environment, e.g., 'Kaggle P100', 'Colab T4', 'Local RTX 4090'")
    
    # Evaluation Evidence
    base_results: EvaluationMetrics = Field(..., description="Evaluation metrics of unadapted base N-ATLAS on test split")
    adapted_results: EvaluationMetrics = Field(..., description="Evaluation metrics of adapted N-ATLAS on test split")
    human_review_results: Optional[HumanReviewSummary] = Field(None, description="Human evaluation results")
    
    # Artefacts & Reproducibility
    adapter_path: str = Field(..., description="Local path or Hugging Face Hub repository containing PEFT weights")
    git_commit: str = Field(..., description="Git commit hash corresponding to the code execution")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="ISO 8601 creation timestamp")
    status: str = Field("completed", description="'queued', 'running', 'completed', 'failed'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "experiment_id": "igala-lora-v1",
                "language": "Igala",
                "language_code": "igl",
                "base_model": "NCAIR1/N-ATLaS",
                "dataset_ids": ["voiceafrica-igala-v1"],
                "dataset_licenses": [
                    {
                        "dataset_id": "voiceafrica-igala-v1",
                        "source_name": "VoiceAfrica Repository",
                        "source_url": "https://example.org/voiceafrica",
                        "license_type": "CC-BY-4.0",
                        "commercial_use_allowed": True,
                        "intended_use_verified": True
                    }
                ],
                "data_version": "sha256:7b1e4a3d6f8e9c0b...",
                "train_size": 450,
                "validation_size": 50,
                "test_size": 100,
                "hyperparameters": {
                    "adapter_method": "LoRA",
                    "rank": 16,
                    "alpha": 32,
                    "dropout": 0.05,
                    "learning_rate": 0.0002,
                    "epochs": 3,
                    "batch_size": 4,
                    "gradient_accumulation_steps": 4,
                    "seed": 42
                },
                "hardware": "Kaggle NVIDIA Tesla P100 16GB",
                "base_results": {
                    "loss": 3.84,
                    "bleu_score": 8.2,
                    "chrf_score": 24.5,
                    "sanity_check_passed": True,
                    "sample_outputs": []
                },
                "adapted_results": {
                    "loss": 2.15,
                    "bleu_score": 21.4,
                    "chrf_score": 48.9,
                    "sanity_check_passed": True,
                    "sample_outputs": []
                },
                "human_review_results": {
                    "total_samples_reviewed": 30,
                    "approved_count": 26,
                    "rejected_count": 4,
                    "needs_correction_count": 0,
                    "reviewer_role_or_id": "Igala Native Speaker (External Reviewer 1)",
                    "notes": "Tone markers and verb agglutination noticeably more natural than base model."
                },
                "adapter_path": "./experiments/igala-v1/adapter",
                "git_commit": "e4f8b91a",
                "created_at": "2026-10-08T15:30:00Z",
                "status": "completed"
            }
        }
