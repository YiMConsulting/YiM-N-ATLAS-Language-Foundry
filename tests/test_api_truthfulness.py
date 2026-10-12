from fastapi.testclient import TestClient
import pytest

from api.main import app
from api.schemas.language import Language, LanguageStatus
from api.schemas.dataset import Dataset, DatasetStatus


@pytest.fixture
def client():
    return TestClient(app)


def test_languages_exposes_tiv_truthfully(client):
    response = client.get("/api/v1/languages")
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    # All items must validate against Language schema
    languages = [Language.model_validate(item) for item in items]

    # Tiv must be present as the pilot language
    tiv_lang = next((lang for lang in languages if lang.code == "tiv"), None)
    assert tiv_lang is not None
    assert tiv_lang.name == "Tiv"
    # Must not claim unsupported adaptation progress (i.e. not "adapted" or "adapting")
    assert tiv_lang.status not in (LanguageStatus.adapted, LanguageStatus.adapting)
    assert tiv_lang.status in (LanguageStatus.data_available, LanguageStatus.ready)


def test_datasets_includes_verified_tiv_dataset(client):
    response = client.get("/api/v1/datasets")
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    tiv_ds = next((ds for ds in items if ds["id"] == "tiv-mt560-v1"), None)
    assert tiv_ds is not None
    assert tiv_ds["language_code"] == "tiv"
    assert tiv_ds["format"] == "jsonl"
    assert tiv_ds["record_count"] == 184099
    assert tiv_ds["status"] == "registered"
    assert tiv_ds["train_records"] == 138074
    assert tiv_ds["validation_records"] == 18410
    assert tiv_ds["test_records"] == 27615
    assert tiv_ds["split_id"] == "tiv-mt560-v1-split-42"

    # Validates against Dataset schema
    validated = Dataset.model_validate(tiv_ds)
    assert validated.status == DatasetStatus.registered


def test_experiments_returns_no_fabricated_experiments(client):
    response = client.get("/api/v1/experiments")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_get_unknown_experiment_returns_404(client):
    response = client.get("/api/v1/experiments/does-not-exist")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_playground_generate_returns_503_while_unavailable(client):
    payload = {
        "prompt": "Hello world",
        "language_code": "tiv",
    }
    response = client.post("/api/v1/playground/generate", json=payload)
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"].lower()
