"""N-ATLAS Language Foundry — FastAPI Control Plane
Implements the v1 API Contract for Problem Statement 1 (Developer Infrastructure).
"""

from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import json
from pathlib import Path

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

SPLITS: dict[str, dict[str, Any]] = {}

processed_dir = Path("data/processed")
if processed_dir.is_dir():
    for split_meta_path in processed_dir.glob("*/split_metadata.json"):
        try:
            with split_meta_path.open("r", encoding="utf-8") as f:
                meta = json.load(f)
                DatasetSplit.model_validate(meta)
                SPLITS[meta["id"]] = meta
        except Exception:
            pass

# Review Requests & Sample Items
DEFAULT_REVIEW_REQUEST_ID = "rev_req_igl_001"

REVIEW_REQUESTS: dict[str, dict[str, Any]] = {
    DEFAULT_REVIEW_REQUEST_ID: {
        "id": DEFAULT_REVIEW_REQUEST_ID,
        "dataset_id": "igl-parallel-v1",
        "reviewer_id": "olusegun-linguist",
        "sample_size": 10,
        "status": "in_progress",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    }
}

SAMPLE_ITEMS: list[dict[str, Any]] = [
    {
        "id": "sample-igl-001",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-001",
        "input_text": "Good morning, how did you sleep?",
        "expected_text": "Ọlọjọ kọla, amá kpe?",
        "context": "Daily greetings & courtesy",
        "flagged_reason": "Tone markings verification on 'amá'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-002",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-002",
        "input_text": "Water is essential for life.",
        "expected_text": "Ómi che n'uche kpaí ọma olé.",
        "context": "General knowledge & biology",
        "flagged_reason": "Check diacritics on 'Ómi' and apostrophe in 'n'uche'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-003",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-003",
        "input_text": "The king is seated upon the ancestral throne.",
        "expected_text": "Àtá d'ojí akpẹ́ ẹnẹwú.",
        "context": "Traditional leadership & culture",
        "flagged_reason": "Validate capitalization of royal title 'Àtá'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-004",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-004",
        "input_text": "Welcome to our home.",
        "expected_text": "Kú alẹwa kpaí olé wa.",
        "context": "Hospitality & welcoming phrases",
        "flagged_reason": "Potential dialectal variation",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-005",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-005",
        "input_text": "Children should respect their parents and elders.",
        "expected_text": "Am'ẹ́ma á che ọlọjọ am'akpamẹ.",
        "context": "Moral instruction & social ethics",
        "flagged_reason": "Sub-dot vowels validation on 'Am'ẹ́ma'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-006",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-006",
        "input_text": "The farmer planted maize before the first rain.",
        "expected_text": "Ọnẹ́ agbẹ kọ akpa tákí ómí akọ́kọ́ dẹ.",
        "context": "Agriculture & seasons",
        "flagged_reason": "Verify compound term for maize 'akpa'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-007",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-007",
        "input_text": "Health is greater than wealth.",
        "expected_text": "Aláfià che gaju ukọlọ kpaí ewn ẹli.",
        "context": "Igala proverbs & wisdom",
        "flagged_reason": "Borrowed word loan-adaptation: 'Aláfià'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-igl-008",
        "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
        "record_id": "rec-008",
        "input_text": "Tell me the story about the turtle and the elephant.",
        "expected_text": "Kọ́ mi ita kpaí aníkpe kpaí enyí.",
        "context": "Folklore & storytelling",
        "flagged_reason": "Grammatical harmony for folk tale characters",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-yor-001",
        "review_request_id": "rev_req_yor_001",
        "record_id": "rec-yor-001",
        "input_text": "Good morning, how did you sleep?",
        "expected_text": "Ẹ kárọ̀ o, ṣé ẹ sùn dáadáa?",
        "context": "Daily greetings & courtesy",
        "flagged_reason": "Tone markings verification",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-yor-002",
        "review_request_id": "rev_req_yor_001",
        "record_id": "rec-yor-002",
        "input_text": "Water is essential for life, let us preserve our rivers.",
        "expected_text": "Omi ṣe pàtàkì fún ẹ̀mí, ẹ jẹ́ ká dáàbò bo odò wa.",
        "context": "General knowledge & biology",
        "flagged_reason": "Verify diacritics on 'ẹ̀mí'",
        "sampled_at": NOW.isoformat(),
    },
    {
        "id": "sample-yor-003",
        "review_request_id": "rev_req_yor_001",
        "record_id": "rec-yor-003",
        "input_text": "Welcome to our home, feel at peace.",
        "expected_text": "Ẹ káàbọ̀ sí ilé wa, ẹ fọkàn balẹ̀.",
        "context": "Hospitality & welcoming phrases",
        "flagged_reason": "Potential dialectal variation",
        "sampled_at": NOW.isoformat(),
    }
]

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
        "review_samples_url": "/api/v1/review/requests/rev_req_igl_001/samples",
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


# --- Human Review Endpoints (James's Schema Contract) ---
@app.get("/review/requests")
@app.get("/api/v1/review/requests")
def list_review_requests():
    items = list(REVIEW_REQUESTS.values())
    return {"items": items, "total": len(items)}

@app.get("/review/requests/{request_id}/samples")
@app.get("/api/v1/review/requests/{request_id}/samples")
def get_review_samples(request_id: str):
    # Match items for this request, or fallback to default Igala set
    items = [s for s in SAMPLE_ITEMS if s["review_request_id"] == request_id]
    if not items:
        items = SAMPLE_ITEMS
    return {"items": items, "total": len(items), "review_request_id": request_id}

@app.post("/review/decisions", status_code=status.HTTP_201_CREATED)
@app.post("/api/v1/review/decisions", status_code=status.HTTP_201_CREATED)
def submit_single_decision(payload: SubmitDecisionRequest):
    # Normalize decision strings
    decision_val = payload.decision
    if decision_val == "approved":
        decision_val = "correct"
    elif decision_val == "rejected":
        decision_val = "incorrect"

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
    saved_count = 0
    for d in batch.decisions:
        sample_id = d.get("sample_id") or d.get("sample_item_id")
        if sample_id:
            dec = d.get("decision", "correct")
            if dec == "approved":
                dec = "correct"
            elif dec == "rejected":
                dec = "incorrect"
            REVIEW_DECISIONS[sample_id] = {
                "id": f"dec-{sample_id}",
                "review_request_id": DEFAULT_REVIEW_REQUEST_ID,
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
    total = len(REVIEW_DECISIONS)
    correct = sum(1 for d in REVIEW_DECISIONS.values() if d["decision"] == "correct")
    incorrect = sum(1 for d in REVIEW_DECISIONS.values() if d["decision"] == "incorrect")
    needs_corr = sum(1 for d in REVIEW_DECISIONS.values() if d["decision"] == "needs_correction")
    return {
        "review_request_id": request_id,
        "total_reviewed": total,
        "correct_count": correct,
        "incorrect_count": incorrect,
        "needs_correction_count": needs_corr,
        "pass_rate": round((correct / max(1, total)) * 100, 1) if total > 0 else 0.0,
        "status": "completed" if total >= len(SAMPLE_ITEMS) else "in_progress",
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
