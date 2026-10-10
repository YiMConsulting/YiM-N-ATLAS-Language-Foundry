# 🛠️ N-ATLAS Language Foundry — Engineering Approach & Scientific Methodology

> **Target Challenge:** National AI Innovation Challenge (NAIC 2026)  
> **Problem Statement 1:** Developer Infrastructure  
> **Author & ML Lead:** James  
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


### Dataset Split and Evaluation Isolation

The dataset split is represented as a separate artifact rather than storing
train/validation/test information directly on the dataset. This allows the
same dataset version to support multiple reproducible split configurations.

For the MVP, the split strategy is deterministic random splitting using an
explicit seed. The split records both the configured ratios and the resulting
record counts.

The test set is treated as held-out evaluation data. It must not be used for
training or for experiment/model-selection decisions. Base N-ATLaS and adapted
N-ATLaS should eventually be evaluated against the same held-out test set so
that their results can be compared fairly.

The Dataset Builder will be responsible for turning usable dataset records
into reproducible train, validation, and test sets. Quality filtering,
human-review outcomes, duplicate handling, and leakage prevention will be
implemented as part of the dataset-building workflow rather than being hidden
inside the split schema.
- **Strict Test-Set Isolation:**
  - **Train split:** Used strictly for gradient optimization / LoRA adaptation.
  - **Validation split:** Used for hyperparameter tuning, checkpoint selection, and overfitting monitoring.
  - **Test split:** Held-out partition evaluated only at final evaluation time for honest, unbiased comparison between unadapted base `N-ATLaS` and adapted `N-ATLaS`.
  - Under no circumstances is test data permitted in training batches or adapter selection loops.


### Canonical Dataset Record and Dataset Builder

The Foundry uses a model-independent canonical dataset record with four required
fields: `id`, `input`, `target`, and `language_code`.

Source datasets may arrive as JSON, JSONL, CSV, or Parquet. The Dataset Builder
normalizes these formats into the canonical record representation before
downstream processing. The original source format remains a data-ingestion
concern and is not required by downstream components.

Dataset-level provenance remains separate from individual records. The
canonical record does not duplicate source, license, or retrieval metadata.

N-ATLaS-specific formatting, tokenization, and chat-template handling are also
kept outside the canonical data layer. These concerns belong to the model
training/inference layer.

The Dataset Builder performs the following steps:

1. Load the registered dataset.
2. Normalize records into the canonical schema.
3. Exclude malformed records and records belonging to a different language.
4. Remove exact duplicate records and duplicate record IDs.
5. Deterministically shuffle records using an explicit seed.
6. Create train, validation, and held-out test splits.
7. Write processed datasets as JSONL.
8. Write split metadata containing the seed, ratios, and resulting record counts.

The builder does not modify the original dataset. Processed datasets are
derived artifacts stored separately.

For the MVP, duplicate detection is exact rather than fuzzy. This avoids
incorrectly removing legitimate language examples based on aggressive or
language-specific normalization.

The test set remains held out from training and experiment/model-selection
decisions. Base N-ATLaS and adapted N-ATLaS will later use the same held-out
test set for fair comparison.

The canonical record and Dataset Builder are intentionally independent of
N-ATLaS, LoRA, QLoRA, Transformers, tokenizers, and GPU infrastructure. This
keeps the Foundry data pipeline reusable for future Nigerian languages and
tasks.


### Dataset Builder Artifact Verification

The Dataset Builder was verified by generating train, validation, and test
JSONL artifacts together with split metadata. The generated records conform
to the canonical DatasetRecord contract, the metadata counts correspond to
the generated files, and the split uses a deterministic seed.

The original source dataset remains unchanged. The processed files are treated
as derived experiment inputs rather than replacements for the registered
source dataset.


## Experiment Contract and Lifecycle

### Experiment definition

An experiment represents one reproducible attempt to adapt a specific
base model for a registered language using a defined dataset composition,
immutable dataset split, adaptation configuration, training configuration,
and runtime configuration.

The experiment is intentionally model- and language-independent. Igala is
the first implementation language, but the experiment contract does not
contain Igala-specific logic.

### Dataset references

An experiment stores `dataset_ids` and a `split_id`.

Multiple registered datasets may contribute to an experiment, but the
experiment does not combine datasets itself. Dataset composition and splitting
are handled by the Dataset Builder before training.

The resulting immutable split is referenced by `split_id`. This allows an
experiment to reproduce the exact data used during training and evaluation.

The intended flow is:

```
Dataset A + Dataset B
        ↓
Dataset Builder
        ↓
Immutable Dataset Split
        ↓
Experiment
        ↓
Adapter + Evaluation Evidence
```

This prevents training code from independently selecting or combining data
and makes the experiment's input traceable.

### Experiment lifecycle

Experiments follow an explicit lifecycle:

`queued → running → evaluating → completed`

An experiment may enter `failed` from an active stage when execution cannot
complete successfully.

