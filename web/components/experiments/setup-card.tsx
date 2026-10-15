import { KvRow } from "@/components/experiments/kv-row";
import type { ExperimentDto } from "@/lib/api-client";

export function SetupCard({ experiment }: { experiment: ExperimentDto }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-medium text-foreground">
          Environment &amp; Hardware Topology
        </h3>
        <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] font-mono uppercase text-foreground-secondary">
          {experiment.language_code}
        </span>
      </div>
      <dl className="divide-y divide-border text-xs">
        <div className="py-2.5">
          <KvRow label="Target Language" value={experiment.language_code.toUpperCase()} />
        </div>
        <div className="py-2.5">
          <KvRow label="Base Model" value={<span className="font-mono text-xs text-foreground">{experiment.base_model}</span>} />
        </div>
        <div className="py-2.5">
          <KvRow
            label="Corpus Datasets"
            value={<span className="font-mono text-xs text-foreground">{experiment.dataset_ids.join(", ")}</span>}
          />
        </div>
        <div className="py-2.5">
          <KvRow label="Deterministic Split" value={<span className="font-mono text-xs text-foreground">{experiment.split_id}</span>} />
        </div>
        <div className="py-2.5">
          <KvRow
            label="Hardware Target"
            value={`${experiment.runtime.hardware} (${experiment.runtime.device})`}
          />
        </div>
        <div className="py-2.5">
          <KvRow
            label="Compute Precision"
            value={experiment.runtime.precision ?? "bf16"}
          />
        </div>
      </dl>
    </div>
  );
}
