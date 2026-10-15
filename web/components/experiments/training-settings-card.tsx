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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-medium text-foreground">
          LoRA Hyperparameters &amp; Schedule
        </h3>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent">
          r={a.rank} &alpha;={a.alpha}
        </span>
      </div>
      <dl className="divide-y divide-border text-xs">
        <div className="py-2.5">
          <KvRow label="Adaptation Method" value={a.method.toUpperCase()} />
        </div>
        <div className="py-2.5">
          <KvRow label="LoRA Rank / Alpha" value={`${a.rank} / ${a.alpha}`} />
        </div>
        <div className="py-2.5">
          <KvRow label="Adapter Dropout" value={a.dropout} />
        </div>
        <div className="py-2.5">
          <KvRow label="Target Modules" value={<span className="font-mono text-xs text-foreground">{a.target_modules.join(", ")}</span>} />
        </div>
        <div className="py-2.5">
          <KvRow
            label="Peak Learning Rate"
            value={<span className="font-mono text-xs text-foreground">{formatLearningRate(t.learning_rate)}</span>}
          />
        </div>
        <div className="py-2.5">
          <KvRow label="Training Epochs" value={t.epochs} />
        </div>
        <div className="py-2.5">
          <KvRow
            label="Batch Size / Accumulation"
            value={`${t.per_device_batch_size} / ${t.gradient_accumulation_steps}`}
          />
        </div>
        <div className="py-2.5">
          <KvRow label="Deterministic Seed" value={<span className="font-mono text-xs text-foreground">{t.seed}</span>} />
        </div>
      </dl>
    </div>
  );
}
