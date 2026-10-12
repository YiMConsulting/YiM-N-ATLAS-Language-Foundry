# System Capabilities and Limitations

This document provides an engineering audit of the N-ATLaS Language Foundry. It clearly delineates operational capabilities from prototype implementations, controlled laboratory workflows, and future architectural targets.

---

## 1. Component Status Matrix

Every major platform subsystem is categorized below according to its verified operational readiness:

| Subsystem / Feature | Current Status | Verification Evidence | Operational Scope & Caveats |
| :--- | :--- | :--- | :--- |
| **Language Discovery & Catalog** | **Implemented and tested** | Unit tests in `tests/test_api_truthfulness.py`; live on Render. | Fully operational in-memory registry containing linguistic taxonomy, speaker metrics, and pilot status for Tiv (`tiv`). |
| **Dataset Metadata & Provenance** | **Implemented and tested** | Manifest validation tests; API route `GET /api/v1/datasets`. | Complete manifest for `tiv-mt560-v1` (184,099 clean records) with pinned source commit and licensing attribution details. |
| **Dataset Partitioning (Splits)** | **Implemented and tested** | Deterministic split tests in `tests/test_dataset_split_schema.py`. | Seed 42 `grouped_by_input` algorithm verified with 0% English input leakage across train (138,074), val (18,410), and test (27,615). |
| **Human-Review Evidence Loader** | **Implemented and tested** | `tests/test_human_review_evidence.py`; route `GET /api/v1/datasets/{dataset_id}/review-evidence`. | Sanitized extraction of 51 empirical annotations from reviewer `REV_04` (4.76/5 accuracy, 100% completeness/naturalness/format). |
| **Durable Review Decision Storage** | **Implemented with limited evidence** | Route `POST /api/v1/review/submit`; test suite validation. | Functional in development mode, but stored in process memory. **Lacks persistent database backing** across container restarts. |
| **Experiment Registry** | **Implemented and tested** | Schema tests in `tests/test_experiments_schema.py`. | Production registry is cleanly initialized and returns empty list `[]` to prevent fake or unverified runs from polluting results. |
| **Training Pipeline Runner** | **Available for local / controlled testing** | `foundry/training/lora_trainer.py`, `tests/test_lora_smoke.py`. | Verified via 4-step CPU/GPU smoke test. Full multi-epoch training pipeline implemented but requires dedicated GPU compute. |
| **Evaluation Harness** | **Implemented and tested** | Unit tests in `tests/test_evaluation_harness.py`. | Standardized evaluation harness with explicit prompt template `Translate the following English text into Tiv:\n{text}` and pinned base revision. |
| **Comparative Evaluation Results** | **Planned or awaiting verification** | Diagnostic smoke run audit in `05-experiment-and-evaluation.md`. | Earlier diagnostic smoke test used an uninstructed prompt; full-scale benchmark re-evaluation on the test split is queued for GPU resources. |
| **Tiv Adapter Artifacts** | **Available for local / controlled testing** | LoRA weights and configs produced in Google Colab / cloud run. | Artifact weights exist in external cloud storage; verified format compatibility with PEFT/Hugging Face transformers. |
| **Live Interactive Inference** | **Planned or awaiting verification** | Route `POST /api/v1/playground/generate`. | Returns intentional `503 Service Unavailable` on public demo instance. Serving 8B LLM weights requires dedicated GPU instance. |
| **Public API Security & Controls** | **Implemented and tested** | `tests/test_production_readiness.py`, read-only demo guard. | Read-only demo mode (`READ_ONLY_MODE=true`) blocks write endpoints on public instance; CORS configured. Authentication/OAuth is planned. |
| **Deployment Reliability** | **Implemented and tested** | Render production container, `GET /health` (`/api/v1/health`, `/healthz`), dynamic port binding. | Web service running stably on Render container platform. Cold starts may take 30–50 seconds on free/starter tiers. |

---

## 2. Detailed Technical Capabilities

### A. Deterministic Data Governance
* **Input-Grouped Splitting**: Unlike random row-level partitioning, the Foundry groups all target translations sharing the same English input phrase into the same partition. This prevents data contamination where a model memorizes a target during training and is evaluated on the exact same input.
* **Integrity Validation**: Pinned commit hashes (`252074f0d4c82c0005099b5eb4043fddc43026f1` for MT560) guarantee complete reproducibility from raw sources to processed partitions.
* **Clean Data Sanitization**: The builder prunes exact duplicate pairs while maintaining record trace IDs.

