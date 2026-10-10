import { KvRow } from "@/components/experiments/kv-row";
import type { Experiment } from "@/lib/experiments";

export function SetupCard({ experiment }: { experiment: Experiment }) {
  const baseModel =
    experiment.base_model.split("/").pop() ?? experiment.base_model;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Setup
      </h3>
      <dl className="mt-3 divide-y divide-border">
        <KvRow label="Language" value={experiment.language} />
        <KvRow label="Base model" value={baseModel} />
        <KvRow label="Dataset" value={experiment.dataset_ids[0]} />
        <KvRow label="Hardware" value={experiment.hardware} />
        <KvRow label="Seed" value={experiment.hyperparameters.seed} />
      </dl>
    </section>
  );
}
