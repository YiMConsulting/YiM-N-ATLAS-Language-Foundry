from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from foundry.review.human_review import (
    HumanReviewSummary,
    ReviewDecision,
    ReviewDecisionRecord,
    ReviewRequest,
    ReviewRequestStatus,
    ReviewSampleItem,
)

NOW = datetime.now(timezone.utc)


def test_valid_review_request():
    request = ReviewRequest(
        id="review-001",
        dataset_id="dataset-igl-001",
        reviewer_id="reviewer-01",
        sample_size=30,
        status=ReviewRequestStatus.pending,
        created_at=NOW,
    )
    assert request.id == "review-001"
    assert request.dataset_id == "dataset-igl-001"
    assert request.status == ReviewRequestStatus.pending


def test_valid_review_sample_item():
    item = ReviewSampleItem(
        id="sample-001",
        review_request_id="review-001",
        record_id="rec-001",
        input_text="Good morning",
        expected_text="Ọlọjọ kọla",
        sampled_at=NOW,
    )
    assert item.id == "sample-001"
    assert item.record_id == "rec-001"
    assert item.input_text == "Good morning"


def test_valid_review_decision_record():
    decision = ReviewDecisionRecord(
        id="decision-001",
        review_request_id="review-001",
        sample_item_id="sample-001",
        decision=ReviewDecision.correct,
        reviewed_at=NOW,
    )
    assert decision.decision == ReviewDecision.correct


def test_needs_correction_with_corrected_text():
    decision = ReviewDecisionRecord(
        id="decision-001",
        review_request_id="review-001",
        sample_item_id="sample-001",
        decision=ReviewDecision.needs_correction,
        corrected_text="Corrected translation",
        reviewed_at=NOW,
    )
    assert decision.corrected_text == "Corrected translation"


def test_valid_review_summary():
    summary = HumanReviewSummary(
        total_reviewed=10,
        correct_count=7,
        incorrect_count=2,
        needs_correction_count=1,
    )
    assert summary.total_reviewed == 10


def test_review_summary_counts_must_match_total():
    with pytest.raises(ValidationError):
        HumanReviewSummary(
            total_reviewed=10,
            correct_count=7,
            incorrect_count=2,
            needs_correction_count=2,
        )


def test_review_summary_all_correct():
    summary = HumanReviewSummary(
        total_reviewed=20,
        correct_count=20,
        incorrect_count=0,
        needs_correction_count=0,
    )
    assert summary.correct_count == 20


def test_review_decision_values():
    expected = {"correct", "incorrect", "needs_correction"}
    actual = {d.value for d in ReviewDecision}
    assert actual == expected


def test_review_request_status_values():
    expected = {"pending", "in_progress", "completed", "cancelled"}
    actual = {s.value for s in ReviewRequestStatus}
    assert actual == expected
