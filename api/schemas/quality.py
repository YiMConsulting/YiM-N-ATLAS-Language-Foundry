from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, model_validator


class AuditStatus(str, Enum):
    passed = "passed"
    warning = "warning"
    failed = "failed"


class QualityAudit(BaseModel):
    id: str
    dataset_id: str
    status: AuditStatus
    total_records: int = Field(..., ge=0)
    valid_records: int = Field(..., ge=0)
    empty_records: int = Field(default=0, ge=0)
    malformed_records: int = Field(default=0, ge=0)
    missing_required_fields: int = Field(default=0, ge=0)
    duplicate_records: int = Field(default=0, ge=0)
    duplicate_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    suspected_language_mismatches: int = Field(default=0, ge=0)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    audit_version: str = "1.0"
    audited_at: datetime

    @model_validator(mode="after")
    def validate_record_counts(self):
        if self.valid_records > self.total_records:
            raise ValueError(
                "valid_records cannot exceed total_records"
            )
        issue_counts = {
            "empty_records": self.empty_records,
            "malformed_records": self.malformed_records,
            "missing_required_fields": self.missing_required_fields,
            "duplicate_records": self.duplicate_records,
            "suspected_language_mismatches": (
                self.suspected_language_mismatches
            ),
        }
        for field_name, count in issue_counts.items():
            if count > self.total_records:
                raise ValueError(
                    f"{field_name} cannot exceed total_records"
                )
        return self
