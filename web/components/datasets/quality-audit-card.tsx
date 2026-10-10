import type { DatasetQuality } from "@/lib/datasets";

const checks: { key: keyof DatasetQuality; label: string }[] = [
  { key: "missing_values", label: "Missing values" },
  { key: "empty_records", label: "Empty records" },
  { key: "duplicates", label: "Duplicates" },
  { key: "malformed_rows", label: "Malformed rows" },
  { key: "possible_non_language", label: "Possible non-Igala" },
];

function countColor(key: keyof DatasetQuality, value: number): string {
  if (value === 0) {
    return "text-emerald-600 dark:text-emerald-300";
  }
  if (key === "possible_non_language") {
    return "text-red-600 dark:text-red-300";
  }
  return "text-amber-600 dark:text-amber-300";
}

export function QualityAuditCard({ quality }: { quality: DatasetQuality }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Quality audit
      </h3>

      <ul className="mt-4 space-y-3">
        {checks.map(({ key, label }) => {
          const value = quality[key];

          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">{label}</span>
              <span className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold tabular-nums ${countColor(key, value)}`}
                >
                  {value}
                </span>
                {key === "possible_non_language" && value > 0 ? (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-300">
                    flagged
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