Results and adapter artifacts are therefore optional during the early
lifecycle. A completed experiment must contain both baseline and adapted
evaluation results.

### Baseline and adapted evaluation

The experiment records both `base_results` and `adapted_results`.

The base model and adapted model must be evaluated using the same held-out
test split and evaluation procedure so that the comparison measures the
effect of adaptation rather than a difference in evaluation data.

No improvement is assumed by the schema. Actual performance claims will only
be made from recorded evaluation results.

### Adaptation configuration

Adaptation is represented separately from general training configuration.

The MVP supports LoRA and QLoRA as adaptation methods. LoRA target modules,
rank, alpha, and dropout are recorded explicitly so that an experiment can
be reproduced.

### Runtime configuration

Hardware, device, and numerical precision are recorded as part of the
experiment because training results depend on the execution environment.

The local development environment remains separate from GPU training.
Training experiments are expected to run on the available GPU environment,
while local Docker is used for reproducible API and development work.


## N-ATLaS Training Input Boundary

The Foundry keeps its canonical dataset representation independent of the
model being adapted. A canonical `DatasetRecord` contains:

- `id`
- `input`
- `target`
- `language_code`

N-ATLaS-specific formatting is performed in the training layer rather than
inside the Dataset Builder.

The N-ATLaS formatter converts each canonical record into a conversational
message pair:

`input → user message`
`target → assistant message`

The formatter then uses the tokenizer's registered
`apply_chat_template()` implementation.

For training, the chat template is applied with
`add_generation_prompt=False`. Generation prompts are reserved for inference.

This boundary prevents N-ATLaS-specific formatting decisions from leaking
into the generic dataset model and allows the Foundry's canonical dataset
representation to remain reusable across languages and future model
adapters.

The formatter does not modify the source `DatasetRecord`.

The actual N-ATLaS tokenizer was verified separately in the Kaggle GPU
environment before being used by the training pipeline.

### Empirical Kaggle Formatter Smoke Test Results

The training input boundary was empirically validated against the official `NCAIR1/N-ATLaS` model on Kaggle (`notebooks/01_natlas_formatter_smoke_test.ipynb`):

- **Tokenizer Backend:** `TokenizersBackend` with active `chat_template` (`chat_template is not None: True`).
- **Template Formatting:** Prepend system date markers (`Cutting Knowledge Date: December 2023`, `Today Date: 26 Jul 2024`), user header block, and assistant response block terminating with end-of-turn token `<|eot_id|>`.
- **Sample Igala Record:**
  - Input: `"How are you?"`
  - Target: `"Abe ele?"`
  - Formatted Output:
    ```text
    <|begin_of_text|><|start_header_id|>system<|end_header_id|>

    Cutting Knowledge Date: December 2023
    Today Date: 26 Jul 2024

    <|eot_id|><|start_header_id|>user<|end_header_id|>

    How are you?<|eot_id|><|start_header_id|>assistant<|end_header_id|>

    Abe ele?<|eot_id|>
    ```
  - Total Token Count: 45 tokens (`token_ids: [128000, 128000, 128006, 9125, 128007, ...]`).
- **Multi-Language Generalization:**
  - Igala (`igl`): 43 tokens (`Good morning` → `Ólódù`)
  - Yoruba (`yor`): 45 tokens (`Good morning` → `Ẹ ku aarọ`)
  - Igbo (`ibo`): 48 tokens (`Good morning` → `Ụtụtụ ọma`)
  - Hausa (`hau`): 43 tokens (`Good morning` → `Ina kwana`)

This confirms that the N-ATLaS chat template is preserved consistently across languages without modifying the underlying canonical record.


## Training Preprocessing & Label Construction

The Foundry converts canonical dataset records into tokenized supervised
fine-tuning examples with assistant-only loss masking:

```
Canonical DatasetRecord
        │
        ▼
Apply Chat Template
  ├─ Prompt only (with generation prompt)  → prompt_ids
  └─ Full conversation (without gen prompt) → input_ids
        │
        ▼
Prefix Integrity Check (fail-safe)
  input_ids[:len(prompt_ids)] == prompt_ids
        │
        ▼
Label Construction
  ├─ Prompt tokens: masked with IGNORE_INDEX (-100)
  └─ Assistant tokens: retained for loss calculation (including <|eot_id|>)
        │
        ▼
Validation & Boundary Checks
  ├─ Non-empty input & target
  ├─ Overlength rejection (> max_length)
  └─ Positive assistant token presence
        │
        ▼
TokenizedTrainingExample
  (record_id, language_code, input_ids, attention_mask, labels)
```

### Key Engineering Guarantees

1. **Assistant-Only Loss Masking:**
   Prompt tokens (including system headers, user turns, and formatting delimiters)
   are assigned `IGNORE_INDEX` (`-100`). The model is penalized solely on its ability
   to predict target language responses and appropriate turn termination (`<|eot_id|>`).

