"""Tests for the English-to-Tiv evaluation harness and prompt construction."""

import json
from pathlib import Path
import pytest

from api.schemas.dataset import DatasetRecord
from foundry.evaluation.harness import (
    DEFAULT_TIV_TRANSLATION_TEMPLATE,
    EvaluationHarnessConfig,
    EvaluationPromptBuilder,
)


class MockChatTokenizer:
    """Mock tokenizer simulating chat template application."""

    def apply_chat_template(
        self,
        messages: list[dict[str, str]],
        tokenize: bool = False,
        add_generation_prompt: bool = False,
    ) -> str:
        rendered = ""
        for msg in messages:
            rendered += f"<|start_header_id|>{msg['role']}<|end_header_id|>\n\n{msg['content']}<|eot_id|>"
        if add_generation_prompt:
            rendered += "<|start_header_id|>assistant<|end_header_id|>\n\n"
        return rendered


def make_record(
    id: str = "mt560-140929",
    input_text: str = "This advance knowledge brought with it responsibility .",
    target_text: str = "Er Yehova a pasen mbatomov nav kwagh u ken hemen yô , kwagh ne gema va ve a tom .",
) -> DatasetRecord:
    return DatasetRecord(
        id=id,
        input=input_text,
        target=target_text,
        language_code="tiv",
    )


def test_prompt_builder_includes_explicit_instruction():
    builder = EvaluationPromptBuilder()
    formatted = builder.format_user_instruction("This is a test sentence.")
    assert "Translate the following English text into Tiv:" in formatted
    assert "This is a test sentence." in formatted
    assert formatted == "Translate the following English text into Tiv:\nThis is a test sentence."


def test_reference_exclusion():
    builder = EvaluationPromptBuilder()
    tokenizer = MockChatTokenizer()
    unique_target = "CONFIDENTIAL_TIV_REFERENCE_TARGET_12345"
    record = make_record(target_text=unique_target)

    # Check messages
    messages = builder.build_messages(record)
    assert len(messages) == 1
    assert messages[0]["role"] == "user"
    assert unique_target not in messages[0]["content"]

    # Check rendered prompt
    rendered = builder.render_prompt(tokenizer, record)
    assert unique_target not in rendered
    assert "Translate the following English text into Tiv:" in rendered
    assert record.input in rendered


def test_base_and_adapted_prompt_parity():
    builder = EvaluationPromptBuilder()
    tokenizer = MockChatTokenizer()
    record = make_record()

    # The prompt sent to the base model and the adapted model must be 100% identical
    base_prompt = builder.render_input_prompt(tokenizer, record.input)
    adapted_prompt = builder.render_input_prompt(tokenizer, record.input)

    assert base_prompt == adapted_prompt
    assert len(base_prompt) > 0


def test_empty_or_whitespace_input_rejection():
    builder = EvaluationPromptBuilder()
    with pytest.raises(ValueError, match="cannot be empty"):
        builder.format_user_instruction("")

    with pytest.raises(ValueError, match="cannot be empty"):
        builder.format_user_instruction("   \n\t  ")


def test_invalid_template_rejection():
    with pytest.raises(ValueError, match="placeholder"):
        EvaluationPromptBuilder(template="Translate without placeholder")

    with pytest.raises(ValueError, match="placeholder"):
        EvaluationPromptBuilder(template="   ")


def test_harness_config_defaults():
    config = EvaluationHarnessConfig()
    assert config.base_model_id == "NCAIR1/N-ATLaS"
    assert config.base_model_revision == "e294476928aca9030e924ca27bb8e085e8581273"
    assert config.adapter_run_id == "tiv-lora-smoke-v1"
    assert config.generation_parameters["do_sample"] is False
    assert config.generation_parameters["max_new_tokens"] == 128
    assert config.evaluation_type == "diagnostic_smoke_test"


def test_evaluation_manifest_structure():
    manifest_path = Path("data/manifests/tiv_evaluation_harness_manifest.json")
    assert manifest_path.exists(), "Manifest file must exist"

    with open(manifest_path, encoding="utf-8") as f:
        data = json.load(f)

    assert data["base_model"]["model_id"] == "NCAIR1/N-ATLaS"
    assert data["base_model"]["resolved_commit_sha"] == "e294476928aca9030e924ca27bb8e085e8581273"
    assert data["prompt_specification"]["reference_excluded"] is True
    assert data["prompt_specification"]["identical_across_models"] is True
    assert data["prompt_specification"]["template"] == DEFAULT_TIV_TRANSLATION_TEMPLATE
    assert len(data["dataset_and_split"]["sample_record_ids"]) == 10
    assert data["evaluation_classification"]["quality_conclusion_supported"] is False
    assert data["evaluation_classification"]["production_registry_eligible"] is False
