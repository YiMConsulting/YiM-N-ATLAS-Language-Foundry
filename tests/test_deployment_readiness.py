"""Tests for Render deployment readiness, health endpoints, split discovery, and security safeguards."""

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from api.main import app, load_processed_splits, DATASETS, REVIEW_REQUESTS


@pytest.fixture
def client():
    return TestClient(app)


def test_root_and_health_endpoints(client):
    # Root endpoint
    root_resp = client.get("/")
    assert root_resp.status_code == 200
    root_data = root_resp.json()
    assert root_data["status"] == "healthy"
    assert "version" in root_data
    assert "read_only_mode" in root_data

    # /health and /api/v1/health
    for path in ["/health", "/api/v1/health"]:
        resp = client.get(path)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "natlas-foundry-api"
        assert "timestamp" in data


def test_split_discovery_from_manifests_fallback(tmp_path):
    # Test that load_processed_splits discovers splits from manifests when processed dir is empty
    empty_processed_dir = tmp_path / "processed_empty"
    empty_processed_dir.mkdir()

    # Load with empty processed dir and explicit manifests_dir
    splits = load_processed_splits(base_dir=empty_processed_dir, manifests_dir=Path("data/manifests"))
    assert "tiv-mt560-v1-split-42" in splits
    split = splits["tiv-mt560-v1-split-42"]
    assert split["dataset_id"] == "tiv-mt560-v1"
    assert split["strategy"] == "grouped_by_input"
    assert split["train_records"] == 138074
    assert split["validation_records"] == 18410
    assert split["test_records"] == 27615


def test_public_read_endpoints_are_available(client):
    # Languages
    lang_resp = client.get("/api/v1/languages")
    assert lang_resp.status_code == 200
    assert lang_resp.json()["total"] >= 1

    # Datasets
    ds_resp = client.get("/api/v1/datasets")
    assert ds_resp.status_code == 200
    assert ds_resp.json()["total"] >= 1

    # Dataset splits
    split_resp = client.get("/api/v1/datasets/tiv-mt560-v1/splits")
    assert split_resp.status_code == 200
    assert split_resp.json()["total"] >= 1

    # Review evidence
    ev_resp = client.get("/api/v1/datasets/tiv-mt560-v1/review-evidence")
    assert ev_resp.status_code == 200
    assert ev_resp.json()["dataset_id"] == "tiv-mt560-v1"

    # Experiments (empty registry)
    exp_resp = client.get("/api/v1/experiments")
    assert exp_resp.status_code == 200
    assert exp_resp.json()["items"] == []

    # Inference unavailable (503)
    gen_resp = client.post(
        "/api/v1/playground/generate",
        json={"prompt": "Hello", "language_code": "tiv"},
    )
    assert gen_resp.status_code == 503


def test_read_only_mode_blocks_unauthorized_writes(monkeypatch, client):
    # Enable read-only mode for this test
    monkeypatch.setattr("api.main.READ_ONLY_MODE", True)
    monkeypatch.setattr("api.main.ADMIN_API_KEY", "secret-admin-key")

    # Attempt write without authorization -> 403 Forbidden
    payload = {
        "dataset_id": "tiv-mt560-v1",
        "reviewer_id": "test-reviewer",
        "decisions": [{"sample_id": "s1", "decision": "correct"}],
    }
    resp = client.post("/api/v1/review/submit", json=payload)
    assert resp.status_code == 403
    assert "read-only demonstration" in resp.json()["detail"]

    # Attempt write with valid authorization header -> Allowed (201 Created)
    headers = {"Authorization": "Bearer secret-admin-key"}
    resp_auth = client.post("/api/v1/review/submit", json=payload, headers=headers)
    assert resp_auth.status_code == 201
    assert resp_auth.json()["status"] == "success"
