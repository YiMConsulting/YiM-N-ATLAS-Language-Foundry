# N-ATLaS Language Foundry --- API Contract

**Status:** Frontend-facing MVP contract proposal\
**Version:** `v1`\
**Audience:** Frontend, backend/API, AI/ML, and integration
contributors.

> **Important:** This document defines the target contract for parallel
> frontend development. It does not claim every route is implemented.
> Existing schemas and verified ML setup are foundations; routes,
> training execution, evaluation, and inference must be implemented and
> tested separately. Use mock data for routes not yet available.

## 1. Purpose and MVP workflow

The API is the Foundry **control plane**: it manages language, dataset,
review, split, and experiment state. Model training is a separate
execution concern. Long-running training must not block an HTTP request;
the API should create/queue an experiment and expose its status.

Target workflow:

1.  Register/list languages.
2.  Register datasets and ingest records.
3.  Inspect quality/audit results.
4.  Review flagged records and record decisions.
5.  Create reproducible train/validation/test splits.
6.  Create and start adaptation experiments.
7.  Inspect status, metrics, logs, and artifacts.
8.  Try a completed adapter in the playground when inference is
    available.

Status labels in this document: - **Existing schema:** a schema exists
in the repository; this does not prove a route exists. - **Proposed
API:** shape to implement for the MVP. - **Execution-dependent:** only
operational after a real worker/training/inference path exists.

## 2. Base URL and conventions

Local default (confirm actual port/prefix from the backend app entry
point):

``` text
http://localhost:8000/api/v1
```

Frontend environment variable:

``` text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Use JSON request/response bodies except where file upload is explicitly
implemented. Use ISO-8601 UTC timestamps. IDs are opaque strings. The
current backend schema uses **snake_case**; preserve that in API
payloads unless the backend explicitly configures aliases. Frontend code
may map to camelCase internally.

Recommended HTTP status codes:

  Code    Meaning
  ------- ----------------------------------------
  `200`   Successful read/action
  `201`   Resource created
  `202`   Long-running operation accepted/queued
  `204`   Success with no body
  `400`   Invalid workflow request
  `404`   Resource not found
  `409`   State conflict
  `422`   Request validation failed
  `500`   Unexpected server error
  `503`   Required executor/model unavailable

The normalized error envelope below is a target. Until implemented,
handle FastAPI/Pydantic's default validation response too.

## 3. Shared TypeScript contracts

### Language

``` ts
export type LanguageStatus = "discovered" | "active" | "paused" | "deprecated";

export interface Language {
  code: string; // e.g. "igl" (2-8 characters)
  name: string;
  native_name?: string | null;
  status: LanguageStatus;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
}
```

Igala (`igl`) is the first target, but Foundry logic and shared UI must
remain language-agnostic.

### Dataset and Provenance

``` ts
export type DatasetFormat =
  | "jsonl" | "json" | "csv" | "tsv" | "parquet" | "txt";
export type DatasetSourceType =
  | "research" | "community" | "institutional" | "private";
export type DatasetStatus =
  | "registered" | "provenance_checked" | "audited"
  | "reviewed" | "ready" | "rejected";

export interface DatasetProvenance {
  id: string;
  source_name: string;
  source_url?: string | null;
  license: string;
  version?: string | null;
  published_at?: string | null;
  retrieved_at: string;
  usage_allowed: boolean;
  usage_notes?: string | null;
  checksum?: string | null;
}

export interface Dataset {
  id: string;
  language_code: string;
  name: string;
  description?: string | null;
  format: DatasetFormat;
  source_type: DatasetSourceType;
  record_count?: number | null;
  local_path?: string | null;
  provenance_id: string;
  version?: string | null;
  status: DatasetStatus;
  created_at: string;
  updated_at: string;
}
```

### Canonical dataset record

``` ts
export interface DatasetRecord {
  id: string;
  input: string;
  target: string;
  language_code: string;
}
```

`input` is the source/instruction text; `target` is the expected
response/translation. Empty input or target is invalid for training.
Record IDs should be stable within a dataset.

### Quality Audit

``` ts
export type AuditStatus = "passed" | "warning" | "failed";

