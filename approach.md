# 🛠️ N-ATLAS Language Foundry — Engineering Approach & Scientific Methodology

> **Target Challenge:** National AI Innovation Challenge (NAIC 2026)  
> **Problem Statement 1:** Developer Infrastructure  
> **Author & ML Lead:** Olusegun  
> **Current Status:** Day 1 Kickoff & Pipeline Ingestion

---

## 1. Executive Summary

The objective of the **N-ATLAS Language Foundry** is not to train another foundation model from scratch, but to build the missing **developer infrastructure** that makes adapting Nigeria's sovereign base model (`NCAIR1/N-ATLaS`) to newly onboarded indigenous languages structured, repeatable, transparent, and auditable.

Rather than running unmonitored Jupyter notebooks with opaque hyperparameter choices and unverified data pools, the Foundry enforces a disciplined 12-step pipeline. We prove this concept end-to-end using **Igala** (`igl`) as our initial laboratory language.

---

## 2. Why Igala as the First Laboratory Language?

1. **Strategic Linguistic Representation:** While N-ATLAS has foundational capabilities in Nigeria's dominant regional languages (Yoruba, Hausa, Igbo, Nigerian Pidgin), languages like Igala—spoken by millions across Kogi and surrounding North-Central states—remain severely underserved in generative language models.
2. **Honest Baseline Testing:** Because base foundation models typically lack dense pretraining in Igala, it provides an authentic, high-signal testing ground. We can demonstrably measure whether low-resource parameter-efficient adaptation creates genuine comprehension or merely memorization.
3. **Manageable Data Scale for a 2-Day Sprint:** High-quality parallel/monolingual corpora exist in curated amounts (e.g., VoiceAfrica, community documentation). A dataset of 500–1,000 clean sentence pairs is sufficient to prove a parameter-efficient adapter without exhausting compute.

---

## 3. Genuine N-ATLAS Integration

We directly utilize `NCAIR1/N-ATLaS` as the root base model.
* We do **not** substitute an off-the-shelf Llama-3 or Mistral checkpoint and label it as N-ATLAS.
* The Hugging Face model access is verified via gated repo authorization.
* We verify tokenizer compatibility, token embedding coverage, and context window requirements during our Day 1 smoke test.

---

## 4. Data Strategy: Provenance, Quality & Native Review

```
[ Raw Data Ingestion ] 
       │
       ▼
[ Provenance & License Gate ] ──(Fails?)──> [ REJECT / LOG ]
       │
       ▼
[ Automated Quality Audit ]
  ├─ Deduplication (SHA-256 normalized hash)
  ├─ Missing & Malformed Field Stripping
  └─ Token Length & Anomaly Filtering
       │
       ▼
[ Human Review Sample (30-50 pairs) ]
  └─ Native Speaker validates tone markings & meaning
       │
       ▼
[ Deterministic Train / Val / Test Split ] (75 / 10 / 15)
```

### Strict Licensing Rules
Every dataset ingested into the Foundry must possess an explicit provenance manifest recording:
- Origin repository & URL
- License terms (e.g., CC-BY-4.0, OpenRAIL)
- Permissibility of research and commercial fine-tuning

---

## 5. Adaptation Strategy: PEFT (LoRA vs QLoRA)

Adapting a multi-billion parameter base model within a two-day hackathon requires parameter-efficient fine-tuning (PEFT):

1. **LoRA (Low-Rank Adaptation):**
   - Targets query and value projection matrices (`q_proj`, `v_proj`).
   - Default Configuration: Rank $r = 16$, Alpha $\alpha = 32$, Dropout = $0.05$.
   - Allows training less than 0.5% of model weights, drastically slashing memory requirements while preserving foundational reasoning.
2. **QLoRA (4-bit Quantization Fallback):**
   - If available GPU VRAM is restricted (<16GB), base weights are quantized using `bitsandbytes` NF4 (NormalFloat4) with double quantization.
   - Paged optimizers prevent out-of-memory spikes during gradient accumulation.

---

## 6. Evaluation Protocol: "Do Not Invent Improvement"

A cornerstone of our engineering ethics is transparent scientific reporting:
1. **Pre-training Baseline:**
   - Before running gradient descent, the unadapted `N-ATLaS` model is evaluated on the exact held-out test split.
   - Baseline loss, BLEU, and chrF metrics are saved into the immutable experiment record.
2. **Post-training Evaluation:**
   - The adapted model is evaluated on the exact same test records.
3. **Regression / Sanity Check:**
   - A sanity prompt test set (standard English, Yoruba, and general knowledge) is evaluated before and after. This guarantees that fine-tuning on Igala did not cause catastrophic forgetting of the base model's capabilities.
4. **Human Evaluation:**
   - External native speakers review a random sample of generation outputs to judge fluency and tone correctness.

---

## 7. Compute Strategy & Pragmatic Fallback Plan

| Scenario | Primary Compute | Action Plan | Fallback Trigger |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Target)** | Kaggle NVIDIA Tesla P100 (16GB) | Full 16-bit LoRA adaptation | OOM error during forward/backward pass |
| **Tier 2 (Fallback A)** | Google Colab T4 GPU (16GB) | 4-bit QLoRA with batch size 2, gradient accumulation 8 | Kaggle session quota or allocation delay |
| **Tier 3 (Fallback B)** | Local RTX GPU or CPU-mock | Mock evaluation suite & cached adapter weights | Hard failure across cloud GPU runtimes |

---

## 8. Extensibility: The Multi-Language Roadmap

The architecture designed here for Igala is modular:
* Adding a new language (e.g., Ebira, Nupe, Tiv, Kanuri, Berom) requires solely registering the ISO code and submitting raw records through the audited pipeline.
* The Foundry automates the audit, split, training orchestration, and comparative reporting uniformly.
