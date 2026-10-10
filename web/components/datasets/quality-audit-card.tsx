import type { QualityAudit } from "@/lib/datasets";

type Tone = "good" | "warn" | "bad";

const toneClass: Record<Tone, string> = {
  good: "text-emerald-600 dark:text-emerald-300",
  warn: "text-amber-600 dark:text-amber-300",
  bad: "text-red-600 dark:text-red-300",
};

function toneFor(value: number, badWhenNonZero = false): Tone {
  if (value === 0) {
    return "good";
  }
  return badWhenNonZero ? "bad" : "warn";
}

export function QualityAuditCard({
  quality,
}: {
  quality: QualityAudit | null;
}) {
  if (!quality) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Quality audit
        </h3>
        <p className="mt-4 text-sm text-muted">No audit run yet.</p>
      </section>
    );
  }

  const rows: { label: string; value: number; tone: Tone }[] = [
    { label: "Total records", value: quality.total_records, tone: "good" },
    { label: "Valid records", value: quality.valid_records, tone: "good" },
    {
      label: "Empty records",
      value: quality.empty_records,
      tone: toneFor(quality.empty_records),
    },
    {
      label: "Malformed records",
      value: quality.malformed_records,
      tone: toneFor(quality.malformed_records),
    },
    {
      label: "Missing required fields",
      value: quality.missing_required_fields,
      tone: toneFor(quality.missing_required_fields),
    },
    {
      label: "Duplicate records",
      value: quality.duplicate_records,
      tone: toneFor(quality.duplicate_records),
    },
    {
      label: "Suspected language mismatches",
      value: quality.suspected_language_mismatches,
      tone: toneFor(quality.suspected_language_mismatches, true),
    },
  ];

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Quality audit
        </h3>
        <span className="text-xs capitalize text-muted">
          {quality.status} · {quality.audited_at}
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map(({ label, value, tone }) => (
          <li key={label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">{label}</span>
            <span
              className={`text-sm font-semibold tabular-nums ${toneClass[tone]}`}
            >
              {value}
            </span>
          </li>
        ))}
      </ul>

      {quality.warnings.length > 0 || quality.errors.length > 0 ? (
        <div className="mt-4 space-y-1 text-sm">
          {quality.warnings.map((warning) => (
            <p key={warning} className="text-amber-600 dark:text-amber-300">
              {warning}
            </p>
          ))}
          {quality.errors.map((error) => (
            <p key={error} className="text-red-600 dark:text-red-300">
              {error}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
