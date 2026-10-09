# N-ATLAS Language Foundry — Agreed API Contract

> **Version:** 1.0.0  
> **Target Base Model:** `NCAIR1/N-ATLaS`  
> **Laboratory Language:** Igala (`igl`)  
> **Compliance:** Aligned with Section 10 (Architecture), Section 11 (Experiment Storage), and Section 12 (Workflow) of the MVP Implementation Plan.

---

## 1. Overview & Architecture Interface

The Foundry separates **AI/ML & Training execution (FastAPI backend)** from the **Dashboard, Reviewer portal & Playground (Next.js frontend)**. This API contract defines the exact interface connecting the two layers.

```
   [ Next.js Frontend / Gilbert & 3 ]
                  |
             HTTP / REST
                  v
       [ FastAPI Backend / Person 1 ]
         |             |             |
   [ SQLite DB ]  [ N-ATLAS ]   [ PEFT LoRA ]
   (Metadata)     (Base Model)  (Igala Adapter)
```

---

## 2. Core Data Models (Derived from Section 11)

Every experiment executed in the Foundry generates an immutable **`ExperimentRecord`** conforming to the fields below:

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `experiment_id` | `string` | Unique experiment identifier slug | `"igala-lora-v1"` |
| `language` | `string` | Human-readable language name | `"Igala"` |
| `language_code` | `string` | ISO 639-3 code | `"igl"` |
| `base_model` | `string` | Hugging Face model identifier | `"NCAIR1/N-ATLaS"` |
| `dataset_ids` | `string[]` | List of registered dataset IDs used | `["voiceafrica-igala-v1"]` |
| `dataset_licenses` | `object[]` | Per-dataset license & provenance verification | `[{"source_name": "VoiceAfrica", "license_type": "CC-BY-4.0", ...}]` |
| `data_version` | `string` | Checksum or manifest hash of processed data | `"sha256:7b1e4a3d..."` |
| `train_size` | `integer` | Count of training records | `450` |
| `validation_size`| `integer` | Count of validation records | `50` |
| `test_size` | `integer` | Count of held-out evaluation records | `100` |
| `hyperparameters`| `object` | `adapter_method`, `rank`, `alpha`, `dropout`, `lr`, `epochs`, `batch_size`, `seed` | `{ "adapter_method": "LoRA", "rank": 16, "alpha": 32, "dropout": 0.05, "learning_rate": 0.0002, "epochs": 3, "seed": 42 }` |
| `hardware` | `string` | Host GPU/CPU compute environment | `"Kaggle NVIDIA Tesla P100 16GB"` |
| `base_results` | `object` | Unadapted N-ATLAS performance metrics + outputs | `{ "loss": 3.84, "bleu_score": 8.2, "chrf_score": 24.5, "sanity_check_passed": true }` |
| `adapted_results`| `object` | Adapted N-ATLAS performance metrics + outputs | `{ "loss": 2.15, "bleu_score": 21.4, "chrf_score": 48.9, "sanity_check_passed": true }` |
| `human_review` | `object` | Human reviewer audit counts and qualitative notes | `{ "total_reviewed": 30, "approved": 26, "rejected": 4, "reviewer_id": "Reviewer-1" }` |
| `adapter_path` | `string` | Relative path or HF hub ID for saved weights | `"./experiments/igala-v1/adapter"` |
| `git_commit` | `string` | Commit hash at time of training run | `"e4f8b91a"` |
| `created_at` | `string` | ISO 8601 UTC timestamp | `"2026-10-08T15:30:00Z"` |
| `status` | `string` | Execution status | `"queued" \| "running" \| "completed" \| "failed"` |

---

## 3. REST API Endpoints Specification

### 3.1 System & Readiness
- **`GET /health`**
  - **Response `200 OK`**:
    ```json
    {
      "status": "healthy",
      "model_loaded": true,
      "base_model": "NCAIR1/N-ATLaS",
      "device": "cuda:0",
      "peft_ready": true
    }
    ```

---

### 3.2 Language Registry (Step 1)
- **`GET /api/languages`**
  - Returns list of registered Nigerian languages.
- **`POST /api/languages`**
  - **Request Body**:
    ```json
    {
      "language_code": "igl",
      "name": "Igala",
      "region": "Kogi State, North-Central Nigeria",
      "status": "pilot_active"
    }
    ```

---

