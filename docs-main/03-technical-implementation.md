# 03 — Technical Implementation Deep Dive

> **N-ATLaS Language Foundry — Engineering Deep Dive**  
> *Author: YiM Consulting Engineering Team*

---

## 1. Data Pipeline & Schema Validation

### 1.1 Canonical Record Schema
Every parallel translation record processed by the Foundry is validated against the strict `DatasetRecord` Pydantic model (`api/schemas/dataset.py`):

```python
class DatasetRecord(BaseModel):
    id: str = Field(..., description="Unique record identifier, e.g. 'mt560-140929'")
    input: str = Field(..., min_length=1, description="Source English sentence")
    target: str = Field(..., min_length=1, description="Target indigenous language translation")
    language_code: str = Field(..., min_length=2, max_length=8, description="Target BCP-47 / ISO-639-3 code")
```

Any record containing empty strings, whitespace-only content, missing keys, or invalid language codes is rejected immediately during ingestion with an observable error log.

### 1.2 Deterministic Grouped-by-Input Splitting
To solve the data leakage issue where identical English sentences are translated slightly differently across chapters, `foundry/datasets/split.py` implements hash-based input grouping:

```python
def assign_bucket(input_text: str, seed: int) -> float:
    # Normalized hash ensures deterministic assignment regardless of execution environment
    hasher = hashlib.sha256(f"{seed}:{input_text.strip().lower()}".encode("utf-8"))
    return int(hasher.hexdigest()[:8], 16) / 0xFFFFFFFF
```
If a bucket value falls within $[0, 0.75)$, all records with that English input are placed into `train`. Values in $[0.75, 0.85)$ are assigned to `validation`, and $[0.85, 1.0]$ to `test`. This guarantees mathematical **0% source overlap** across partitions.

---

## 2. Tokenization, Prefix Verification & Loss Masking

A critical defect in naive LLM fine-tuning is supervising the entire prompt sequence, which causes models to learn prompt repetition rather than generating translation targets.

### 2.1 Assistant-Only Loss Masking
In `foundry/training/preprocessing.py`, `NAtlasPreprocessor` implements assistant-only token supervision:

```python
IGNORE_INDEX = -100

prompt_result = tokenizer.apply_chat_template(
    [{"role": "user", "content": record.input}],
    tokenize=True,
    add_generation_prompt=True,
    return_dict=True,
)
full_result = tokenizer.apply_chat_template(
    [{"role": "user", "content": record.input},
     {"role": "assistant", "content": record.target}],
    tokenize=True,
    add_generation_prompt=False,
    return_dict=True,
)

prompt_ids = list(prompt_result["input_ids"])
input_ids = list(full_result["input_ids"])

# Boundary Safety Assertion:
if input_ids[: len(prompt_ids)] != prompt_ids:
    raise ValueError(f"Prompt IDs do not form an exact prefix of conversation in record {record.id}")

# Mask prompt tokens with -100; supervise only assistant tokens and <|eot_id|>
labels = [IGNORE_INDEX] * len(prompt_ids) + input_ids[len(prompt_ids):]
```

### 2.2 Dynamic Batch Collation
Variable-length sequences are padded dynamically at collation time using `NAtlasDataCollator` (`foundry/training/collator.py`):
- Uses native `<|eot_id|>` (ID `128009`) as the padding token.
- Right-padding aligns sequences to the batch maximum.
- Padded token positions receive `attention_mask = 0` and `labels = -100`.
- Supervised losses are token-weighted to ensure batches with varying response lengths contribute proportionally to the gradient.

---

## 3. PEFT LoRA Adaptation Setup

Model adaptation is parameterized via versioned YAML specifications (`configs/tiv_lora.yaml`):

```yaml
id: tiv-lora-v1
language_code: tiv
base_model: NCAIR1/N-ATLaS
dataset_ids:
  - tiv-mt560-v1
split_id: tiv-mt560-v1-split-42

adaptation:
  method: lora
  rank: 16
  alpha: 32
  dropout: 0.05
  target_modules:
    - q_proj
    - v_proj

training:
  per_device_batch_size: 1
  gradient_accumulation_steps: 8
  learning_rate: 0.0001
  epochs: 1
  warmup_ratio: 0.03
  weight_decay: 0.01
  seed: 42

runtime:
  hardware: Tesla T4
  device: cuda
  precision: fp16
```

### Parameter Efficiency
Targeting attention projection layers (`q_proj`, `v_proj`) with rank $r=16$ yields:
- **Total Model Parameters:** 8,037,076,992 (~8.04 billion)
- **Trainable Parameters:** 6,815,744 (~6.8 million)
- **Trainable Ratio:** ~**0.0848%**
- **Artifact Size:** 27.28 MB (`adapter_model.safetensors`), allowing instant distribution and minimal storage overhead.

---

## 4. Evaluation Harness Architecture

Implemented in `foundry/evaluation/harness.py`, `EvaluationPromptBuilder` eliminates the methodological flaw identified in earlier informal tests:

```python
DEFAULT_TIV_TRANSLATION_TEMPLATE = "Translate the following English text into Tiv:\n{text}"

class EvaluationPromptBuilder:
    def __init__(self, template: str = DEFAULT_TIV_TRANSLATION_TEMPLATE):
        if not template.strip() or "{text}" not in template:
            raise ValueError("Template must contain non-empty '{text}' placeholder.")
        self.template = template

    def format_user_instruction(self, input_text: str) -> str:
        if not input_text or not input_text.strip():
            raise ValueError("Input text cannot be empty.")
        return self.template.format(text=input_text.strip())

    def build_messages(self, record: DatasetRecord) -> list[dict[str, str]]:
        # Reference exclusion guaranteed: record.target is never accessed
        return [{"role": "user", "content": self.format_user_instruction(record.input)}]
```

### Invariants Enforced by Unit Tests (`tests/test_evaluation_harness.py`):
1. **Reference Exclusion:** Validates that reference targets never leak into prompt content.
2. **Inference Parity:** Ensures identical prompt byte sequences are dispatched to both `base_model` and `adapted_model`.
3. **Empty Input Rejection:** Rejects empty and whitespace-only strings.
4. **Base Model Revision Pinning:** Pinned to `e294476928aca9030e924ca27bb8e085e8581273`.

---

## 5. FastAPI Control Plane Implementation

### 5.1 Route Topology (`api/main.py`)
- `GET /` — Root metadata, service health, and `read_only_mode` status.
- `GET /health` & `GET /api/v1/health` — Probes reporting service uptime, version, and ISO timestamp.
- `GET /api/v1/languages` & `GET /api/v1/languages/{code}` — Language registry.
- `GET /api/v1/datasets` & `GET /api/v1/datasets/{id}` — Dataset metadata.
- `GET /api/v1/datasets/{id}/splits` & `GET /api/v1/splits/{id}` — Split metadata.
- `GET /api/v1/datasets/{id}/review-evidence` — Verified human-review evidence.
- `GET /api/v1/review/requests` — Review queue.
- `POST /api/v1/review/decisions` & `POST /api/v1/review/submit` — Review submission (guarded by read-only mode).
- `GET /api/v1/experiments` & `GET /api/v1/experiments/{id}` — Experiment registry.
- `POST /api/v1/playground/generate` — Controlled inference endpoint (returns HTTP 503).

### 5.2 Standalone Manifest Discovery
`load_processed_splits()` dynamically searches `data/processed/*/split_metadata.json` and seamlessly falls back to `data/manifests/*split_metadata.json`. This enables cloud containers to return full partition statistics without carrying gigabytes of training JSONL files.

---

## 6. Security & Read-Only Guard

For public demonstration deployments on Render, `api/main.py` enforces a demonstration security guard:

```python
READ_ONLY_MODE = os.getenv("READ_ONLY_MODE", "false").lower() in ("true", "1", "yes")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "").strip()

def verify_write_permission(authorization: Optional[str] = None) -> None:
    if READ_ONLY_MODE:
        if ADMIN_API_KEY and authorization:
            expected = f"Bearer {ADMIN_API_KEY}"
            if authorization == expected or authorization == ADMIN_API_KEY:
                return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public review submission is disabled in demonstration mode. The API is currently configured for read-only demonstration.",
        )
```

This prevents unauthenticated public writes, defacement of in-memory review states, and spam attacks during hackathon judging.

---

## 7. Containerization & Cloud Deployment

### 7.1 Dockerfile Design
```dockerfile
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PYTHONPATH=/app
WORKDIR /app
COPY requirements-api.txt .
RUN pip install --upgrade pip && pip install -r requirements-api.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```
- **Dynamic Port Binding:** Shell form CMD dynamically evaluates `${PORT:-8000}`, ensuring compatibility with Render's dynamic port assignment.
- **Slim Footprint:** `.dockerignore` excludes bulky datasets (`data/raw/*`, `data/processed/*`), adapter weights (`foundry/runs/*`), and virtual environments, keeping image builds under 200 MB.

### 7.2 Render Blueprint (`render.yaml`)
```yaml
services:
  - type: web
    name: natlas-foundry-api
    runtime: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    plan: free
    region: oregon
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 10000
      - key: PYTHONUNBUFFERED
        value: "1"
      - key: CORS_ORIGINS
        value: "*"
      - key: READ_ONLY_MODE
        value: "true"
      - key: PROCESSED_DATA_DIR
        value: "data/processed"
```

---

## 8. Test Suite & Verification Results

The backend codebase is covered by **125 automated unit and regression tests** across 14 test modules:

```text
tests/test_api_truthfulness.py ..................                        [ 14%]
tests/test_dataset_builder.py ..........                                 [ 22%]
tests/test_dataset_record_schema.py .....                                [ 26%]
tests/test_dataset_schema.py ......                                      [ 31%]
tests/test_dataset_split_schema.py ......                                [ 36%]
tests/test_deployment_readiness.py ....                                  [ 39%]
tests/test_evaluation_harness.py .......                                 [ 44%]
tests/test_experiment_schema.py ...............                          [ 56%]
tests/test_human_review_schema.py .........                              [ 64%]
tests/test_language_schema.py .....                                      [ 68%]
tests/test_natlas_formatter.py ........                                  [ 74%]
tests/test_natlas_model_setup.py .....                                   [ 78%]
tests/test_natlas_preprocessing.py ..........                            [ 86%]
tests/test_quality_schema.py .................                           [100%]
================== 125 passed, 2 skipped, 1 warning in 2.41s ===================
```

---
*Next: Read about dataset curation and provenance in [04-tiv-dataset-and-provenance.md](./04-tiv-dataset-and-provenance.md).*