2. **Prefix Boundary Verification:**
   Before slicing labels, the preprocessor verifies that `prompt_ids` form an exact
   prefix of `full_conversation_ids`. If tokenizer post-processing alters prefix
   tokens, execution fails safely rather than computing loss over corrupted token offsets.

3. **Overlength Rejection Policy:**
   Examples exceeding the configured `max_length` (e.g., 512 tokens) are rejected
   explicitly during preprocessing rather than silently truncated mid-sentence,
   preserving sentence completeness.

4. **Deferred Batch Padding:**
   Individual examples are produced unpadded. Dynamic batch-level padding is deferred
   to data collation during training, maximizing GPU throughput.




## Batch Collation and Padding

### Objective

Prepare variable-length tokenized training examples for batch processing while preserving assistant-only loss masking established during preprocessing.

### Implementation

Implemented `NAtlasDataCollator` in `foundry/training/collator.py`.

The collator accepts `TokenizedTrainingExample` instances and returns PyTorch tensors for `input_ids`, `attention_mask`, and `labels`.

The implementation:
- Pads examples to the longest sequence in the batch.
- Supports left and right padding based on the tokenizer configuration.
- Preserves existing prompt masking and assistant-response labels.
- Rejects empty batches, inconsistent sequence lengths, and missing padding-token configuration.
- Assigns `-100` to padded label positions so padding does not contribute to the training loss.

### N-ATLaS Padding Decision

The real N-ATLaS tokenizer reports the following configuration:

- Tokenizer class: `TokenizersBackend`
- Padding token: `<|eot_id|>`
- Padding token ID: `128009`
- EOS token: `<|eot_id|>`
- EOS token ID: `128009`
- Padding side: right

The existing tokenizer padding token will be reused. No additional token will be introduced, and no model embedding resize is required for padding.

Because the padding token shares its ID with the end-of-turn token, token IDs alone cannot distinguish padding from genuine conversation endings. The attention mask and labels must therefore be constructed correctly: padding positions receive attention-mask value `0` and label `-100`, while genuine assistant end-of-turn tokens remain attended and supervised.

### Verification

The preprocessing and batch-collator test suites passed in the Kaggle environment. The reported full local API test suite also passed with 88 tests.

The unit tests cover sequence padding, tensor shapes and data types, preservation of prompt masking, left-padding behavior, empty-batch rejection, inconsistent sequence lengths, and missing padding-token configuration.

### Checkpoint 1I.3 — Real-Tokenizer Preprocessing and Collation Integration

- **Status:** Passed in Kaggle.
- **Verified:**
  - Loaded the real `NCAIR1/N-ATLaS` tokenizer.
  - Confirmed the existing `<|eot_id|>` token is used for padding, with token ID `128009` and right padding.
  - Successfully preprocessed two representative Igala records.
  - Verified that prompt tokens are excluded from the training loss and assistant response tokens are supervised.
  - Successfully collated both examples into tensors with shape `(2, 51)`.
  - Confirmed that the input IDs, attention mask, and labels have matching shapes and that padding labels are masked with `-100`.
- **Implementation Note:** The preprocessor extracts `input_ids` and `attention_mask` directly from the mapping returned by `apply_chat_template(..., return_dict=True)`. The prefix assertion remains enabled to prevent unsafe assistant-only label construction.
- **Limitations:** This checkpoint verifies preprocessing and collation only. It does not establish training convergence, model improvement, or Igala language quality.
- **Next Checkpoint:** Connect the verified data pipeline to the N-ATLaS LoRA training configuration and validate a single forward pass before attempting training.


### Model Setup and LoRA Validation

- **Status:** Passed in Kaggle.

#### Model Environment
- **Base model:** `NCAIR1/N-ATLaS`
- **GPU:** Tesla T4, with the model distributed across the available GPU devices.
- **Model precision:** FP16.
- **LoRA method:** Standard LoRA, not QLoRA.
- **Target modules:** `q_proj` and `v_proj`.

#### Verified Results
- Loaded the base model successfully.
- Confirmed that both configured LoRA target modules exist in the model.
- Attached LoRA adapters successfully.
- PEFT reported 6,815,744 trainable parameters out of 8,037,076,992 total parameters (~0.0848%).
- Processed a batch of two synthetic Igala examples with shape `(2, 51)`.
- Completed a forward pass with a finite loss of `6.752442359924316`.
- Completed backward propagation successfully.
- All 128 trainable LoRA tensors had gradients; 64 had nonzero gradients for this batch.

#### Implementation Notes
- The existing experiment configuration is reused for adaptation settings.
- The existing preprocessor and data collator supply the training batch.
- FP16 is used for the current T4 environment.
- QLoRA remains unsupported until a separate quantized model-loading path is implemented and tested.

#### Limitations
- This checkpoint validates model setup and gradient flow only.
- No optimizer update or full training run has been completed.
- The observed loss is a smoke-test result, not evidence of improved Igala language performance.

**Next Checkpoint:** Implement a reproducible training runner with optimizer updates, gradient accumulation, validation, checkpoint saving, and experiment artifact tracking.