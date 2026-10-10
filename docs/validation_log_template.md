# 📑 NAIC 2026 — External Beta Validation Log
## Problem Statement 1: Developer Infrastructure Evidence Log

> **Challenge:** National AI Innovation Challenge (NAIC 2026)  
> **Target Track:** Problem Statement 1 (Developer Infrastructure)  
> **Mandatory Rule:** Minimum 2 external beta testers with documented task completions, feedback, and resolved bugs.

---

## 👥 Tester Summary Table

| ID | Tester Name / Code | Role & Background | Tasks Completed | Date / Time | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **BT-01** | `BT-01-IGALA` | NLP Researcher / Native Igala Speaker | Tasks 1, 2, 4 (Data Audit, Portal, Comparison) | Saturday 14:30 WAT | Completed (4.8/5.0) |
| **BT-02** | `BT-02-DEV` | AI Developer / Python Backend Engineer | Tasks 1, 3, 5 (Clone, API, Playground) | Saturday 15:45 WAT | Completed (4.9/5.0) |

---

## 🔍 Detailed Log: Beta Tester 1 (Linguistic & Review Evaluation)

* **Tester ID / Identifier:** `BT-01-IGALA`
* **Assigned Evaluator:** Olusegun / Gilbert
* **Date Conducted:** October 10, 2026
* **Environment:** Web Portal ([http://localhost:3000/review](http://localhost:3000/review)) & Standalone Review UI

### Tasks Executed:
1. Audited 8 sample translation pairs in the Igala Review Portal.
2. Tested diacritic insertion for characters: `ẹ`, `ọ`, `ñ`, and high tone `á`.
3. Evaluated Base N-ATLAS vs. LoRA-adapted Igala generation on 3 benchmark sentences.

### Observations & Feedback:
* *"The dedicated tone diacritic toolbar in the review screen is a game changer for native African language speakers who don't have specialized keyboards."*
* *"Base N-ATLaS struggled with subtle Igala verb conjugations, but the LoRA adapter showed marked improvement on everyday greetings and vocabulary."*

### Issues Logged & Resolution:
* **Issue #15 (Gilbert):** Button font size and padding on diacritic toolbar on mobile screens.  
  * **Fix Applied:** Increased touch target size to `h-8 min-w-8` with hover glow and flex wrap.
* **Issue #16 (Gilbert):** Missing explicit confirmation indicator showing live connection to backend.  
  * **Fix Applied:** Added pulsating green badge `Live FastAPI Connected (:8000)` in header.

---

## 🔍 Detailed Log: Beta Tester 2 (Developer & API Infrastructure)

* **Tester ID / Identifier:** `BT-02-DEV`
* **Assigned Evaluator:** Olusegun / James
* **Date Conducted:** October 10, 2026
* **Environment:** Clean Python Virtual Environment (Windows 11)

### Tasks Executed:
1. Cloned repo from GitHub clean without cached dependencies.
2. Executed FastAPI service via `uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload`.
3. Called `GET /api/v1/languages` and `POST /api/v1/review/submit` via Swagger Docs (`/docs`).
4. Ran automated test suite (`pytest tests/`) — 91 passed.

### Observations & Feedback:
* *"The API contract in `docs/api_contract.md` is strictly followed by the FastAPI schemas. Clear error codes and schema validation."*
* *"Clone-to-run experience took under 3 minutes once dependencies were installed."*

### Issues Logged & Resolution:
* **Issue #17 (James):** Missing CORS headers for browser requests from external origins.  
  * **Fix Applied:** Configured `CORSMiddleware` in `api/main.py`.
* **Issue #18 (James):** Route alias required for both `/api/v1/review/submit` and `/api/reviews/submit`.  
  * **Fix Applied:** Added dual route decorators to `api/main.py`.

---

## 🏆 Summary of Evidence for Hackathon Submission

* **Total External Testers:** 2
* **Average Usability Score:** 4.85 / 5.0
* **Identified Bugs:** 4
* **Bugs Resolved & Pushed:** 4 / 4 (100% resolved before code freeze)
* **Status:** Verified and ready for final submission dossier.
