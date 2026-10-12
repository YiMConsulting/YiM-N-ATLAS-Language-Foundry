# 🇳🇬 N-ATLAS Language Foundry

> **A Practical Infrastructure Pipeline for Extending N-ATLAS to Underserved Nigerian Languages**  
> *Submitted to the National AI Innovation Challenge (NAIC 2026)*  
> **Problem Statement 1:** Developer Infrastructure (Fine-tuning starter kits, adaptation tooling & evaluation playgrounds)  
> **Initial Laboratory Language:** **Tiv** (`tiv`) *(Transitioned from initial scoping language **Igala** `igl`)*

---

## 🌟 1. What We Are Building

**N-ATLAS Language Foundry** is developer infrastructure built around Nigeria’s sovereign foundation model, **N-ATLAS** (`NCAIR1/N-ATLaS`). 

The Foundry is **not** another foundation model. Instead, it provides a disciplined, repeatable, and verifiable workflow for developers and researchers to systematically adapt N-ATLAS to underrepresented Nigerian languages without prompt-engineering guesswork or unmonitored scripts.

For this MVP, the Foundry proves one complete, end-to-end language expansion journey using **Tiv** (`tiv`) as the active laboratory language with a verified parallel corpus (`tiv-mt560-v1`), while honoring and preserving the project's foundational journey with **Igala** (`igl`):

```
[ RAW CORPUS / INGESTION ] (MT560 English-Tiv / Community Sources)
          ↓
[ PROVENANCE & LICENSE AUDIT ] (Open Research Manifests & Checksums)
          ↓
[ CANONICAL DATASET RECORDS ] (id, input, target, language_code)
          ↓
[ AUTOMATED QUALITY AUDIT ] (empty, malformed, duplicate, language mismatch)
          ↓
[ HUMAN REVIEW PROTOCOL ] (native speaker sample audits & diacritic corrections)
          ↓
[ DETERMINISTIC DATASET SPLITS ] (Train 75% / Val 10% / Held-out Test 15% with Grouped Splitting)
          ↓
[ N-ATLAS CHAT FORMATTER & TOKENIZER BOUNDARY ] (<|eot_id|> validation)
          ↓
[ ASSISTANT-ONLY LOSS PREPROCESSING ] (prompt masked with -100)
          ↓
[ DYNAMIC BATCH COLLATION ] (pad to batch max with 128009)
          ↓
[ PARAMETER-EFFICIENT LoRA ADAPTATION ] (q_proj, v_proj on N-ATLaS 8B)
          ↓
[ HONEST BASE vs ADAPTED EVALUATION ] (BLEU, chrF, regression sanity)
          ↓
[ IMMUTABLE REPRODUCIBILITY MANIFESTS + FASTAPI + PLAYGROUND ]
```

### 1.1 Laboratory Language Evolution: From Igala to Tiv

A foundational pillar of the N-ATLaS Language Foundry is **strict data truthfulness and verifiable provenance**: we never invent synthetic benchmarks, fabricate readiness, or bypass quality gates.

* **The Initial Choice of Igala (`igl`):**
  During initial project scoping and planning, **Igala** was formally selected as the Foundry's primary laboratory language. The project team invested initial research into Igala orthography, tone markers, and domain requirements. However, during the provenance and data-readiness audit phase, accessible and legally verifiable parallel training corpora for Igala could not be secured in sufficient volume without compromising provenance integrity.
* **The Principled Transition to Tiv (`tiv`):**
  Rather than fabricating synthetic Igala records or proceeding with unverified data, the team made an intentional engineering decision to transition the active adaptation pipeline to **Tiv (`tiv`)**. Tiv offered accessible, open research parallel data through the MT560 corpus (184,099 sentence pairs) and an explicit candidate instruction set (Hypa Text-10k). This provided the rigorous, real-world data foundation needed to validate our dataset builder, deterministic grouped splitting, and training collator.
* **Preserving Igala in the Foundry:**
  Igala is **not discarded**. It remains an active, registered language in the Foundry control plane (`lang-igl-002`, status: `discovered`) with full support in the human-review orthography toolbars. As community datasets and native-speaker corpora become verified, Igala will move seamlessly through the same audited adaptation pipeline.
* **Language-Agnostic Architecture:**
  This transition directly demonstrates the Foundry’s greatest strength: the control plane, quality filters, human review tools, split algorithms, and LoRA adaptation pipelines are completely **language-agnostic** and built to expand across Nigeria's 500+ indigenous languages.

---

## 👥 2. Team Structure & Roles

