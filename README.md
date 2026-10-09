# 🇳🇬 N-ATLAS Language Foundry

> **A Practical Infrastructure Pipeline for Extending N-ATLAS to Underserved Nigerian Languages**  
> *Submitted to the National AI Innovation Challenge (NAIC 2026)*  
> **Problem Statement 1:** Developer Infrastructure (Fine-tuning starter kits, adaptation tooling & evaluation playgrounds)  
> **Initial Laboratory Language:** **Igala** (`igl`)

---

## 🌟 1. What We Are Building

**N-ATLAS Language Foundry** is developer infrastructure built around Nigeria’s sovereign foundation model, **N-ATLAS** (`NCAIR1/N-ATLaS`). 

The Foundry is **not** another foundation model. Instead, it provides a disciplined, repeatable, and verifiable workflow for developers and researchers to systematically adapt N-ATLAS to underrepresented Nigerian languages without prompt-engineering guesswork or unmonitored scripts.

For this MVP, the Foundry proves one complete, end-to-end language expansion journey using **Igala** as the primary laboratory language:

```
[ IGALA DATA ]
      ↓
[ PROVENANCE & LICENSE AUDIT ]
      ↓
[ AUTOMATED QUALITY CHECKS ] (deduplication, token sanity, length)
      ↓
[ HUMAN REVIEW PIPELINE ] (native speaker verification)
      ↓
[ TRAIN / VAL / TEST SPLITS ] (deterministic & held-out)
      ↓
[ N-ATLAS ADAPTATION ] (LoRA / QLoRA parameter-efficient fine-tuning)
      ↓
[ HONEST BASE vs ADAPTED EVAL ] (BLEU, chrF, regression sanity, human score)
      ↓
[ REPRODUCIBILITY MANIFEST + API + PLAYGROUND ]
```

---

## 👥 2. Team Structure & Roles

| Role | Member | Primary Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Kickoff Lead + Coordination** | **Olusegun** | Project Kickoff, GitHub Setup, Docs & Submission | Branch setup, API contract, GitHub issues board, README, approach.md, submission checklist, final submission coordination |
| **AI/ML + Backend Lead** | **James** | N-ATLAS Integration, Training Pipeline & API | N-ATLAS model loading, data ingestion & quality audit, LoRA/QLoRA training, evaluation engine (BLEU, chrF), FastAPI endpoints |
| **Full-Stack Frontend Lead** | **Gilbert** | Dashboard & Playground UI | Next.js app, language registry page, dataset audit UI, experiment status monitor, base-vs-adapted comparison, interactive playground |

---

## 📐 3. System Architecture & Tech Stack

The architecture is deliberately lean, self-contained, and free of unnecessary cloud dependencies to guarantee hackathon reproducibility:

* **Foundation Model:** `NCAIR1/N-ATLaS` (Gated Hugging Face model repository).
* **Adaptation Engine:** PyTorch 2.x, Hugging Face `transformers`, `peft` (LoRA/QLoRA), `bitsandbytes` (4-bit quantization fallback).
* **Backend API:** FastAPI + Pydantic v2 (enforcing the strict Section 11 experiment schema).
* **Storage:** SQLite (zero-cost, embedded local database) + JSON manifests.
* **Frontend:** Next.js (App Router), TypeScript, Vanilla CSS / Tailwind.
* **Testing & Quality:** `pytest`, deterministic hashing, and language token validation.

---

## 🚀 4. Quickstart Guide

### Prerequisites
* Python 3.10+ (Python 3.11 recommended)
* Node.js 18+ (for the Next.js frontend)
* Hugging Face Account with access granted to `NCAIR1/N-ATLaS`
* NVIDIA GPU with 16GB+ VRAM (or free Kaggle P100 / Colab T4)

### 4.1 Backend Setup (FastAPI & Foundry Pipeline)

