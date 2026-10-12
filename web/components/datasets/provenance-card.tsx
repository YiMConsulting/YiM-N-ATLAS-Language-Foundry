import type { ReactNode } from "react";
import type { DatasetDto } from "@/lib/api-client";

export function ProvenanceCard({ dataset }: { dataset: DatasetDto }) {
  const isProvenanceChecked = dataset.status === "provenance_checked" || dataset.status === "ready";

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Provenance & Licensing
        </h3>
        <span className="font-mono text-xs text-muted">
          {dataset.provenance_id}
        </span>
      </div>

      <dl className="mt-4 space-y-3">
        <Row label="Provenance ID" value={<span className="font-mono">{dataset.provenance_id}</span>} />
        <Row label="Source type" value={<span className="capitalize">{dataset.source_type}</span>} />
        <Row label="Format" value={<span className="font-mono uppercase">{dataset.format}</span>} />
        <Row
          label="Version / Commit"
          value={
            dataset.version ? (
              <code className="text-xs">{dataset.version.slice(0, 12)}</code>
            ) : (
              <span className="text-muted italic">Unavailable</span>
            )
          }
        />
        <Row
          label="License"
          value={
            <span className="text-amber-600 dark:text-amber-400">
              Pending verification
            </span>
          }
        />
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
        <span>
          {isProvenanceChecked
            ? "Provenance has been verified by the Foundry."
            : "Provenance record exists, but license and usage rights are awaiting audit verification."}
        </span>
      </div>
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