export interface QualityAudit {
  id: string;
  dataset_id: string;
  status: AuditStatus;
  total_records: number;
  valid_records: number;
  empty_records: number;
  malformed_records: number;
  missing_required_fields: number;
  duplicate_records: number;
  duplicate_rate: number; // Range [0.0, 1.0]
  suspected_language_mismatches: number;
  warnings: string[];
  errors: string[];
  audit_version: string;
  audited_at: string;
}
```

### Human Review

``` ts
export type ReviewRequestStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type ReviewDecision = "correct" | "incorrect" | "needs_correction";

export interface ReviewRequest {
  id: string;
  dataset_id: string;
  reviewer_id?: string | null;
  sample_size: number;
  status: ReviewRequestStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface ReviewSampleItem {
  id: string;
  review_request_id: string;
  record_id: string;
  input_text: string;
  expected_text: string;
  sampled_at: string;
}

export interface ReviewDecisionRecord {
  id: string;
  review_request_id: string;
  sample_item_id: string;
  decision: ReviewDecision;
  reviewer_id?: string | null;
  corrected_text?: string | null;
  notes?: string | null;
  reviewed_at: string;
}

export interface HumanReviewSummary {
  total_reviewed: number;
  correct_count: number;
  incorrect_count: number;
  needs_correction_count: number;
  review_request_id?: string | null;
  reviewer_id?: string | null;
  notes?: string | null;
}
```

### Dataset split

``` ts
export type SplitStrategy = "random";

export interface DatasetSplit {
  id: string;
  dataset_id: string;
  strategy: SplitStrategy;
  seed: number;
  train_ratio: number;
  validation_ratio: number;
  test_ratio: number;
  total_records: number;
  train_records: number;
  validation_records: number;
  test_records: number;
  created_at: string;
}
```

Ratios must be in `(0, 1)` and sum to `1.0` within tolerance. Split
counts must sum to `total_records`. Frontend should display actual
server-returned counts, not calculate authoritative counts itself.

### Experiment and nested settings

The existing experiment schema includes `id`, `language_code`,
`base_model`, `dataset_ids`, `split_id`, `adaptation`, `training`,
`runtime`, `status`, base/adapted results, artifact metadata, optional
`git_commit`, and timestamps.

``` ts
export type ExperimentStatus =
  | "queued" | "running" | "evaluating" | "completed" | "failed";
export type AdaptationMethod = "lora" | "qlora";

export interface AdaptationConfig {
  method: AdaptationMethod;
  rank: number;
  alpha: number;
  dropout: number;
  target_modules: string[];
}

export interface TrainingConfig {
  per_device_batch_size: number;
  gradient_accumulation_steps: number;
  learning_rate: number;
  epochs: number;
  warmup_ratio: number;
  weight_decay: number;
  seed: number;
}

export interface RuntimeConfig {
  hardware: string;
  device: string;
  precision: string | null;
}

export interface EvaluationMetrics {
  loss?: number | null;
  bleu_score?: number | null;
  chrf_score?: number | null;
  exact_match_ratio?: number | null;
  inference_latency_ms?: number | null;
  sanity_check_passed: boolean;
  sample_outputs: Array<Record<string, string>>;
}

export interface ExperimentArtifacts {
  adapter_path?: string | null;
  config_path?: string | null;
  metrics_path?: string | null;
  logs_path?: string | null;
}

export interface Experiment {
  id: string;
  language_code: string;
  base_model: string;
  dataset_ids: string[];
  split_id: string;
  adaptation: AdaptationConfig;
  training: TrainingConfig;
  runtime: RuntimeConfig;
  status: ExperimentStatus;
  base_results?: EvaluationMetrics | null;
  adapted_results?: EvaluationMetrics | null;
  artifacts: ExperimentArtifacts;
  git_commit?: string | null;
  created_at: string;
  updated_at?: string | null;
}
```

**Important capability limit:** `qlora` exists in the schema, but the
current verified model setup supports standard LoRA and deliberately
rejects QLoRA until quantized model loading is implemented. Disable
QLoRA in the MVP UI or label it unavailable. The verified smoke test
confirms adapter attachment and gradient flow, not completed training or
model quality.

## 4. Error contract

Target normalized error:

``` ts
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id?: string;
  };
}
```

Example:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "train_ratio, validation_ratio, and test_ratio must sum to 1.0",
    "details": {"field": "train_ratio"},
    "request_id": "req_example"
  }
}
```

