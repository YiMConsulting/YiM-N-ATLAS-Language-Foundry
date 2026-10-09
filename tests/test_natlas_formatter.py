import pytest
from api.schemas.dataset import DatasetRecord
from foundry.training.natlas_formatter import NAtlasFormatter


class FakeTokenizer:
    def __init__(self):
        self.calls = []

    def apply_chat_template(
        self,
        messages: list[dict[str, str]],
        tokenize: bool = False,
        add_generation_prompt: bool = False,
    ) -> str:
        self.calls.append(
            {
                "messages": messages,
                "tokenize": tokenize,
                "add_generation_prompt": add_generation_prompt,
            }
        )
        return (
            f"<user>{messages[0]['content']}</user>"
            f"<assistant>{messages[1]['content']}</assistant>"
        )


def make_record(
    id: str = "record-001",
    input: str = "How are you?",
    target: str = "Awa nɔ?",
    language_code: str = "igl",
) -> DatasetRecord:
    return DatasetRecord(
        id=id,
        input=input,
        target=target,
        language_code=language_code,
    )


def test_formatter_creates_user_and_assistant_messages():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    result = formatter.format(make_record())
    assert result.messages == [
        {
            "role": "user",
            "content": "How are you?",
        },
        {
            "role": "assistant",
            "content": "Awa nɔ?",
        },
    ]


def test_formatter_preserves_record_identity():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    result = formatter.format(make_record())
    assert result.record_id == "record-001"
    assert result.language_code == "igl"


def test_formatter_uses_chat_template_for_training():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    formatter.format(make_record())
    assert len(tokenizer.calls) == 1
    call = tokenizer.calls[0]
    assert call["tokenize"] is False
    assert call["add_generation_prompt"] is False


def test_formatter_returns_formatted_text():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    result = formatter.format(make_record())
    assert result.formatted_text == (
        "<user>How are you?</user>"
        "<assistant>Awa nɔ?</assistant>"
    )


def test_formatter_rejects_empty_input():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    record = DatasetRecord(
        id="rec-01",
        input="   ",
        target="Valid target",
        language_code="igl",
    )
    with pytest.raises(ValueError, match="DatasetRecord.input cannot be empty"):
        formatter.format(record)


def test_formatter_rejects_empty_target():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    record = DatasetRecord(
        id="rec-02",
        input="Valid input",
        target="   ",
        language_code="igl",
    )
    with pytest.raises(ValueError, match="DatasetRecord.target cannot be empty"):
        formatter.format(record)


def test_formatter_rejects_empty_language_code():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    record = DatasetRecord(
        id="rec-03",
        input="Valid input",
        target="Valid target",
        language_code="   ",
    )
    with pytest.raises(ValueError, match="DatasetRecord.language_code cannot be empty"):
        formatter.format(record)


def test_formatter_supports_any_registered_language():
    tokenizer = FakeTokenizer()
    formatter = NAtlasFormatter(tokenizer)
    for lang in ["igl", "ibo", "yor", "hau", "ful", "ede"]:
        record = make_record(language_code=lang)
        result = formatter.format(record)
        assert result.language_code == lang
        assert result.messages[0]["content"] == "How are you?"
        assert result.messages[1]["content"] == "Awa nɔ?"
