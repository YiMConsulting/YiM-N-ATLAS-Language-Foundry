export type ExperimentStatus =
  | "queued"
  | "running"
  | "evaluating"
  | "completed"
  | "failed";

export type AdaptationMethod = "lora" | "qlora";

export type AdaptationConfig = {
  method: AdaptationMethod;
  rank: number;
  alpha: number;
  dropout: number;
  target_modules: string[];
};

export type TrainingConfig = {
  per_device_batch_size: number;
  gradient_accumulation_steps: number;
  learning_rate: number;
  epochs: number;
  warmup_ratio: number;
  weight_decay: number;
  seed: number;
};

export type RuntimeConfig = {
  hardware: string;
  device: string;
  precision: string | null;
};

export type EvaluationMetrics = {
  loss?: number | null;
  bleu_score?: number | null;
  chrf_score?: number | null;
  exact_match_ratio?: number | null;
  inference_latency_ms?: number | null;
  sanity_check_passed: boolean;
  sample_outputs: Record<string, string>[];
};

export type ExperimentArtifacts = {
  adapter_path?: string | null;
  config_path?: string | null;
  metrics_path?: string | null;
  logs_path?: string | null;
};

export type Experiment = {
  id: string;
  language_code: string;
  base_model: string;
  dataset_ids: string[];
  split_id: string;
  adaptation: AdaptationConfig;
  training: TrainingConfig;
  runtime: RuntimeConfig;
  status: ExperimentStatus;
  base_results: EvaluationMetrics | null;
  adapted_results: EvaluationMetrics | null;
  artifacts: ExperimentArtifacts;
  git_commit: string | null;
  created_at: string;
  updated_at: string | null;
};
