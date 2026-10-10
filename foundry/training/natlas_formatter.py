from dataclasses import dataclass
from api.schemas.dataset import DatasetRecord


@dataclass(frozen=True)
class FormattedTrainingExample:
    record_id: str
    language_code: str
    messages: list[dict[str, str]]
    formatted_text: str


class NAtlasFormatter:
    """
    Converts canonical Foundry DatasetRecords into the conversational
    representation expected by N-ATLaS.
    """

    def __init__(self, tokenizer):
        self.tokenizer = tokenizer

    def _validate_record(self, record: DatasetRecord) -> None:
        if not record.input.strip():
            raise ValueError("DatasetRecord.input cannot be empty")
        if not record.target.strip():
            raise ValueError("DatasetRecord.target cannot be empty")
        if not record.language_code.strip():
            raise ValueError("DatasetRecord.language_code cannot be empty")

    def build_messages(
        self,
        record: DatasetRecord,
    ) -> list[dict[str, str]]:
        return [
            {
                "role": "user",
                "content": record.input,
            },
            {
                "role": "assistant",
                "content": record.target,
            },
        ]

    def format(
        self,
        record: DatasetRecord,
    ) -> FormattedTrainingExample:
        self._validate_record(record)
        messages = self.build_messages(record)
        formatted_text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=False,
        )
        return FormattedTrainingExample(
            record_id=record.id,
            language_code=record.language_code,
            messages=messages,
            formatted_text=formatted_text,
        )