Suggested codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`,
`INVALID_STATE`, `EXECUTOR_UNAVAILABLE`, `MODEL_LOAD_FAILED`,
`TRAINING_FAILED`, `INTERNAL_ERROR`.

Frontend should show a useful message and retain field-level details
when available. Until normalized errors are implemented, also parse
FastAPI's default `422` response.

## 5. Endpoint catalogue

All routes below are **proposed** unless independently verified in the
backend. The base prefix is `/api/v1`.

  ------------------------------------------------------------------------------------------------------
  Method            Path                                       Purpose             Availability
  ----------------- ------------------------------------------ ------------------- ---------------------
  `GET`             `/health`                                  API health          Proposed

  `GET`             `/languages`                               List languages      Proposed

  `GET`             `/languages/{code}`                        Language details    Proposed

  `GET`             `/datasets`                                List/filter         Proposed
                                                               datasets            

  `POST`            `/datasets`                                Register dataset    Proposed

  `GET`             `/datasets/{dataset_id}`                   Dataset details     Proposed

  `POST`            `/datasets/{dataset_id}/records`           Import records      Proposed

  `GET`             `/datasets/{dataset_id}/records`           Preview records     Proposed

  `POST`            `/datasets/{dataset_id}/audit`             Run quality audit   Proposed

  `GET`             `/datasets/{dataset_id}/quality`           Read quality audit  Proposed

  `POST`            `/datasets/{dataset_id}/review-requests`   Create review req   Proposed

  `GET`             `/review/requests`                         List review reqs    Proposed

  `GET`             `/review/requests/{id}/samples`            List sample items   Proposed

  `POST`            `/review/decisions`                        Submit decision     Proposed

  `GET`             `/review/requests/{id}/summary`            Read review summary Proposed

  `POST`            `/datasets/{dataset_id}/splits`            Create split        Proposed

  `GET`             `/splits/{split_id}`                       Split details       Proposed

  `GET`             `/experiments`                             List/filter         Proposed
                                                               experiments         

  `POST`            `/experiments`                             Create experiment   Proposed

  `GET`             `/experiments/{experiment_id}`             Experiment/status   Proposed
                                                               details             

  `POST`            `/experiments/{experiment_id}/start`       Queue execution     Execution-dependent

  `GET`             `/experiments/{experiment_id}/logs`        Read logs           Execution-dependent

  `GET`             `/experiments/{experiment_id}/metrics`     Evaluation results  Execution-dependent

  `GET`             `/experiments/{experiment_id}/artifacts`   Artifact            Execution-dependent
                                                               metadata/links      

  `GET`             `/experiments/compare?ids=a,b`             Compare experiments Proposed

  `POST`            `/playground/generate`                     Generate text       Execution-dependent
  ------------------------------------------------------------------------------------------------------

### Shared list response

Use this pagination envelope for list routes:

``` ts
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
```

Proposed default `limit` is 20 and `offset` is 0. Query filters should
be documented per route.

## 6. Endpoint request/response examples

### Health

`GET /health`

``` json
{
  "status": "ok",
  "service": "natlas-foundry-api",
  "version": "0.1.0"
}
```

This should report API process health only. Do not claim GPU/model
readiness unless explicitly checked.

### Languages

`GET /languages` returns `PaginatedResponse<Language>` (or a simple
`{items, total}` list if pagination is not needed for the initial
registry). Optional filters: `status`, `search`.

`GET /languages/{code}` returns a `Language`, or `404`.

### Register dataset

`POST /datasets`

``` json
{
  "language_code": "igl",
  "name": "Igala starter corpus",
  "description": "Reviewed examples for initial adaptation experiments",
  "format": "jsonl",
  "source_type": "research",
  "provenance_id": "prov_example_001",
  "version": "v1"
}
```

Response: `201 Created` with `Dataset`. The server creates the
ID/timestamps. `provenance_id` must reference a real provenance record;
the sample ID is illustrative. A dataset must not become `ready` until
required provenance, ingestion, and quality checks pass.

### Import records

`POST /datasets/{dataset_id}/records`

``` json
{
  "records": [
    {
      "id": "igl-001",
      "input": "How are you?",
      "target": "Awa nɔ?",
      "language_code": "igl"
    }
  ],
  "mode": "append"
}
```

`mode` (`append` or `replace`) is proposed and must be implemented
explicitly. Backend must define duplicate-ID behavior and reject invalid
records transparently.

Target response:

``` json
{
  "dataset_id": "dataset_example_001",
  "received": 1,
  "accepted": 1,
  "rejected": 0,
  "errors": []
}
```

These counts are example values, not project data.

### Record preview

`GET /datasets/{dataset_id}/records?limit=20&offset=0`

Returns `PaginatedResponse<DatasetRecord>`. If the dataset has no
records, return an empty list rather than a fabricated record.

### Quality audit

`POST /datasets/{dataset_id}/audit`

Runs automated quality audit on the specified dataset.

Target response: `200 OK` or `201 Created` with `QualityAudit`:

``` json
{
  "id": "audit_example_001",
  "dataset_id": "dataset_example_001",
  "status": "passed",
  "total_records": 100,
  "valid_records": 98,
  "empty_records": 0,
  "malformed_records": 0,
  "missing_required_fields": 0,
  "duplicate_records": 2,
  "duplicate_rate": 0.02,
  "suspected_language_mismatches": 0,
  "warnings": ["Duplicate records detected: 2"],
  "errors": [],
  "audit_version": "1.0",
  "audited_at": "2026-10-09T12:00:00Z"
}
```

`GET /datasets/{dataset_id}/quality` returns the latest `QualityAudit` summary or `404` when no audit exists.

### Human Review Workflow

1. **Create Review Request:**
   `POST /datasets/{dataset_id}/review-requests`

   ``` json
   {
     "sample_size": 30,
     "reviewer_id": "reviewer_001"
   }
   ```

   Response: `201 Created` with `ReviewRequest`:
   ``` json
   {
     "id": "rev_req_001",
     "dataset_id": "dataset_example_001",
     "reviewer_id": "reviewer_001",
     "sample_size": 30,
     "status": "pending",
     "created_at": "2026-10-09T12:30:00Z",
     "updated_at": null
   }
   ```

2. **Fetch Sample Items to Review:**
   `GET /review/requests/{id}/samples`

   ``` json
   {
     "items": [
       {
         "id": "sample_001",
         "review_request_id": "rev_req_001",
         "record_id": "igl-001",
         "input_text": "How are you?",
         "expected_text": "Awa nɔ?",
         "sampled_at": "2026-10-09T12:30:00Z"
       }
     ],
     "total": 1
   }
   ```

3. **Submit Review Decision:**
   `POST /review/decisions`

   ``` json
   {
     "review_request_id": "rev_req_001",
     "sample_item_id": "sample_001",
     "decision": "correct",
     "reviewer_id": "reviewer_001",
     "corrected_text": null,
     "notes": "Natural and grammatically valid tone markings."
   }
   ```

   Allowed decisions: `"correct"`, `"incorrect"`, `"needs_correction"`. If `"needs_correction"` is selected, `corrected_text` should provide the suggested revision.

   Response: `201 Created` with `ReviewDecisionRecord`.

4. **Review Request Summary:**
   `GET /review/requests/{id}/summary`

   ``` json
   {
     "total_reviewed": 30,
     "correct_count": 28,
     "incorrect_count": 0,
     "needs_correction_count": 2,
     "review_request_id": "rev_req_001",
     "reviewer_id": "reviewer_001",
     "notes": "Reviewed and verified."
   }
   ```

### Create split

`POST /datasets/{dataset_id}/splits`

``` json
{
  "strategy": "random",
  "seed": 42,
  "train_ratio": 0.8,
  "validation_ratio": 0.1,
  "test_ratio": 0.1
}
```

Response: `201 Created` with `DatasetSplit`. Reject invalid ratios and
inconsistent counts. The same dataset version, strategy, and seed should
produce a reproducible split.

### Create experiment

`POST /experiments`

``` json
{
  "id": "exp_igl_001",
  "language_code": "igl",
  "base_model": "NCAIR1/N-ATLaS",
  "dataset_ids": ["dataset_example_001"],
  "split_id": "split_example_001",
  "adaptation": {
    "method": "lora",
    "rank": 16,
    "alpha": 32,
    "dropout": 0.05,
    "target_modules": ["q_proj", "v_proj"]
  },
  "training": {
    "per_device_batch_size": 1,
    "gradient_accumulation_steps": 4,
    "learning_rate": 0.0002,
    "epochs": 1,
    "warmup_ratio": 0.0,
    "weight_decay": 0.0,
    "seed": 42
  },
  "runtime": {
    "hardware": "Tesla T4",
    "device": "cuda",
    "precision": "fp16"
  }
}
```

Response: `201 Created` with `Experiment`, normally initially `queued`.
Values are a proposed small-run example, not a validated training
recipe. Backend must verify the dataset/split relationship and supported
runtime settings. Current schema requires the caller-provided experiment
`id`; change to server-generated IDs only if schema and contract are
updated together.

### Start experiment

`POST /experiments/{experiment_id}/start`

``` json
{"confirm": true}
```

Target response: `202 Accepted`

``` json
{
  "experiment_id": "exp_igl_001",
  "status": "queued",
  "message": "Experiment accepted for execution"
}
```

This route must not claim execution has started unless a real
executor/worker has accepted the job. If execution is unavailable,
return `503` with `EXECUTOR_UNAVAILABLE`.

### Experiment detail/status

`GET /experiments/{experiment_id}` returns `Experiment`.

Expected lifecycle:

``` text
queued -> running -> evaluating -> completed
                              \-> failed
