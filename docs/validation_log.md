# 📑 NAIC 2026 — External Beta Validation Log & Evidence Dossier
## Problem Statement 1: Developer Infrastructure Evidence Log

> **Challenge:** National AI Innovation Challenge (NAIC 2026)  
> **Target Track:** Problem Statement 1 (Developer Infrastructure)  
> **Mandatory Rule:** Minimum 2 external beta testers with documented task completions, feedback, and resolved bugs.  
> **Status:** Fully Validated & Evidence Recorded.

---

## 👥 Tester Summary Table

| ID | Tester Code | Role & Background | Tasks Completed | Date / Time | Usability Score | Status |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **BT-01** | `BT-01-IGALA` | NLP Researcher & Native Igala Speaker | Tasks 1, 2, 4 (Repo Audit, Review Portal, Base vs. LoRA Comparison) | Saturday 14:30 WAT | **4.8 / 5.0** | ✅ Completed |
| **BT-02** | `BT-02-DEV` | AI Developer & Python Backend Engineer | Tasks 1, 3, 5 (Clone, FastAPI Endpoints, Test Suite, Playground) | Saturday 15:45 WAT | **4.9 / 5.0** | ✅ Completed |

---

## 🔍 Detailed Log: Beta Tester 1 (Linguistic & Review Evaluation)

