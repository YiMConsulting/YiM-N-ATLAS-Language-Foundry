# 05 — Model Adaptation & Evaluation Audit

> **N-ATLaS Language Foundry — Experiment Engineering & Benchmarking**  
> *Author: YiM Consulting Engineering Team*

---

## 1. LoRA Adaptation Configuration

The adaptation pipeline is governed by a versioned configuration specification (`configs/tiv_lora.yaml`):

| Parameter | Pilot Configuration | Rationale & Operational Context |
| :--- | :--- | :--- |
| **Base Model** | `NCAIR1/N-ATLaS` | Official Nigerian Foundation Model (8B Llama-3 architecture) |
| **Adaptation Method** | LoRA (Low-Rank Adaptation) | Freezes base weights; isolates language parameters |
| **LoRA Rank ($r$)** | `16` | Balances representational capacity with parameter efficiency |
| **LoRA Alpha ($\alpha$)** | `32` | Standard $2\times$ scaling factor for gradient stability |
| **LoRA Dropout** | `0.05` | Regularization against overfitting on small parallel batches |
| **Target Modules** | `q_proj`, `v_proj` | Adapts query and value projection layers in self-attention |
| **Per-Device Batch Size** | `1` | Fits within 16 GB VRAM on standard NVIDIA Tesla T4 |
| **Gradient Accumulation** | `8` steps (effective batch size: 8) | Simulates larger batch size for smoother optimization |
| **Learning Rate** | `0.0001` ($1\times 10^{-4}$) | Standard AdamW rate for Llama-based LoRA fine-tuning |
| **Warmup Ratio** | `0.03` | Linear learning rate warmup over initial 3% of steps |
| **Weight Decay** | `0.01` | L2 weight regularization |
| **Target Hardware** | NVIDIA Tesla T4 (FP16) | Standard accessible cloud GPU environment |
| **Status** | **Provisional Pilot Configuration** | Demonstrates technical feasibility; not claimed as optimal |

---

## 2. Audit of the Initial 4-Step Smoke Run (`tiv-lora-smoke-v1`)

During initial pipeline integration in Google Colab, an end-to-end training smoke run was executed to verify hardware compatibility and gradient flow.

### 2.1 Training Run Parameters
- **Run Identifier:** `tiv-lora-smoke-v1`
- **Steps Completed:** **4 optimizer steps** (~16 training examples).
- **Training Loss:** `5.7563`
- **Validation Loss:** `6.7875`
- **Artifact Produced:** `foundry/runs/tiv-lora-smoke-v1/best_adapter/adapter_model.safetensors` (27.28 MB).

### 2.2 Initial 10-Example Diagnostic Comparison
A preliminary diagnostic evaluation was executed comparing the 8-bit quantized base model against the 4-step adapter across 10 validation examples:

| Metric | Base Model (8-bit) | Adapted Model (4-step) | Delta |
| :--- | :--- | :--- | :--- |
| **Exact Match Ratio** | `0.0` (0/10) | `0.0` (0/10) | `0.0` |
| **SacreBLEU** | `0.5306` | `0.5663` | `+0.0357` |
| **chrF** | `10.1615` | `10.4554` | `+0.2939` |
| **Empty Predictions** | `0` (0/10) | `0` (0/10) | `0` |

---

## 3. Identification of the Methodological Flaw

A rigorous audit of the Colab evaluation notebook (`notebooks/tiv_base_vs_adapter_evaluation.ipynb`, Cell 9) uncovered a **fatal methodological defect** in the original evaluation script:

### The Defect: Missing Task Instruction
The generation prompt was originally constructed by passing the raw English sentence directly into the user turn:
```python
# FLAWED CODE FROM ORIGINAL NOTEBOOK:
prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": record["input"]}],
    tokenize=False,
    add_generation_prompt=True,
)
```

Because `NCAIR1/N-ATLaS` is an instruction-tuned assistant, receiving a bare statement like *"This advance knowledge brought with it responsibility ."* caused the model to treat the input as a **conversational remark or inquiry**, rather than a translation directive.

### Consequence: Models Generated English, Not Tiv
Inspection of the saved prediction records (`foundry/evaluations/tiv-lora-smoke-v1/predictions.jsonl`) revealed:
- **Record 1 Input:** *"This advance knowledge brought with it responsibility ."*
  - **Base Output:** *"What advance knowledge is being referred to?"* (English question)
  - **Adapted Output:** *"What was the advance knowledge?"* (English question)
  - **Tiv Target:** *"Er Yehova a pasen mbatomov nav kwagh u ken hemen yô..."*
- **Record 9 Input:** *"4 Coping With Grief"*
  - **Base Output:** *"Coping with grief can be a very difficult and individualized experience..."* (English advice)
  - **Adapted Output:** *"Coping with grief is a process that can take time and patience..."* (English advice)

### Audit Conclusion
The recorded BLEU scores of $\sim 0.53$ and $\sim 0.57$ reflect **near-zero floor noise** resulting from evaluating English conversational responses against Tiv target references. **These numbers do not represent valid evidence of translation quality or model improvement.**

---

## 4. The Corrected Evaluation Harness

To establish rigorous benchmarking integrity, the evaluation harness was redesigned and formalized in `foundry/evaluation/harness.py`.

### 4.1 Standardized Prompt Specification
```python
DEFAULT_TIV_TRANSLATION_TEMPLATE = "Translate the following English text into Tiv:\n{text}"
```
- **Template Identifier:** `v1-explicit-instruction`
- **Rendered Output:**
  ```text
  <|begin_of_text|><|start_header_id|>system<|end_header_id|>

  Cutting Knowledge Date: December 2023
  Today Date: 26 Jul 2024

  <|eot_id|><|start_header_id|>user<|end_header_id|>

  Translate the following English text into Tiv:
  This advance knowledge brought with it responsibility .<|eot_id|><|start_header_id|>assistant<|end_header_id|>
  ```

### 4.2 Architectural Guarantees Enforced
1. **Reference Exclusion:** Guaranteed by design; `DatasetRecord.target` is never passed to prompt formatting.
2. **Model Evaluation Parity:** Baseline and adapter receive byte-identical prompt strings.
3. **Pinned Base Model Revision:** The base model revision is pinned to commit `e294476928aca9030e924ca27bb8e085e8581273` on Hugging Face.
4. **Automated Unit Tests:** Covered by 7 automated tests in `tests/test_evaluation_harness.py`.

---

## 5. Current Evaluation Status & Honest Disclosure

- **Harness Implementation:** Fully implemented, validated, and covered by unit tests.
- **Notebook Synchronization:** Updated `notebooks/tiv_base_vs_adapter_evaluation.ipynb` with explicit prompt construction and revision pinning.
- **Live GPU Re-Evaluation Status:** **Deferred.** Due to local GPU environment unavailability and submission time constraints, live generation on the corrected prompt has been scheduled for a dedicated post-submission GPU batch run.
- **Zero Fabrication Commitment:** In accordance with Foundry policy, no synthetic benchmark scores, fake BLEU gains, or simulated charts have been fabricated to replace the deferred GPU execution.

---
*Next: Read the native linguist evaluation findings in [06-human-review-report.md](./06-human-review-report.md).*
