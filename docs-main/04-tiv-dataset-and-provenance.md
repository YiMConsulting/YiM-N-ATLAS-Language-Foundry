# 04 — Tiv Dataset & Provenance Report

> **N-ATLaS Language Foundry — Corpus Engineering & Provenance**  
> *Author: YiM Consulting Engineering Team*

---

## 1. Primary Dataset Overview

The primary laboratory dataset curated for the initial Foundry adaptation pilot is the **Tiv MT560 Parallel Corpus V1** (`tiv-mt560-v1`).

| Attribute | Verified Value | Source / Manifest Reference |
| :--- | :--- | :--- |
| **Dataset Identifier** | `tiv-mt560-v1` | `api/main.py: DATASETS` |
| **Source Repository** | `michsethowusu/english-tiv_sentence-pairs_mt560` | Hugging Face Datasets |
| **Pinned Commit SHA** | `252074f0d4c82c0005099b5eb4043fddc43026f1` | `data/manifests/tiv_source_provenance_manifest.json` |
| **Declared License** | CC BY 4.0 | Declared by source curator; formal legal verification pending |
| **Task Definition** | English-to-Tiv sentence-level machine translation | Bi-text parallel corpus |
| **Original Ingested Pairs** | **184,113** | Raw download count |
| **Exact Duplicates Pruned** | **14** | `foundry.datasets.builder` deduplication pass |
| **Retained Clean Pairs** | **184,099** | Canonical records |
| **Split Identifier** | `tiv-mt560-v1-split-42` | `data/processed/tiv-mt560-v1/split_metadata.json` |
| **Partitioning Strategy** | `grouped_by_input` | SHA-256 hash bucket partitioning |
| **Deterministic Seed** | `42` | Cryptographic random seed |

---

## 2. Partition Breakdown & Leakage Prevention

### 2.1 Partition Counts

The 184,099 deduplicated records were partitioned using a 75% / 10% / 15% ratio allocation:

| Split Partition | Record Count | Percentage | Partition Filename |
| :--- | :--- | :--- | :--- |
| **Training Set (`train`)** | **138,074** | 75.00% | `data/processed/tiv-mt560-v1/train.jsonl` |
| **Validation Set (`validation`)** | **18,410** | 10.00% | `data/processed/tiv-mt560-v1/validation.jsonl` |
| **Test Set (`test`)** | **27,615** | 15.00% | `data/processed/tiv-mt560-v1/test.jsonl` |
| **Total Corpus** | **184,099** | 100.00% | `data/processed/tiv-mt560-v1/split_metadata.json` |

### 2.2 Proof of 0% Data Leakage
In low-resource corpora, identical English sentences frequently appear translated with minor orthographic differences across chapters. A standard random split produces high data contamination, leaking identical English inputs into test sets.

Under the Foundry's `grouped_by_input` algorithm:
1. Every unique English input string is hashed via SHA-256.
2. All occurrences of that English string are constrained to the same partition bucket.
3. **Automated Audit Result:**
   - **Train/Validation ID Overlap:** **0 records** (verified).
   - **Train/Validation English Input Overlap:** **0 sentences** (verified).
   - **Unique English Inputs in Evaluation Sample:** **10 out of 10** (100% unique).

---

## 3. Data Integrity & Schema Validation

### 3.1 Canonical Record Schema
Every record written to the processed partitions conforms to `DatasetRecord`:

```json
{
  "id": "mt560-140929",
  "input": "This advance knowledge brought with it responsibility .",
  "target": "Er Yehova a pasen mbatomov nav kwagh u ken hemen yô , kwagh ne gema va ve a tom .",
  "language_code": "tiv"
}
```

### 3.2 Ingestion Validation Invariants
The ingestion pipeline enforces six strict data-quality assertions:
1. **UTF-8 Normalization:** Resolves broken characters, trailing control codes, and malformed diacritics.
2. **Non-Empty String Verification:** Any record where `input.strip()` or `target.strip()` is empty is rejected.
3. **Exact Deduplication:** Identical `(input, target)` pairs are detected and eliminated (14 pairs pruned).
4. **Unique Stable Identifiers:** Generates predictable IDs (`mt560-XXXXXX`) mapping 1-to-1 with source rows.
5. **Language Code Conformance:** Verifies BCP-47 / ISO-639-3 conformance (`tiv`).
6. **Immutable Partition Metadata:** Writes `split_metadata.json` capturing exact counts and partition hashes.

---

## 4. File Storage & Repository Governance

To preserve repository agility and adhere to strict data-governance standards:
- **Raw and Processed Datasets Excluded:** `data/raw/*` and `data/processed/*.jsonl` (totalling over 50 MB) are explicitly excluded from Git tracking via `.gitignore`.
- **Versioned Split Metadata Tracked:** Only the lightweight metadata descriptor (`data/processed/tiv-mt560-v1/split_metadata.json` and its deployment mirror `data/manifests/tiv_split_metadata.json`, each 344 bytes) is tracked in version control.
- **Reproducibility Guarantee:** Developers can reproduce the exact bit-for-bit partitions locally by executing the ingestion builder from the pinned Hugging Face commit SHA.

---

## 5. Licensing, Attribution & Provenance Responsibility

### Declared License
- Source MT560 declares `CC BY 4.0` (Creative Commons Attribution 4.0 International).

### Responsible Provenance Disclosure
1. **Attribution:** The original English-Tiv sentence pairs were curated as part of the MT560 multilingual benchmark by Seth Owusu et al.
2. **Legal Status:** While the dataset curator declared CC BY 4.0, formal commercial clearance and full underlying copyright verification (e.g. assessing whether religious texts or public domain literature were source materials) remain ongoing responsibilities.
3. **Integrity Rule:** The Foundry explicitly reports licensing as *"CC BY 4.0 (attribution required; formal verification pending)"* in public endpoints, refusing to claim unearned commercial certification.

---

## 6. Secondary Corpora: Hypa Candidate Exploration

In addition to MT560, the Foundry audited a secondary candidate: **Hypa-Text-10k** (`hypaai/Hypa-Text-10k`, commit `7a442cf5b029fab79540b093c9ef9abae5e30e96`):
- **Candidate Size:** 10,000 multilingual pairs.
- **Tiv Candidates Discovered:** 103 explicit English-to-Tiv pairs.
- **Pilot Inclusions:** Exactly **1 Hypa record** was included in the manual human-review distribution sample to test cross-corpus evaluation behavior.
- **Strict Separation Policy:** The Hypa candidate dataset **has NOT been merged** into the `tiv-mt560-v1` training partition. It remains categorized as a discovered candidate undergoing provenance investigation.

---
*Next: Read the full adaptation experiment and evaluation audit in [05-experiment-and-evaluation.md](./05-experiment-and-evaluation.md).*
