export type DatasetFormat =
  | "jsonl"
  | "json"
  | "csv"
  | "tsv"
  | "parquet"
  | "txt";

export type DatasetSourceType =
  | "research"
  | "community"
  | "institutional"
  | "private";

export type DatasetStatus =
  | "registered"
  | "provenance_checked"
  | "audited"
  | "reviewed"
  | "ready"
  | "rejected";

export const datasetStatusLabels: Record<DatasetStatus, string> = {
  registered: "Registered",
  provenance_checked: "Provenance checked",
  audited: "Audited",
  reviewed: "Reviewed",
  ready: "Ready",
  rejected: "Rejected",
};

export type DatasetProvenance = {
  id: string;
  source_name: string;
  source_url: string | null;
  license: string;
  version: string | null;
  published_at: string | null;
  retrieved_at: string;
  usage_allowed: boolean;
  usage_notes: string | null;
  checksum: string | null;
};

export type Dataset = {
  id: string;
  language_code: string;
  name: string;
  description: string | null;
  format: DatasetFormat;
  source_type: DatasetSourceType;
  record_count: number | null;
  local_path: string | null;
  provenance_id: string;
  version: string | null;
  status: DatasetStatus;
  created_at: string;
  updated_at: string;
};

export type DatasetRecord = {
  id: string;
  input: string;
  target: string;
  language_code: string;
};

export type AuditStatus = "passed" | "warning" | "failed";

export type QualityAudit = {
  id: string;
  dataset_id: string;
  status: AuditStatus;
  total_records: number;
  valid_records: number;
  empty_records: number;
  malformed_records: number;
  missing_required_fields: number;
  duplicate_records: number;
  duplicate_rate: number;
  suspected_language_mismatches: number;
  warnings: string[];
  errors: string[];
  audit_version: string;
  audited_at: string;
};

export type SplitStrategy = "random";

export type DatasetSplit = {
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
