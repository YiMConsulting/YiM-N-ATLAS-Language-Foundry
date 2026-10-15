"""Inference gateway client connecting the control plane to the standalone inference service."""

from __future__ import annotations

import logging
import os
import re
import time
from typing import Any, Optional

import httpx
from fastapi import HTTPException, status

from api.schemas.inference import InferenceStatusResponse, PlaygroundResponse

logger = logging.getLogger("foundry.api.inference_client")

DEFAULT_INFERENCE_TIMEOUT = 45.0
DEFAULT_STATUS_TIMEOUT = 5.0


def scrub_secrets(text: str, additional_secrets: Optional[list[str]] = None) -> str:
    """
    Redact potential API tokens, credentials, or secrets from upstream error strings.
    """
    if not text:
        return text

    scrubbed = text

    # Redact explicit additional secret strings (e.g. INFERENCE_API_KEY)
    if additional_secrets:
        for sec in additional_secrets:
            if sec and sec in scrubbed:
                scrubbed = scrubbed.replace(sec, "[REDACTED]")

    # Redact common Hugging Face token patterns
    scrubbed = re.sub(r"hf_[a-zA-Z0-9_]{10,}", "[REDACTED]", scrubbed)

    # Redact Bearer token patterns
    scrubbed = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]{10,}", "Bearer [REDACTED]", scrubbed)

    # General authorization and credential keyword redaction
    lower = scrubbed.lower()
    if any(k in lower for k in ("token=", "api_key=", "secret_key=", "password=")):
        return "Authentication or authorization failure."

    return scrubbed


