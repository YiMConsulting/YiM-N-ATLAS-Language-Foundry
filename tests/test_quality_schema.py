from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from api.schemas.quality import AuditStatus, QualityAudit


def make_audit(**kwargs):
    now = datetime.now(timezone.utc)
    base = {
        "id": "audit_igl_001",
        "dataset_id": "dataset_igl_001",
        "status": AuditStatus.passed,
        "total_records": 100,
        "valid_records": 100,
        "audited_at": now,
    }
    base.update(kwargs)
    return QualityAudit(**base)


def test_quality_audit_accepts_valid_data():
    audit = make_audit()
    assert audit.id == "audit_igl_001"
    assert audit.dataset_id == "dataset_igl_001"
    assert audit.status == AuditStatus.passed
    assert audit.total_records == 100
    assert audit.valid_records == 100
    assert audit.empty_records == 0
    assert audit.malformed_records == 0
    assert audit.missing_required_fields == 0
    assert audit.duplicate_records == 0
    assert audit.duplicate_rate == 0.0
    assert audit.suspected_language_mismatches == 0
    assert audit.warnings == []
    assert audit.errors == []
    assert audit.audit_version == "1.0"


@pytest.mark.parametrize(
    "field_name",
    [
        "total_records",
        "valid_records",
        "empty_records",
        "malformed_records",
        "missing_required_fields",
        "duplicate_records",
        "suspected_language_mismatches",
    ],
)
def test_quality_audit_rejects_negative_counts(field_name):
    with pytest.raises(ValidationError):
        make_audit(**{field_name: -1})


@pytest.mark.parametrize(
    "duplicate_rate",
    [-0.01, 1.01],
)
def test_quality_audit_rejects_invalid_duplicate_rate(duplicate_rate):
    with pytest.raises(ValidationError):
        make_audit(duplicate_rate=duplicate_rate)


def test_quality_audit_rejects_valid_records_above_total_records():
    with pytest.raises(ValidationError, match="valid_records"):
        make_audit(
            total_records=100,
            valid_records=101,
        )


@pytest.mark.parametrize(
    "field_name",
    [
        "empty_records",
        "malformed_records",
        "missing_required_fields",
        "duplicate_records",
        "suspected_language_mismatches",
    ],
)
def test_quality_audit_rejects_issue_count_above_total_records(
    field_name,
):
    with pytest.raises(ValidationError):
        make_audit(
            total_records=100,
            **{field_name: 101},
        )


def test_quality_audit_accepts_warning_status():
    audit = make_audit(
        status=AuditStatus.warning,
        warnings=["Duplicate records detected."],
    )
    assert audit.status == AuditStatus.warning
