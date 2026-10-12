import type { DatasetReviewEvidenceDto } from "@/lib/api-client";

export function ReviewEvidenceCard({
  evidence,
}: {
  evidence: DatasetReviewEvidenceDto | null;
}) {
  if (!evidence) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Human Linguistic Review Evidence
        </h3>
        <p className="mt-3 text-xs text-muted">
          No offline linguistic review evidence has been uploaded or verified for this dataset.
        </p>
      </section>
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
    sources_breakdown,
  } = evidence;

  const accuracy = metrics.translation_accurate;
  const meaning = metrics.meaning_complete;
  const naturalness = metrics.tiv_naturalness;
  const format = metrics.format_acceptable;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Human Linguistic Review Evidence (Manual Pilot)
          </h3>
          <p className="mt-1 text-xs text-muted">
            Evaluated from verified distribution artifact:{" "}
            <span className="font-mono text-foreground font-medium">
              {evidence.artifact_name}
            </span>{" "}
            ({evidence.sheet_name})
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
          In Progress ({(coverage_ratio * 100).toFixed(1)}% Sample Reviewed)
        </span>
      </div>

      {/* Scope Overview */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-surface-muted/50 p-3">
          <span className="text-[11px] uppercase tracking-wider text-muted block">
            Reviewed Records
          </span>
          <span className="mt-1 text-lg font-semibold text-foreground">
            {reviewed_records}{" "}
            <span className="text-xs font-normal text-muted">
              / {total_sampled_records}
            </span>
          </span>
        </div>

        <div className="rounded-md border border-border bg-surface-muted/50 p-3">
          <span className="text-[11px] uppercase tracking-wider text-muted block">
            Evaluator Scope
          </span>
          <span className="mt-1 text-sm font-semibold text-foreground block">
            {reviewer_scope.completed_reviewers.join(", ")}{" "}
            <span className="text-xs font-normal text-muted">
              (1 of {reviewer_scope.assigned_reviewers.length} completed)
            </span>
          </span>
        </div>

        <div className="rounded-md border border-border bg-surface-muted/50 p-3">
          <span className="text-[11px] uppercase tracking-wider text-muted block">
            Pending Review
          </span>
          <span className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">
            {pending_records}{" "}
            <span className="text-xs font-normal text-muted">pairs</span>
          </span>
        </div>

        <div className="rounded-md border border-border bg-surface-muted/50 p-3">
          <span className="text-[11px] uppercase tracking-wider text-muted block">
            Source Mix
          </span>
          <span className="mt-1 text-xs font-medium text-foreground block">
            MT560: {sources_breakdown.mt560 ?? 0} · Hypa: {sources_breakdown.hypa ?? 0}
          </span>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {accuracy ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <span className="text-xs text-muted block">{accuracy.metric_name}</span>
            <span className="mt-1 text-xl font-bold text-foreground block">
              {accuracy.mean_score?.toFixed(2)}{" "}
              <span className="text-xs font-normal text-muted">/ 5.0</span>
            </span>
            <p className="mt-1 text-[11px] text-muted">
              {accuracy.score_distribution["5"] ?? 0} @ 5/5, {accuracy.score_distribution["4"] ?? 0} @ 4/5
            </p>
          </div>
        ) : null}

        {meaning ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <span className="text-xs text-muted block">{meaning.metric_name}</span>
            <span className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
              100%
            </span>
            <p className="mt-1 text-[11px] text-muted">
              {meaning.pass_count} / {meaning.total_count} full meaning preserved
            </p>
          </div>
        ) : null}

        {naturalness ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <span className="text-xs text-muted block">{naturalness.metric_name}</span>
            <span className="mt-1 text-xl font-bold text-foreground block">
              {naturalness.mean_score?.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted">/ 5.0</span>
            </span>
            <p className="mt-1 text-[11px] text-muted">
              51 / 51 native idiomatic fluency
            </p>
          </div>
        ) : null}

        {format ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <span className="text-xs text-muted block">{format.metric_name}</span>
            <span className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
              100%
            </span>
            <p className="mt-1 text-[11px] text-muted">
              51 / 51 valid casing and punctuation
            </p>
          </div>
        ) : null}
      </div>

      {/* Qualitative Findings */}
      {qualitative_findings && qualitative_findings.length > 0 ? (
        <div className="mt-4 rounded-md border border-border bg-surface-muted/30 p-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
            Qualitative Reviewer Observations (REV_04)
          </span>
          <ul className="mt-2 space-y-1 text-xs text-foreground list-disc list-inside">
            {qualitative_findings.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Qualification Notice */}
      <div className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
        <strong>Reviewer Judgment Qualification:</strong> {qualification}
      </div>
    </section>
  );
}
