import json
from pathlib import Path
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


def test_get_verified_split_by_id(client):
    response = client.get("/api/v1/splits/tiv-mt560-v1-split-42")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "tiv-mt560-v1-split-42"
    assert data["dataset_id"] == "tiv-mt560-v1"
    assert data["strategy"] == "grouped_by_input"
    assert data["seed"] == 42
    assert data["total_records"] == 184099
    assert data["train_records"] == 138074
    assert data["validation_records"] == 18410
    assert data["test_records"] == 27615


def test_get_unknown_split_returns_404(client):
    response = client.get("/api/v1/splits/nonexistent-split")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_dataset_splits_returns_verified_split(client):
    response = client.get("/api/v1/datasets/tiv-mt560-v1/splits")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    split_ids = [s["id"] for s in data["items"]]
    assert "tiv-mt560-v1-split-42" in split_ids


def test_list_unknown_dataset_splits_returns_404(client):
    response = client.get("/api/v1/datasets/nonexistent-dataset/splits")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_load_processed_splits_handles_malformed_and_duplicates(tmp_path: Path):
    from api.main import load_processed_splits

    # Directory with valid split
    d1 = tmp_path / "valid_dir"
    d1.mkdir()
    valid_meta = {
        "id": "split-001",
        "dataset_id": "ds-001",
        "strategy": "grouped_by_input",
        "seed": 42,
        "train_ratio": 0.8,
        "validation_ratio": 0.1,
        "test_ratio": 0.1,
        "total_records": 100,
        "train_records": 80,
        "validation_records": 10,
        "test_records": 10,
        "created_at": "2026-10-12T00:00:00Z",
    }
    (d1 / "split_metadata.json").write_text(json.dumps(valid_meta), encoding="utf-8")

    # Directory with duplicate split ID
    d2 = tmp_path / "dup_dir"
    d2.mkdir()
    dup_meta = dict(valid_meta)
    dup_meta["total_records"] = 999
    (d2 / "split_metadata.json").write_text(json.dumps(dup_meta), encoding="utf-8")

    # Directory with malformed JSON
    d3 = tmp_path / "malformed_dir"
    d3.mkdir()
    (d3 / "split_metadata.json").write_text("{invalid json", encoding="utf-8")

    # Directory with schema-invalid metadata (ratios don't sum to 1.0)
    d4 = tmp_path / "schema_invalid_dir"
    d4.mkdir()
    invalid_schema = dict(valid_meta)
    invalid_schema["id"] = "split-invalid"
    invalid_schema["train_ratio"] = 0.5
    (d4 / "split_metadata.json").write_text(json.dumps(invalid_schema), encoding="utf-8")

    loaded = load_processed_splits(tmp_path)

    # Valid split should be loaded, malformed skipped, and duplicate not overwritten
    assert "split-001" in loaded
    assert loaded["split-001"]["total_records"] == 100
    assert "split-invalid" not in loaded
    assert len(loaded) == 1


def test_review_requests_returns_empty_queue(client):
    response = client.get("/api/v1/review/requests")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_get_unknown_review_request_returns_404(client):
    response = client.get("/api/v1/review/requests/nonexistent-request")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_unknown_review_samples_returns_404(client):
    response = client.get("/api/v1/review/requests/nonexistent-request/samples")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_unknown_review_summary_returns_404(client):
    response = client.get("/api/v1/review/requests/nonexistent-request/summary")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_submit_review_batch_unknown_dataset_returns_404(client):
    payload = {
        "dataset_id": "nonexistent-dataset",
        "reviewer_id": "reviewer-01",
        "decisions": [],
    }
    response = client.post("/api/v1/review/submit", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_dataset_review_evidence_success(client):
    response = client.get("/api/v1/datasets/tiv-mt560-v1/review-evidence")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_id"] == "tiv-mt560-v1"
    assert data["language_code"] == "tiv"
    assert data["reviewed_records"] == 51
    assert data["total_sampled_records"] == 203
    assert data["pending_records"] == 152
    assert data["reviewer_scope"]["completed_reviewers"] == ["REV_04"]
    assert "REV_01" in data["reviewer_scope"]["pending_reviewers"]
    assert data["metrics"]["translation_accurate"]["mean_score"] == 4.7647
    assert data["metrics"]["tiv_naturalness"]["mean_score"] == 5.0
    assert data["metrics"]["meaning_complete"]["score_distribution"]["Yes"] == 51
    assert "reviewer-reported" in data["qualification"].lower()


def test_get_dataset_review_evidence_unknown_dataset_returns_404(client):
    response = client.get("/api/v1/datasets/nonexistent-dataset/review-evidence")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_load_review_evidence_handles_malformed(tmp_path: Path):
    from api.main import load_review_evidence

    # Valid review evidence manifest
    valid_data = {
        "dataset_id": "ds-test-01",
        "language_code": "tiv",
        "review_type": "offline_manual_pilot",
        "artifact_name": "test.xlsx",
        "sheet_name": "TestSheet",
        "status": "in_progress",
        "total_sampled_records": 100,
        "reviewed_records": 25,
        "pending_records": 75,
        "coverage_ratio": 0.25,
        "sources_breakdown": {"test": 25},
        "reviewer_scope": {
            "assigned_reviewers": ["REV_01"],
            "completed_reviewers": ["REV_01"],
            "pending_reviewers": []
        },
        "metrics": {
            "acc": {
                "metric_name": "Acc",
                "scale": "1-5",
                "description": "desc",
                "mean_score": 4.5,
                "pass_count": 25,
                "total_count": 25,
                "score_distribution": {"5": 25}
            }
        },
        "qualitative_findings": ["finding 1"],
        "qualification": "Test qualification.",
        "evaluated_at": "2026-10-12T00:00:00Z"
    }
    (tmp_path / "tiv_human_review_evidence.json").write_text(json.dumps(valid_data), encoding="utf-8")

    # Malformed JSON
    (tmp_path / "bad_human_review_evidence.json").write_text("{bad json", encoding="utf-8")

    # Schema invalid (missing required fields)
    (tmp_path / "invalid_human_review_evidence.json").write_text(json.dumps({"dataset_id": "bad"}), encoding="utf-8")

    loaded = load_review_evidence(tmp_path)
    assert "ds-test-01" in loaded
    assert len(loaded) == 1
