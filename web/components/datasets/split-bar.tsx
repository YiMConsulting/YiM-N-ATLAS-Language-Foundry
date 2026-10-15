import type { DatasetSplitDto } from "@/lib/api-client";

export function SplitBar({ split }: { split: DatasetSplitDto | null }) {
  if (!split) {
    return (
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Dataset Partitions</span>
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] text-foreground-muted">
            Unsplit
          </span>
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          No verified split metadata discovered for this dataset. Deterministic split generation must be
          executed before training and test evaluation partitions can be confirmed.
        </p>
      </div>
    );
  }

  const trainPct = (split.train_ratio * 100).toFixed(1);
  const valPct = (split.validation_ratio * 100).toFixed(1);
  const testPct = (split.test_ratio * 100).toFixed(1);

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground">
              Deterministic Partition Distribution
            </h2>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              Leakage Protected
            </span>
          </div>
          <p className="mt-0.5 text-xs font-mono text-foreground-muted">
            {split.id} · strategy: {split.strategy} · seed: {split.seed}
          </p>
        </div>
        <span className="text-xs text-foreground-secondary">
          Total: <strong className="font-medium text-foreground">{split.total_records.toLocaleString()}</strong> parallel pairs
        </span>
      </div>

      {/* Visual Partition Bar */}
      <div className="space-y-3">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="bg-accent transition-all duration-300"
            style={{ width: `${trainPct}%` }}
            title={`Train: ${trainPct}%`}
          />
          <div
            className="bg-accent/60 transition-all duration-300"
            style={{ width: `${valPct}%` }}
            title={`Validation: ${valPct}%`}
          />
          <div
            className="bg-warning transition-all duration-300"
            style={{ width: `${testPct}%` }}
            title={`Test: ${testPct}%`}
          />
        </div>

        {/* Legend / Metrics */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
            <span className="text-foreground-secondary">Train:</span>
            <span className="font-medium text-foreground">
              {split.train_records.toLocaleString()}
            </span>
            <span className="text-[11px] text-foreground-muted">({trainPct}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent/60 shrink-0" />
            <span className="text-foreground-secondary">Validation:</span>
            <span className="font-medium text-foreground">
              {split.validation_records.toLocaleString()}
            </span>
            <span className="text-[11px] text-foreground-muted">({valPct}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
            <span className="text-foreground-secondary">Held-Out Test:</span>
            <span className="font-medium text-foreground">
              {split.test_records.toLocaleString()}
            </span>
            <span className="text-[11px] text-foreground-muted">({testPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

