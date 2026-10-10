import pytest
from pydantic import ValidationError
from foundry.datasets.record import DatasetRecord


def test_valid_dataset_record():
    record = DatasetRecord(
        id="igl-000001",
        input="How are you?",
        target="Test Igala response",
        language_code="igl",
    )
    assert record.id == "igl-000001"
    assert record.input == "How are you?"
    assert record.target == "Test Igala response"
    assert record.language_code == "igl"


def test_empty_id_is_rejected():
    with pytest.raises(ValidationError):
        DatasetRecord(
            id="",
            input="How are you?",
            target="Response",
            language_code="igl",
        )


def test_empty_input_is_rejected():
    with pytest.raises(ValidationError):
        DatasetRecord(
            id="igl-000001",
            input="",
            target="Response",
            language_code="igl",
        )


def test_empty_target_is_rejected():
    with pytest.raises(ValidationError):
        DatasetRecord(
            id="igl-000001",
            input="How are you?",
            target="",
            language_code="igl",
        )


def test_language_code_must_be_at_least_two_characters():
    with pytest.raises(ValidationError):
        DatasetRecord(
            id="igl-000001",
            input="How are you?",
            target="Response",
            language_code="i",
        )
