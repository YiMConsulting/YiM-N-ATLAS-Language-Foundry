# Hackathon Submission & Validation Report

**National Artificial Intelligence Challenge (NAIC)**  
**Problem Statement Focus**: Developer Infrastructure (PS1) *(Subject to confirmation against team's final track registration)*  
**Repository**: [YiMConsulting/YiM-N-ATLAS-Language-Foundry](https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry)  
**Current Working Branch**: `feat/james-ml-pipeline`  
**Live Public Endpoint**: [https://yim-n-atlas-language-foundry.onrender.com](https://yim-n-atlas-language-foundry.onrender.com)  

---

## 1. Challenge Alignment: Developer Infrastructure (PS1)

General-purpose artificial intelligence models consistently fail low-resource languages because developers lack the specialized tooling, curated data pipelines, and validation frameworks necessary to adapt foundation models responsibly.

The **N-ATLaS Language Foundry** addresses this structural bottleneck by delivering open, reusable developer infrastructure designed specifically for African languages, centered around Nigeria's sovereign foundation model **NCAIR1/N-ATLaS**:

| Hackathon Evaluation Pillar | N-ATLaS Language Foundry Implementation |
| :--- | :--- |
| **Problem Value & Innovation** | Solves the high barrier to entry in fine-tuning 8B models for 500+ Nigerian languages by providing standardized data contracts, deterministic splitting, and PEFT/LoRA recipes. |
| **Working Software Artifact** | Deployed FastAPI control plane on Render, reproducible Docker containerization, Next.js web application, and verified PyTorch/PEFT training scripts. |
| **Engineering Rigor & Data Integrity** | Input-grouped hash partitioning with 0% data leakage; commit-pinned dataset provenance; assistant-only loss masking; standardized prompt templates. |
| **Human-in-the-Loop Validation** | First-class human review ingestion schema capturing empirical multi-dimensional ratings (accuracy, completeness, naturalness, format) from native speakers. |
| **System Truthfulness** | Refusal to use synthetic or mocked results; transparent handling of unavailable GPU inference (`503 Service Unavailable`); clean production experiment registry. |

---

## 2. Working Artifact & Deliverables Checklist

The table below summarizes the core deliverables required for evaluation:

| Deliverable | Status | Location / Reference | Verification Evidence |
| :--- | :---: | :--- | :--- |
| **Live Deployed API** | **Verified** | [yim-n-atlas-language-foundry.onrender.com](https://yim-n-atlas-language-foundry.onrender.com) | Live health check at `/health` (`/api/v1/health`, `/healthz`), OpenAPI docs at `/docs`. |
| **Source Code Repository** | **Verified** | `YiMConsulting/YiM-N-ATLAS-Language-Foundry` | Branch: `feat/james-ml-pipeline`. Clean Git history. |
| **Comprehensive Documentation** | **Verified** | `docs-main/` | 13 detailed markdown and diagram specifications. |
| **Automated Test Suite** | **Verified** | `tests/` | 125 passed tests in Docker environment; 0 failures. |
| **Dataset Splitting Pipeline** | **Verified** | `foundry/datasets/builder.py` | 184,099 records partitioned into train/val/test with 0% overlap. |
| **Human Review Evidence** | **Verified** | `data/processed/review_evidence_tiv_mt560.json` | 51 records annotated by native reviewer `REV_04`. |
| **Standardized Eval Harness** | **Verified** | `foundry/evaluation/harness.py` | Prompt template: `Translate the following English text into Tiv:\n{text}`. |
| **Demonstration Video** | *Pending* | `[ACTION REQUIRED: Insert YouTube/Loom Link]` | Video walkthrough of live API, dataset audit, and code walkthrough. |
| **Team Profiles** | *Pending* | `[ACTION REQUIRED: Complete Team Section below]` | Contributor roles, affiliations, and contact details. |
| **External Beta Feedback** | *Pending* | `[ACTION REQUIRED: Complete Section 4 below]` | Minimum 2 external tester reports required by NAIC challenge rules. |

---

## 3. Team Information & Submission Metadata

> [!IMPORTANT]
> **Action Required**: The team must complete the bracketed placeholders below prior to final challenge submission.

* **Project Name**: N-ATLaS Language Foundry
* **Lead Organization**: YiM Consulting / Community Collaborators
* **Submission Track**: Problem Statement 1 — Developer Infrastructure
* **Product Pitch / Video Walkthrough URL**: `[INSERT_DEMO_VIDEO_URL_HERE]` (e.g., YouTube, Loom, or Google Drive link)
* **Team Members**:
  1. **[Name / Handle]** — Lead AI Engineer & ML Pipeline Architect (`[Contact / GitHub]`)
  2. **[Name / Handle]** — Backend & Infrastructure Engineer (`[Contact / GitHub]`)
  3. **[Name / Handle]** — Frontend & UI/UX Developer (`[Contact / GitHub]`)
  4. **[Name / Handle]** — Computational Linguist / Language Lead (`[Contact / GitHub]`)

---

## 4. Beta Testing Validation Section

The challenge criteria require external validation from users outside the core development team. 

> [!NOTE]
> **Important Distinction**: In accordance with scientific rigor, dataset translation reviewers (such as native speaker `REV_04` who annotated sentence pairs in the workbook) evaluate **linguistic data quality**, not the **software product**. They must not be counted as software beta testers unless they also independently tested the deployed application and provided product feedback.

### Beta Tester 1: External Developer / ML Practitioner

* **Tester Name / Affiliation**: `[INSERT TESTER 1 NAME / ORGANIZATION]`
* **Role**: `[e.g., Machine Learning Engineer, Nigerian AI Community]`
* **Testing Date**: `[YYYY-MM-DD]`
* **Platform Tested**: `[Hosted Render API / Local Docker / OpenAPI Docs]`
* **Workflows Executed**:
  - Tested `GET /health` and `GET /api/v1/languages` for metadata clarity.
  - Inspected dataset split `tiv-mt560-v1-split-42` via API.
  - Executed playground inference request and verified clear HTTP 503 error handling.
* **Tester Feedback**:
  > *"`[INSERT TESTER 1 QUOTE OR SUMMARY OF FEEDBACK]"`*
* **Impact on Development**:
  * `[Explain what was changed or logged based on this feedback, e.g., improved error message documentation or API parameter clarification]`

---

### Beta Tester 2: Computational Linguist / Researcher

* **Tester Name / Affiliation**: `[INSERT TESTER 2 NAME / ORGANIZATION]`
* **Role**: `[e.g., African NLP Researcher / Language Technology Advocate]`
* **Testing Date**: `[YYYY-MM-DD]`
* **Platform Tested**: `[Hosted Render Web UI / Review Evidence API]`
* **Workflows Executed**:
  - Audited human-review evidence endpoint `GET /api/v1/datasets/tiv-mt560-v1/review-evidence`.
  - Reviewed qualitative issue categories (loanwords, word order, citation shifts).
  - Evaluated split strategy to confirm prevention of target memorization.
* **Tester Feedback**:
  > *"`[INSERT TESTER 2 QUOTE OR SUMMARY OF FEEDBACK]"`*
* **Impact on Development**:
  * `[Explain how this feedback influenced the platform roadmap or human-review annotation guidelines]`

---

## 5. Submission Readiness Checklist

Use this actionable checklist before final submission on the hackathon portal:

- [x] **Code Base Cleanliness**: All mock data deleted; real APIs integrated; no hardcoded dummy values.
- [x] **Container Deployment**: Dockerfile uses dynamic `$PORT` binding; tested on Render container runner.
- [x] **Data Hygiene**: Large JSONL corpora, raw `.xlsx` workbooks, and model checkpoint weights excluded via `.gitignore` and `.dockerignore`.
- [x] **Test Verification**: 125 backend tests passing with 0 failures; frontend TypeScript compiles without errors.
- [x] **Documentation Package**: Complete 13-document package generated in `docs-main/`.
- [ ] **Demo Video Recorded**: 3–5 minute video demonstration recorded and uploaded.
- [ ] **Team Profiles Added**: Team names, GitHub usernames, and emails populated in Section 3.
- [ ] **Beta Feedback Documented**: At least 2 external tester reports recorded in Section 4.
- [ ] **Final Submission Form**: Links to Render deployment, GitHub repository, and video submitted to NAIC portal.
