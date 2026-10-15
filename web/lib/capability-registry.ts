export type CapabilityStatus =
  | "available"      // Implemented and verified by code, tests, or artifacts
  | "manual"         // Underlying function works via CLI/notebook/managed script, not automated in UI
  | "in-development" // Concrete implementation in progress with staged code
  | "planned";       // Target vision, not yet implemented

export type CapabilityCategory =
  | "data"
  | "review"
  | "training"
  | "inference"
  | "evaluation"
  | "platform";

export type CapabilityEvidence = {
  label: string;
  type: "test" | "code" | "artifact" | "doc";
  ref: string;
};

export type CapabilityRecord = {
  id: string;
  name: string;
  summary: string;
  status: CapabilityStatus;
  isExperimental?: boolean;
  category: CapabilityCategory;
  implementedScope: string;
  limitations: string;
  nextMilestone?: string;
  dependencies?: string[];
  relatedRoute?: string;
  evidence: CapabilityEvidence[];
  lastVerifiedAt?: string;
};

export type LifecycleStage = {
  step: number;
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  executionMode: "ui" | "manual-cli" | "cloud-gpu" | "planned";
  relatedRoute?: string;
};

export const CAPABILITIES: CapabilityRecord[] = [
  // --- Data & Splits ---
  {
    id: "lang-registry",
    name: "Language Registry & Adaptation Readiness",
    summary:
      "Taxonomy, orthographic profiles, variety metadata, and readiness scoring across 5 Nigerian languages.",
    status: "available",
    category: "data",
    implementedScope:
      "REST endpoints (GET /api/v1/languages, /api/v1/languages/{code}) exposing Tiv (pilot), Igala, Yoruba, Hausa, and Igbo with orthography notes and resource levels.",
    limitations:
      "Tiv is currently the sole active pilot with live training and review artifacts. Other languages have registered metadata but no processed training corpora in this repository yet.",
    nextMilestone: "Ingest parallel sentence corpus for Igala (igl).",
    dependencies: ["Language schema v1"],
    relatedRoute: "/languages",
    evidence: [
      { label: "Unit Tests", type: "test", ref: "tests/test_language_schema.py" },
      { label: "Registry Module", type: "code", ref: "foundry/languages/registry.py" },
      { label: "Specification", type: "doc", ref: "docs-main/01-language-schema.md" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "input-grouped-split",
    name: "Input-Grouped Deterministic Splitting",
    summary:
      "Strict deduplication and grouping by source input to guarantee zero cross-partition leakage between train, validation, and test sets.",
    status: "available",
    category: "data",
    implementedScope:
      "Python pipeline in foundry/datasets/builder.py & split.py. Pruned 14 identical pairs, sealed 75/10/15 partition on Tiv MT560 corpus (152 train / 20 val / 31 test pairs).",
    limitations:
      "Splitting is executed via Python scripts/CLI. Web UI provides inspection of split distributions and hashes, but does not yet trigger new split generation.",
    nextMilestone: "Async API job to trigger split creation from raw uploaded CSV/JSONL files.",
    dependencies: ["Dataset builder core"],
    relatedRoute: "/datasets",
    evidence: [
      { label: "Split Unit Tests", type: "test", ref: "tests/test_dataset_split.py" },
      { label: "Builder Unit Tests", type: "test", ref: "tests/test_dataset_builder.py" },
      { label: "Sealed Metadata", type: "artifact", ref: "data/processed/tiv/tiv_split_metadata.json" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "data-provenance",
    name: "Provenance & Cryptographic Checksums",
    summary:
      "SHA-256 artifact verification, upstream source tracking (MT560, JW300, JW.ORG), and CC BY-SA 4.0 license audits.",
    status: "available",
    category: "data",
    implementedScope:
      "Artifact manifests with SHA-256 hashes for all partition files, rendered in Dataset detail and Evidence Dossier.",
    limitations:
      "Currently tracks local file-based manifests. Integration with S3/GCS remote object storage is planned.",
    relatedRoute: "/datasets",
    evidence: [
      { label: "Manifest Data", type: "artifact", ref: "data/processed/tiv/tiv_split_metadata.json" },
      { label: "Provenance Spec", type: "doc", ref: "docs-main/02-data-curation-and-deduplication.md" },
    ],
    lastVerifiedAt: "2026-10-14",
  },

  // --- Linguistic Review ---
  {
    id: "human-review-evidence",
    name: "Native Speaker Review Dossier",
    summary:
      "Detailed linguistic audit metrics and individual annotated sentence pairs produced by verified native speakers.",
    status: "available",
    category: "review",
    implementedScope:
      "51 test-split pairs evaluated by native reviewer REV_04 with Likert scores (4.76/5.0 translation accuracy, 4.41 naturalness) and error typology flags.",
    limitations:
      "Evidence represents an audited sample of 51 pairs from the 203-record corpus. It provides empirical verification, but does not represent full-corpus certification.",
    nextMilestone: "Multi-annotator Cohen's kappa inter-rater reliability agreement calculation.",
    dependencies: ["Review schema v1"],
    relatedRoute: "/evidence",
    evidence: [
      { label: "Review Unit Tests", type: "test", ref: "tests/test_human_review_schema.py" },
      { label: "Review Evidence Artifact", type: "artifact", ref: "data/review/tiv_human_review_evidence.json" },
      { label: "Audit Documentation", type: "doc", ref: "docs-main/04-human-review-and-guidelines.md" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "interactive-review-gate",
    name: "Interactive Review Queue & Diacritic Keyboard",
    summary:
      "In-browser triage workspace with specialized Nigerian language tone diacritics and approve/reject/edit workflow.",
    status: "manual",
    category: "review",
    implementedScope:
      "Frontend review portal (/review) with diacritic virtual keys and hotkeys. POST /api/v1/review/submit records decisions in the running container and enforces read-only mode permissions.",
    limitations:
      "Current backend stores review triage decisions in container memory; edits are not yet persisted to a permanent PostgreSQL database. Requires running without READ_ONLY_MODE=true for write access.",
    nextMilestone: "Relational persistence in PostgreSQL with audit log and reviewer assignment queues.",
    dependencies: ["Review API endpoint"],
    relatedRoute: "/review",
    evidence: [
      { label: "API Endpoint Tests", type: "test", ref: "tests/test_human_review_schema.py" },
      { label: "Review API Router", type: "code", ref: "api/routes/review.py" },
    ],
    lastVerifiedAt: "2026-10-14",
  },

  // --- Training & Adaptation ---
  {
    id: "loss-masking",
    name: "Assistant-Only Loss Masking & Right-Padding",
    summary:
      "Tokenization and collation pipeline that sets prompt tokens to -100 so gradient updates only backpropagate on target language responses.",
    status: "available",
    category: "training",
    implementedScope:
      "foundry/training/preprocessing.py and collator.py configured for Llama-3 chat template with <|start_header_id|> and <|eot_id|> delimiters.",
    limitations:
      "Preprocessing runs as a Python module in the training pipeline; not yet accessible as a standalone web playground preview.",
    dependencies: ["Transformers / PyTorch"],
    evidence: [
      { label: "Preprocessing Tests", type: "test", ref: "tests/test_natlas_preprocessing.py" },
      { label: "Collator Tests", type: "test", ref: "tests/test_natlas_collator.py" },
      { label: "Tokenization Pipeline", type: "code", ref: "foundry/training/preprocessing.py" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "lora-runner",
    name: "LoRA Adaptation Execution (CLI & Cloud GPU)",
    summary:
      "PEFT Parameter-Efficient Fine-Tuning pipeline adapting N-ATLaS 8B via LoRA (r=16, alpha=32, target all linear modules).",
    status: "manual",
    category: "training",
    implementedScope:
      "foundry/training/runner.py verified with 4-step optimizer smoke run locally. Generates standard Hugging Face PEFT adapter directory.",
    limitations:
      "Full multi-epoch adaptation requires 18–28 hours of dedicated GPU compute (Tesla T4 / A100). The web frontend does not initiate cloud training runs directly; runs are triggered manually via CLI or Colab notebook.",
    nextMilestone: "Celery/Redis worker daemon to accept adaptation jobs from UI.",
    dependencies: ["PyTorch", "PEFT", "Transformers", "Hardware GPU"],
    relatedRoute: "/experiments",
    evidence: [
      { label: "Trainer Code", type: "code", ref: "foundry/training/runner.py" },
      { label: "Training Spec", type: "doc", ref: "docs-main/03-adaptation-recipe-and-training.md" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "async-training-queue",
    name: "Automated Asynchronous Training Queue",
    summary:
      "One-click job dispatch from dashboard, automated GPU worker orchestration, and live training telemetry streaming.",
    status: "planned",
    category: "training",
    implementedScope:
      "Detailed architectural design documented in Section 11 of the technical roadmap (Celery/Redis worker pool + WebSocket loss streaming).",
    limitations:
      "Not implemented in the current prototype. Training jobs must be orchestrated manually via terminal or external notebooks.",
    nextMilestone: "Deploy Celery worker service with Redis broker and job status polling API.",
    dependencies: ["LoRA runner CLI", "Celery", "Redis", "GPU cluster"],
    evidence: [
      { label: "Vision Document", type: "doc", ref: "docs-main/11-future-platform-vision-and-implementation-roadmap.md" },
    ],
  },

  // --- Inference & Playground ---
  {
    id: "inference-proxy",
    name: "Inference Proxy & Standby Guard",
    summary:
      "REST proxy forwarding generation requests to external vLLM/TGI inference engines with automated standby error handling.",
    status: "available",
    category: "inference",
    implementedScope:
      "POST /api/v1/playground/generate in api/routes/playground.py. Gracefully intercepts missing GPU backend, returns 503 Service Unavailable with setup runbook.",
    limitations:
      "In the local development environment, the inference backend defaults to standby mode to preserve developer system RAM and prevent silent GPU allocation failure.",
    dependencies: ["FastAPI proxy", "External vLLM container"],
    relatedRoute: "/playground",
    evidence: [
      { label: "Inference Proxy Tests", type: "test", ref: "tests/test_inference_proxy.py" },
      { label: "Playground Router", type: "code", ref: "api/routes/playground.py" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "streaming-inference",
    name: "Token Streaming & Live Decoding Adjustments",
    summary:
      "Real-time Server-Sent Events (SSE) token stream with interactive temperature, top-p, and repetition penalty controls.",
    status: "in-development",
    category: "inference",
    implementedScope:
      "Frontend playground controls and parameter sliders built. Backend SSE handler staging in api/routes/playground.py.",
    limitations:
      "Full token streaming requires active vLLM service; falls back to single-turn response when backend is in standby mode.",
    nextMilestone: "SSE streaming endpoint integration with mock fallback for local UI testing.",
    dependencies: ["Inference proxy", "FastAPI StreamingResponse"],
    relatedRoute: "/playground",
    evidence: [
      { label: "Playground UI", type: "code", ref: "web/app/playground/page.tsx" },
    ],
  },

  // --- Evaluation ---
  {
    id: "eval-harness",
    name: "Standardized Evaluation Harness",
    summary:
      "Automated prompt builder and metric evaluation computing SacreBLEU, chrF-2++, and exact match accuracy against gold references.",
    status: "available",
    category: "evaluation",
    implementedScope:
      "foundry/evaluation/harness.py verified by unit tests. Generates standardized evaluation results schema matching NIST MT protocols.",
    limitations:
      "CLI-driven harness. Web results page displays recorded benchmark runs, but does not execute new evaluations inside the browser.",
    nextMilestone: "Direct execution of evaluation harness from experiment result records.",
    dependencies: ["SacreBLEU", "chrF"],
    relatedRoute: "/results",
    evidence: [
      { label: "Evaluation Tests", type: "test", ref: "tests/test_evaluation_harness.py" },
      { label: "Harness Code", type: "code", ref: "foundry/evaluation/harness.py" },
      { label: "Evaluation Spec", type: "doc", ref: "docs-main/05-experiment-and-evaluation.md" },
    ],
    lastVerifiedAt: "2026-10-14",
  },
  {
    id: "comparative-benchmarks",
    name: "Base vs. Adapted Comparative Benchmarks",
    summary:
      "Head-to-head empirical comparison of raw base model vs. LoRA-adapted checkpoints on held-out test splits.",
    status: "manual",
    isExperimental: true,
    category: "evaluation",
    implementedScope:
      "Evaluation script scripts/run_eval.py exists and generates comparison tables.",
    limitations:
      "Experimental qualification: Preliminary smoke-run BLEU scores were invalidated due to a prompt formatting defect in earlier testing. Formal re-evaluation on the held-out test split is currently pending GPU re-run.",
    nextMilestone: "Execute re-evaluation run with corrected chat template on held-out test split.",
    dependencies: ["Evaluation harness", "LoRA checkpoint"],
    relatedRoute: "/results",
    evidence: [
      { label: "Evaluation Script", type: "code", ref: "scripts/run_eval.py" },
      { label: "Experiment Doc", type: "doc", ref: "docs-main/05-experiment-and-evaluation.md" },
    ],
  },

  // --- Platform Vision ---
  {
    id: "adapter-hub",
    name: "Foundry Adapter Hub & Publication Registry",
    summary:
      "Versioned adapter catalog with Hugging Face Hub synchronization, cryptographic artifact signing, and lineage tracking.",
    status: "planned",
    category: "platform",
    implementedScope:
      "Product specification in Section 11 of documentation. Design defines model card generation and Hub upload.",
    limitations:
      "Target capability. Checkpoints currently remain in local directory storage.",
    nextMilestone: "Export pipeline module to push LoRA weights to Hugging Face Hub with automated model cards.",
    evidence: [
      { label: "Platform Roadmap", type: "doc", ref: "docs-main/11-future-platform-vision-and-implementation-roadmap.md" },
    ],
  },
  {
    id: "web-dataset-ingestion",
    name: "Web-Based Dataset Ingestion & Validation Wizard",
    summary:
      "Browser drag-and-drop CSV/TSV/JSONL ingestion with automatic UTF-8 validation, encoding repair, and duplicate detection.",
    status: "planned",
    category: "platform",
    implementedScope:
      "Specification outlined in future vision. Current ingestion requires placing raw files in data/raw and running builder CLI.",
    limitations:
      "Currently requires local terminal access and Python virtual environment.",
    nextMilestone: "Build multipart upload endpoint with stream validation.",
    evidence: [
      { label: "Architecture Spec", type: "doc", ref: "docs-main/11-future-platform-vision-and-implementation-roadmap.md" },
    ],
  },
  {
    id: "multitenant-governance",
    name: "Enterprise Multi-Tenancy & Compute Quotas",
    summary:
      "Role-based access control (Admin, Linguist, Engineer), audit log immutability, and per-tenant GPU quota enforcement.",
    status: "planned",
    category: "platform",
    implementedScope:
      "Target enterprise capability. Current application operates in single-workspace mode with read-only permission simulation.",
    limitations:
      "No authentication server or user directory integrated in current version.",
    evidence: [
      { label: "Roadmap Section 11", type: "doc", ref: "docs-main/11-future-platform-vision-and-implementation-roadmap.md" },
    ],
  },
];

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    step: 1,
    id: "select-language",
    name: "Select Language",
    description: "Inspect language taxonomy, orthography notes, and adaptation readiness score.",
    status: "available",
    executionMode: "ui",
    relatedRoute: "/languages",
  },
  {
    step: 2,
    id: "prepare-data",
    name: "Prepare & Audit Data",
    description: "Strict deduplication, input-grouped 75/10/15 splitting, and cryptographic SHA-256 manifest.",
    status: "available",
    executionMode: "manual-cli",
    relatedRoute: "/datasets",
  },
  {
    step: 3,
    id: "review-validate",
    name: "Review & Validate",
    description: "Native speaker linguistic verification gate with Likert scoring and error typology flags.",
    status: "available",
    executionMode: "ui",
    relatedRoute: "/evidence",
  },
  {
    step: 4,
    id: "build-version",
    name: "Build Dataset Version",
    description: "Seal deterministic dataset split with zero cross-split leakage for reproducibility.",
    status: "manual",
    executionMode: "manual-cli",
    relatedRoute: "/datasets",
  },
  {
    step: 5,
    id: "configure-adaptation",
    name: "Configure Adaptation",
    description: "Set LoRA hyper-parameters (rank, alpha, target modules) and assistant loss masking.",
    status: "available",
    executionMode: "manual-cli",
    relatedRoute: "/experiments",
  },
  {
    step: 6,
    id: "train-lora",
    name: "Train (LoRA on GPU)",
    description: "Execute fine-tuning on cloud GPU (Tesla T4 / A100; ~18-28h for multi-epoch convergence).",
    status: "manual",
    executionMode: "cloud-gpu",
    relatedRoute: "/experiments",
  },
  {
    step: 7,
    id: "evaluate-results",
    name: "Evaluate & Benchmark",
    description: "Run automated evaluation harness (SacreBLEU, chrF-2++) against held-out gold references.",
    status: "manual",
    executionMode: "manual-cli",
    relatedRoute: "/results",
  },
  {
    step: 8,
    id: "export-publish",
    name: "Export & Publish",
    description: "Export versioned PEFT adapter weights and publish model card to Hugging Face Hub.",
    status: "planned",
    executionMode: "planned",
  },
  {
    step: 9,
    id: "trace-lineage",
    name: "Trace Lineage",
    description: "End-to-end audit trail linking trained checkpoint to exact dataset partition and native reviews.",
    status: "planned",
    executionMode: "planned",
  },
];

export function getCapabilitySummaryStats() {
  const available = CAPABILITIES.filter((c) => c.status === "available").length;
  const manual = CAPABILITIES.filter((c) => c.status === "manual").length;
  const inDev = CAPABILITIES.filter((c) => c.status === "in-development").length;
  const planned = CAPABILITIES.filter((c) => c.status === "planned").length;
  return {
    total: CAPABILITIES.length,
    available,
    manual,
    inDev,
    planned,
  };
}

export function getCapabilitiesByStatus(status?: CapabilityStatus) {
  if (!status) return CAPABILITIES;
  return CAPABILITIES.filter((c) => c.status === status);
}

export function getCapabilitiesByCategory(category?: CapabilityCategory) {
  if (!category) return CAPABILITIES;
  return CAPABILITIES.filter((c) => c.category === category);
}