| Role | Member | Primary Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Kickoff Lead + Coordination** | **Olusegun** | Project Coordination, Documentation & Submission | Branch setup, API contract, documentation, submission checklist, final coordination |
| **AI/ML + Backend Lead** | **James** | N-ATLAS Training Pipeline, Quality Audits & FastAPI Backend | Canonical data schema, quality auditor, human review schemas, N-ATLaS tokenization & collator, LoRA adaptation, evaluation engine, Dockerized API |
| **Full-Stack Frontend Lead** | **Gilbert** | Developer Dashboard & Playground UI | Next.js app, language registry, dataset audit UI, experiment status monitor, base-vs-adapted comparison playground |
| **Full-Stack Developer & Documentation** | **Joel** | Frontend/backend support and developer documentation | Supports frontend and backend implementation while improving setup guidance, README clarity, and developer onboarding documentation |
| **Team Lead & Founder (Y-SI Lab)** | **yemisolves** | Leadership Oversight and Management | Leads planning, coordinates contributors, resolves blockers, tracks milestones, and keeps language adaptation work on schedule |

---

## 📐 3. System Architecture & Tech Stack

The architecture is deliberately modular, decoupled, and dual-environment ready:

* **Foundation Model:** `NCAIR1/N-ATLaS` (Llama-3 architecture 8B sovereign foundation model, gated Hugging Face repo).
* **Adaptation & ML Stack:** PyTorch 2.x, Hugging Face `transformers`, `peft` (LoRA with target modules `q_proj`, `v_proj`), `accelerate`.
* **Backend API:** FastAPI + Pydantic v2 (enforcing strict data, quality, split, human review, and experiment schemas).
* **Local Backend Container:** Lightweight Docker runtime based on `python:3.11-slim` with SELinux `:z` volume isolation.
* **GPU Training Environment:** Dedicated acceleration runtime (Kaggle dual Tesla T4s / cloud GPUs) executing verified Foundry training modules.
* **Storage & Artifacts:** Local structured JSON manifests, deterministic SHA-256 content hashes, and saved PEFT adapter weights.
* **Frontend:** Next.js (App Router), TypeScript, modern CSS.
* **Testing & Quality:** Comprehensive `pytest` test suite with 100% boundary check coverage and zero mock-leaks.

---

## 🚀 4. Quickstart Guide

