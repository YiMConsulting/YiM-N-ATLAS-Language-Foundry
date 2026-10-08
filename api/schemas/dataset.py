from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class DatasetFormat(str, Enum):
    jsonl = "jsonl"
    json = "json"
    csv = "csv"
    tsv = "tsv"
    parquet = "parquet"
    txt = "txt"


class DatasetSourceType(str, Enum):
    research = "research"
    community = "community"
    institutional = "institutional"
    private = "private"


class DatasetStatus(str, Enum):
    registered = "registered"
    provenance_checked = "provenance_checked"
    audited = "audited"
    reviewed = "reviewed"
    ready = "ready"
    rejected = "rejected"


class DatasetProvenance(BaseModel):
    id: str
    source_name: str
    source_url: str | None = None
    license: str
    version: str | None = None
    published_at: datetime | None = None
    retrieved_at: datetime
    usage_allowed: bool
    usage_notes: str | None = None
    checksum: str | None = None


class Dataset(BaseModel):
    id: str
    language_code: str
    name: str
    description: str | None = None
    format: DatasetFormat
    source_type: DatasetSourceType
    record_count: int | None = Field(default=None, ge=0)
    local_path: str | None = None
    provenance_id: str
    version: str | None = None
    status: DatasetStatus = DatasetStatus.registered
    created_at: datetime
    updated_at: datetime
