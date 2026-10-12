"""Harness and prompt formatting for N-ATLaS translation evaluations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from api.schemas.dataset import DatasetRecord

DEFAULT_TIV_TRANSLATION_TEMPLATE = "Translate the following English text into Tiv:\n{text}"
TEMPLATE_VERSION = "v1-explicit-instruction"


class EvaluationPromptBuilder:
    """
    Constructs standardized, instruction-explicit generation prompts for
    evaluating translation performance on N-ATLaS.

    Guarantees:
    1. The reference translation (DatasetRecord.target) is never included in the prompt.
    2. The prompt format is identical between base and adapted model evaluations.
    3. Empty or whitespace-only inputs are rejected safely.
    """

    def __init__(self, template: str = DEFAULT_TIV_TRANSLATION_TEMPLATE):
        if not template.strip() or "{text}" not in template:
            raise ValueError("Template must contain a non-empty '{text}' placeholder.")
        self.template = template

    def format_user_instruction(self, input_text: str) -> str:
        if not input_text or not input_text.strip():
            raise ValueError("Evaluation input text cannot be empty.")
        return self.template.format(text=input_text.strip())

    def build_messages(
        self,
        record: DatasetRecord,
    ) -> list[dict[str, str]]:
        """
        Build single-turn user messages for evaluation.
        Ensures reference target is strictly excluded.
        """
        instruction_content = self.format_user_instruction(record.input)
        return [
            {
                "role": "user",
                "content": instruction_content,
            }
        ]

    def render_prompt(
        self,
        tokenizer: Any,
        record: DatasetRecord,
    ) -> str:
        """
        Render the final generation prompt via tokenizer chat template.
        """
        messages = self.build_messages(record)
        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    def render_input_prompt(
        self,
        tokenizer: Any,
        input_text: str,
    ) -> str:
        """
        Render the final generation prompt for raw input text.
        """
        instruction_content = self.format_user_instruction(input_text)
        messages = [
            {
                "role": "user",
                "content": instruction_content,
            }
        ]
        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )


@dataclass
class EvaluationHarnessConfig:
    """
    Metadata configuration for reproducible translation evaluation runs.
    """

    base_model_id: str = "NCAIR1/N-ATLaS"
    base_model_revision: str = "e294476928aca9030e924ca27bb8e085e8581273"
    adapter_run_id: str = "tiv-lora-smoke-v1"
    prompt_template_version: str = TEMPLATE_VERSION
    prompt_template: str = DEFAULT_TIV_TRANSLATION_TEMPLATE
    dataset_id: str = "tiv-mt560-v1"
    dataset_split: str = "validation"
    generation_parameters: dict[str, Any] = field(
        default_factory=lambda: {
            "max_new_tokens": 128,
            "do_sample": False,
            "temperature": None,
            "top_p": None,
        }
    )
    evaluation_type: str = "diagnostic_smoke_test"
    notes: str = (
        "Corrected evaluation harness with explicit English-to-Tiv instruction. "
        "Diagnostic smoke test only; live GPU re-evaluation deferred due to local "
        "GPU unavailability and submission time constraints."
    )