### 4.1 Prerequisites
* [Docker](https://docs.docker.com/get-docker/) & Docker Compose (recommended for local backend development)
* Python 3.11+ (if running natively without Docker)
* Node.js 18+ (for the Next.js frontend)
* Hugging Face Account with access granted to [`NCAIR1/N-ATLaS`](https://huggingface.co/NCAIR1/N-ATLaS)
* NVIDIA GPU with 16GB+ VRAM (or free Kaggle dual T4 / Colab GPU) for full model fine-tuning

---

### 4.2 Docker Setup (Recommended for Local Dev & Testing)

The backend and test suite run in a clean, reproducible container without requiring local PyTorch/CUDA installs:

```bash
# 1. Clone the repository
git clone https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry.git
cd YiM-N-ATLAS-Language-Foundry

# 2. Configure environment variables
cp .env.example .env
# Edit .env and supply your HF_TOKEN and environment settings

# 3. Build the Docker container
docker compose build

# 4. Run the full unit and integration test suite
docker compose run --rm api pytest -v

# 5. Start the FastAPI backend server
docker compose up api
```

The API server will be live at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

---

### 4.3 Native Python Setup (Optional Alternative)

If you prefer running without Docker:

```bash
# 1. Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install lightweight API dependencies
pip install -r requirements-api.txt

# 3. (Optional) Install full ML dependencies for local GPU fine-tuning
pip install -r requirements-ml.txt

# 4. Run tests
pytest -v

# 5. Start the FastAPI server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 4.4 ML Training & Notebook Workflow (GPU / Kaggle)

For GPU training and adaptation on `NCAIR1/N-ATLaS`:

1. Open Kaggle or your GPU cluster with dual Tesla T4 / A10G / P100.
2. Clone the repository or mount `foundry/` as a Python module (`PYTHONPATH=.`).
3. Set your `HF_TOKEN` secret to load the gated N-ATLaS model.
4. Run the verified smoke-test and adaptation notebooks in `notebooks/`:
   * `notebooks/00_natlas_smoke_test.ipynb`: Validates model loading, GPU distribution, and baseline tokenization.
   * `notebooks/01_natlas_formatter_smoke_test.ipynb`: Validates canonical record formatting, chat template rendering, assistant-only loss masking, and LoRA forward/backward passes on `q_proj` and `v_proj`.

---

### 4.5 Frontend Setup (Next.js Dashboard)

```bash
cd web
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the Foundry Dashboard and Model Playground.

---

## 📊 5. Experiment Storage Contract

Every adaptation run produces an immutable `Experiment` record adhering strictly to `api/schemas/experiment.py` (illustrated below for an adaptation run on the verified Tiv corpus):

```json
{
  "id": "exp-tiv-lora-v1",
  "language_code": "tiv",
  "base_model": "NCAIR1/N-ATLaS",
  "dataset_ids": ["tiv-mt560-v1"],
  "split_id": "tiv-mt560-v1-split-42",
  "adaptation": {
    "method": "lora",
    "rank": 16,
    "alpha": 32,
    "dropout": 0.05,
    "target_modules": ["q_proj", "v_proj"]
  },
  "training": {
    "per_device_batch_size": 4,
    "gradient_accumulation_steps": 4,
    "learning_rate": 0.0002,
    "epochs": 3,
    "warmup_ratio": 0.0,
    "weight_decay": 0.0,
    "seed": 42
  },
  "runtime": {
    "hardware": "Tesla T4 (Dual GPU)",
    "device": "cuda",
    "precision": "fp16"
  },
  "status": "completed",
  "base_results": {
    "loss": 6.75,
    "bleu_score": 8.2,
    "chrf_score": 24.5,
    "exact_match_ratio": 0.02,
    "inference_latency_ms": 142.0,
    "sanity_check_passed": true,
    "sample_outputs": []
  },
  "adapted_results": {
    "loss": 2.15,
    "bleu_score": 22.4,
    "chrf_score": 49.1,
    "exact_match_ratio": 0.18,
    "inference_latency_ms": 145.0,
    "sanity_check_passed": true,
    "sample_outputs": []
  },
  "artifacts": {
    "adapter_path": "experiments/exp-tiv-lora-v1/adapter",
    "config_path": "experiments/exp-tiv-lora-v1/config.json",
    "metrics_path": "experiments/exp-tiv-lora-v1/metrics.json",
    "logs_path": "experiments/exp-tiv-lora-v1/training.log"
  },
  "git_commit": "e4f8b91a",
  "created_at": "2026-10-09T18:00:00Z",
  "updated_at": "2026-10-09T18:45:00Z"
}
```

Full details and schema specifications are documented in [`docs/api_contract.md`](docs/api_contract.md).

---

## 🧪 6. Scientific Rigor & Evaluation Philosophy

We adhere to one core rule: **Never invent improvement numbers.**
* The base `N-ATLAS` model is evaluated on the exact same held-out test split prior to adapter training.
* Baseline outputs are retained side-by-side with adapted outputs to identify both gains and potential regressions.
* A small general English/Yoruba/Hausa sanity set is evaluated to ensure catastrophic forgetting did not occur.
* All training examples use assistant-only loss masking (`IGNORE_INDEX = -100`) so the model is penalized only on target generation, never prompt reproduction.

---

## 📂 7. Repository Layout

```
YiM-N-ATLAS-Language-Foundry/
├── README.md               # Main project overview and setup guide
├── approach.md             # Detailed engineering checkpoints & empirical results
├── submission_checklist.md # NAIC Day 3 verification checklist
├── Dockerfile              # Container definition for FastAPI backend
├── docker-compose.yml      # Local dev & test orchestration
├── requirements.txt        # Full unified dependency specification
├── requirements-api.txt    # Lightweight backend/test dependencies
├── requirements-ml.txt     # Dedicated PyTorch + PEFT training dependencies
├── api/                    # FastAPI service
│   ├── main.py             # Application entrypoint
│   ├── routes/             # REST API routers (languages, datasets, audits, experiments)
│   ├── schemas/            # Pydantic v2 schemas (contracts for all entities)
│   └── services/           # Backend business logic
├── foundry/                # Core Python ML & data pipeline
│   ├── datasets/           # Canonical records, builders, split logic
│   ├── quality/            # Automated filtering & quality audit engine
│   ├── review/             # Native speaker human review protocol
│   ├── registry/           # Supported Nigerian language registry
│   ├── training/           # N-ATLaS formatter, preprocessor, collator, LoRA setup
│   └── evaluation/         # BLEU, chrF, latency, and regression metrics
├── notebooks/              # Verified Kaggle/GPU smoke tests & training runs
│   ├── 00_natlas_smoke_test.ipynb
│   └── 01_natlas_formatter_smoke_test.ipynb
├── data/                   # Data storage (manifests, splits, reviewer samples)
├── experiments/            # Saved adapter weights and run artifacts
├── tests/                  # Pytest unit and integration test suite
├── web/                    # Next.js developer dashboard & playground UI
└── docs/                   # API contracts, architecture notes, and guides
```

---

## 📜 8. License & Attribution

* Base Model: [N-ATLaS](https://huggingface.co/NCAIR1/N-ATLaS) by the National Centre for Artificial Intelligence and Robotics (NCAIR), Nigeria.
* This Project is open-sourced under the MIT License for the National AI Innovation Challenge (NAIC 2026).
