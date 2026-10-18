"""Tests for the runtime configurable Tiv Gradio demo endpoint."""

import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.schemas.inference import TivDemoConfigResponse


@pytest.fixture
def client():
    return TestClient(app)


def test_tiv_demo_config_missing_url(client, monkeypatch):
    """When TIV_GRADIO_URL is empty or not set, endpoint returns safe not_configured status."""
    monkeypatch.delenv("TIV_GRADIO_URL", raising=False)

    for route in ("/config/tiv-demo", "/api/v1/config/tiv-demo"):
        response = client.get(route)
        assert response.status_code == 200
        data = response.json()
        validated = TivDemoConfigResponse.model_validate(data)

        assert validated.configured is False
        assert validated.tiv_demo_url is None
        assert validated.status == "not_configured"
        assert "not configured" in (validated.message or "").lower()
        assert validated.is_experimental is True
        assert validated.quality_validated is False
        assert "YiMConsulting/n-atlas-slanguage-tiv-qlora-experimental-v1" in validated.model_adapter


def test_tiv_demo_config_valid_url(client, monkeypatch):
    """When TIV_GRADIO_URL is a valid HTTPS or HTTP URL, endpoint returns configured=True."""
    sample_url = "https://490f55186b25f3a26c.gradio.live"
    monkeypatch.setenv("TIV_GRADIO_URL", sample_url)

    for route in ("/config/tiv-demo", "/api/v1/config/tiv-demo"):
        response = client.get(route)
        assert response.status_code == 200
        data = response.json()
        validated = TivDemoConfigResponse.model_validate(data)

        assert validated.configured is True
        assert validated.tiv_demo_url == sample_url
        assert validated.status == "ready"
        assert validated.is_experimental is True
        assert validated.quality_validated is False
        assert "experimental" in validated.disclaimer.lower()


def test_tiv_demo_config_trims_trailing_slash(client, monkeypatch):
    """Endpoint normalizes and cleans trailing slashes."""
    monkeypatch.setenv("TIV_GRADIO_URL", "https://xyz-demo.gradio.live/   ")

    response = client.get("/api/v1/config/tiv-demo")
    assert response.status_code == 200
    data = response.json()
    assert data["configured"] is True
    assert data["tiv_demo_url"] == "https://xyz-demo.gradio.live"


def test_tiv_demo_config_invalid_url(client, monkeypatch):
    """When TIV_GRADIO_URL has invalid scheme or missing host, endpoint returns invalid_url status."""
    invalid_inputs = [
        "not-a-valid-url",
        "ftp://gradio.live/test",
        "javascript:alert(1)",
        "http://",
        "   ",
    ]

    for bad_url in invalid_inputs:
        monkeypatch.setenv("TIV_GRADIO_URL", bad_url)
        response = client.get("/api/v1/config/tiv-demo")
        assert response.status_code == 200
        data = response.json()
        validated = TivDemoConfigResponse.model_validate(data)

        assert validated.configured is False
        assert validated.tiv_demo_url is None
        assert validated.status in ("invalid_url", "not_configured")


def test_tiv_demo_config_never_exposes_secrets(client, monkeypatch):
    """Endpoint must never expose server secrets or other environment variables in its response."""
    secret_token = "hf_secret_token_1234567890"
    secret_db = "postgresql://user:supersecretpass@db.internal:5432/foundry"
    monkeypatch.setenv("HF_TOKEN", secret_token)
    monkeypatch.setenv("DATABASE_URL", secret_db)
    monkeypatch.setenv("TIV_GRADIO_URL", "https://active-session.gradio.live")

    response = client.get("/api/v1/config/tiv-demo")
    assert response.status_code == 200
    body_text = response.text

    assert secret_token not in body_text
    assert secret_db not in body_text
    assert "supersecretpass" not in body_text
    # Ensure only expected schema keys exist in payload
    data = response.json()
    expected_keys = {
        "configured",
        "tiv_demo_url",
        "status",
        "message",
        "model_adapter",
        "base_model",
        "is_experimental",
        "quality_validated",
        "disclaimer",
    }
    assert set(data.keys()) == expected_keys


def test_tiv_demo_config_runtime_dynamic_update(client, monkeypatch):
    """Confirm that modifying TIV_GRADIO_URL immediately updates the returned URL at runtime."""
    # First Kaggle session
    session_1 = "https://111111111111111111.gradio.live"
    monkeypatch.setenv("TIV_GRADIO_URL", session_1)
    res1 = client.get("/api/v1/config/tiv-demo").json()
    assert res1["configured"] is True
    assert res1["tiv_demo_url"] == session_1

    # Second Kaggle session after manual restart
    session_2 = "https://222222222222222222.gradio.live"
    monkeypatch.setenv("TIV_GRADIO_URL", session_2)
    res2 = client.get("/api/v1/config/tiv-demo").json()
    assert res2["configured"] is True
    assert res2["tiv_demo_url"] == session_2


def test_frontend_does_not_contain_hardcoded_gradio_urls():
    """Verify that no temporary Gradio live URLs are hardcoded in frontend source files."""
    repo_root = Path(__file__).parent.parent
    web_dir = repo_root / "web"
    assert web_dir.is_dir()

    extensions = {".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"}
    for path in web_dir.rglob("*"):
        if path.is_file() and path.suffix in extensions:
            # Skip node_modules and .next build artifacts
            if any(p in path.parts for p in ("node_modules", ".next", "package-lock.json")):
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            assert "gradio.live" not in text, f"Found hardcoded gradio.live link in {path}"
            assert "490f55186b25f3a26c" not in text, f"Found temporary Kaggle hash in {path}"
