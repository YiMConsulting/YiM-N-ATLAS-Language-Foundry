import { KvRow } from "@/components/experiments/kv-row";
import type { ExperimentDto } from "@/lib/api-client";

function formatLearningRate(value: number): string {
  return value !== 0 && Math.abs(value) < 0.01
    ? value.toExponential()
    : String(value);
}

export function TrainingSettingsCard({
  experiment,
}: {
  experiment: ExperimentDto;
}) {
  const a = experiment.adaptation;
  const t = experiment.training;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Training Settings
      </h3>
      <dl className="mt-3 divide-y divide-border">
        <KvRow label="Method" value={a.method.toUpperCase()} />
        <KvRow label="Rank / Alpha" value={`${a.rank} / ${a.alpha}`} />
        <KvRow label="Dropout" value={a.dropout} />
        <KvRow label="Target modules" value={a.target_modules.join(", ")} />
        <KvRow
          label="Learning rate"
          value={formatLearningRate(t.learning_rate)}
        />
        <KvRow label="Epochs" value={t.epochs} />
        <KvRow
          label="Batch / Accum"
          value={`${t.per_device_batch_size} / ${t.gradient_accumulation_steps}`}
        />
        <KvRow label="Seed" value={t.seed} />
      </dl>
    </section>
  );
}
