import axios from "axios";

const baseURL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiListResponse<T> = {
  items: T[];
  total: number;
};

export type LanguageStatus =
  | "discovered"
  | "registered"
  | "data_available"
  | "ready"
  | "adapting"
  | "adapted";

export type LanguageDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: LanguageStatus;
  created_at: string;
  updated_at: string;
};

export type DatasetStatus =
  | "registered"
  | "provenance_checked"
  | "audited"
  | "reviewed"
  | "ready"
  | "rejected";

export type DatasetDto = {
  id: string;
  language_code: string;
  name: string;
  description: string | null;
  format: "jsonl" | "json" | "csv" | "tsv" | "parquet" | "txt";
  source_type: "research" | "community" | "institutional" | "private";
  record_count: number | null;
  local_path: string | null;
  provenance_id: string;
  version: string | null;
  status: DatasetStatus;
  created_at: string;
  updated_at: string;
};

export type SplitStrategy = "random" | "grouped_by_input";

export type DatasetSplitDto = {
  id: string;
  dataset_id: string;
  strategy: SplitStrategy;
  seed: number;
  train_ratio: number;
  validation_ratio: number;
  test_ratio: number;
  total_records: number;
  train_records: number;
  validation_records: number;
  test_records: number;
  created_at: string;
};


export type ExperimentStatus =
  | "queued"
  | "running"
  | "evaluating"
  | "completed"
  | "failed";

export type ExperimentDto = {
  id: string;
  language_code: string;
  base_model: string;
  dataset_ids: string[];
  split_id: string;
  adaptation: {
    method: "lora" | "qlora";
    rank: number;
    alpha: number;
    dropout: number;
    target_modules: string[];
  };
  training: {
    per_device_batch_size: number;
    gradient_accumulation_steps: number;
    learning_rate: number;
    epochs: number;
    warmup_ratio: number;
    weight_decay: number;
    seed: number;
  };
  runtime: {
    hardware: string;
    device: string;
    precision: string | null;
  };
  status: ExperimentStatus;
  base_results: Record<string, unknown> | null;
  adapted_results: Record<string, unknown> | null;
  artifacts: {
    adapter_path: string | null;
    config_path: string | null;
    metrics_path: string | null;
    logs_path: string | null;
  };
  git_commit: string | null;
  created_at: string;
  updated_at: string | null;
};

export type PlaygroundRequest = {
  prompt: string;
  language_code?: string;
  experiment_id?: string;
  max_new_tokens?: number;
  do_sample?: boolean;
};

export type PlaygroundResponse = {
  prompt?: string;
  generated_text?: string;
  language_code?: string;
  model?: string;
  experiment_id?: string | null;
  latency_ms?: number;
};


export const foundryApi = {
  async listLanguages() {
    const response =
      await apiClient.get<ApiListResponse<LanguageDto>>("/languages");
    return response.data;
  },

  async getLanguage(code: string) {
    const response = await apiClient.get<LanguageDto>(
      `/languages/${encodeURIComponent(code)}`,
    );
    return response.data;
  },

  async listDatasets() {
    const response =
      await apiClient.get<ApiListResponse<DatasetDto>>("/datasets");
    return response.data;
  },

  async getDataset(id: string) {
    const response = await apiClient.get<DatasetDto>(
      `/datasets/${encodeURIComponent(id)}`,
    );
    return response.data;
  },

  async listDatasetSplits(datasetId: string) {
    const response = await apiClient.get<ApiListResponse<DatasetSplitDto>>(
      `/datasets/${encodeURIComponent(datasetId)}/splits`,
    );
    return response.data;
  },

  async getSplit(splitId: string) {
    const response = await apiClient.get<DatasetSplitDto>(
      `/splits/${encodeURIComponent(splitId)}`,
    );
    return response.data;
  },


  async listExperiments() {
    const response =
      await apiClient.get<ApiListResponse<ExperimentDto>>("/experiments");
    return response.data;
  },

  async getExperiment(id: string) {
    const response = await apiClient.get<ExperimentDto>(
      `/experiments/${encodeURIComponent(id)}`,
    );
    return response.data;
  },

  async generate(request: PlaygroundRequest) {
    const response = await apiClient.post<PlaygroundResponse>(
      "/playground/generate",
      request,
    );
    return response.data;
  },

};
