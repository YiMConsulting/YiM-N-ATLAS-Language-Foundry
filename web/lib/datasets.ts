export type DatasetQualityStatus = "passed" | "needs_review" | "failed";

export type DatasetQuality = {
  missing_values: number;
  empty_records: number;
  duplicates: number;
  malformed_rows: number;
  possible_non_language: number;
};

export type DatasetSplit = {
  train: number;
  validation: number;
  test: number;
};

export type Dataset = {
  dataset_id: string;
  name: string;
  source: string;
  license: string;
  rows: number;
  quality_status: DatasetQualityStatus;
  intended_use_allowed: boolean;
  source_url: string;
  version_date: string;
  manifest_hash: string;
  split: DatasetSplit;
  quality: DatasetQuality;
};

export const datasets: Dataset[] = [
  {
    dataset_id: "igl-parallel-v1",
    name: "Igala Parallel Instructions V1",
    source: "YiM Consulting & Community Native Speakers",
    license: "CC-BY-4.0",
    rows: 4850,
    quality_status: "passed",
    intended_use_allowed: true,
    source_url: "https://huggingface.co/datasets/YiMConsulting/igala-instructions",
    version_date: "2026-10-09",
    manifest_hash: "sha256:d8a9f3b18c0e29d71c4fa4891bca7f9184b2c451",
    split: {
      train: 80,
      validation: 10,
      test: 10,
    },
    quality: {
      missing_values: 0,
      empty_records: 0,
      duplicates: 0,
      malformed_rows: 0,
      possible_non_language: 0,
    },
  },
  {
    dataset_id: "igl-monolingual-curated",
    name: "Igala Monolingual Domain Corpus",
    source: "Verified Oral & Written Igala Archives",
    license: "Open Data Commons / CC-BY-4.0",
    rows: 12400,
    quality_status: "passed",
    intended_use_allowed: true,
    source_url: "https://huggingface.co/datasets/YiMConsulting/igala-monolingual",
    version_date: "2026-10-08",
    manifest_hash: "sha256:9c7e12b4501a18290fbbcd514210e7193c72b1aa",
    split: {
      train: 85,
      validation: 10,
      test: 5,
    },
    quality: {
      missing_values: 0,
      empty_records: 0,
      duplicates: 4,
      malformed_rows: 0,
      possible_non_language: 0,
    },
  },
];
