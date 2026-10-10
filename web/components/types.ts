export type ReviewDecision = 'approved' | 'needs_correction' | 'rejected';

export interface ReviewSample {
  sample_id: string;
  source_text: string; // English
  target_text: string; // Igala
  domain: string;
  confidence_score: number;
}

export interface ReviewItemDecision {
  sample_id: string;
  decision: ReviewDecision;
  comment: string;
  suggested_correction?: string;
}

export interface ReviewSubmissionPayload {
  dataset_id: string;
  reviewer_id: string;
  decisions: ReviewItemDecision[];
  submitted_at: string;
}

export interface ReviewBatchStats {
  total: number;
  reviewed: number;
  approved: number;
  needs_correction: number;
  rejected: number;
  progress_pct: number;
}
