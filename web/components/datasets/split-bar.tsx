import type { DatasetSplit } from "@/lib/datasets";

export function SplitBar({ split }: { split: DatasetSplit | null }) {
  if (!split) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Split
        </h3>
        <p className="mt-4 text-sm text-muted">
          No split created yet — waiting on the backend split-list route.
        </p>
      </section>
    );
  }

  const trainPct = split.train_ratio * 100;
  const validationPct = split.validation_ratio * 100;
  const testPct = split.test_ratio * 100;

  const segments = [
    {
      key: "train",
      label: "Train",
      pct: trainPct,
      count: split.train_records,
      color: "bg-accent",
    },
    {
      key: "validation",
      label: "Validation",
      pct: validationPct,
      count: split.validation_records,
      color: "bg-accent/60",
    },
    {
      key: "test",
      label: "Test",
      pct: testPct,
      count: split.test_records,
      color: "bg-amber-500",
    },
  ] as const;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Split
        </h3>
        <span className="text-xs text-muted">
          seed {split.seed} · {split.strategy} · test set held out
        </span>
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-accent" style={{ width: `${trainPct}%` }} />
        <div className="bg-accent/60" style={{ width: `${validationPct}%` }} />
        <div className="bg-amber-500" style={{ width: `${testPct}%` }} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
            <span className="text-muted">{segment.label}</span>
            <span className="font-medium">
              {segment.count.toLocaleString()} ({segment.pct.toFixed(0)}%)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
