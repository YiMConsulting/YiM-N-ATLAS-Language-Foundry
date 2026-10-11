import type {
  Dataset,
  DatasetProvenance,
  DatasetSplit,
  QualityAudit,
} from "@/lib/datasets";

// Explicit mock data for the pre-backend demo. Data-driven pages must
// use the API service layer (web/lib/api/datasets.ts), not these arrays.

export const mockDatasets: Dataset[] = [
  {
    id: "dataset_example_001",
    language_code: "igl",
    name: "Igala starter corpus",
    description: "Reviewed examples for initial adaptation experiments",
    format: "jsonl",
    source_type: "research",
    record_count: 4210,
    local_path: null,
    provenance_id: "prov_example_001",
    version: "v1",
    status: "ready",
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T12:00:00Z",
  },
];

export const mockProvenance: DatasetProvenance = {
  id: "prov_example_001",
  source_name: "VoiceAfrica Igala",
  source_url: "https://huggingface.co/datasets/voiceafrica-igala",
  license: "CC-BY-4.0",
  version: "v1",
  published_at: "2026-10-01T00:00:00Z",
  retrieved_at: "2026-10-08T00:00:00Z",
  usage_allowed: true,
  usage_notes: null,
  checksum: "a1b2c3d4e5f6",
};

export const mockQualityAudit: QualityAudit = {
  id: "audit_example_001",
  dataset_id: "dataset_example_001",
  status: "warning",
  total_records: 100,
  valid_records: 98,
  empty_records: 0,
  malformed_records: 0,
  missing_required_fields: 0,
  duplicate_records: 2,
  duplicate_rate: 0.02,
  suspected_language_mismatches: 0,
  warnings: ["Duplicate records detected: 2"],
  errors: [],
  audit_version: "1.0",
  audited_at: "2026-10-09T12:00:00Z",
};

export const mockSplit: DatasetSplit = {
  id: "split_example_001",
  dataset_id: "dataset_example_001",
  strategy: "random",
  seed: 42,
  train_ratio: 0.8,
  validation_ratio: 0.1,
  test_ratio: 0.1,
  total_records: 4210,
  train_records: 3368,
  validation_records: 421,
  test_records: 421,
  created_at: "2026-10-09T12:00:00Z",
};
