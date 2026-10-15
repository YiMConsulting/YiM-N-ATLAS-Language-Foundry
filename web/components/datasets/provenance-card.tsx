import type { ReactNode } from "react";
import type { DatasetDto } from "@/lib/api-client";

export function ProvenanceCard({ dataset }: { dataset: DatasetDto }) {
  const isVerified =
    dataset.status === "provenance_checked" ||
    dataset.status === "audited" ||
    dataset.status === "reviewed" ||
    dataset.status === "ready";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-medium text-foreground">
          Provenance &amp; Source Verification
        </h2>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
          {isVerified ? "Documented" : "Pending Verification"}
        </span>
      </div>

      <dl className="divide-y divide-border text-xs">
        <Row
          label="Provenance Record ID"
          value={<code className="font-mono text-[11px] text-foreground">{dataset.provenance_id}</code>}
        />
        <Row
          label="Source Classification"
          value={<span className="capitalize text-foreground">{dataset.source_type}</span>}
        />
        <Row
          label="File Format"
          value={<span className="font-mono uppercase text-foreground">{dataset.format}</span>}
        />
        <Row
          label="Corpus Version SHA"
          value={
            dataset.version ? (
              <code className="font-mono text-[11px] text-foreground">{dataset.version.slice(0, 12)}</code>
            ) : (
              <span className="text-foreground-muted italic">Unspecified</span>
            )
          }
        />
        <Row
          label="Storage Reference"
          value={
            dataset.local_path ? (
              <code className="font-mono text-[11px] text-foreground-secondary break-all">{dataset.local_path}</code>
            ) : (
              <span className="text-foreground-muted italic">Repository manifest</span>
            )
          }
        />
      </dl>

      <p className="text-xs text-foreground-secondary leading-relaxed pt-1">
        {isVerified
          ? "Source lineage and usage rights are recorded in the Foundry provenance registry. Licensed for research and non-commercial model adaptation."
          : "Provenance record exists; license and usage rights are awaiting audit verification before wide distribution."}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <dt className="text-foreground-secondary">{label}</dt>
      <dd className="font-medium text-foreground text-right">{value}</dd>
    </div>
  );
}
