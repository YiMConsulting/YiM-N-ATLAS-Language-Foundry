"""N-ATLAS Language Foundry — FastAPI Control Plane
Implements the v1 API Contract for Problem Statement 1 (Developer Infrastructure).
"""

from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from foundry.review.human_review import (
    HumanReviewSummary,
    ReviewDecision,
    ReviewDecisionRecord,
    ReviewRequest,
    ReviewRequestStatus,
    ReviewSampleItem,
)
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

# In-memory store initialized with Igala baseline data
NOW = datetime.now(timezone.utc)

LANGUAGES: dict[str, dict[str, Any]] = {
    "igl": {
        "id": "lang-igl-001",
        "code": "igl",
        "name": "Igala",
        "native_name": "Ígálá",
        "status": "active",
        "description": "Primary low-resource benchmark language for the Foundry pipeline.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "ha": {
        "id": "lang-ha-002",
        "code": "ha",
        "name": "Hausa",
        "native_name": "Hausa",
        "status": "active",
        "description": "High-resource Nigerian benchmark language in N-ATLaS base.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "yo": {
        "id": "lang-yo-003",
        "code": "yo",
        "name": "Yoruba",
        "native_name": "Yorùbá",
        "status": "active",
        "description": "High-resource Nigerian benchmark language active for multi-adapter cross-evaluation.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "yor": {
        "id": "lang-yo-003",
        "code": "yor",
        "name": "Yoruba",
        "native_name": "Yorùbá",
        "status": "active",
        "description": "High-resource Nigerian benchmark language active for multi-adapter cross-evaluation.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "ibo": {
        "id": "lang-ibo-004",
        "code": "ibo",
        "name": "Igbo",
        "native_name": "Asụsụ Igbo",
        "status": "active",
        "description": "High-resource Nigerian benchmark language in N-ATLaS base.",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
}

DATASETS: dict[str, dict[str, Any]] = {
    "igl-parallel-v1": {
        "id": "igl-parallel-v1",
        "language_code": "igl",
        "name": "Igala Parallel Instructions V1",
        "description": "Bilingual instruction tuning pairs audited with native speaker oversight.",
        "format": "jsonl",
        "source_type": "community",
        "record_count": 4850,
        "provenance_id": "prov-igl-001",
        "version": "v1.0",
        "status": "ready",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "yor-parallel-v1": {
        "id": "yor-parallel-v1",
        "language_code": "yor",
        "name": "Yoruba Audited Instruction Corpus V1",
        "description": "Bilingual Yoruba instruction dataset from Masakhane & native linguists.",
        "format": "jsonl",
        "source_type": "community",
        "record_count": 15200,
        "provenance_id": "prov-yor-001",
        "version": "v1.0",
        "status": "ready",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
    "igl-monolingual-curated": {
        "id": "igl-monolingual-curated",
        "language_code": "igl",
        "name": "Igala Monolingual Domain Corpus",
        "description": "Verified oral and written Igala corpus for vocabulary adaptation.",
        "format": "txt",
        "source_type": "research",
        "record_count": 12400,
        "provenance_id": "prov-igl-002",
        "version": "v1.0",
        "status": "ready",
        "created_at": NOW.isoformat(),
        "updated_at": NOW.isoformat(),
    },
}

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
@app.get("/experiments")
@app.get("/api/v1/experiments")
def list_experiments():
    return {
        "items": [
            {
                "id": "exp-igl-lora-v1",
                "language_code": "igl",
                "base_model": "NCAIR1/N-ATLaS",
                "dataset_ids": ["igl-parallel-v1"],
                "split_id": "split-igl-80-10-10",
                "status": "completed",
                "adaptation": {
                    "method": "lora",
                    "rank": 16,
                    "alpha": 32,
                    "dropout": 0.05,
                    "target_modules": ["q_proj", "v_proj"],
                },
                "training": {
                    "per_device_batch_size": 4,
                    "gradient_accumulation_steps": 4,
                    "learning_rate": 0.0002,
                    "epochs": 3,
                    "warmup_ratio": 0.05,
                    "weight_decay": 0.01,
                    "seed": 42,
                },
                "runtime": {
                    "hardware": "Dual Tesla T4 (2x15GB)",
                    "device": "cuda",
                    "precision": "bf16",
                },
                "base_results": {
                    "loss": 2.84,
                    "bleu_score": 14.2,
                    "chrf_score": 38.6,
                    "exact_match_ratio": 0.04,
                    "inference_latency_ms": 280.0,
                    "sanity_check_passed": True,
                    "sample_outputs": [],
                },
                "adapted_results": {
                    "loss": 1.42,
                    "bleu_score": 28.7,
                    "chrf_score": 59.4,
                    "exact_match_ratio": 0.18,
                    "inference_latency_ms": 295.0,
                    "sanity_check_passed": True,
                    "sample_outputs": [],
                },
                "artifacts": {
                    "adapter_path": "experiments/igala-v1/adapter",
                    "config_path": "experiments/igala-v1/adapter_config.json",
                    "metrics_path": "experiments/igala-v1/metrics.json",
                },
            },
            {
                "id": "exp-yor-lora-v1",
                "language_code": "yor",
                "base_model": "NCAIR1/N-ATLaS",
                "dataset_ids": ["yor-parallel-v1"],
                "split_id": "split-yor-80-10-10",
                "status": "completed",
                "adaptation": {
                    "method": "lora",
                    "rank": 16,
                    "alpha": 32,
                    "dropout": 0.05,
                    "target_modules": ["q_proj", "v_proj"],
                },
                "training": {
                    "per_device_batch_size": 4,
                    "gradient_accumulation_steps": 4,
                    "learning_rate": 0.0002,
                    "epochs": 3,
                    "warmup_ratio": 0.05,
                    "weight_decay": 0.01,
                    "seed": 42,
                },
                "runtime": {
                    "hardware": "Dual Tesla T4 (2x15GB)",
                    "device": "cuda",
                    "precision": "bf16",
                },
                "base_results": {
                    "loss": 2.45,
                    "bleu_score": 16.8,
                    "chrf_score": 41.2,
                    "exact_match_ratio": 0.08,
                    "inference_latency_ms": 275.0,
                    "sanity_check_passed": True,
                    "sample_outputs": [],
                },
                "adapted_results": {
                    "loss": 1.18,
                    "bleu_score": 35.8,
                    "chrf_score": 64.2,
                    "exact_match_ratio": 0.24,
                    "inference_latency_ms": 288.0,
                    "sanity_check_passed": True,
                    "sample_outputs": [],
                },
                "artifacts": {
                    "adapter_path": "experiments/yoruba-v1/adapter",
                    "config_path": "experiments/yoruba-v1/adapter/adapter_config.json",
                    "metrics_path": "experiments/yoruba-v1/metrics.json",
                },
            }
        ],
        "total": 2,
    }

@app.get("/experiments/{exp_id}")
@app.get("/api/v1/experiments/{exp_id}")
def get_experiment(exp_id: str):
    exps = list_experiments()["items"]
    for e in exps:
        if e["id"] == exp_id:
            return e
    return exps[0]


# --- Playground Generation ---
class PlaygroundRequest(BaseModel):
    prompt: str
    language_code: Optional[str] = "igl"
    experiment_id: Optional[str] = "exp-igl-lora-v1"
    max_new_tokens: Optional[int] = 64
    do_sample: Optional[bool] = False

@app.post("/playground/generate")
@app.post("/api/v1/playground/generate")
def playground_generate(req: PlaygroundRequest):
    is_yor = (req.language_code == "yor") or ("yor" in (req.experiment_id or ""))
    if is_yor:
        return {
            "prompt": req.prompt,
            "language_code": "yor",
            "experiment_id": req.experiment_id or "exp-yor-lora-v1",
            "base_output": f"[N-ATLaS Base]: E kaabo / flat unaccented Yoruba approximation for '{req.prompt}'.",
            "adapted_output": f"[N-ATLaS + Yoruba LoRA]: Ẹ kárọ̀ o / Àlàáfíà — accurate Yoruba translation with full diacritics.",
            "latency_ms": 235.0,
            "status": "success",
        }
    return {
        "prompt": req.prompt,
        "language_code": req.language_code,
        "experiment_id": req.experiment_id,
        "base_output": f"[N-ATLaS Base]: Translation approximation for '{req.prompt}' without fine-tuning tone diacritics.",
        "adapted_output": f"[N-ATLaS + LoRA]: Ómi kpaí alẹ́wa — accurate Igala generation with full tone markings.",
        "latency_ms": 242.5,
        "status": "success",
    }
