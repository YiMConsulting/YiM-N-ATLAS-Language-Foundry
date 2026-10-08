# 📋 GitHub Issues & Project Board Setup

> **Project:** N-ATLAS Language Foundry  
> **Team:** 3 Members (Olusegun / Person 1, Person 2, Person 3)  
> **Schedule:** Day 1 (Build Core Pipeline & Shell) → Day 2 (Vertical Slice Integration) → Day 3 (Verification & Submission)

---

## 🏗️ 1. GitHub Project Board Layout

Create a new GitHub Project (Table / Board view) with the following 5 columns:

1. **Backlog (To Do)**
2. **Ready for Dev**
3. **In Progress**
4. **In Review / Testing**
5. **Done**

Add Custom Fields:
- **Milestone:** `Day 1 - Core AI Pipeline & Shell`, `Day 2 - Complete Vertical Slice`, `Day 3 - Submission & Evidence`
- **Owner:** `Olusegun (AI/ML & Backend)`, `Person 2 (Full-stack UI)`, `Person 3 (Review & Docs)`
- **Priority:** `P0 (Critical Path)`, `P1 (Important)`, `P2 (Nice to have)`

---

## 🎯 2. Ready-to-Create GitHub Issues

### 🗓️ Milestone: Day 1 — Core AI Pipeline & Shell

#### Issue #1: [Kickoff] Git Setup, Branching & Section 11 API Contract Alignment
* **Assignee:** Olusegun (Person 1)
* **Labels:** `setup`, `p0-critical`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Initialize repository branches, establish Section 11 experiment contract, and publish README/approach documents.
  
  ### Acceptance Criteria
  - [x] Branching model (`main`, `develop`, feature branches) documented and created.
  - [x] Section 11 Pydantic experiment schema defined in `api/schemas/experiment.py`.
  - [x] `docs/api_contract.md`, `README.md`, `approach.md`, and `submission_checklist.md` pushed.
  ```

#### Issue #2: [AI/ML] N-ATLAS Access & Inference Smoke Test
* **Assignee:** Olusegun (Person 1)
* **Labels:** `backend`, `ml`, `p0-critical`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Verify Hugging Face gated access for `NCAIR1/N-ATLaS`, download/load tokenizer and model, execute baseline inference smoke test.
  
  ### Acceptance Criteria
  - [ ] Validated HF authentication using `HF_TOKEN`.
  - [ ] Smoke test script runs without OOM on GPU (or Colab/Kaggle).
  - [ ] Tested 4-bit `bitsandbytes` loading as safety fallback.
  - [ ] Documented loading latency and memory footprint.
  ```

#### Issue #3: [Frontend] Next.js Application Shell & Layout Setup
* **Assignee:** Person 2 (Full-Stack UI)
* **Labels:** `frontend`, `p0-critical`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Scaffold Next.js application in `web/` directory with clean navigation layout.
  
  ### Acceptance Criteria
  - [ ] Clean responsive layout with Navbar & Sidebar.
  - [ ] Route structure created:
    - `/` (Overview)
    - `/registry` (Language Registry)
    - `/datasets` (Data Ingestion & Audit)
    - `/experiments` (Training Status & Comparison)
    - `/playground` (Interactive Side-by-Side Inference)
  - [ ] Configured API client consuming `http://localhost:8000`.
  ```

#### Issue #4: [AI/ML] Ingestion, Automated Quality Audit & Manifest Generation
* **Assignee:** Olusegun (Person 1)
* **Labels:** `backend`, `ml`, `data`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Build dataset ingestion module for Igala with deduplication, field validation, and manifest generation.
  
  ### Acceptance Criteria
  - [ ] `foundry/ingestion` loads raw Igala corpus.
  - [ ] `foundry/quality` strips duplicate records, missing translations, and malformed characters.
  - [ ] Produces deterministic SHA256 checksum and manifest JSON in `data/manifests/`.
  ```

