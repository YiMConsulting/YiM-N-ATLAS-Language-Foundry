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
| **Tier 1 (Target / Verified)** | Kaggle 2x NVIDIA Tesla T4 (2x 15GB VRAM) | 16-bit LoRA / QLoRA adaptation with `device_map="auto"` | OOM error or quota limits |
| **Tier 2 (Fallback A)** | Google Colab T4 GPU (15GB) | 4-bit QLoRA with batch size 2, gradient accumulation 8 | Kaggle session quota or allocation delay |
| **Tier 3 (Fallback B)** | Local RTX GPU or CPU-mock | Mock evaluation suite & cached adapter weights | Hard failure across cloud GPU runtimes |

---

## 8. Extensibility: The Multi-Language Roadmap

The architecture designed here for Igala is modular:
* Adding a new language (e.g., Ebira, Nupe, Tiv, Kanuri, Berom) requires solely registering the ISO code and submitting raw records through the audited pipeline.
* The Foundry automates the audit, split, training orchestration, and comparative reporting uniformly.

### Local Development Environment

For the local development environment, I decided to use Docker to provide a consistent Python runtime instead of installing Python 3.11 directly on my laptop.

My host machine is currently running Python 3.14, while the project is targeting Python 3.11. Rather than changing the host Python installation or creating a setup that depends on the local machine, the API environment is now running inside a Python 3.11 Docker container.

I also separated the project dependencies into API, development, and ML requirements. This keeps the local backend environment lightweight and avoids installing GPU/ML packages such as PyTorch, Transformers, PEFT, and bitsandbytes on the laptop.

The local machine will mainly be used for backend/API development, frontend development, testing, Git, and other lightweight development tasks. The actual N-ATLaS model work and LoRA/QLoRA training will be handled in a GPU environment, with Kaggle (2x Tesla T4) as the primary verified option and Google Colab as a fallback.

I verified that the Docker setup builds successfully, uses Python 3.11, loads the required API dependencies, and correctly mounts the project directories.

This keeps the local development environment isolated and reproducible without requiring CUDA or an NVIDIA GPU on the development machine.


### N-ATLaS Access and Inference Verification (Empirical Baseline)

Before starting the language adaptation pipeline, I verified that the N-ATLaS model can be accessed and run in the intended GPU environment.

The smoke test was executed and verified on Kaggle (`notebooks/00_natlas_smoke_test.ipynb`) with the following actual infrastructure configuration:

- **Compute & Accelerator:** Dual NVIDIA Tesla T4 GPUs (2x 15,360 MiB VRAM), Driver 580.178.04, CUDA 12.8 / 13.0.
- **Software Stack:** Python 3.11 (Kaggle runtime), PyTorch `2.11.0+cu128`, Transformers `5.19.0`, PEFT `0.21.2`, Accelerate `1.15.0`, Datasets `5.1.0`, Hugging Face Hub `1.33.0`.
- **Base Model Verification:** `NCAIR1/N-ATLaS` authenticated via Hugging Face token.
- **Architecture Details:** `LlamaForCausalLM` (`model_type: llama`), 32 layers, hidden size 4096, 32 attention heads (with 8 KV heads for Grouped Query Attention), native `bfloat16` precision, vocab size 128,256, context window of 131,072 tokens with Llama-3 RoPE parameters.
- **LoRA Targetable Projections:** Verified presence of `q_proj`, `k_proj`, `v_proj`, `o_proj` across all 32 transformer blocks.
- **Inference Verification:** Prompt `"Nigeria is"` completed successfully with deterministic greedy decoding (`do_sample=False`, `max_new_tokens=30`), generating coherent base continuation.

The smoke-test notebook is preserved in `notebooks/00_natlas_smoke_test.ipynb` to guarantee full end-to-end reproducibility of the environment setup.

This checkpoint confirms that the project can proceed to designing the generic language and dataset contracts. No training or LoRA implementation was performed at this stage.





### Human Review
- Human review is a validation/gating mechanism, not a permanent manual bottleneck.
- Automated quality checks happen before human validation.
- The Foundry does not provide or recruit reviewers in the MVP.
- The developer can provide a qualified reviewer, such as a native speaker, linguist, or domain expert.
- The Foundry provides the review workflow and evidence tracking, not the reviewer itself.
- Human review is represented as:
  Review Request → Sampled Examples → Individual Decisions → Review Summary.
- Reviewers can mark examples:
  - correct
  - incorrect
  - needs_correction
- Corrections are preserved as review evidence rather than silently modifying the original dataset.
- Multiple review rounds/reviewers should be possible.
- A dataset can therefore have review history independent of any particular experiment.
- Five developers working on the same language should be able to create separate datasets/experiments/adapters rather than automatically merging their work.
- Adapters should be produced by experiments and evaluated independently.
- The preferred/best adapter should be determined by evaluation evidence, not simply by being the newest adapter or using the largest dataset.
- The Foundry's value is reproducibility, traceability, provenance, validation, and experiment management, rather than claiming that it inherently produces better fine-tuned models.

Quality Audit ≠ Human Review

The automated audit answers:
“Does this dataset have obvious structural/data problems?”

Human review answers:
“Are these actual language examples correct and usable?”


### Dataset Splitting & Test-Set Isolation
- **Splits are independent entities:** A dataset retains its canonical identity while supporting multiple deterministic splits (e.g. seed 42 vs seed 123) represented via `DatasetSplit`.
- **Reproducibility Contract:** Ratios (`train_ratio`, `validation_ratio`, `test_ratio` summing to 1.0) and realized counts (`train_records`, `validation_records`, `test_records` summing to `total_records`) are recorded explicitly with the generator seed.
- **Strict Test-Set Isolation:**
  - **Train split:** Used strictly for gradient optimization / LoRA adaptation.
  - **Validation split:** Used for hyperparameter tuning, checkpoint selection, and overfitting monitoring.
  - **Test split:** Held-out partition evaluated only at final evaluation time for honest, unbiased comparison between unadapted base `N-ATLaS` and adapted `N-ATLaS`.
  - Under no circumstances is test data permitted in training batches or adapter selection loops.