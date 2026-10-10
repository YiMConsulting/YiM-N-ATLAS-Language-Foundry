import type { ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import type { DatasetProvenance } from "@/lib/datasets";

export function ProvenanceCard({
  provenance,
}: {
  provenance: DatasetProvenance | null;
}) {
  if (!provenance) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Provenance
        </h3>
        <p className="mt-4 text-sm text-muted">
          Provenance not available — waiting on the backend provenance route.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Provenance
      </h3>

      <dl className="mt-4 space-y-3">
        <Row label="Source" value={provenance.source_name} />
        {provenance.source_url ? (
          <Row
            label="Source URL"
            value={
              <a
                href={provenance.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {provenance.source_url}
              </a>
            }
          />
        ) : null}
        <Row label="License" value={provenance.license} />
        <Row label="Version" value={provenance.version ?? "—"} />
        {provenance.checksum ? (
          <Row
            label="Checksum"
            value={<code className="text-sm">{provenance.checksum}</code>}
          />
        ) : null}
        <Row label="Retrieved" value={provenance.retrieved_at} />
      </dl>

      {provenance.usage_allowed ? (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckIcon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Intended use allowed
          </span>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
          <XIcon className="h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
            Review required before use
          </span>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-all text-sm sm:text-right">{value}</dd>
    </div>
  );
}