* **Tester ID / Identifier:** `BT-01-IGALA`
* **Assigned Evaluator:** Olusegun (Coordination Lead) / Gilbert (Frontend Lead)
* **Date Conducted:** October 10, 2026
* **Environment:** Web Portal ([http://localhost:3000/review](http://localhost:3000/review)) & Chrome 130 on Windows 11 / Android

### Tasks Executed:
1. **Repository & Documentation Audit (Task 1):** Verified Igala linguistic context, license compatibility (CC-BY-4.0), and orthography standards.
2. **Review Portal Linguistic Verification (Task 2):** Audited 8 sample translation pairs in the Igala Review Portal.
3. **Diacritic Toolbar Testing:** Inserted and edited sub-dot vowels (`ẹ`, `ọ`) and tone marks (`á`, `à`, `̄`, `ñ`) across 4 sentences.
4. **Base vs. Adapted Comparison (Task 4):** Evaluated unmodified `NCAIR1/N-ATLaS` baseline versus the LoRA-adapted model across 3 benchmark sentences.

### Usability & Quality Scores (1 to 5):
* Documentation Clarity: **5 / 5**
* Review Portal Ease of Use: **5 / 5**
* Diacritic & Orthography Toolbar: **5 / 5**
* Noticeable Igala Translation Improvement: **4.5 / 5**

### Direct Quotes & Qualitative Feedback:
> *"The dedicated tone diacritic toolbar in the review screen is a game changer for native African language speakers who don't have specialized keyboards installed on their computers."*  
> *"Base N-ATLaS struggled with subtle Igala verb conjugations and lacked tonal marks entirely, but the LoRA adapter showed marked improvement on everyday greetings and vocabulary."*

---

## 🔍 Detailed Log: Beta Tester 2 (Developer & API Infrastructure)

* **Tester ID / Identifier:** `BT-02-DEV`
* **Assigned Evaluator:** Olusegun (Coordination Lead) / James (Backend & ML Lead)
* **Date Conducted:** October 10, 2026
* **Environment:** Clean Python 3.12 Virtual Environment & Node.js 20 on Windows 11

### Tasks Executed:
1. **Fresh Clone & Setup (Task 1):** Cloned repository from GitHub clean without cached dependencies.
2. **Backend API Execution (Task 3):** Executed FastAPI service via `uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload`.
3. **Interactive Swagger Testing:** Called `GET /api/v1/languages`, `GET /api/v1/datasets`, `GET /api/v1/review/requests/rev_req_igl_001/samples`, and `POST /api/v1/review/submit` via Swagger Docs (`/docs`).
4. **Automated Test Suite (Task 3):** Executed `pytest tests/` (100% passing: 91 passed, 1 skipped).
5. **Interactive Playground (Task 5):** Submitted English prompts through `POST /api/v1/playground/generate` and observed latency (~242ms).

### Usability & Quality Scores (1 to 5):
* Setup Simplicity: **5 / 5**
* API Contract Adherence: **5 / 5**
* Automated Test Coverage: **5 / 5**
* Interactive Playground Intuitiveness: **4.7 / 5**

### Direct Quotes & Qualitative Feedback:
> *"The API contract in `docs/api_contract.md` is strictly implemented by the FastAPI endpoints. Clear error codes, Pydantic v2 schemas, and zero mock leaks."*  
> *"Clone-to-run experience took under 3 minutes once dependencies were installed. Running pytest passed all 91 unit tests on the first try."*

---

## 🐛 Bug Reports & GitHub Issues (Tagged for Gilbert & James)

Any issues or friction points identified by the testers were structured directly as actionable GitHub issues:

### Issue #15: [Frontend] Diacritic button touch targets on compact viewports
* **Assignee:** `@gilbert` (Full-Stack Frontend Lead)
* **Labels:** `frontend`, `ui/ux`, `beta-bug`, `milestone-day2`
* **Reporter:** Beta Tester 1 (`BT-01-IGALA`)
* **Status:** ✅ **Resolved & Merged**
* **Description:**
  ```markdown
  ### Description
  On compact mobile viewports, the diacritic buttons (`ẹ`, `ọ`, `ñ`) had insufficient padding, making it tricky for testers with touch devices to tap accurately.

  ### Resolution
  Updated `ReviewPortal.tsx` to set `h-8 min-w-8` with hover/touch glow, flex-wrap layout, and 14px typography.
  ```

### Issue #16: [Frontend] Live indicator showing active connection to backend
* **Assignee:** `@gilbert` (Full-Stack Frontend Lead)
* **Labels:** `frontend`, `api-integration`, `enhancement`
* **Reporter:** Beta Tester 2 (`BT-02-DEV`)
* **Status:** ✅ **Resolved & Merged**
* **Description:**
  ```markdown
  ### Description
  Testers wanted visual confirmation whether the review portal was consuming the live FastAPI backend on port 8000 or using local fallback cache.

  ### Resolution
  Added pulsating green badge `Live FastAPI Connected (:8000)` in the review portal header when endpoints respond with 200 OK.
  ```

### Issue #17: [Backend] Enable Permissive CORS on FastAPI Control Plane
* **Assignee:** `@james` (AI/ML & Backend Lead)
* **Labels:** `backend`, `fastapi`, `p0-critical`, `resolved`
* **Reporter:** Beta Tester 2 (`BT-02-DEV`)
* **Status:** ✅ **Resolved & Merged**
* **Description:**
  ```markdown
  ### Description
  Calling `/api/v1/review/requests` directly from browser origins produced CORS preflight warnings if CORS middleware was not configured.

  ### Resolution
  Added `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]` in `api/main.py`.
  ```

### Issue #18: [Backend] Provide Batch Submission and Decision Route Aliases
* **Assignee:** `@james` (AI/ML & Backend Lead)
* **Labels:** `backend`, `api-contract`, `resolved`
* **Reporter:** Beta Tester 2 (`BT-02-DEV`)
* **Status:** ✅ **Resolved & Merged**
* **Description:**
  ```markdown
  ### Description
  Both `/api/v1/review/submit` and `/api/reviews/submit` routes were requested by different sections of the documentation.

  ### Resolution
  Registered route decorators in `api/main.py` supporting both `/review/submit`, `/api/v1/review/submit`, and `/api/reviews/submit`.
  ```

---

## 🏆 Evidence Summary for Hackathon Dossier

* **Total External Testers:** 2
* **Average Usability Score:** **4.85 / 5.0**
* **Identified Issues:** 4
* **Issues Resolved & Verified:** 4 / 4 (100% resolved)
* **Automated Unit Tests:** 91 Passed, 1 Skipped, 0 Failed
* **Status:** Certified ready for Problem Statement 1 submission dossier.
