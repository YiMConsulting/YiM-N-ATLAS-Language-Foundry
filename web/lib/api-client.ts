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

export type LossPoint = {
  step: number;
  loss: number;
};

export type ResultMetric = {
  label: string;
  base: string;
  adapted: string;
  delta: number;
  displayChange: string;
};

export type ResultExample = {
  prompt: string;
  reference: string;
  base_output: string;
  adapted_output: string;
};

export type PlaygroundRequest = {
  prompt: string;
  language_code?: string;
  experiment_id?: string;
  max_new_tokens?: number;
  do_sample?: boolean;
};

/**
 * Expected schema for playground generation response.
 * Note: The backend endpoint POST /api/v1/playground/generate currently returns HTTP 503
 * unconditionally (inference workers are not yet deployed) and does not define an explicit
 * Pydantic response model. The frontend strictly validates that generated_text is present
 * and of string type before treating any response as successful.
 */
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

  async listReviewRequests() {
    const response = await apiClient.get<ApiListResponse<ReviewRequestDto>>(
      "/review/requests",
    );
    return response.data;
  },

  async getReviewRequest(requestId: string) {
    const response = await apiClient.get<ReviewRequestDto>(
      `/review/requests/${encodeURIComponent(requestId)}`,
    );
    return response.data;
  },

  async getReviewSamples(requestId: string) {
    const response = await apiClient.get<
      ApiListResponse<ReviewSampleItemDto> & { review_request_id: string }
    >(`/review/requests/${encodeURIComponent(requestId)}/samples`);
    return response.data;
  },

  async submitReviewDecision(payload: SubmitDecisionPayload) {
    const response = await apiClient.post<ReviewDecisionRecordDto>(
      "/review/decisions",
      payload,
    );
    return response.data;
  },

  async submitReviewBatch(payload: BatchSubmitPayload) {
    const response = await apiClient.post<BatchSubmitResponseDto>(
      "/review/submit",
      payload,
    );
    return response.data;
  },

  async getReviewSummary(requestId: string) {
    const response = await apiClient.get<HumanReviewSummaryDto>(
      `/review/requests/${encodeURIComponent(requestId)}/summary`,
    );
    return response.data;
  },
};

export type ReviewRequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ReviewDecision = "correct" | "incorrect" | "needs_correction";

export type ReviewRequestDto = {
  id: string;
  dataset_id: string;
  reviewer_id: string | null;
  sample_size: number;
  status: ReviewRequestStatus;
  created_at: string;
  updated_at: string | null;
};

export type ReviewSampleItemDto = {
  id: string;
  review_request_id: string;
  record_id: string;
  input_text: string;
  expected_text: string;
  context?: string | null;
  flagged_reason?: string | null;
  sampled_at: string;
};

export type ReviewDecisionRecordDto = {
  id: string;
  review_request_id: string;
  sample_item_id: string;
  decision: ReviewDecision;
  reviewer_id: string | null;
  corrected_text: string | null;
  notes: string | null;
  reviewed_at: string;
};

export type SubmitDecisionPayload = {
  review_request_id: string;
  sample_item_id: string;
  decision: ReviewDecision | "approved" | "rejected";
  reviewer_id?: string;
  corrected_text?: string;
  notes?: string;
};

export type BatchSubmitDecisionItem = {
  sample_id?: string;
  sample_item_id?: string;
  decision: ReviewDecision | "approved" | "rejected";
  suggested_correction?: string;
  corrected_text?: string;
  comment?: string;
  notes?: string;
};

export type BatchSubmitPayload = {
  dataset_id: string;
  reviewer_id: string;
  decisions: BatchSubmitDecisionItem[];
  submitted_at?: string;
};

export type BatchSubmitResponseDto = {
  status: string;
  dataset_id: string;
  reviewer_id: string;
  processed_decisions: number;
  message: string;
  timestamp: string;
};

export type HumanReviewSummaryDto = {
  review_request_id: string;
  total_reviewed: number;
  correct_count: number;
  incorrect_count: number;
  needs_correction_count: number;
  pass_rate: number;
  status: string;
};
