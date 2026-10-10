from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class LanguageStatus(str, Enum):
    discovered = "discovered"
    registered = "registered"
    data_available = "data_available"
    ready = "ready"
    adapting = "adapting"
    adapted = "adapted"


class Language(BaseModel):
    id: str = Field(
        ...,
        description="Internal Foundry language identifier",
    )
    name: str = Field(
        ...,
        min_length=1,
    )
    code: str = Field(
        ...,
        min_length=2,
        max_length=8,
    )
    description: str | None = None
    status: LanguageStatus = LanguageStatus.discovered
    created_at: datetime
    updated_at: datetime