```

The frontend should poll while status is non-terminal, using a modest
interval (e.g. 3--5 seconds), and stop at `completed` or `failed`.
Include a useful failure message or log reference, never secrets.

### Logs, metrics, and artifacts

-   `GET /experiments/{id}/logs`: available logs or a log reference.
-   `GET /experiments/{id}/metrics`: base/adapted results when
    available.
-   `GET /experiments/{id}/artifacts`: artifact metadata and permitted
    download URLs.

Example metrics response before evaluation:

``` json
{
  "experiment_id": "exp_igl_001",
  "base_results": null,
  "adapted_results": null
}
```

`null` means not available, not zero. Paths such as `adapter_path` and
`metrics_path` are not necessarily public URLs. Only return download
links if a route/storage layer actually serves them.

### Compare experiments

`GET /experiments/compare?ids=exp_igl_001,exp_igl_002`

Target response:

``` json
{
  "items": [
    {
      "experiment_id": "exp_igl_001",
      "status": "completed",
      "base_results": null,
      "adapted_results": null
    }
  ]
}
```

Return actual values only. UI should show unavailable metrics as `—` or
"Not evaluated," not zero. Comparisons should show the evaluation
dataset/split so the user can judge comparability.

### Playground generation

`POST /playground/generate`

``` json
{
  "prompt": "How are you?",
  "language_code": "igl",
  "experiment_id": "exp_igl_001",
  "max_new_tokens": 64,
  "do_sample": false
}
```

Target response:

``` json
{
  "prompt": "How are you?",
  "generated_text": "Example generated text",
  "language_code": "igl",
  "model": "NCAIR1/N-ATLaS",
  "experiment_id": "exp_igl_001",
  "latency_ms": 123.4
}
```

Output and latency above are placeholders, not model results. Return
actual measured output or an error. Until inference exists, frontend
must label this as mock/demo mode. If an adapter is requested, verify
that it exists and is loadable.

## 7. Frontend guidance

Suggested screens: 1. Overview/dashboard. 2. Languages. 3. Datasets:
register, import, preview, quality. 4. Human review queue. 5. Dataset
splits. 6. Experiments: create, list, status, logs, metrics, artifacts.
7. Compare experiments. 8. Playground.

Keep HTTP calls in one service/API-client layer rather than inside UI
components. Minimal example:

``` ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
```

Expand this client to parse API errors, handle timeouts/cancellation,
and support mutations. Do not swallow errors or silently substitute mock
responses.

Every data-driven page should support loading, empty, validation-error,
server/network-error, pending/running, and success states. Keep mock
data in a dedicated layer and make mock mode explicit. Never show
invented metrics or mock generations as real N-ATLaS results. Use the
same TypeScript interfaces for mocks and live responses.

## 8. Backend implementation checklist

-   [ ] Confirm actual app entry point, port, and prefix.
-   [ ] Implement and test `GET /health`.
-   [ ] Implement language list/detail.
-   [ ] Implement dataset registration/list/detail and record
    ingestion/preview.
-   [ ] Connect quality audit to real checks.
-   [ ] Connect review queue/decisions to the review module.
-   [ ] Implement deterministic split creation/retrieval.
-   [ ] Implement experiment create/list/detail using existing Pydantic
    schemas.
-   [ ] Implement an executor before advertising experiment start as
    operational.
-   [ ] Connect training progress/failure/metrics to experiment
    lifecycle.
-   [ ] Expose artifact metadata and authorized downloads.
-   [ ] Implement inference before advertising playground as live.
-   [ ] Add route tests for success, validation failure, missing
    resources, and invalid state transitions.
-   [ ] Update this contract as endpoints become implemented.

Responsibilities: - Schemas validate request/resource shapes. - Foundry
modules implement domain behavior. - API routes translate HTTP requests
into domain calls. - Training runner executes model work and reports
state/artifacts. - Frontend depends on this API contract, not internal
Python module names.

## 9. Decisions to finalize



1.  Persistence: SQLite or another store; behavior across API restarts.
2.  Ingestion transport: JSON record batches versus multipart file
    uploads.
3.  Execution: local subprocess, queued worker, or manual Kaggle
    execution. Do not represent a Kaggle notebook as an always-on API
    worker without real integration.
4.  Dataset storage: managed copies versus local paths.
5.  Review identity and duplicate-decision behavior.
6.  Authentication/authorization expectations for the demo.
7.  Artifact delivery: authenticated download routes versus internal
    paths/object storage.
8.  Playground execution: API process, separate inference service, or
    mock mode.

## 10. Contract change policy

1.  Update this document and the matching schema/route test together.
2.  Prefer additive, backward-compatible changes during the hackathon.
3.  Do not rename/remove fields without notifying the frontend owner.
4.  Update frontend types and mock responses alongside contract changes.
5.  Treat actual route behavior and tests as evidence of implementation;
    this document is the target contract until verified.

**MVP principle:** The frontend can start immediately against this
contract and mock data. Training, evaluation, and generation must be
marked unavailable until their execution paths are implemented and
tested.
