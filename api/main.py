"""N-ATLAS Language Foundry — FastAPI Control Plane
Implements the v1 API Contract for Problem Statement 1 (Developer Infrastructure).
"""

from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import json
import logging
from pathlib import Path

logger = logging.getLogger("foundry.api")


from foundry.review.human_review import (
    HumanReviewSummary,
    ReviewDecision,
    ReviewDecisionRecord,
    ReviewRequest,
    ReviewRequestStatus,
    ReviewSampleItem,
)
from foundry.datasets.split import DatasetSplit
from api.schemas.language import Language, LanguageStatus

app = FastAPI(
    title="N-ATLaS Language Foundry API",
    description="Control Plane API for Problem Statement 1: Developer Infrastructure for Nigerian Low-Resource Languages.",
    version="0.1.0",
)

# Enable CORS for Next.js frontend (http://localhost:3000) and external beta testers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store initialized with verified Tiv pilot and discovered baseline data
NOW = datetime.now(timezone.utc)

LANGUAGES: dict[str, dict[str, Any]] = {
    "tiv": {
        "id": "lang-tiv-001",
        "code": "tiv",
        "name": "Tiv",
        "status": "data_available",
        "description": "Primary pilot language with verified English-Tiv parallel corpus and splits.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "igl": {
        "id": "lang-igl-002",
        "code": "igl",
        "name": "Igala",
        "status": "discovered",
        "description": "Exploratory Nigerian language under provenance and corpus investigation.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "yor": {
        "id": "lang-yor-003",
        "code": "yor",
        "name": "Yoruba",
        "status": "discovered",
        "description": "Benchmark Nigerian language supported in base N-ATLaS model.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "ha": {
        "id": "lang-ha-004",
        "code": "ha",
        "name": "Hausa",
        "status": "discovered",
        "description": "Benchmark Nigerian language supported in base N-ATLaS model.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "ibo": {
        "id": "lang-ibo-005",
        "code": "ibo",
        "name": "Igbo",
        "status": "discovered",
        "description": "Benchmark Nigerian language supported in base N-ATLaS model.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
}

DATASETS: dict[str, dict[str, Any]] = {
    "tiv-mt560-v1": {
        "id": "tiv-mt560-v1",
        "language_code": "tiv",
        "name": "Tiv MT560 Parallel Corpus V1",
        "description": "English-Tiv sentence pairs from MT560 with deterministic grouped splitting.",
        "format": "jsonl",
        "source_type": "research",
        "record_count": 184099,
        "train_records": 138074,
        "validation_records": 18410,
        "test_records": 27615,
        "split_id": "tiv-mt560-v1-split-42",
        "provenance_id": "prov-tiv-mt560",
        "version": "252074f0d4c82c0005099b5eb4043fddc43026f1",
        "status": "registered",
        "local_path": "data/processed/tiv-mt560-v1",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
}

def load_processed_splits(
    base_dir: Path = Path("data/processed"),
) -> dict[str, dict[str, Any]]:
    """Discovers and validates split metadata files from processed data directories.

    Notes:
        - Loaded at application startup. If new splits are generated on disk,
          an API server restart is required to discover them.
        - Each split_metadata.json is validated against the DatasetSplit schema.
        - Malformed or invalid split files are logged as warnings and skipped,
          ensuring other endpoints and splits remain available.
        - Duplicate split IDs are logged as warnings and the initial occurrence is preserved.
    """
    splits: dict[str, dict[str, Any]] = {}
    if not base_dir.is_dir():
        return splits

    for split_meta_path in sorted(base_dir.glob("*/split_metadata.json")):
        try:
            with split_meta_path.open("r", encoding="utf-8") as f:
                meta = json.load(f)
            DatasetSplit.model_validate(meta)
            split_id = meta["id"]
            if split_id in splits:
                logger.warning(
                    "Duplicate split ID '%s' found in %s; preserving existing entry.",
                    split_id,
                    split_meta_path,
                )
                continue
            splits[split_id] = meta
        except Exception as exc:
            logger.warning(
                "Failed to load or validate split metadata from %s: %s",
                split_meta_path,
                exc,
            )

    return splits


SPLITS: dict[str, dict[str, Any]] = load_processed_splits()


# Review Requests & Sample Items (Empty until real review sampling is conducted)
REVIEW_REQUESTS: dict[str, dict[str, Any]] = {}
SAMPLE_ITEMS: list[dict[str, Any]] = []
REVIEW_DECISIONS: dict[str, dict[str, Any]] = {}

# --- Request / Response Models ---
class SubmitDecisionRequest(BaseModel):
    review_request_id: str
    sample_item_id: str
    decision: str  # "approved" | "rejected" | "needs_correction" | "correct" | "incorrect"
    reviewer_id: Optional[str] = "olusegun-linguist"
    corrected_text: Optional[str] = None
    notes: Optional[str] = None

class BatchSubmitRequest(BaseModel):
    dataset_id: str
    reviewer_id: str
    decisions: List[dict[str, Any]]
    submitted_at: Optional[str] = None


# --- Core Health & Info ---
@app.get("/")
def root():
    return {
        "service": "N-ATLAS Language Foundry Control Plane",
        "status": "healthy",
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_url": "/health",
        "review_requests_url": "/api/v1/review/requests",
    }

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "natlas-foundry-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# --- Languages ---
@app.get("/languages")
@app.get("/api/v1/languages")
def list_languages():
    items = list(LANGUAGES.values())
    return {"items": items, "total": len(items)}

@app.get("/languages/{code}")
@app.get("/api/v1/languages/{code}")
def get_language(code: str):
    lang = LANGUAGES.get(code.lower())
    if not lang:
        raise HTTPException(status_code=404, detail=f"Language '{code}' not found")
    return lang


# --- Datasets ---
@app.get("/datasets")
@app.get("/api/v1/datasets")
def list_datasets():
    items = list(DATASETS.values())
    return {"items": items, "total": len(items)}

@app.get("/datasets/{dataset_id}")
@app.get("/api/v1/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    ds = DATASETS.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    return ds


# --- Splits ---
@app.get("/splits/{split_id}")
@app.get("/api/v1/splits/{split_id}")
def get_split(split_id: str):
    split = SPLITS.get(split_id)
    if not split:
        raise HTTPException(status_code=404, detail=f"Split '{split_id}' not found")
    return split

@app.get("/datasets/{dataset_id}/splits")
@app.get("/api/v1/datasets/{dataset_id}/splits")
def list_dataset_splits(dataset_id: str):
    if dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    items = [s for s in SPLITS.values() if s.get("dataset_id") == dataset_id]
    return {"items": items, "total": len(items)}


# --- Human Review Endpoints ---
@app.get("/review/requests")
@app.get("/api/v1/review/requests")
def list_review_requests():
    items = list(REVIEW_REQUESTS.values())
    return {"items": items, "total": len(items)}

@app.get("/review/requests/{request_id}")
@app.get("/api/v1/review/requests/{request_id}")
def get_review_request(request_id: str):
    req = REVIEW_REQUESTS.get(request_id)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review request '{request_id}' not found",
        )
    return req

@app.get("/review/requests/{request_id}/samples")
@app.get("/api/v1/review/requests/{request_id}/samples")
def get_review_samples(request_id: str):
    if request_id not in REVIEW_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review request '{request_id}' not found",
        )
    items = [s for s in SAMPLE_ITEMS if s.get("review_request_id") == request_id]
    return {"items": items, "total": len(items), "review_request_id": request_id}

@app.post("/review/decisions", status_code=status.HTTP_201_CREATED)
@app.post("/api/v1/review/decisions", status_code=status.HTTP_201_CREATED)
def submit_single_decision(payload: SubmitDecisionRequest):
    if payload.review_request_id not in REVIEW_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review request '{payload.review_request_id}' not found",
        )
    decision_val = payload.decision
    if decision_val == "approved":
        decision_val = "correct"
    elif decision_val == "rejected":
        decision_val = "incorrect"

    if decision_val not in ("correct", "incorrect", "needs_correction"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid decision '{payload.decision}'. Must be 'correct', 'incorrect', or 'needs_correction'.",
        )

    rec_id = f"dec-{payload.sample_item_id}"
    record = {
        "id": rec_id,
        "review_request_id": payload.review_request_id,
        "sample_item_id": payload.sample_item_id,
        "decision": decision_val,
        "reviewer_id": payload.reviewer_id,
        "corrected_text": payload.corrected_text,
        "notes": payload.notes,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }
    REVIEW_DECISIONS[payload.sample_item_id] = record
    return record