### B. Human-Centric Review Evidence
* **Empirical Annotation Schema**: Structured multi-dimensional scoring capturing translation accuracy (1–5), meaning completeness (boolean), naturalness (1–5), and formatting compliance (boolean).
* **Qualitative Issue Tagging**: Granular flags for loanwords, syntactic word ordering, citation discrepancies, and punctuation variations.
* **Privacy-Preserving Sanitization**: Raw reviewer names, private workbooks, and confidential notes are stripped prior to API exposure.

### C. Standardized Adapter Training & Evaluation Harness
* **Memory-Efficient LoRA**: Low-Rank Adaptation targets attention query/value projections (`q_proj`, `v_proj`), enabling fine-tuning of N-ATLaS (8B) on consumer-grade Tesla T4 (16GB) hardware.
* **Assistant-Only Loss Masking**: Loss computation is restricted to Tiv assistant tokens via cross-entropy label masking (`-100`), preventing gradient updates on English user instructions.
* **Prompt Isolation**: The evaluation harness strictly enforces the `Translate the following English text into Tiv:\n{text}` prompt template, preventing reference leakage.

---

## 3. Current Technical Limitations & Boundaries

### Limitation 1: Training Smoke Test vs. Translation Quality
* **The Reality**: The passing 4-step training run (`tiv-lora-smoke-v1`) verified that tensor operations, token collation, gradient backward passes, and adapter weight serialization execute without crashing.
* **The Boundary**: A smoke test of 4 optimizer steps does **not** train the model or impart linguistic fluency. It establishes pipeline validity, not linguistic performance.

### Limitation 2: Corrected Harness vs. Completed Benchmark
* **The Reality**: The corrected evaluation harness in `foundry/evaluation/harness.py` resolves the prompt flaw identified in the initial smoke run and is covered by automated unit tests.
* **The Boundary**: Executing a comprehensive, statistically significant evaluation of 1,000+ test samples requires continuous GPU compute. A live comparative benchmark run has not yet been conducted; claims of superior translation quality are explicitly withheld until that run completes.

### Limitation 3: Model Artifact vs. Live Serving Service
* **The Reality**: Adapter weights and tokenizer configurations can be saved locally or in cloud object storage (e.g., Google Drive or Hugging Face Hub).
* **The Boundary**: An adapter file is not a hosted inference microservice. Serving an 8B model with low latency requires high-VRAM GPU infrastructure (e.g., vLLM or TGI on an NVIDIA A10G or A100), which exceeds the resource allocation of the public Render web tier.

### Limitation 4: In-Memory Storage vs. Persistent Database
* **The Reality**: The review submission endpoint (`POST /api/review/decision`) allows testers to submit quality reviews during active API sessions.
* **The Boundary**: Review decisions submitted via this endpoint are stored in container process memory. When the Render instance restarts, scales down, or redeploys, these decisions are reset. Persistent relational storage (PostgreSQL/SQLite) is on the architectural roadmap.

### Limitation 5: Public Read-Only Demo Guard
* **The Reality**: To protect the integrity of the live public demo and prevent denial-of-service or database poisoning, write endpoints are guarded by `FOUNDRY_READ_ONLY_DEMO=true`.
* **The Boundary**: Testers accessing the public instance can inspect all preloaded metadata and review evidence, but cannot persist new languages, datasets, or reviews without running the API locally in write-enabled mode.

---

## 4. Engineering Trade-Offs & Design Rationale

1. **Lightweight Web Control Plane vs. Monolithic GPU Node**:
   * *Decision*: Separate the metadata/governance API from the GPU training cluster.
   * *Rationale*: Allows researchers and developers to audit datasets, evaluate splits, and inspect review evidence on low-cost, high-availability web tiers without paying continuous GPU hosting rates.
2. **Deterministic Splitting vs. Fast Random Splitting**:
   * *Decision*: Implement grouped English input hash partitioning.
   * *Rationale*: Prevents metric inflation caused by test data leakage, ensuring benchmark fidelity over convenience.
3. **Empty Experiment Registry vs. Prepopulated Mock Runs**:
   * *Decision*: Retain an empty production experiment registry rather than display simulated benchmark results.
   * *Rationale*: Adheres to strict engineering integrity and transparency, ensuring hackathon judges evaluate verified systems rather than marketing mockups.
