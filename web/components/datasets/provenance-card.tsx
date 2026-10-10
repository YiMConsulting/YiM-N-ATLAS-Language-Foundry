import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import type { Dataset } from "@/lib/datasets";

export function ProvenanceCard({ dataset }: { dataset: Dataset }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Provenance
      </h3>

      <dl className="mt-4 space-y-3">
        <Row
          label="Source URL"
          value={
            <a
              href={dataset.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {dataset.source_url}
            </a>
          }
        />
        <Row label="License" value={dataset.license} />
        <Row label="Version / date" value={dataset.version_date} />
        <Row
          label="Manifest hash"
          value={<code className="text-sm">{dataset.manifest_hash}</code>}
        />
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <CheckIcon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Intended use allowed
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
