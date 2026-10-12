"""Pydantic schemas for verified offline dataset review evidence."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class MetricScoreSummary(BaseModel):
    metric_name: str
    scale: str
    description: str
    mean_score: Optional[float] = None
    pass_count: Optional[int] = None
    total_count: int = Field(..., ge=0)
    score_distribution: Dict[str, int] = Field(default_factory=dict)


class ReviewerScopeSummary(BaseModel):
    assigned_reviewers: List[str]
    completed_reviewers: List[str]
    pending_reviewers: List[str]


class DatasetReviewEvidence(BaseModel):
    dataset_id: str
    language_code: str
    review_type: str = "offline_manual_pilot"
    artifact_name: str
    sheet_name: str
    status: str
    total_sampled_records: int = Field(..., ge=0)
    reviewed_records: int = Field(..., ge=0)
    pending_records: int = Field(..., ge=0)
    coverage_ratio: float = Field(..., ge=0.0, le=1.0)
    sources_breakdown: Dict[str, int] = Field(default_factory=dict)
    reviewer_scope: ReviewerScopeSummary
    metrics: Dict[str, MetricScoreSummary]
    qualitative_findings: List[str] = Field(default_factory=list)
    qualification: str
    evaluated_at: str