@app.post("/review/submit", status_code=status.HTTP_201_CREATED)
@app.post("/api/v1/review/submit", status_code=status.HTTP_201_CREATED)
@app.post("/api/reviews/submit", status_code=status.HTTP_201_CREATED)
def submit_review_batch(batch: BatchSubmitRequest):
    if batch.dataset_id not in DATASETS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{batch.dataset_id}' not found",
        )
    saved_count = 0
    for d in batch.decisions:
        sample_id = d.get("sample_id") or d.get("sample_item_id")
        if sample_id:
            dec = d.get("decision", "correct")
            if dec == "approved":
                dec = "correct"
            elif dec == "rejected":
                dec = "incorrect"
            req_id = d.get("review_request_id")
            REVIEW_DECISIONS[sample_id] = {
                "id": f"dec-{sample_id}",
                "review_request_id": req_id,
                "sample_item_id": sample_id,
                "decision": dec,
                "reviewer_id": batch.reviewer_id,
                "corrected_text": d.get("suggested_correction") or d.get("corrected_text"),
                "notes": d.get("comment") or d.get("notes"),
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
            }
            saved_count += 1
    return {
        "status": "success",
        "dataset_id": batch.dataset_id,
        "reviewer_id": batch.reviewer_id,
        "processed_decisions": saved_count,
        "message": f"Successfully recorded {saved_count} audit decisions.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.get("/review/requests/{request_id}/summary")
@app.get("/api/v1/review/requests/{request_id}/summary")
def get_review_summary(request_id: str):
    if request_id not in REVIEW_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review request '{request_id}' not found",
        )
    req_decisions = [
        d for d in REVIEW_DECISIONS.values()
        if d.get("review_request_id") == request_id
    ]
    total = len(req_decisions)
    correct = sum(1 for d in req_decisions if d["decision"] == "correct")
    incorrect = sum(1 for d in req_decisions if d["decision"] == "incorrect")
    needs_corr = sum(1 for d in req_decisions if d["decision"] == "needs_correction")
    req_samples = [s for s in SAMPLE_ITEMS if s.get("review_request_id") == request_id]
    return {
        "review_request_id": request_id,
        "total_reviewed": total,
        "correct_count": correct,
        "incorrect_count": incorrect,
        "needs_correction_count": needs_corr,
        "pass_rate": round((correct / max(1, total)) * 100, 1) if total > 0 else 0.0,
        "status": "completed" if total > 0 and total >= len(req_samples) else "in_progress",
    }


# --- Experiments ---
EXPERIMENTS: dict[str, dict[str, Any]] = {}

@app.get("/experiments")
@app.get("/api/v1/experiments")
def list_experiments():
    items = list(EXPERIMENTS.values())
    return {
        "items": items,
        "total": len(items),
    }

@app.get("/experiments/{exp_id}")
@app.get("/api/v1/experiments/{exp_id}")
def get_experiment(exp_id: str):
    exp = EXPERIMENTS.get(exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment '{exp_id}' not found",
        )
    return exp


# --- Playground Generation ---
class PlaygroundRequest(BaseModel):
    prompt: str
    language_code: Optional[str] = "tiv"
    experiment_id: Optional[str] = None
    max_new_tokens: Optional[int] = 64
    do_sample: Optional[bool] = False

@app.post("/playground/generate")
@app.post("/api/v1/playground/generate")
def playground_generate(req: PlaygroundRequest):
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Model inference is currently unavailable. Real inference endpoints are pending model hosting and adapter deployment.",
    )
