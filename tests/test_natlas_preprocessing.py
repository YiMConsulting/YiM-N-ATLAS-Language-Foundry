from collections import UserDict
import pytest
from foundry.datasets.record import DatasetRecord
from foundry.training.preprocessing import (
    IGNORE_INDEX,
    NAtlasPreprocessor,
    TokenizedTrainingExample,
)


class FakeTokenizer:
    def __init__(self, prefix_mismatch: bool = False, empty_assistant: bool = False):
        self.prefix_mismatch = prefix_mismatch
        self.empty_assistant = empty_assistant

    def apply_chat_template(
        self,
        messages: list[dict[str, str]],
        tokenize: bool = True,
        add_generation_prompt: bool = False,
        return_dict: bool = True,
    ) -> dict[str, list[int]]:
        prompt_ids = [128000, 100, 101, 128009]
        assistant_ids = [] if self.empty_assistant else [200, 201, 128009]

        if len(messages) == 1:
            return {
                "input_ids": list(prompt_ids),
                "attention_mask": [1] * len(prompt_ids),
            }
        else:
            if self.prefix_mismatch:
                full_ids = [999999] + prompt_ids[1:] + assistant_ids
            else:
                full_ids = prompt_ids + assistant_ids
            return {
                "input_ids": list(full_ids),
                "attention_mask": [1] * len(full_ids),
            }


def make_record(
    id: str = "rec-001",
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


def test_prompt_tokens_are_masked_with_ignore_index():
    tokenizer = FakeTokenizer()
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)
    example = preprocessor.preprocess(make_record())

    # Prompt length is 4
    assert example.labels[:4] == [IGNORE_INDEX, IGNORE_INDEX, IGNORE_INDEX, IGNORE_INDEX]


def test_assistant_and_eot_tokens_remain_supervised():
    tokenizer = FakeTokenizer()
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)
    example = preprocessor.preprocess(make_record())

    # Assistant tokens are [200, 201, 128009] (including eot token 128009)
    assert example.labels[4:] == [200, 201, 128009]
    assert example.input_ids[4:] == [200, 201, 128009]


def test_input_ids_attention_mask_and_labels_have_equal_lengths():
    tokenizer = FakeTokenizer()
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)
    example = preprocessor.preprocess(make_record())

    assert len(example.input_ids) == len(example.attention_mask) == len(example.labels) == 7


def test_empty_input_and_empty_target_are_rejected():
    tokenizer = FakeTokenizer()
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)

    with pytest.raises(ValueError, match="input cannot be empty"):
        preprocessor.preprocess(
            DatasetRecord(id="rec-01", input="   ", target="Valid", language_code="igl")
        )

    with pytest.raises(ValueError, match="target cannot be empty"):
        preprocessor.preprocess(
            DatasetRecord(id="rec-02", input="Valid", target="   ", language_code="igl")
        )


def test_example_longer_than_max_length_is_rejected():
    tokenizer = FakeTokenizer()
    # Total tokens is 7; max_length=6 will reject
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=6)

    with pytest.raises(ValueError, match="exceeds configured max_length"):
        preprocessor.preprocess(make_record())


def test_mismatched_prompt_boundary_is_rejected():
    tokenizer = FakeTokenizer(prefix_mismatch=True)
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)

    with pytest.raises(
        ValueError, match="Prompt tokens are not a prefix of the full conversation"
    ):
        preprocessor.preprocess(make_record())


def test_record_identity_and_language_code_are_preserved():
    tokenizer = FakeTokenizer()
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)
    example = preprocessor.preprocess(make_record(id="igl-999", language_code="igl"))

    assert example.record_id == "igl-999"
    assert example.language_code == "igl"


def test_invalid_max_length_raises_value_error():
    tokenizer = FakeTokenizer()
    with pytest.raises(ValueError, match="max_length must be positive"):
        NAtlasPreprocessor(tokenizer=tokenizer, max_length=0)
    with pytest.raises(ValueError, match="max_length must be positive"):
        NAtlasPreprocessor(tokenizer=tokenizer, max_length=-10)


def test_empty_assistant_response_raises_value_error():
    tokenizer = FakeTokenizer(empty_assistant=True)
    preprocessor = NAtlasPreprocessor(tokenizer=tokenizer, max_length=512)

    with pytest.raises(
        ValueError, match="Full conversation contains no assistant response tokens"
    ):
        preprocessor.preprocess(make_record())


def test_preprocessor_accepts_mapping_like_tokenizer_output():
    class MappingTokenizer(FakeTokenizer):
        def apply_chat_template(
            self,
            messages,
            tokenize=True,
            add_generation_prompt=False,
            return_dict=True,
        ):
            result = super().apply_chat_template(
                messages,
                tokenize=tokenize,
                add_generation_prompt=add_generation_prompt,
                return_dict=return_dict,
            )
            return UserDict(result)

    preprocessor = NAtlasPreprocessor(
        tokenizer=MappingTokenizer(),
        max_length=512,
    )
    example = preprocessor.preprocess(make_record())
    assert example.input_ids == [
        128000, 100, 101, 128009, 200, 201, 128009
    ]
    assert example.labels == [
        IGNORE_INDEX,
        IGNORE_INDEX,
        IGNORE_INDEX,
        IGNORE_INDEX,
        200,
        201,
        128009,
    ]
    assert example.attention_mask == [1, 1, 1, 1, 1, 1, 1]

