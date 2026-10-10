# 📅 N-ATLAS Language Foundry — Team Master Schedule

> **Team Roles:**
> * **Olusegun:** Project Manager & Full Stack (Integration, Review Portal, Evidence & Docs) — Branch: `feat/olusegun-coordination`
> * **James:** AI/ML Engineer & Backend (N-ATLaS LoRA, Data Pipeline, FastAPI) — Branch: `feat/james-ml-pipeline`
> * **Gilbert:** Frontend Developer (Next.js Dashboard, Language Registry, Results & Playground) — Branch: `feat/gilbert-frontend`

---

## 👨‍💻 James (AI/ML & Backend)

### Friday
* **08:00 – 10:00:** Accept N-ATLaS terms on Hugging Face; put token in `.env` (never commit). Load model on Kaggle and run test generation. **Gate 1 at 10:00**.
* **10:00 – 10:30:** Confirm 2 external beta testers and the Igala reviewer.
* **10:30 – 13:00:** Pick 1–2 Igala data sources. Record license & provenance. Build ingestion, manifest, and checks for missing/duplicate/malformed rows with tests.
* **13:00 – 14:00:** Build FastAPI skeleton & schemas as agreed in contract (`/languages`, `/datasets`, review endpoints, `/experiments`, `/results`). Mock data is fine to start.
* **14:00 – 15:00:** Split data (train, val, test). Run baseline evaluation on original N-ATLaS. Send first sample to Igala reviewer.
* **15:00 – 19:00:** Run small LoRA test, QLoRA if memory tight, then first real training run. Save settings & checkpoints. **Gate 2 at 19:00**.
* **16:00 – 18:00:** (While training runs) Finish review endpoints.
* **19:00 – 20:30:** Save first adapter, baseline & adapted outputs. Finish `/experiments` and `/results`.
* **All day:** Keep short notes on model access, dataset licenses, and training settings for Olusegun.
* **By 20:30 (Day 1 PR):** Pull latest `develop`, push `feat/james-ml-pipeline`, open PR to `develop`. Message Olusegun: *"Done, PR sent"*, stating any unfinished items.

### Saturday
* **08:00 – 10:00:** Confirm training finished, collect reviewer's results. Run adapted test matching baseline, plus sanity prompts.
* **10:00 – 12:00:** Save metrics & experiment record. Push adapter to HF if allowed. Add playground endpoint.
* **12:00 – 13:00:** Send tester pack to testers and confirm session times.
* **13:00 (PR #1):** Push, open PR, message Olusegun.
* **14:00 – 17:00:** Run beta sessions. Send notes, feedback, and screenshots to Olusegun. Fix backend bugs.
* **17:00 (PR #2 - Freeze):** Freeze experiment, tag `exp/igala-v1`, push, open PR, message Olusegun.
* **17:00 – 19:00:** Write `docs/reproducibility.md` with exact commands, versions, and commit.
* **19:00 – 20:30:** Fix backend bugs. Check no secrets in git history. Confirm base & adapted result files are committed.
* **20:30 (Final PR):** Final PR & message Olusegun.

### Sunday
* **Morning:** Verify beta tester evidence is complete (names/IDs, tasks, feedback, fixes). Confirm adapter & manifest match final commit. Record voice-over for training/eval section of video.
* **By 15:00:** Final PR to Olusegun.

---

## 🎨 Gilbert (Frontend Dashboard)

### Friday
* **08:00 – 10:00:** Create Next.js app in `web/` with layout & nav. Add placeholder `/review` and `/evidence` links (so Olusegun can plug in seamlessly). Build API client using mock data from contract.
* **10:00 – 13:00:** Build Language Registry page and Dataset/Provenance page on mock data.
* **14:00 – 17:00:** Build Experiment Status page and Base-vs-Adapted Results page (basic version).
* **17:00 – 20:00:** Add loading and error states. Keep design clean and robust.
* **By 20:30 (Day 1 PR):** Pull latest `develop`, verify pages run, push `feat/gilbert-frontend`, open PR to `develop`, message Olusegun: *"Done, PR sent."*

### Saturday
* **08:00 – 10:00:** Pull `develop`. Switch registry, dataset, and status pages from mock data to real API.
* **10:00 – 13:00:** Build Playground page (prompt box and result). Mock until James's endpoint arrives.
* **13:00 (PR #1):** Push, open PR to `develop`, message Olusegun.
* **14:00 – 17:00:** Switch results page to real metrics and example outputs. Connect playground to real endpoint. Fix demo path and tester UI bugs.
* **17:00 (PR #2 - Freeze):** Push, open PR, message Olusegun.
* **17:00 – 19:00:** UI polish, fresh-clone verification, demo screenshots. No new features.
* **19:00 – 20:30:** Fix remaining bugs and capture clean screenshots for video.
* **20:30 (Final PR):** Final PR & message Olusegun. Record demo walkthrough and send to Olusegun.

---

## 🧭 Olusegun (Project Manager + Full Stack Lead)

### Friday
* **08:00:** ✅ Create `develop` with folder structure, README, approach.md, submission checklist.
* **By 09:00:** ✅ Provide `docs/api_contract.md` and confirm with Gilbert and James.
* **10:00 – 13:00:** Start the Review Page component using mock data.
* **14:00 – 17:00:** Finish Review Page (reviewer marks examples correct/incorrect/needs-correction).
* **17:00 – 20:00:** Build Evidence Screen and validation log template. Write Tester Pack (task list & feedback form). Start docs skeleton.
* **20:30 (Integration Sync):** Merge Gilbert's PR, then James's PR, then own PR into `develop`. Run full app, capture screenshots, write Day 1 notes.

### Saturday
* **08:00 (Standup):** Add demo link to tester pack and hand to James by 09:30. Connect Review Page to James's real endpoints.
* **All Day Support:** Prepare validation log, answer tester questions, log bug reports as GitHub issues.
* **13:00:** Merge PRs #1 from James and Gilbert into `develop`.
* **14:00 – 17:00:** Convert James's beta notes into validation evidence. Draft docs: N-ATLAS integration, data quality, training, evaluation, limitations, attribution.
* **17:00 (Freeze Merge):** Merge PRs #2, merge `develop` into `main`. Finalize README and video script. Test from fresh clone.
* **19:00 – 20:30:** Final checkpoint: catalog unproven items in limitations, update checklist.
* **20:30:** Merge final fixes into `develop` and `main`. Assemble final video & submission package.
