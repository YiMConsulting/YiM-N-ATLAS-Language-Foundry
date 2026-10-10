from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, model_validator


class SplitStrategy(str, Enum):
    random = "random"


class DatasetSplit(BaseModel):
    id: str
    dataset_id: str
    strategy: SplitStrategy = SplitStrategy.random
    seed: int
    train_ratio: float = Field(..., gt=0.0, lt=1.0)
    validation_ratio: float = Field(..., gt=0.0, lt=1.0)
    test_ratio: float = Field(..., gt=0.0, lt=1.0)
    total_records: int = Field(..., ge=0)
    train_records: int = Field(..., ge=0)
    validation_records: int = Field(..., ge=0)
    test_records: int = Field(..., ge=0)
    created_at: datetime

    @model_validator(mode="after")
    def validate_split(self):
        ratio_total = (
            self.train_ratio
            + self.validation_ratio
            + self.test_ratio
        )
        if abs(ratio_total - 1.0) > 1e-6:
            raise ValueError(
                "train_ratio, validation_ratio, and test_ratio "
                "must sum to 1.0"
            )
        record_total = (
            self.train_records
            + self.validation_records
            + self.test_records
        )
        if record_total != self.total_records:
            raise ValueError(
                "train_records, validation_records, and test_records "
                "must sum to total_records"
            )
        return self
