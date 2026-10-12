"""Model loading and inference engine for N-ATLaS and Tiv LoRA adapter."""

from __future__ import annotations

import contextlib
import logging
from dataclasses import dataclass
from typing import Any, Callable, Optional

from inference_service.app.config import InferenceConfig
from inference_service.app.prompt import InferencePromptBuilder

logger = logging.getLogger(__name__)


@dataclass
class GenerationResult:
    """Structured generation output from the N-ATLaS model engine."""

    generated_text: str
    prompt: str
    base_model: str
    base_revision: str
    adapter_repo: str
    adapter_revision: str
    model_status: str
    is_smoke_test_preview: bool
    disclaimer: str
    max_new_tokens: int


class ModelEngine:
    """
    Inference engine for N-ATLaS base model and PEFT LoRA adapter.

    Guarantees:
    1. Loads base model and adapter once (single initialization), not per request.
    2. Enforces exact pinned commit SHAs for reproducibility.
    3. Supports dependency injection for model/tokenizer/adapter loaders so
       unit tests run completely offline without GPU or downloading weights.
    4. Input validation and upper-bound enforcement for generation tokens.
    5. Clear governance disclaimer: smoke_test_preview is NOT validated for translation quality.
    """

    def __init__(
        self,
        config: Optional[InferenceConfig] = None,
        prompt_builder: Optional[InferencePromptBuilder] = None,
        model_loader: Optional[Callable[..., Any]] = None,
        tokenizer_loader: Optional[Callable[..., Any]] = None,
        adapter_loader: Optional[Callable[..., Any]] = None,
    ):
        self.config = config or InferenceConfig()
        self.prompt_builder = prompt_builder or InferencePromptBuilder()

        # Injectable loaders for unit testing and offline mocking
        self._model_loader = model_loader
        self._tokenizer_loader = tokenizer_loader
        self._adapter_loader = adapter_loader

        # Loaded instances
        self.model: Any = None
        self.tokenizer: Any = None
        self._is_loaded: bool = False

    @property
    def is_loaded(self) -> bool:
        """Return whether the model and adapter are loaded into memory."""
        return self._is_loaded

    def load_model(self, force_reload: bool = False) -> None:
        """
        Load the base model, tokenizer, and LoRA adapter once.
        Subsequent calls are idempotent unless force_reload=True.
        """
        if self._is_loaded and not force_reload:
            logger.info("Model and adapter are already loaded; skipping redundant initialization.")
            return

        logger.info(
            "Initializing N-ATLaS model engine: base=%s@%s, adapter=%s@%s",
            self.config.base_model,
            self.config.base_revision,
            self.config.adapter_repo,
            self.config.adapter_revision,
        )

        try:
            # 1. Hugging Face credentials check (base model is gated)
            token = self.config.require_hf_token()

            # 2. Load tokenizer
            if self._tokenizer_loader:
                self.tokenizer = self._tokenizer_loader(
                    self.config.base_model,
                    revision=self.config.base_revision,
                    token=token,
                )
            else:
                from transformers import AutoTokenizer  # lazy import
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.config.base_model,
                    revision=self.config.base_revision,
                    token=token,
                )

            # 3. Load base model
            if self._model_loader:
                base_model_instance = self._model_loader(
                    self.config.base_model,
                    revision=self.config.base_revision,
                    token=token,
                )
            else:
                import torch
                from transformers import AutoModelForCausalLM

                model_kwargs: dict[str, Any] = {
                    "revision": self.config.base_revision,
                    "token": token,
                }

                if self.config.quantization:
                    # Quantization constraint: requires bitsandbytes and CUDA support
                    from transformers import BitsAndBytesConfig
                    if self.config.quantization == "4bit":
                        model_kwargs["quantization_config"] = BitsAndBytesConfig(load_in_4bit=True)
                    elif self.config.quantization == "8bit":
                        model_kwargs["quantization_config"] = BitsAndBytesConfig(load_in_8bit=True)
                else:
                    if self.config.torch_dtype == "float16":
                        model_kwargs["torch_dtype"] = torch.float16
                    elif self.config.torch_dtype == "bfloat16":
                        model_kwargs["torch_dtype"] = torch.bfloat16
                    elif self.config.torch_dtype == "float32":
                        model_kwargs["torch_dtype"] = torch.float32

                if self.config.device != "cpu":
                    model_kwargs["device_map"] = self.config.device

                base_model_instance = AutoModelForCausalLM.from_pretrained(
                    self.config.base_model,
                    **model_kwargs,
                )

            # 4. Attach PEFT LoRA adapter
            if self._adapter_loader:
                self.model = self._adapter_loader(
                    base_model_instance,
                    self.config.adapter_repo,
                    revision=self.config.adapter_revision,
                    token=token,
                )
            else:
                from peft import PeftModel  # lazy import
                self.model = PeftModel.from_pretrained(
                    base_model_instance,
                    self.config.adapter_repo,
                    revision=self.config.adapter_revision,
                    token=token,
                )

            if hasattr(self.model, "eval"):
                self.model.eval()

            self._is_loaded = True
            logger.info("Successfully loaded N-ATLaS base model and Tiv LoRA adapter.")

        except Exception as exc:
            self._is_loaded = False
            self.model = None
            self.tokenizer = None
            logger.error("Failed to load model engine: %s", exc)
            raise RuntimeError(f"Model engine initialization failed: {exc}") from exc

    @contextlib.contextmanager
    def _inference_mode(self):
        """Context manager enabling PyTorch inference mode if torch is available."""
        try:
            import torch
            with torch.inference_mode():
                yield
        except (ImportError, AttributeError):
            yield

    def generate(
        self,
        text: str,
        max_new_tokens: Optional[int] = None,
    ) -> GenerationResult:
        """
        Generate a Tiv translation for the supplied English input text.

        Input validation & bounded tokens:
        - Rejects empty, whitespace-only, or None text.
        - Clamps max_new_tokens between 1 and max_new_tokens_limit.
        - Fails clearly if model has not been loaded.
        - Returns structured GenerationResult with smoke_test_preview disclaimer.
        """
        if not self._is_loaded or self.model is None or self.tokenizer is None:
            raise RuntimeError("Model engine is not loaded. Call load_model() before generating.")

        if text is None:
            raise ValueError("Input text cannot be None.")
        clean_text = text.strip()
        if not clean_text:
            raise ValueError("Input text cannot be empty or whitespace-only.")

        # Determine and bound max_new_tokens
        if max_new_tokens is None:
            effective_tokens = self.config.default_max_new_tokens
        else:
            if max_new_tokens <= 0:
                raise ValueError(f"max_new_tokens must be positive (got {max_new_tokens}).")
            effective_tokens = min(max_new_tokens, self.config.max_new_tokens_limit)

        rendered_prompt = self.prompt_builder.render_prompt(self.tokenizer, clean_text)

        try:
            tokenized = self.tokenizer(rendered_prompt, return_tensors="pt")

            # Transfer to model device if available
            if hasattr(self.model, "device"):
                target_device = self.model.device
                tokenized = {k: v.to(target_device) if hasattr(v, "to") else v for k, v in tokenized.items()}

            gen_kwargs: dict[str, Any] = {
                "max_new_tokens": effective_tokens,
                "do_sample": self.config.do_sample,
            }
            if self.config.do_sample:
                gen_kwargs["temperature"] = self.config.temperature

            pad_id = getattr(self.tokenizer, "pad_token_id", None) or getattr(self.tokenizer, "eos_token_id", None)
            if pad_id is not None:
                gen_kwargs["pad_token_id"] = pad_id

            with self._inference_mode():
                output_ids = self.model.generate(**tokenized, **gen_kwargs)

            # Strip input prompt token sequence from output
            input_length = tokenized["input_ids"].shape[-1]
            generated_ids = output_ids[:, input_length:]

            decoded = self.tokenizer.decode(generated_ids[0], skip_special_tokens=True).strip()

            return GenerationResult(
                generated_text=decoded,
                prompt=rendered_prompt,
                base_model=self.config.base_model,
                base_revision=self.config.base_revision,
                adapter_repo=self.config.adapter_repo,
                adapter_revision=self.config.adapter_revision,
                model_status=self.config.model_status,
                is_smoke_test_preview=True,
                disclaimer=(
                    "This output was generated by the diagnostic smoke-test adapter (smoke_test_preview). "
                    "It has NOT been translation-quality validated and must not be treated as production quality."
                ),
                max_new_tokens=effective_tokens,
            )

        except Exception as exc:
            logger.error("Generation failed for input '%s': %s", clean_text[:50], exc)
            raise RuntimeError(f"Inference generation error: {exc}") from exc
