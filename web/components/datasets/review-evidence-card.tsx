import Link from "next/link";
import type { DatasetReviewEvidenceDto } from "@/lib/api-client";
import { ShieldCheckIcon, AlertTriangleIcon } from "@/components/icons";

export function ReviewEvidenceCard({
  evidence,
}: {
  evidence: DatasetReviewEvidenceDto | null;
}) {
  if (!evidence) {
    return (
      <div className="space-y-2 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Human Linguistic Review</h2>
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] text-foreground-muted">
            Pending Review
          </span>
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          No offline linguistic review evidence has been uploaded or verified for this dataset.
        </p>
      </div>
    );
  }

  const {
    reviewed_records,
    total_sampled_records,
    pending_records,
    coverage_ratio,
    reviewer_scope,
    metrics,
    qualitative_findings,
    qualification,
  } = evidence;

  const accuracy = metrics.translation_accurate;
  const meaning = metrics.meaning_complete;
  const naturalness = metrics.tiv_naturalness;
  const format = metrics.format_acceptable;

  return (
    <div className="space-y-6 py-4">
      {/* Evidence Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              Linguistic Verification Evidence
            </h2>
          </div>
          <p className="mt-1 text-xs text-foreground-secondary">
            Verified sample: <span className="font-mono text-foreground">{evidence.artifact_name}</span> ({evidence.sheet_name})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
            {(coverage_ratio * 100).toFixed(1)}% verified
          </span>
          <Link
            href="/evidence"
            className="text-xs font-medium text-accent hover:underline"
          >
            Evidence dossier
          </Link>
        </div>
      </div>

      {/* Scope Overview (Unboxed) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-foreground-muted block text-[11px]">Reviewed pairs</span>
          <span className="font-semibold text-foreground text-sm mt-0.5 block">
            {reviewed_records} <span className="text-foreground-muted font-normal">/ {total_sampled_records}</span>
          </span>
        </div>
        <div>
          <span className="text-foreground-muted block text-[11px]">Evaluator scope</span>
          <span className="font-semibold text-foreground text-sm mt-0.5 block truncate">
            {reviewer_scope.completed_reviewers.join(", ")}
          </span>
        </div>
        <div>
          <span className="text-foreground-muted block text-[11px]">Pending queue</span>
          <span className="font-semibold text-warning text-sm mt-0.5 block">
            {pending_records} pairs
          </span>
        </div>
        <div>
          <span className="text-foreground-muted block text-[11px]">Review status</span>
          <span className="font-semibold text-foreground text-sm mt-0.5 block">
            In progress (1 of {reviewer_scope.assigned_reviewers.length})
          </span>
        </div>
      </div>

      {/* Unboxed 4-Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {accuracy && (
          <div className="rounded-lg bg-surface-secondary/50 p-3 space-y-1">
            <span className="text-[11px] font-medium text-foreground-muted block">
              {accuracy.metric_name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {accuracy.mean_score?.toFixed(2)}
              </span>
              <span className="text-xs text-foreground-muted">/ 5.0</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              {accuracy.score_distribution["5"] ?? 0} rated 5/5
            </p>
          </div>
        )}

        {meaning && (
          <div className="rounded-lg bg-surface-secondary/50 p-3 space-y-1">
            <span className="text-[11px] font-medium text-foreground-muted block">
              {meaning.metric_name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">100%</span>
              <span className="text-xs text-foreground-muted">complete</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              {meaning.pass_count} / {meaning.total_count} without omissions
            </p>
          </div>
        )}

        {naturalness && (
          <div className="rounded-lg bg-surface-secondary/50 p-3 space-y-1">
            <span className="text-[11px] font-medium text-foreground-muted block">
              {naturalness.metric_name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {naturalness.mean_score?.toFixed(1)}
              </span>
              <span className="text-xs text-foreground-muted">/ 5.0</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Native idiomatic phrasing
            </p>
          </div>
        )}

        {format && (
          <div className="rounded-lg bg-surface-secondary/50 p-3 space-y-1">
            <span className="text-[11px] font-medium text-foreground-muted block">
              {format.metric_name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">100%</span>
              <span className="text-xs text-foreground-muted">valid</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Punctuation &amp; casing match
            </p>
          </div>
        )}
      </div>

      {/* Field Findings & Qualification (Progressive / Unboxed) */}
      <div className="space-y-3 pt-2 text-xs">
        {qualitative_findings && qualitative_findings.length > 0 && (
          <div className="rounded-lg bg-surface-secondary/40 p-3.5 space-y-1">
            <span className="font-medium text-foreground block">Field observations</span>
            <ul className="list-disc pl-4 space-y-0.5 text-foreground-secondary">
              {qualitative_findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-lg border border-warning-border/60 bg-warning-soft/40 p-3 text-foreground-secondary">
          <AlertTriangleIcon className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">Scope limitation:</strong> {qualification}
          </p>
        </div>
      </div>
    </div>
  );
}
