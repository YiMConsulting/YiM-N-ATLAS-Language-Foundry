from dataclasses import dataclass
from foundry.datasets.record import DatasetRecord

IGNORE_INDEX = -100


@dataclass(frozen=True)
class TokenizedTrainingExample:
    record_id: str
    language_code: str
    input_ids: list[int]
    attention_mask: list[int]
    labels: list[int]


class NAtlasPreprocessor:
    """
    Tokenizes canonical Foundry DatasetRecords using the N-ATLaS chat template,
    masks the prompt portion with IGNORE_INDEX (-100), and retains supervision
    only on the assistant response tokens (including end-of-turn tokens).
    """

    def __init__(self, tokenizer, max_length: int = 512):
        if max_length <= 0:
            raise ValueError("max_length must be positive")
        self.tokenizer = tokenizer
        self.max_length = max_length

    def preprocess(
        self, record: DatasetRecord
    ) -> TokenizedTrainingExample:
        if not record.input.strip():
            raise ValueError("input cannot be empty")
        if not record.target.strip():
            raise ValueError("target cannot be empty")

        messages = [
            {"role": "user", "content": record.input},
            {"role": "assistant", "content": record.target},
        ]

        prompt_result = self.tokenizer.apply_chat_template(
            messages[:1],
            tokenize=True,
            add_generation_prompt=True,
            return_dict=True,
        )
        full_result = self.tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=False,
            return_dict=True,
        )

        # return_dict=True gives us a mapping containing input_ids.
        prompt_ids = list(prompt_result["input_ids"])
        input_ids = list(full_result["input_ids"])

        # Fail safely if this example does not have a verified prefix boundary.
        if input_ids[: len(prompt_ids)] != prompt_ids:
            raise ValueError(
                "Prompt tokens are not a prefix of the full conversation. "
                "Cannot safely construct assistant-only labels."
            )

        prompt_length = len(prompt_ids)
        if prompt_length >= len(input_ids):
            raise ValueError(
                "Full conversation contains no assistant response tokens."
            )

        if len(input_ids) > self.max_length:
            raise ValueError(
                f"Example length ({len(input_ids)}) exceeds configured max_length ({self.max_length})"
            )

        labels = [IGNORE_INDEX] * prompt_length + list(input_ids[prompt_length:])

        attention_mask = list(full_result["attention_mask"])

        return TokenizedTrainingExample(
            record_id=record.id,
            language_code=record.language_code,
            input_ids=list(input_ids),
            attention_mask=attention_mask,
            labels=labels,
        )
