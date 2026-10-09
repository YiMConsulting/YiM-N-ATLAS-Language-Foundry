
import pytest

from foundry.training.collator import NAtlasDataCollator
from foundry.training.preprocessing import (
    IGNORE_INDEX,
    TokenizedTrainingExample,
)


class FakeTokenizer:
    pad_token_id = 0
    padding_side = "right"


def make_example(record_id, input_ids, labels, attention_mask=None):
    if attention_mask is None:
        attention_mask = [1] * len(input_ids)

    return TokenizedTrainingExample(
        record_id=record_id,
        language_code="igl",
        input_ids=input_ids,
        attention_mask=attention_mask,
        labels=labels,
    )


def test_collator_pads_to_longest_example():
    torch = pytest.importorskip("torch")
    collator = NAtlasDataCollator(FakeTokenizer())

    examples = [
        make_example("a", [1, 2, 3], [-100, 2, 3]),
        make_example("b", [4, 5], [-100, 5]),
    ]

    batch = collator(examples)

    assert batch["input_ids"].shape == (2, 3)
    assert batch["attention_mask"].tolist() == [
        [1, 1, 1],
        [1, 1, 0],
    ]
    assert batch["input_ids"].tolist() == [
        [1, 2, 3],
        [4, 5, 0],
    ]
    assert batch["labels"].tolist() == [
        [-100, 2, 3],
        [-100, 5, IGNORE_INDEX],
    ]

    assert batch["input_ids"].dtype == torch.long
    assert batch["attention_mask"].dtype == torch.long
    assert batch["labels"].dtype == torch.long


def test_collator_preserves_prompt_masking():
    collator = NAtlasDataCollator(FakeTokenizer())

    example = make_example(
        "a",
        [1, 2, 3, 4],
        [IGNORE_INDEX, IGNORE_INDEX, 3, 4],
    )

    batch = collator([example])

    assert batch["labels"].tolist() == [
        [-100, -100, 3, 4]
    ]


def test_collator_rejects_empty_batch():
    collator = NAtlasDataCollator(FakeTokenizer())

    with pytest.raises(ValueError, match="empty batch"):
        collator([])


def test_collator_rejects_inconsistent_lengths():
    collator = NAtlasDataCollator(FakeTokenizer())

    example = make_example(
        "bad",
        [1, 2, 3],
        [-100, 2, 3],
        attention_mask=[1, 1],
    )

    with pytest.raises(ValueError, match="inconsistent"):
        collator([example])


def test_collator_rejects_missing_padding_token():
    class NoPadTokenizer:
        pad_token_id = None
        padding_side = "right"

    collator = NAtlasDataCollator(NoPadTokenizer())
    example = make_example("a", [1, 2], [-100, 2])

    with pytest.raises(ValueError, match="pad_token_id"):
        collator([example])


def test_collator_supports_left_padding():
    class LeftPaddingTokenizer:
        pad_token_id = 0
        padding_side = "left"

    collator = NAtlasDataCollator(LeftPaddingTokenizer())

    examples = [
        make_example("a", [1, 2, 3], [-100, 2, 3]),
        make_example("b", [4, 5], [-100, 5]),
    ]

    batch = collator(examples)

    assert batch["input_ids"].tolist() == [
        [1, 2, 3],
        [0, 4, 5],
    ]
    assert batch["attention_mask"].tolist() == [
        [1, 1, 1],
        [0, 1, 1],
    ]
    assert batch["labels"].tolist() == [
        [-100, 2, 3],
        [-100, -100, 5],
    ]
