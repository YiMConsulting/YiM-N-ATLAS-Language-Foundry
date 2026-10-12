# 01 — Project Vision & Problem Framing

> **National Artificial Intelligence Challenge (NAIC) — Problem Statement 1: Developer Infrastructure**  
> *Author: YiM Consulting Engineering Team*

---

## 1. The Linguistic Landscape of Nigeria

Nigeria represents one of the most linguistically diverse geographies on Earth. Across 36 states and the Federal Capital Territory, more than **500 distinct languages and dialects** are spoken natively by a population exceeding 220 million people. These languages belong to major African language families:
- **Niger-Congo (Benue-Congo, Atlantic-Congo):** Including Yoruba, Igbo, Tiv, Edo, Ibibio, and Efik.
- **Afroasiatic (Chadic):** Dominantly represented by Hausa across northern Nigeria.
- **Nilo-Saharan:** Represented by Kanuri in northeastern Nigeria.

While Hausa, Yoruba, and Igbo represent the three largest demographic blocs, tens of millions of Nigerian citizens communicate daily in indigenous languages that possess minimal digital presence. Languages such as **Tiv** (over 5 million speakers in Benue, Taraba, and Nasarawa states), **Igala** (over 2 million speakers in Kogi state), **Kanuri**, **Ijaw**, **Nupe**, and **Fulfulde** represent vibrant cultural and economic communities that remain severely under-represented in modern natural language processing systems.

---

## 2. The Core Problem: Why Foundation Models Are Not Enough

The release of foundational multilingual models such as `NCAIR1/N-ATLaS` marks a historic milestone for Nigerian artificial intelligence. Developed to advance national sovereign AI capabilities, N-ATLaS establishes an unprecedented open baseline.

However, a foundation model alone cannot solve the low-resource language divide. Building reliable, real-world applications in indigenous languages reveals five systemic infrastructure bottlenecks:

### 1. Severe Data Scarcity & Noisy Corpora
Unlike global languages with billions of web-crawled tokens, Nigerian low-resource corpora often consist of only thousands or low hundreds of thousands of sentence pairs, frequently scraped from religious texts, government notices, or localized parallel exercises. These sources contain inconsistent diacritics, OCR errors, non-standard orthography, and conflicting regional spelling conventions.

### 2. High Risk of Uncontrolled Data Leakage
In low-resource corpora, identical English sentences frequently appear paired with slightly different translations or recorded across multiple source chapters. Standard random train/test splitting routines routinely place identical English source prompts into both training and evaluation partitions. This creates severe data contamination, resulting in artificially inflated benchmark scores that collapse upon real-world deployment.

### 3. Destruction of Tonal Semantics by Generic Tokenization
Most African languages are tonal. In Tiv, tone alterations distinguish grammatical tense, aspect, and lexical meaning. Generic NLP pipelines frequently strip tone marks or tokenize diacritics into fragmented, uncoordinated byte tokens, degrading generation quality and producing nonsensical outputs.

### 4. The Developer Tooling Deficit
Currently, any engineer attempting to adapt N-ATLaS to a new Nigerian language must independently build data cleaning scripts, solve token masking, construct collation pipelines, design training runners, and set up evaluation scripts from scratch. This repetitive, error-prone wheel-reinvention severely limits research productivity and community participation.

### 5. Absence of Human Linguistic Grounding
Automated metrics such as BLEU and chrF are notoriously poor proxies for naturalness, cultural propriety, and syntactic accuracy in African languages. Without systematic, auditable human-in-the-loop review mechanisms, developer teams cannot distinguish authentic idiomatic expressions from literal, awkward translations.

---

## 3. The Solution: N-ATLaS Language Foundry

The **N-ATLaS Language Foundry** is purpose-built developer infrastructure that solves these bottlenecks. Rather than being a one-off translation demo, the Foundry is an extensible, modular software platform that automates and standardizes the entire lifecycle of language-specific adaptation:

```
[ Raw Corpora Ingestion ] ──► [ Provenance & Deduplication ] ──► [ Input-Grouped Splitting ]
                                                                             │
[ Standardized Evaluation ] ◄── [ LoRA Adapter Training ] ◄── [ Loss-Masked Tokenization ]
            │
            ▼
[ Native Review Integration ] ──► [ Versioned Adapter Registry ] ──► [ Developer API / UI ]
```

### Core Value Pillars

1. **Deterministic Data Integrity:** Guarantees repeatable dataset generation with 0% train/val data leakage through cryptographic seeding and input-grouped partitioning.
2. **Parameter-Efficient Specialization (LoRA):** Enables lightweight, modular adaptation ($<30\text{ MB}$ per adapter) on standard commodity GPUs (e.g. NVIDIA Tesla T4) without modifying base model weights or incurring massive training costs.
3. **Loss-Masked Tokenization:** Implements exact prompt prefix boundary assertions and dynamic sequence padding, ensuring that adapters learn target generation rather than echoing prompts.
4. **Human-in-the-Loop Review Infrastructure:** Bridges automated validation with empirical human linguistic judgments, managing review samples, scoring dimensions, and reviewer notes in auditable, sanitized manifests.
5. **Contract-Backed Control Plane:** Exposes RESTful endpoints conforming strictly to typed schemas, separating the metadata control plane from compute-heavy ML execution.

---

## 4. The Specialization Thesis: Language & Dialect Modules

Why train modular adapters rather than retraining a single monolithic model?

1. **Preventing Catastrophic Forgetting:** Fine-tuning an entire foundation model on a small dataset of an under-resourced language degrades its reasoning and multilingual capabilities. LoRA adapters keep base weights frozen, isolating linguistic specialization.
2. **Modular Composition:** A developer serving users in Benue State can dynamically attach the Tiv adapter; a service in Kogi State can load the Igala adapter; all while sharing a single underlying N-ATLaS base deployment.
3. **Dialectal Granularity:** Many Nigerian languages feature distinct dialectal varieties (e.g., Central Tiv vs. peripheral regional variants; Oyo Yoruba vs. Ekiti Yoruba). The Foundry architecture is designed to support versioned dialect adapters once empirical data warrants differentiation.
4. **Rapid Iteration:** Training a 16-rank LoRA adapter on 100k sentence pairs takes hours on a single GPU, compared to weeks of cluster time for base pre-training.

---

## 5. The Pilot Laboratory Language: Tiv

To demonstrate and stress-test the Foundry infrastructure under real-world conditions, the platform implements a complete end-to-end pilot on the **Tiv** language (`tiv`):
- **Why Tiv?** Tiv has an active linguistic community, an established Latin-based orthography with distinct diacritics and tone rules, and an open parallel corpus (MT560) that provides an ideal testbed for evaluating data leakage, loss masking, and human review integration.
- **Scope & Rigor:** The pilot exercises all six pipeline stages: raw ingestion of 184,113 rows, deduplication to 184,099 clean records, 0%-leakage partitioning, LoRA model configuration, human review integration from native linguists (`REV_04`), and evaluation harness standardization.

---

## 6. Alignment with NAIC Problem Statement 1

The Foundry directly fulfills the objectives of **Problem Statement 1 (Developer Infrastructure)** of the National Artificial Intelligence Challenge:
- **Reproducibility:** Code, configs, split metadata, and evaluation harnesses are completely versioned and reproducible.
- **Open Standards:** Built on open-source standards (FastAPI, PyTorch, Transformers, PEFT, Next.js).
- **Extensibility:** Any developer can add a new language configuration (`configs/<lang>_lora.yaml`) and data directory to run the full Foundry workflow.
- **Data Sovereignty & Ethics:** Strict provenance manifests, explicit licensing checks, and privacy-preserving review storage ensure compliance with open data ethics.

---
*Next: Explore the comprehensive system architecture in [02-architecture.md](./02-architecture.md).*
