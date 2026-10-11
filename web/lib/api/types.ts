import type {
  DatasetFormat,
  DatasetRecord,
  DatasetSourceType,
} from "@/lib/datasets";

// Shared API contracts per docs/api_contract.md.
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id?: string;
  };
}

export interface DatasetCreate {
  language_code: string;
  name: string;
  description?: string | null;
  format: DatasetFormat;
  source_type: DatasetSourceType;
  provenance_id: string;
  version?: string | null;
}

export interface DatasetRecordImport {
  records: DatasetRecord[];
  mode: "append" | "replace";
}

export interface DatasetImportResult {
  dataset_id: string;
  received: number;
  accepted: number;
  rejected: number;
  errors: unknown[];
}

export interface SplitCreate {
  strategy: "random";
  seed: number;
  train_ratio: number;
  validation_ratio: number;
  test_ratio: number;
}