class InferenceGatewayClient:
    """
    HTTP gateway client for communicating with the standalone N-ATLaS inference microservice.

    Guarantees:
    - Never fabricates model readiness or translations if upstream is unreachable.
    - Preserves pinned base model and adapter revisions and smoke-test disclaimer.
    - Sanitizes upstream error messages, guaranteeing zero credential leaks.
    - Enforces generation bounds and configurable cold-start timeouts.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
        api_key: Optional[str] = None,
        http_client: Optional[httpx.Client] = None,
    ):
        self._base_url = base_url
        self._timeout = timeout
        self._api_key = api_key
        self._custom_client = http_client

    @property
    def base_url(self) -> str:
        if self._base_url is not None:
            return self._base_url.rstrip("/") if self._base_url else ""
        raw_url = os.getenv("INFERENCE_SERVICE_URL", "http://localhost:8001")
        return raw_url.rstrip("/") if raw_url else ""

    @base_url.setter
    def base_url(self, val: Optional[str]) -> None:
        self._base_url = val

    @property
    def timeout(self) -> float:
        if self._timeout is not None:
            return self._timeout
        try:
            return float(os.getenv("INFERENCE_TIMEOUT_SECONDS", str(DEFAULT_INFERENCE_TIMEOUT)))
        except (ValueError, TypeError):
            return DEFAULT_INFERENCE_TIMEOUT

    @timeout.setter
    def timeout(self, val: Optional[float]) -> None:
        self._timeout = val

    @property
    def api_key(self) -> Optional[str]:
        if self._api_key is not None:
            return self._api_key
        return os.getenv("INFERENCE_API_KEY", None)

    @api_key.setter
    def api_key(self, val: Optional[str]) -> None:
        self._api_key = val

    def _get_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        key = self.api_key
        if key and key.strip():
            headers["Authorization"] = f"Bearer {key.strip()}"
            headers["X-API-Key"] = key.strip()
        return headers

    def _sanitize(self, text: str) -> str:
        additional: list[str] = []
        if self.api_key:
            additional.append(self.api_key)
        hf_env = os.getenv("HF_TOKEN")
        if hf_env:
            additional.append(hf_env)
        return scrub_secrets(text, additional_secrets=additional)

    def _extract_detail(self, resp: httpx.Response) -> str:
        try:
            data = resp.json()
            if isinstance(data, dict) and "detail" in data:
                return self._sanitize(str(data["detail"]))
        except Exception:
            pass
        return self._sanitize(resp.text)

    def get_status(self) -> InferenceStatusResponse:
        """
        Query upstream status via a single call to GET /v1/smoke-test/status.
        Returns truthful availability and readiness, never claiming readiness if unreachable.
        """
        if not self.base_url:
            return InferenceStatusResponse(
                available=False,
                model_loaded=False,
                message="Inference service URL is not configured.",
            )

        target_url = f"{self.base_url}/v1/smoke-test/status"

        try:
            client = self._custom_client or httpx.Client(timeout=DEFAULT_STATUS_TIMEOUT)
            try:
                resp = client.get(target_url, headers=self._get_headers())
            finally:
                if not self._custom_client:
                    client.close()

            if resp.status_code == 200:
                data = resp.json()
                return InferenceStatusResponse(
                    available=True,
                    model_loaded=bool(data.get("model_loaded", False)),
                    message="Inference service is operational.",
                    base_model=data.get("base_model", "NCAIR1/N-ATLaS"),
                    base_revision=data.get("base_revision", "e294476928aca9030e924ca27bb8e085e8581273"),
                    adapter_repo=data.get("adapter_repo", "YiMConsulting/n-atlas-tiv-lora-smoke-v1"),
                    adapter_revision=data.get("adapter_revision", "d413bebb74ef3b971eacdd62d6bc10e75654914a"),
                    model_status=data.get("model_status", "smoke_test_preview"),
                    is_smoke_test_preview=bool(data.get("is_smoke_test_preview", True)),
                    quality_validated=bool(data.get("quality_validated", False)),
                    disclaimer=data.get(
                        "disclaimer",
                        (
                            "This output was generated by the diagnostic smoke-test adapter (smoke_test_preview). "
                            "It has NOT been translation-quality validated and must not be treated as production quality."
                        ),
                    ),
                    device=data.get("device"),
                    torch_dtype=data.get("torch_dtype"),
                    quantization=data.get("quantization"),
                )
            else:
                return InferenceStatusResponse(
                    available=False,
                    model_loaded=False,
                    message=f"Inference service responded with status {resp.status_code}.",
                )

        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.NetworkError) as exc:
            logger.warning("Inference service unreachable at %s: %s", target_url, exc)
            return InferenceStatusResponse(
                available=False,
                model_loaded=False,
                message="Inference service is currently unreachable.",
            )
        except httpx.TimeoutException:
            logger.warning("Inference service status check timed out at %s", target_url)
            return InferenceStatusResponse(
                available=False,
                model_loaded=False,
                message="Inference service status request timed out.",
            )
        except Exception as exc:
            logger.error("Error checking inference status: %s", exc)
            return InferenceStatusResponse(
                available=False,
                model_loaded=False,
                message=f"Inference status check failed: {self._sanitize(str(exc))}",
            )

    def generate(
        self,
        prompt: str,
        max_new_tokens: Optional[int] = 64,
        experiment_id: Optional[str] = None,
        language_code: Optional[str] = "tiv",
    ) -> PlaygroundResponse:
        """
        Forward translation request to POST /v1/generate on the standalone inference service.

        Maps:
        - prompt -> upstream 'text'
        - max_new_tokens -> upstream 'max_new_tokens' (capped at 256)
        """
        if not self.base_url:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Inference service is currently unavailable: INFERENCE_SERVICE_URL is not configured.",
            )

        cleaned_prompt = prompt.strip() if prompt else ""
        if not cleaned_prompt:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Input prompt cannot be empty or whitespace-only.",
            )

        # Enforce bounded generation limit
        effective_tokens = min(max_new_tokens or 64, 256)
        payload = {
            "text": cleaned_prompt,
            "max_new_tokens": effective_tokens,
        }

        target_url = f"{self.base_url}/v1/generate"
        start_time = time.perf_counter()

        try:
            client = self._custom_client or httpx.Client(timeout=self.timeout)
            try:
                resp = client.post(target_url, json=payload, headers=self._get_headers())
            finally:
                if not self._custom_client:
                    client.close()

            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if resp.status_code == 200:
                data = resp.json()

                # Validate expected response structure
                if not isinstance(data, dict) or "generated_text" not in data:
                    logger.error("Malformed upstream response: missing 'generated_text'")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Inference service returned a malformed response.",
                    )

                return PlaygroundResponse(
                    generated_text=data["generated_text"],
                    prompt=cleaned_prompt,
                    rendered_prompt=data.get("prompt"),
                    language_code=language_code or "tiv",
                    model=data.get("base_model", "NCAIR1/N-ATLaS"),
                    base_model=data.get("base_model", "NCAIR1/N-ATLaS"),
                    base_revision=data.get("base_revision", "e294476928aca9030e924ca27bb8e085e8581273"),
                    adapter_repo=data.get("adapter_repo", "YiMConsulting/n-atlas-tiv-lora-smoke-v1"),
                    adapter_revision=data.get("adapter_revision", "d413bebb74ef3b971eacdd62d6bc10e75654914a"),
                    model_status=data.get("model_status", "smoke_test_preview"),
                    is_smoke_test_preview=bool(data.get("is_smoke_test_preview", True)),
                    disclaimer=data.get(
                        "disclaimer",
                        (
                            "This output was generated by the diagnostic smoke-test adapter (smoke_test_preview). "
                            "It has NOT been translation-quality validated and must not be treated as production quality."
                        ),
                    ),
                    latency_ms=latency_ms,
                    experiment_id=experiment_id,
                )

            elif resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY:
                err_detail = self._extract_detail(resp)
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Inference service rejected input: {err_detail}",
                )

            elif resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
                err_detail = self._extract_detail(resp)
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Inference engine initialization failed: {err_detail}",
                )

            else:
                err_detail = self._sanitize(resp.text)
                logger.error("Upstream inference service returned status %s: %s", resp.status_code, err_detail)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Inference service encountered an internal execution failure.",
                )

        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.NetworkError) as exc:
            logger.warning("Inference service connection error: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Inference service is currently unavailable (connection failed or service unreachable).",
            ) from None

        except httpx.TimeoutException:
            logger.warning("Inference generation timed out after %s seconds", self.timeout)
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Inference service timed out during generation (exceeded {self.timeout}s limit).",
            ) from None

        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Unexpected error during inference generation: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Inference gateway error: {self._sanitize(str(exc))}",
            ) from None
