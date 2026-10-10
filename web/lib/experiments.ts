export type ExperimentStatus = "queued" | "running" | "completed" | "failed";

export type Hyperparameters = {
  adapter_method: string;
  rank: number;
  alpha: number;
  dropout: number;
  learning_rate: number;
  epochs: number;
  batch_size: number;
  gradient_accumulation_steps: number;
  seed: number;
};

export type LossPoint = {
  step: number;
  loss: number;
};

export type Experiment = {
  experiment_id: string;
  language: string;
  base_model: string;
  dataset_ids: string[];
  hardware: string;
  train_size: number;
  status: ExperimentStatus;
  created_at: string;
  git_commit: string;
  adapter_path: string;
  hyperparameters: Hyperparameters;
  loss: LossPoint[];
};

export const experiments: Experiment[] = [
  {
    experiment_id: "exp-igl-lora-v1",
    language: "Igala (igl)",
    base_model: "meta-llama/Llama-3.1-8B-Instruct",
    dataset_ids: ["igl-parallel-v1"],
    hardware: "NVIDIA RTX 4090 (24GB)",
    train_size: 3880,
    status: "completed",
    created_at: "2026-10-09T14:30:00Z",
    git_commit: "750348b",
    adapter_path: "experiments/igala-v1/checkpoints/best-adapter",
    hyperparameters: {
      adapter_method: "QLoRA",
      rank: 16,
      alpha: 32,
      dropout: 0.05,
      learning_rate: 0.0002,
      epochs: 3,
      batch_size: 4,
      gradient_accumulation_steps: 4,
      seed: 42,
    },
    loss: [
      { step: 50, loss: 2.85 },
      { step: 100, loss: 2.42 },
      { step: 150, loss: 2.11 },
      { step: 200, loss: 1.88 },
      { step: 250, loss: 1.69 },
      { step: 300, loss: 1.55 },
      { step: 350, loss: 1.44 },
      { step: 400, loss: 1.37 },
      { step: 450, loss: 1.31 },
      { step: 500, loss: 1.28 },
    ],
  },
  {
    experiment_id: "exp-igl-lora-v2-full",
    language: "Igala (igl)",
    base_model: "meta-llama/Llama-3.1-8B-Instruct",
    dataset_ids: ["igl-parallel-v1", "igl-monolingual-curated"],
    hardware: "NVIDIA A100 (80GB)",
    train_size: 14200,
    status: "running",
    created_at: "2026-10-10T06:00:00Z",
    git_commit: "b25c2ae",
    adapter_path: "experiments/igala-v2/checkpoints/latest",
    hyperparameters: {
      adapter_method: "LoRA",
      rank: 32,
      alpha: 64,
      dropout: 0.05,
      learning_rate: 0.0001,
      epochs: 4,
      batch_size: 8,
      gradient_accumulation_steps: 2,
      seed: 42,
    },
    loss: [
      { step: 100, loss: 2.71 },
      { step: 200, loss: 2.29 },
      { step: 300, loss: 1.95 },
      { step: 400, loss: 1.72 },
    ],
  },
];
