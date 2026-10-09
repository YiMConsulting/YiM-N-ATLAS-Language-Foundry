from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, model_validator


class ReviewRequestStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ReviewDecision(str, Enum):
    correct = "correct"
    incorrect = "incorrect"
    needs_correction = "needs_correction"


class ReviewRequest(BaseModel):
    id: str
    dataset_id: str
    reviewer_id: str | None = None
    sample_size: int = Field(default=30, ge=1)
    status: ReviewRequestStatus = ReviewRequestStatus.pending
    created_at: datetime
    updated_at: datetime | None = None


class ReviewSampleItem(BaseModel):
    id: str
    review_request_id: str
    # Identifier for the original record in the dataset.
    record_id: str
    # The content shown to the reviewer.
    input_text: str
    expected_text: str
    sampled_at: datetime


class ReviewDecisionRecord(BaseModel):
    id: str
    review_request_id: str
    sample_item_id: str
    decision: ReviewDecision
    reviewer_id: str | None = None
    corrected_text: str | None = None
    notes: str | None = None
    reviewed_at: datetime


class HumanReviewSummary(BaseModel):
    total_reviewed: int = Field(..., ge=0)
    correct_count: int = Field(default=0, ge=0)
    incorrect_count: int = Field(default=0, ge=0)
    needs_correction_count: int = Field(default=0, ge=0)
    review_request_id: str | None = None
    reviewer_id: str | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def validate_counts(self):
        if (
            self.correct_count
            + self.incorrect_count
            + self.needs_correction_count
            != self.total_reviewed
        ):
            raise ValueError(
                "Sum of correct_count, incorrect_count, and needs_correction_count must equal total_reviewed"
            )
        return self
