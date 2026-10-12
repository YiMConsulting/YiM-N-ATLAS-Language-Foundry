import type { DatasetSplitDto } from "@/lib/api-client";

export function SplitBar({ split }: { split: DatasetSplitDto | null }) {
  if (!split) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Verified Dataset Split
          </h3>
          <span className="text-xs text-muted">Verification Status</span>
        </div>
        <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-4 text-sm text-muted">
          No verified split metadata is available for this dataset. Split generation must be run deterministically through the Foundry pipeline before train, validation, and test partitions can be confirmed.
        </div>
      </section>
    );
  }

  const trainPct = (split.train_ratio * 100).toFixed(1);
  const valPct = (split.validation_ratio * 100).toFixed(1);
  const testPct = (split.test_ratio * 100).toFixed(1);

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Verified Dataset Split
          </h3>
          <p className="mt-0.5 text-xs text-muted font-mono">
            {split.id} · strategy: {split.strategy} · seed: {split.seed}
          </p>
        </div>
        <span className="text-xs text-muted">Test set is held out</span>
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className="bg-accent" style={{ width: `${trainPct}%` }} />
        <div className="bg-accent/60" style={{ width: `${valPct}%` }} />
        <div className="bg-amber-500" style={{ width: `${testPct}%` }} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <li className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-muted">Train:</span>
          <span className="font-medium">{split.train_records.toLocaleString()}</span>
          <span className="text-xs text-muted">({trainPct}%)</span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
          <span className="text-muted">Validation:</span>
          <span className="font-medium">{split.validation_records.toLocaleString()}</span>
          <span className="text-xs text-muted">({valPct}%)</span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-muted">Test:</span>
          <span className="font-medium">{split.test_records.toLocaleString()}</span>
          <span className="text-xs text-muted">({testPct}%)</span>
        </li>
      </ul>
    </section>
  );
}