#### Issue #5: [Docs/Review] Review Workflow & Evidence Schema Setup
* **Assignee:** Person 3 (Full-Stack + Docs)
* **Labels:** `review`, `docs`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Define reviewer evaluation criteria (approved, rejected, needs correction) and setup reviewer schema.
  
  ### Acceptance Criteria
  - [ ] Reviewer sampling script extracts 30–50 rows for native speaker audit.
  - [ ] Review schema records reviewer role, timestamp, and feedback.
  - [ ] Documented criteria in `docs/data-provenance.md`.
  ```

#### Issue #6: [AI/ML] Deterministic Split & Baseline N-ATLAS Evaluation
* **Assignee:** Olusegun (Person 1)
* **Labels:** `backend`, `ml`, `eval`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Split clean Igala data into Train (75%), Val (10%), and Test (15%). Run base N-ATLAS on test split before training.
  
  ### Acceptance Criteria
  - [ ] Seed fixed to 42 for reproducible splitting.
  - [ ] Base `N-ATLaS` evaluated on test set; baseline BLEU, chrF, and loss recorded.
  - [ ] Baseline outputs saved to `experiments/baseline/`.
  ```

#### Issue #7: [AI/ML] LoRA / QLoRA Adaptation Experiment Run
* **Assignee:** Olusegun (Person 1)
* **Labels:** `backend`, `ml`, `p0-critical`, `milestone-day1`
* **Description:**
  ```markdown
  ### Goal
  Execute LoRA adaptation experiment on N-ATLAS using training split. Save adapter checkpoint.
  
  ### Acceptance Criteria
  - [ ] Training script completes configured epochs (loss decreases steadily).
  - [ ] Adapter weights saved to `experiments/igala-v1/adapter`.
  - [ ] Hyperparameters, hardware, and duration recorded in Section 11 format.
  ```

---

### 🗓️ Milestone: Day 2 — Complete Vertical Slice

#### Issue #8: [AI/ML] Post-Adaptation Evaluation & Regression Sanity Check
* **Assignee:** Olusegun (Person 1)
* **Labels:** `backend`, `ml`, `eval`, `milestone-day2`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] Evaluate adapted model on identical held-out test split.
  - [ ] Calculate relative metric deltas (BLEU, chrF, loss).
  - [ ] Execute general sanity prompts to confirm zero regression on base language capabilities.
  ```

#### Issue #9: [Frontend] Experiment Comparison & Results Dashboard
* **Assignee:** Person 2 (Full-Stack UI)
* **Labels:** `frontend`, `milestone-day2`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] Visual side-by-side card comparing Base vs Adapted N-ATLAS.
  - [ ] Metric badge showing BLEU / chrF gains.
  - [ ] Sample generation comparisons with qualitative notes.
  ```

#### Issue #10: [Frontend] Interactive Playground for Inference
* **Assignee:** Person 2 (Full-Stack UI)
* **Labels:** `frontend`, `milestone-day2`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] User enters prompt (e.g. English phrase to translate into Igala).
  - [ ] Side-by-side stream/display of Base N-ATLAS vs Igala-Adapted N-ATLAS output.
  - [ ] Displays inference latency in ms.
  ```

#### Issue #11: [Validation] Coordinate 2 External Beta Testers (PS1 Requirement)
* **Assignee:** Person 3 (Full-Stack + Docs)
* **Labels:** `validation`, `p0-critical`, `milestone-day2`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] Minimum two distinct beta testers engaged.
  - [ ] Tester 1: Evaluates data ingestion & native review UI.
  - [ ] Tester 2: Evaluates API / developer setup & playground.
  - [ ] Feedback, logs, and screenshots logged into `docs/validation.md`.
  ```

---

### 🗓️ Milestone: Day 3 — Submission & Evidence

#### Issue #12: [Submission] Clean Environment Reproduction Test
* **Assignee:** Person 3 (Full-Stack + Docs)
* **Labels:** `testing`, `reproducibility`, `milestone-day3`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] Fresh git clone tested on separate machine/virtualenv.
  - [ ] All installation steps from `README.md` verified line-by-line.
  ```

#### Issue #13: [Media] 3–5 Minute Video Demo Recording
* **Assignee:** Person 2 & 3
* **Labels:** `video`, `submission`, `milestone-day3`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] High-definition walkthrough recorded following the timecoded script in `submission_checklist.md`.
  - [ ] Video uploaded with accessible link.
  ```

#### Issue #14: [Final] NAIC Submission Portal Package Assembly
* **Assignee:** Olusegun (Person 1)
* **Labels:** `submission`, `p0-critical`, `milestone-day3`
* **Description:**
  ```markdown
  ### Acceptance Criteria
  - [ ] Institutional / Track registration documents verified.
  - [ ] Team profile confirmed with all 3 members.
  - [ ] Repo frozen and submitted before 12 October 2026 11:59 PM WAT.
  ```
