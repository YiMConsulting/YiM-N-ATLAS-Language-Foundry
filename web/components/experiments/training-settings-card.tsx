import { KvRow } from "@/components/experiments/kv-row";
import type { Experiment } from "@/lib/experiments";

function formatLearningRate(value: number): string {
  return value !== 0 && Math.abs(value) < 0.01
    ? value.toExponential()
    : String(value);
}

export function TrainingSettingsCard({
  experiment,
}: {
  experiment: Experiment;
}) {
  const h = experiment.hyperparameters;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Training settings
      </h3>
      <dl className="mt-3 divide-y divide-border">
        <KvRow label="Method" value={`${h.adapter_method} (4-bit)`} />
        <KvRow label="Rank / Alpha" value={`${h.rank} / ${h.alpha}`} />
        <KvRow label="Dropout" value={h.dropout} />
        <KvRow
          label="Learning rate"
          value={formatLearningRate(h.learning_rate)}
        />
        <KvRow label="Epochs" value={h.epochs} />
        <KvRow
          label="Batch / Accum"
          value={`${h.batch_size} / ${h.gradient_accumulation_steps}`}
        />
      </dl>
    </section>
  );
}
