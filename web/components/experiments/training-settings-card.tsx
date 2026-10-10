import { KvRow } from "@/components/experiments/kv-row";
import type { Experiment } from "@/lib/experiments";

function formatLearningRate(value: number): string {
  return value !== 0 && Math.abs(value) < 0.01
    ? value.toExponential()
    : String(value);
}

function methodLabel(method: Experiment["adaptation"]["method"]): string {
  return method === "qlora" ? "QLoRA" : "LoRA";
}

export function TrainingSettingsCard({
  experiment,
}: {
  experiment: Experiment;
}) {
  const adaptation = experiment.adaptation;
  const training = experiment.training;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Training settings
      </h3>
      <dl className="mt-3 divide-y divide-border">
        <KvRow label="Method" value={methodLabel(adaptation.method)} />
        <KvRow
          label="Rank / Alpha"
          value={`${adaptation.rank} / ${adaptation.alpha}`}
        />
        <KvRow label="Dropout" value={adaptation.dropout} />
        <KvRow
          label="Learning rate"
          value={formatLearningRate(training.learning_rate)}
        />
        <KvRow label="Epochs" value={training.epochs} />
        <KvRow
          label="Batch / Accum"
          value={`${training.per_device_batch_size} / ${training.gradient_accumulation_steps}`}
        />
      </dl>
    </section>
  );
}
