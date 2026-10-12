import type { DatasetDto } from "@/lib/api-client";

export function QualityAuditCard({ dataset }: { dataset: DatasetDto }) {
  const isAudited =
    dataset.status === "audited" ||
    dataset.status === "reviewed" ||
    dataset.status === "ready";

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Quality Audit
        </h3>
        <span className="text-xs text-muted">
          {isAudited ? "Audited" : "Pending Audit"}
        </span>
      </div>

      <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-4 text-sm text-muted">
        {isAudited ? (
          <p>
            This dataset is marked as audited, but detailed syntactic and diacritic check scores have not yet been exposed via the API.
          </p>
        ) : (
          <p>
            Quality audit has not yet been executed for this dataset. Detailed checks for empty records, duplicates, formatting, and language consistency will appear once automated auditing is performed.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted">
        <div className="flex justify-between">
          <span>Automated quality checks:</span>
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {isAudited ? "Completed" : "Not performed"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Linguistic review:</span>
          <span className="font-medium text-muted">
            {dataset.status === "reviewed" || dataset.status === "ready"
              ? "Completed"
              : "Pending"}
          </span>
        </div>
      </div>
    </section>
  );
}
