from pydantic import BaseModel, Field


class DatasetRecord(BaseModel):
    id: str = Field(..., min_length=1)
    input: str = Field(..., min_length=1)
    target: str = Field(..., min_length=1)
    language_code: str = Field(..., min_length=2, max_length=8)
