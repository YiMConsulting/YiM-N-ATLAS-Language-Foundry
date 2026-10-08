# 🧪 N-ATLAS Language Foundry — External Beta Tester Pack
## Problem Statement 1 (Developer Infrastructure) Beta Evaluation

> **Participant Notice:** Thank you for participating in the external beta validation for the **N-ATLAS Language Foundry** (National AI Innovation Challenge 2026). Your feedback directly validates the practical utility and robustness of this infrastructure for extending N-ATLaS to Nigeria's underserved languages.

---

## 📋 Evaluation Overview

* **Laboratory Language:** Igala (`igl`)
* **Base Model:** `NCAIR1/N-ATLaS` (8B BF16)
* **Goal:** Test the developer tools, data audit pipeline, human review portal, and LoRA adapter generation for real-world usability and linguistic validity.
* **Testing Duration:** ~25–30 minutes per tester.

---

## 👤 Tester Profile & Assignment

### Tester 1: NLP / Linguistic Evaluator (Igala Specialist or NLP Researcher)
* **Focus:** Data quality audit, Igala orthography & tone diacritics, review portal usability, and baseline vs. adapted translation accuracy.
* **Assigned Tasks:** Tasks 1, 2, and 4 below.

### Tester 2: AI Developer / Software Engineer
* **Focus:** Repository clone, environment reproducibility, FastAPI endpoint consumption, and CLI execution.
* **Assigned Tasks:** Tasks 1, 3, and 5 below.

---

## 🛠️ Step-by-Step Testing Tasks

### Task 1: Environment & Repository First Impressions (5 mins)
1. Visit the repository: [https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry](https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry)
2. Review the `README.md` and `docs/api_contract.md`.
3. **Question to Answer:** Is the setup process, architecture, and licensing clearly explained?

---

### Task 2: Linguistic Audit & Review Portal Evaluation (10 mins)
1. Open the **Igala Review Portal** (in web dashboard or `web/review_preview.html`).
2. Inspect the bilingual card pairs (English source ↔ Igala candidate).
3. Evaluate 3–5 samples:
   - Try the **Approved**, **Needs Correction**, and **Rejected** buttons.
   - Use the **Igala Diacritic Toolbar** (`ẹ`, `ọ`, `ñ`, `á`, `à`, etc.) to tweak a sentence.
   - Verify that the progress bar and approval percentage update live.
4. Click **"Submit Audit Batch"** and inspect the JSON payload.
5. **Question to Answer:** Does the diacritic toolbar and review flow make it easy for an indigenous language expert to audit data without specialized software?

---

### Task 3: API & CLI Pipeline Execution (10 mins)
1. Start the backend API:
   ```powershell
   uvicorn api.main:app --reload
   ```
2. Open Swagger Docs at `http://localhost:8000/docs`.
3. Execute the `GET /api/languages` and `GET /api/experiments/igala-lora-v1` endpoints.
4. Run the automated test suite:
   ```powershell
   pytest tests/
   ```
5. **Question to Answer:** Did the endpoints respond as described in the API contract? Were any errors encountered during test execution?

---

### Task 4: Base vs. Adapted Model Quality Comparison (5 mins)
1. Inspect the comparative outputs in `experiments/igala-v1/results.json` or on the dashboard.
2. Compare the output of the unmodified `NCAIR1/N-ATLaS` baseline versus the LoRA-adapted model on 3 test prompts.
3. **Question to Answer:** Did the LoRA-adapted model produce more grammatically natural Igala translations and better tone markings?

---

### Task 5: Interactive Playground (5 mins)
1. In the Web UI or via `POST /api/playground/generate`, submit a custom English prompt (e.g., *"Welcome to our home"* or *"Water brings life"*).
2. Observe latency and generated Igala text.
3. **Question to Answer:** How intuitive is the playground for developers seeking to test the model on their custom inputs?

---

## 📝 Tester Feedback Form

*Please complete this section upon completing your testing tasks:*

```markdown
### Beta Tester Information
- Name / Initials: __________________________________________________
- Background / Role: [ ] NLP Researcher  [ ] Software Dev  [ ] Igala Speaker / Linguist  [ ] Student
- Date & Time Tested: _______________________________________________

### Usability & Quality Scores (1 to 5, where 5 = Excellent)
- Documentation & Setup Clarity: [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5
- Review Portal Ease of Use:     [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5
- Diacritic & Orthography Tools: [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5
- API Simplicity & Reliability:  [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5
- Noticeable Igala Improvement:  [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

### Qualitative Feedback
1. What was the smoothest part of the Foundry workflow?
   > [Your response here]

2. What bug, friction point, or confusion did you encounter?
   > [Your response here]

3. One suggestion to make this pipeline even better for other Nigerian languages:
   > [Your response here]
```