```bash
# 1. Clone the repository
git clone https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry.git
cd YiM-N-ATLAS-Language-Foundry

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Open .env and insert your HF_TOKEN

# 5. Run Backend Server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### 4.2 Frontend Setup (Next.js Dashboard)

```bash
cd web
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the Foundry Dashboard and Model Playground.

---

## 📊 5. Experiment Storage Contract (Section 11)

Every training run automatically generates an immutable record adhering to the agreed API schema (`api/schemas/experiment.py`):

```json
{
  "experiment_id": "igala-lora-v1",
  "language": "Igala",
  "base_model": "NCAIR1/N-ATLaS",
  "dataset_ids": ["voiceafrica-igala-v1"],
  "dataset_licenses": [{"source_name": "VoiceAfrica", "license_type": "CC-BY-4.0"}],
  "data_version": "sha256:7b1e4a3d6f...",
  "train_size": 450,
  "validation_size": 50,
  "test_size": 100,
  "hyperparameters": {
    "adapter_method": "LoRA",
    "rank": 16,
    "alpha": 32,
    "dropout": 0.05,
    "learning_rate": 0.0002,
    "epochs": 3,
    "seed": 42
  },
  "hardware": "Kaggle NVIDIA Tesla P100 16GB",
  "base_results": {"loss": 3.84, "bleu_score": 8.2, "chrf_score": 24.5},
  "adapted_results": {"loss": 2.15, "bleu_score": 21.4, "chrf_score": 48.9},
  "adapter_path": "./experiments/igala-v1/adapter",
  "git_commit": "e4f8b91a",
  "created_at": "2026-10-08T15:30:00Z"
}
```

Full details are documented in [`docs/api_contract.md`](file:///c:/Users/USER/Downloads/YiM%20N-Atlas%20Language%20Foundry/docs/api_contract.md).

---

## 🧪 6. Scientific Rigor & Evaluation Philosophy

We adhere to one core rule: **Never invent improvement numbers.**
* The base `N-ATLAS` model is evaluated on the exact same held-out test split prior to adapter training.
* Baseline outputs are retained side-by-side with adapted outputs to identify both gains and potential regressions.
* A small general English/Yoruba sanity set is evaluated to ensure catastrophic forgetting did not occur.

---

## 📂 7. Repository Layout

```
n-atlas-language-foundry/
├── README.md               # Main project overview and guide
├── approach.md             # Detailed engineering and scientific rationale
├── submission_checklist.md # NAIC Day 3 verification checklist
├── .env.example            # Environment variables template
├── requirements.txt        # Pinned Python dependencies
├── configs/                # LoRA & evaluation YAML configs
├── data/                   # Data directory (raw gitignored; manifests tracked)
│   ├── manifests/          # Hashed provenance manifests
│   └── samples/            # Verified reviewer samples
├── foundry/                # Core Python ML pipeline modules
│   ├── registry/           # Language registry
│   ├── ingestion/          # Corpus ingestion & provenance
│   ├── quality/            # Automated filtering & deduplication
│   ├── review/             # Native speaker review handling
│   ├── datasets/           # Split generation
│   ├── training/           # LoRA/QLoRA fine-tuning logic
│   └── evaluation/         # Comparative metrics engine
├── api/                    # FastAPI service
│   ├── main.py             # App entrypoint
│   ├── routes/             # REST API routers
│   └── schemas/            # Pydantic v2 schemas (Section 11)
├── web/                    # Next.js Full-stack frontend
├── experiments/            # Saved adapter weights and run artifacts
├── tests/                  # Unit and integration test suite
└── docs/                   # Full documentation & contracts
```

---

## 📜 8. License & Attribution

* Base Model: [N-ATLaS](https://huggingface.co/NCAIR1/N-ATLaS) by the National Centre for Artificial Intelligence and Robotics (NCAIR), Nigeria.
* This Project is open-sourced under the MIT License for the National AI Innovation Challenge 2026.
