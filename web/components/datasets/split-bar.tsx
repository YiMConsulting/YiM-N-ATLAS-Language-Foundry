import type { DatasetSplit } from "@/lib/datasets";

const segments = [
  { key: "train", label: "Train", color: "bg-accent" },
  { key: "validation", label: "Validation", color: "bg-accent/60" },
  { key: "test", label: "Test", color: "bg-amber-500" },
] as const;

export function SplitBar({ split }: { split: DatasetSplit }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Split
        </h3>
        <span className="text-xs text-muted">Test set is held out</span>
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-accent" style={{ width: `${split.train}%` }} />
        <div
          className="bg-accent/60"
          style={{ width: `${split.validation}%` }}
        />
        <div className="bg-amber-500" style={{ width: `${split.test}%` }} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
            <span className="text-muted">{segment.label}</span>
            <span className="font-medium">{split[segment.key]}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
