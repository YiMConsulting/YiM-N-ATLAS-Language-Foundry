from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from api.schemas.dataset import (
    Dataset,
    DatasetFormat,
    DatasetProvenance,
    DatasetSourceType,
    DatasetStatus,
)


def test_dataset_provenance_accepts_valid_data():
    now = datetime.now(timezone.utc)
    provenance = DatasetProvenance(
        id="prov_igl_001",
        source_name="Example Research Dataset",
        source_url="https://example.org/dataset",
        license="Example License",
        version="1.0",
        published_at=now,
        retrieved_at=now,
        usage_allowed=True,
        usage_notes="Permitted for research and model adaptation.",
        checksum="sha256:abc123",
    )
    assert provenance.id == "prov_igl_001"
    assert provenance.source_name == "Example Research Dataset"
    assert provenance.license == "Example License"
    assert provenance.usage_allowed is True
    assert provenance.checksum == "sha256:abc123"


def test_dataset_accepts_valid_data():
    now = datetime.now(timezone.utc)
    dataset = Dataset(
        id="dataset_igl_001",
        language_code="igl",
        name="Igala Parallel Dataset",
        description="Dataset used for the first Foundry adaptation experiment.",
        format=DatasetFormat.jsonl,
        source_type=DatasetSourceType.research,
        record_count=5000,
        local_path="data/raw/igl_001/",
        provenance_id="prov_igl_001",
        version="1.0",
        status=DatasetStatus.registered,
        created_at=now,
        updated_at=now,
    )
    assert dataset.id == "dataset_igl_001"
    assert dataset.language_code == "igl"
    assert dataset.format == DatasetFormat.jsonl
    assert dataset.source_type == DatasetSourceType.research
    assert dataset.record_count == 5000


def test_dataset_status_defaults_to_registered():
    now = datetime.now(timezone.utc)
    dataset = Dataset(
        id="dataset_igl_001",
        language_code="igl",
        name="Igala Parallel Dataset",
        format=DatasetFormat.jsonl,
        source_type=DatasetSourceType.research,
        provenance_id="prov_igl_001",
        created_at=now,
        updated_at=now,
    )
    assert dataset.status == DatasetStatus.registered


def test_dataset_rejects_negative_record_count():
    now = datetime.now(timezone.utc)
    with pytest.raises(ValidationError):
        Dataset(
            id="dataset_igl_001",
            language_code="igl",
            name="Igala Parallel Dataset",
            format=DatasetFormat.jsonl,
            source_type=DatasetSourceType.research,
            record_count=-1,
            provenance_id="prov_igl_001",
            created_at=now,
            updated_at=now,
        )


def test_dataset_status_values_are_valid():
    expected = {
        "registered",
        "provenance_checked",
        "audited",
        "reviewed",
        "ready",
        "rejected",
    }
    actual = {status.value for status in DatasetStatus}
    assert actual == expected


def test_dataset_source_type_values_are_valid():
    expected = {
        "research",
        "community",
        "institutional",
        "private",
    }
    actual = {st.value for st in DatasetSourceType}
    assert actual == expected
