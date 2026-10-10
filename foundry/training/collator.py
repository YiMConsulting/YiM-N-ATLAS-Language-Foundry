
from dataclasses import dataclass

from foundry.training.preprocessing import (
    IGNORE_INDEX,
    TokenizedTrainingExample,
)


@dataclass
class NAtlasDataCollator:
    tokenizer: object

    def __call__(
        self,
        examples: list[TokenizedTrainingExample],
    ) -> dict:
        if not examples:
            raise ValueError("Cannot collate an empty batch.")

        pad_token_id = self.tokenizer.pad_token_id

        if pad_token_id is None:
            raise ValueError(
                "Tokenizer must define pad_token_id before batching."
            )

        padding_side = getattr(
            self.tokenizer, "padding_side", "right"
        )

        if padding_side not in {"left", "right"}:
            raise ValueError(
                f"Unsupported padding_side: {padding_side}"
            )

        for example in examples:
            lengths = (
                len(example.input_ids),
                len(example.attention_mask),
                len(example.labels),
            )

            if not example.input_ids:
                raise ValueError(
                    f"Example {example.record_id} has no input tokens."
                )

            if len(set(lengths)) != 1:
                raise ValueError(
                    f"Example {example.record_id} has inconsistent "
                    "input_ids, attention_mask, and labels lengths."
                )

        max_length = max(
            len(example.input_ids) for example in examples
        )

        batch_input_ids = []
        batch_attention_mask = []
        batch_labels = []

        for example in examples:
            padding_length = max_length - len(example.input_ids)

            pad_ids = [pad_token_id] * padding_length
            pad_mask = [0] * padding_length
            pad_labels = [IGNORE_INDEX] * padding_length

            if padding_side == "right":
                input_ids = example.input_ids + pad_ids
                attention_mask = example.attention_mask + pad_mask
                labels = example.labels + pad_labels
            else:
                input_ids = pad_ids + example.input_ids
                attention_mask = pad_mask + example.attention_mask
                labels = pad_labels + example.labels

            batch_input_ids.append(input_ids)
            batch_attention_mask.append(attention_mask)
            batch_labels.append(labels)

        try:
            import torch
        except ImportError as exc:
            raise RuntimeError(
                "PyTorch is required to create training batches."
            ) from exc

        return {
            "input_ids": torch.tensor(
                batch_input_ids, dtype=torch.long
            ),
            "attention_mask": torch.tensor(
                batch_attention_mask, dtype=torch.long
            ),
            "labels": torch.tensor(
                batch_labels, dtype=torch.long
            ),
        }
