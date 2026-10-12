import { KvRow } from "@/components/experiments/kv-row";
import type { ExperimentDto } from "@/lib/api-client";

export function SetupCard({ experiment }: { experiment: ExperimentDto }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Setup
      </h3>
      <dl className="mt-3 divide-y divide-border">
        <KvRow label="Language" value={experiment.language_code.toUpperCase()} />
        <KvRow label="Base model" value={experiment.base_model} />
        <KvRow
          label="Datasets"
          value={experiment.dataset_ids.join(", ")}
        />
        <KvRow label="Split ID" value={<span className="font-mono text-xs">{experiment.split_id}</span>} />
        <KvRow
          label="Hardware"
          value={`${experiment.runtime.hardware} (${experiment.runtime.device})`}
        />
        <KvRow
          label="Precision"
          value={experiment.runtime.precision ?? "Unavailable"}
        />
      </dl>
    </section>
  );
}
