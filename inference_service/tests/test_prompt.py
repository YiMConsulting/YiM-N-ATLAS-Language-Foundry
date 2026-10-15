"""Unit tests for prompt formatting and target isolation."""

import pytest

from inference_service.app.prompt import (
    DEFAULT_TIV_TRANSLATION_TEMPLATE,
    InferencePromptBuilder,
)
try:
    from foundry.evaluation.harness import (
        DEFAULT_TIV_TRANSLATION_TEMPLATE as HARNESS_TEMPLATE,
    )
except (ImportError, ModuleNotFoundError):
    # Standalone fallback when foundry/api dependencies (e.g. pandas) are not present
    HARNESS_TEMPLATE = "Translate the following English text into Tiv:\n{text}"


class MockTokenizer:
    """Mock tokenizer providing apply_chat_template for unit testing."""

    def apply_chat_template(self, messages, tokenize=False, add_generation_prompt=True):
        rendered = ""
        for msg in messages:
            rendered += f"<start_{msg['role']}>{msg['content']}<end_{msg['role']}>\n"
        if add_generation_prompt:
            rendered += "<start_assistant>"
        return rendered


def test_prompt_template_preserves_evaluation_harness_contract():
    """Verify exact instruction parity between inference service and evaluation harness."""
    assert DEFAULT_TIV_TRANSLATION_TEMPLATE == "Translate the following English text into Tiv:\n{text}"
    assert DEFAULT_TIV_TRANSLATION_TEMPLATE == HARNESS_TEMPLATE


def test_prompt_formatting():
    """Verify user instruction contains text and template structure."""
    builder = InferencePromptBuilder()
    instruction = builder.format_instruction("Good morning.")
    assert instruction == "Translate the following English text into Tiv:\nGood morning."


def test_prompt_rejects_empty_or_whitespace_input():
    """Ensure invalid inputs fail with descriptive ValueError."""
    builder = InferencePromptBuilder()
    with pytest.raises(ValueError, match="empty or whitespace-only"):
        builder.format_instruction("")
    with pytest.raises(ValueError, match="empty or whitespace-only"):
        builder.format_instruction("   \n\t  ")
    with pytest.raises(ValueError, match="cannot be None"):
        builder.format_instruction(None)  # type: ignore


def test_prompt_strict_target_isolation():
    """
    Ensure reference targets are NEVER included in messages or rendered prompts.
    Even if passed to builder methods, target text must not leak.
    """
    builder = InferencePromptBuilder()
    secret_target = "Ngu dedoo gbaaye (DO NOT LEAK)"
    input_text = "The rain has stopped."

    messages = builder.build_messages(text=input_text, target=secret_target)
    assert len(messages) == 1
    assert messages[0]["role"] == "user"
    assert secret_target not in messages[0]["content"]
    assert "The rain has stopped." in messages[0]["content"]

    tokenizer = MockTokenizer()
    rendered = builder.render_prompt(tokenizer, input_text)
    assert secret_target not in rendered
    assert "The rain has stopped." in rendered


def test_prompt_rendering_with_chat_template():
    """Verify proper chat template rendering with assistant generation prompt."""
    builder = InferencePromptBuilder()
    tokenizer = MockTokenizer()
    rendered = builder.render_prompt(tokenizer, "Where is the market?")
    assert "<start_user>Translate the following English text into Tiv:\nWhere is the market?<end_user>" in rendered
    assert rendered.endswith("<start_assistant>")


def test_prompt_fallback_without_chat_template():
    """Verify graceful fallback for tokenizers without apply_chat_template."""
    builder = InferencePromptBuilder()
    bare_tokenizer = object()  # No apply_chat_template method
    rendered = builder.render_prompt(bare_tokenizer, "Welcome.")
    assert "<|user|>" in rendered
    assert "Translate the following English text into Tiv:\nWelcome." in rendered
    assert "<|assistant|>" in rendered
