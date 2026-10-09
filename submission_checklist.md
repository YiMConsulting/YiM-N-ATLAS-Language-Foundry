# 📋 National AI Innovation Challenge (NAIC 2026) — Submission Checklist

> **Project Name:** N-ATLAS Language Foundry  
> **Problem Statement 1:** Developer Infrastructure  
> **Final Submission Deadline:** **12 October 2026 at 11:59 PM WAT**  
> **Day 3 Rule:** Zero new engineering; strict verification, documentation, and asset compilation.

---

## 📌 Section 1: Mandatory NAIC Deliverables

| Status | Requirement Item | Verification Criteria & Artifact Link | Owner |
| :---: | :--- | :--- | :--- |
| [ ] | **Working Technical Artefact** | Clean, public/evaluator Git repository containing functional pipeline, FastAPI service, and Next.js frontend. | All |
| [ ] | **Genuine N-ATLAS Integration** | Clear code, logs, and screenshots demonstrating `NCAIR1/N-ATLaS` loading, tokenizer processing, and LoRA adaptation. | James (AI/ML & Backend) |
| [ ] | **Real-World Beta Validation (PS1)** | At least **two (2) external beta testers** documented with names/roles, testing tasks, qualitative feedback, and validation logs. | James |
| [ ] | **3–5 Minute Video Demo** | High-definition screen recording showing problem statement, Igala pipeline, adaptation run, base vs adapted comparison, and playground. | Gilbert & 3 |
| [ ] | **Technical Documentation** | Comprehensive README, `approach.md`, architecture diagrams, API contracts, reproducibility guide. | James |
| [ ] | **Team Profile** | Full names, roles, contact info, affiliations, and clear breakdown of individual contributions for all 3 members. | Olusegun |
| [ ] | **Track Endorsement / Registration** | Track A institutional endorsement letter OR Track B CAC incorporation / valid government ID. | Olusegun |
| [ ] | **Declaration of Originality** | Formal statement affirming work was created for NAIC 2026 and not submitted or awarded elsewhere. | Olusegun |

---

## 🧪 Section 2: Technical & Experiment Reproducibility

- [ ] **Clean Environment Test:** Successfully cloned repository into a blank Python environment and executed `pytest` and smoke inference without errors.
- [ ] **Section 11 Metadata Complete:** Every experiment record contains:
  - `experiment_id`, `language`, `base_model`
  - Exact `dataset_ids`, licenses, and SHA256 checksums
  - Hyperparameters (`rank`, `alpha`, `learning_rate`, `epochs`, `seed`)
  - Hardware specifications used (e.g., Kaggle Tesla P100)
  - Baseline vs Adapted metrics (Loss, BLEU, chrF, sanity check status)
  - Local/HF adapter weights path and Git commit SHA.
- [ ] **No Committed Model Weights / Secrets:** Verified `.gitignore` blocks `.safetensors`, `.bin`, `.env`, and raw bulky datasets.
- [ ] **Automated Tests Passing:** `tests/test_quality.py`, `tests/test_splits.py`, and `tests/test_api.py` all return green.

---

## 👥 Section 3: PS1 External Beta Testers Log

*Problem Statement 1 requires at least 2 external beta testers:*

### Beta Tester 1:
* **Name / Anonymized Role:** _______________________________________
* **Affiliation / Background:** (e.g., NLP Researcher / Linguistics Student / Igala Speaker)
* **Assigned Evaluation Task:** Ingest a custom Igala text snippet, inspect quality audit, review translation outputs.
* **Key Feedback:** _______________________________________
* **Issue Raised & Resolved:** _______________________________________

### Beta Tester 2:
* **Name / Anonymized Role:** _______________________________________
* **Affiliation / Background:** (e.g., Python Backend / ML Developer)
* **Assigned Evaluation Task:** Clone repo, execute CLI baseline evaluation, call FastAPI endpoint.
* **Key Feedback:** _______________________________________
* **Issue Raised & Resolved:** _______________________________________

---

## 🎥 Section 4: Video Script Checklist (3 to 5 Minutes)

- [ ] **0:00 – 0:30:** Problem definition (Challenges in adapting N-ATLAS to Nigeria's 500+ indigenous languages).
- [ ] **0:30 – 1:00:** Selecting Igala, dataset registration, and provenance check.
- [ ] **1:00 – 1:30:** Automated quality audit (deduplication, token length) & human review UI.
- [ ] **1:30 – 2:15:** Executing N-ATLAS adaptation (LoRA training & loss convergence).
- [ ] **2:15 – 3:00:** Base vs Adapted evaluation showing genuine Igala translation improvement.
- [ ] **3:00 – 3:40:** Section 11 reproducibility record & adapter export.
- [ ] **3:40 – 4:20:** Live interactive prompt playground.
- [ ] **4:20 – 5:00:** Extensibility to other Nigerian languages & concluding vision.

---

## 🚀 Section 5: Final Submission Protocol (Day 3)

1. [ ] Freeze `main` branch code 6 hours before deadline.
2. [ ] Upload final demo video to YouTube (unlisted) or Google Drive (public view permissions).
3. [ ] Verify all URLs in README and submission form are accessible in an incognito window.
4. [ ] Submit form on official NAIC portal well ahead of 11:59 PM WAT on October 12, 2026.
