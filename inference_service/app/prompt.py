"""Standardized prompt construction for N-ATLaS Tiv translation inference."""

from __future__ import annotations

from typing import Any, Optional

DEFAULT_TIV_TRANSLATION_TEMPLATE = "Translate the following English text into Tiv:\n{text}"
TEMPLATE_VERSION = "v1-explicit-instruction"


class InferencePromptBuilder:
    """
    Constructs standardized translation generation prompts for N-ATLaS.

    Guarantees:
    1. Preserves the exact instruction: "Translate the following English text into Tiv:\\n{text}"
    2. Reference targets are strictly excluded from the prompt (prevents data leakage).
    3. Empty or whitespace-only inputs are safely validated and rejected.
    4. Deterministic rendering with tokenizer chat template support.
    """

    def __init__(self, template: str = DEFAULT_TIV_TRANSLATION_TEMPLATE):
        if not template or not template.strip() or "{text}" not in template:
            raise ValueError("Template must contain a non-empty '{text}' placeholder.")
        self.template = template.strip()

    def format_instruction(self, text: str) -> str:
        """Format the single-turn user instruction with the input text."""
        if text is None:
            raise ValueError("Input text cannot be None.")
        cleaned = text.strip()
        if not cleaned:
            raise ValueError("Input text cannot be empty or whitespace-only.")
        return self.template.format(text=cleaned)

    def build_messages(
        self,
        text: str,
        target: Optional[str] = None,  # Explicitly rejected/ignored to prevent target leakage
    ) -> list[dict[str, str]]:
        """
        Build the chat messages payload.
        
        Even if a reference target is passed in or available in a dataset record,
        it is strictly excluded from the prompt messages.
        """
        user_content = self.format_instruction(text)
        return [
            {
                "role": "user",
                "content": user_content,
            }
        ]

    def render_prompt(self, tokenizer: Any, text: str) -> str:
        """
        Render the final generation prompt using the tokenizer's chat template
        if available, or fall back to raw formatted instruction.
        """
        messages = self.build_messages(text)
        if hasattr(tokenizer, "apply_chat_template"):
            return tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
            )
        # Fallback for mock tokenizers or tokenizers without chat template support
        return f"<|user|>\n{messages[0]['content']}\n<|assistant|>\n"