### 3.3 Data Ingestion, Provenance & Quality Audit (Steps 2–4)
- **`POST /api/datasets/ingest`**
  - Ingests raw text/translation corpus and assigns unique manifest ID.
  - **Request Body**:
    ```json
    {
      "dataset_id": "voiceafrica-igala",
      "source_name": "VoiceAfrica Repository",
      "source_url": "https://example.org/voiceafrica",
      "license_type": "CC-BY-4.0",
      "commercial_use_allowed": true,
      "raw_records_count": 600
    }
    ```

- **`POST /api/datasets/{dataset_id}/audit`**
  - Runs automated quality filters (duplicates, missing, malformed tokens, length outliers).
  - **Response `200 OK`**:
    ```json
    {
      "dataset_id": "voiceafrica-igala",
      "total_records": 600,
      "passed_records": 560,
      "duplicates_removed": 25,
      "empty_or_malformed": 15,
      "audit_status": "passed",
      "manifest_checksum": "sha256:7b1e4a3d6f8e9c0b"
    }
    ```

---

### 3.4 Human Review Pipeline (Step 5)
- **`GET /api/reviews/sample?dataset_id=voiceafrica-igala&sample_size=30`**
  - Returns pseudo-random sample of audited rows for native speaker verification.
- **`POST /api/reviews/submit`**
  - Submits evaluation decisions by language reviewer.
  - **Request Body**:
    ```json
    {
      "dataset_id": "voiceafrica-igala",
      "reviewer_id": "Igala-Validator-01",
      "decisions": [
        { "sample_id": "igl_001", "decision": "approved", "comment": "" },
        { "sample_id": "igl_002", "decision": "needs_correction", "comment": "Tone diacritic missing on 'ọ'" }
      ]
    }
    ```

---

### 3.5 Splits & Training Execution (Steps 6–8)
- **`POST /api/datasets/{dataset_id}/split`**
  - Creates deterministic train / validation / test splits.
  - **Request Body**:
    ```json
    {
      "train_ratio": 0.75,
      "val_ratio": 0.10,
      "test_ratio": 0.15,
      "seed": 42
    }
    ```
  - **Response `200 OK`**:
    ```json
    {
      "train_count": 420,
      "val_count": 56,
      "test_count": 84,
      "split_manifest_id": "split_igala_v1"
    }
    ```

- **`POST /api/experiments/train`**
  - Launches adaptation run.
  - **Request Body**:
    ```json
    {
      "experiment_id": "igala-lora-v1",
      "dataset_id": "voiceafrica-igala",
      "hyperparameters": {
        "adapter_method": "LoRA",
        "rank": 16,
        "alpha": 32,
        "dropout": 0.05,
        "learning_rate": 0.0002,
        "epochs": 3,
        "seed": 42
      }
    }
    ```

---

### 3.6 Evaluation & Comparison (Steps 9–10)
- **`GET /api/experiments/{experiment_id}/comparison`**
  - Compares Base N-ATLAS vs Adapted N-ATLAS on held-out test split.
  - **Response `200 OK`**:
    ```json
    {
      "experiment_id": "igala-lora-v1",
      "language": "Igala",
      "base_metrics": {
        "bleu": 8.2,
        "chrf": 24.5,
        "loss": 3.84
      },
      "adapted_metrics": {
        "bleu": 21.4,
        "chrf": 48.9,
        "loss": 2.15
      },
      "relative_improvement_pct": 160.9,
      "side_by_side_examples": [
        {
          "input": "Good morning, how is the family?",
          "reference": "Ọlọjọ kọla, am'olubo nko?",
          "base_natlas_output": "E káárọ, bawo ni ile?",
          "adapted_natlas_output": "Ọlọjọ kọla, am'unyi nko?",
          "notes": "Base fell back to Yoruba; adapted generated correct Igala greeting."
        }
      ]
    }
    ```

---

### 3.7 Interactive Playground (Step 12)
- **`POST /api/playground/generate`**
  - **Request Body**:
    ```json
    {
      "prompt": "Translate to Igala: Where is the hospital located?",
      "experiment_id": "igala-lora-v1",
      "temperature": 0.7,
      "max_tokens": 64
    }
    ```
  - **Response `200 OK`**:
    ```json
    {
      "base_model_output": "Ibo ni ile iwosan wa?",
      "adapted_model_output": "Ene che asibiti le de?",
      "latency_ms": 380
    }
    ```

---

## 4. Error Handling Standards

All backend endpoints return standardized error envelopes:
```json
{
  "error": true,
  "code": "DATASET_NOT_AUDITED",
  "message": "Cannot perform training split before quality audit is completed.",
  "timestamp": "2026-10-08T15:30:00Z"
}
```
