# 06 — Human Linguistic Review Report

> **N-ATLaS Language Foundry — Qualitative Evaluation & Review Evidence**  
> *Author: YiM Consulting Engineering Team*

---

## 1. Review Workflow & Methodology

To complement automated metrics with authentic native-speaker grounding, the Foundry includes a structured human-in-the-loop review subsystem.

For the Tiv translation pilot, an offline evaluation workbook (`docs/Tiv Translation Pilot - Manual Review Distribution_2.xlsx`) was prepared to sample and evaluate parallel translation pairs across four evaluation dimensions:
1. **Translation Accuracy (1–5 Likert scale):** Fidelity of translated meaning compared to the source English sentence ($5 = \text{Fully accurate}$, $4 = \text{Minor nuance shift}$, $1 = \text{Completely inaccurate}$).
2. **Meaning Completeness (Binary Yes/No):** Full preservation of core semantics without omissions or hallucinations.
3. **Tiv Naturalness (1–5 Likert scale):** Fluency, tone appropriateness, and idiomatic phrasing in native Tiv ($5 = \text{Completely natural}$ native expression).
4. **Formatting Acceptability (Binary Yes/No):** Correct preservation of punctuation, capitalization, quotes, and alphanumeric references.

---

## 2. Reviewer Allocation & Sample Coverage

The pilot evaluation distribution was designed across four native linguist evaluators:

| Evaluator Code | Planned Records | Status | Records Completed | Sample Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **`REV_04`** | 51 | **Completed** | **51** | **25.12%** |
| **`REV_01`** | 51 | Pending | 0 | 0.00% |
| **`REV_02`** | 51 | Pending | 0 | 0.00% |
| **`REV_03`** | 50 | Pending | 0 | 0.00% |
| **Total Pilot Allocation** | **203** | **In Progress** | **51** | **25.12%** |

### Source Corpus Breakdown of Reviewed Sample
- **MT560 Tiv Parallel Corpus (`tiv-mt560-v1`):** **50 records** (98.04%)
- **Hypa Candidate (`hypaai/Hypa-Text-10k`):** **1 record** (1.96%)

---

## 3. Quantitative Scoring Summary

Evaluator `REV_04` annotated all 51 assigned records in the `Receiver 4` sheet:

| Evaluation Dimension | Metric Scale | Recorded Mean | Score Breakdown | Pass / Positive Count |
| :--- | :--- | :--- | :--- | :--- |
| **Translation Accuracy** | 1–5 scale | **4.7647 / 5.0** | Score 5: 39 records (76.5%)<br/>Score 4: 12 records (23.5%) | 51 / 51 (100% $\ge 4$) |
| **Meaning Completeness** | Binary (Yes/No) | 1.0 (100%) | Yes: 51 records (100%)<br/>No: 0 records (0%) | 51 / 51 (100%) |
| **Tiv Naturalness** | 1–5 scale | **5.0000 / 5.0** | Score 5: 51 records (100%)<br/>Score $<5$: 0 records (0%) | 51 / 51 (100%) |
| **Formatting Acceptability** | Binary (Yes/No) | 1.0 (100%) | Yes: 51 records (100%)<br/>No: 0 records (0%) | 51 / 51 (100%) |

### Review Flags Distribution
- **Records with Zero Review Flags:** **21 records** (41.2%)
- **Records with at Least One Informational Flag:** **30 records** (58.8%)

---

## 4. Qualitative Linguistic Observations

Detailed reviewer notes recorded by evaluator `REV_04` provide crucial qualitative insights into the characteristics of the Tiv parallel corpus:

### 1. Authentic Idiomatic Phrasing
The reviewer praised culturally idiomatic translations that capture the true spirit of native Tiv rather than literal English calques:
- **English Source:** *"in the English language"*
- **Tiv Target Translation:** *"ken zwa Buter"* (literally: *"in the European/English tongue"*)
- **Reviewer Note:** Validated as the natural, universally accepted native Tiv designation for the English language.

### 2. Publication & Page-Number Edition Shifts
All 12 records that received a Translation Accuracy score of `4/5` (instead of 5) were marked down due to differences in page-number citations between publication editions:
- **English Source:** Cited page 29 of a reference publication.
- **Tiv Target Translation:** Cited page 11 (the corresponding page in the Tiv language edition of the same publication).
- **Reviewer Note:** The reviewer noted that while the text translation was faithful and grammatically impeccable, the cited page number differed due to publication pagination, warranting a rating of 4 rather than 5.

### 3. Alphanumeric Token and Orthographic Preservation
The reviewer observed that complex alphanumeric lists (e.g. *( A - D ) .*), biblical book titles (*Ekesodu* for Exodus), and chapter citations (*15 : 16*) were faithfully aligned and correctly formatted.

### 4. Grammatical Imperative Repetition
In historical slogans or emphatic commands (*"yôô nen , yôô nen"*), the reviewer validated the repetition as standard and natural Tiv grammar for plural imperative emphasis.

---

## 5. Honest Disclosures & Methodological Boundaries

To ensure complete transparency, the following qualifications are formally enforced across the Foundry API and documentation:

1. **Reviewer-Recorded Judgments, Not Independent Audits:** These figures represent subjective annotations recorded by a single qualified native speaker (`REV_04`), not automated or multi-rater consensus certifications.
2. **Partial Pilot Coverage:** The 51 evaluated records represent **25.12% of the planned 203-record sample** and only **0.028% of the full 184,099-record MT560 corpus**. They do not constitute an evaluation of the entire dataset.
3. **Corpus Assessment, Not Model Evaluation:** These annotations evaluate the quality of the *training/validation corpus data*, **not** the output of the trained LoRA adapter.
4. **Data Governance & Privacy:** In compliance with ethical data standards, the raw review workbook (`docs/*.xlsx`) is excluded from Git tracking via `.gitignore`. Only sanitized, anonymized statistical summaries are exposed through `data/manifests/tiv_human_review_evidence.json`.

---
*Next: Learn how to set up, reproduce, and run the Foundry locally in [07-setup-and-reproduction.md](./07-setup-and-reproduction.md).*
