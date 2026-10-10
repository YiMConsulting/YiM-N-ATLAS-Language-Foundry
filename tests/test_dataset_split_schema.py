from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from foundry.datasets.split import DatasetSplit, SplitStrategy

NOW = datetime.now(timezone.utc)


def test_valid_dataset_split():
    split = DatasetSplit(
        id="split-001",
        dataset_id="dataset-001",
        seed=42,
        train_ratio=0.75,
        validation_ratio=0.10,
        test_ratio=0.15,
        total_records=1000,
        train_records=750,
        validation_records=100,
        test_records=150,
        created_at=NOW,
    )
    assert split.strategy == SplitStrategy.random
    assert split.seed == 42
    assert split.total_records == 1000
    assert split.train_records == 750
    assert split.validation_records == 100
    assert split.test_records == 150


def test_split_ratios_must_sum_to_one():
    with pytest.raises(ValidationError):
        DatasetSplit(
            id="split-001",
            dataset_id="dataset-001",
            seed=42,
            train_ratio=0.70,
            validation_ratio=0.10,
            test_ratio=0.10,
            total_records=1000,
            train_records=700,
            validation_records=100,
            test_records=200,
            created_at=NOW,
        )


def test_split_record_counts_must_match_total():
    with pytest.raises(ValidationError):
        DatasetSplit(
            id="split-001",
            dataset_id="dataset-001",
            seed=42,
            train_ratio=0.75,
            validation_ratio=0.10,
            test_ratio=0.15,
            total_records=1000,
            train_records=700,
            validation_records=100,
            test_records=150,
            created_at=NOW,
        )


def test_negative_record_count_is_rejected():
    with pytest.raises(ValidationError):
        DatasetSplit(
            id="split-001",
            dataset_id="dataset-001",
            seed=42,
            train_ratio=0.75,
            validation_ratio=0.10,
            test_ratio=0.15,
            total_records=1000,
            train_records=-1,
            validation_records=100,
            test_records=901,
            created_at=NOW,
        )


def test_zero_ratio_is_rejected():
    with pytest.raises(ValidationError):
        DatasetSplit(
            id="split-001",
            dataset_id="dataset-001",
            seed=42,
            train_ratio=0.0,
            validation_ratio=0.50,
            test_ratio=0.50,
            total_records=1000,
            train_records=0,
            validation_records=500,
            test_records=500,
            created_at=NOW,
        )


def test_split_strategy_values():
    assert [s.value for s in SplitStrategy] == ["random", "grouped_by_input"]
