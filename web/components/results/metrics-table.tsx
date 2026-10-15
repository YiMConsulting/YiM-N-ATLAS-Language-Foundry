import { ChangeValue } from "@/components/results/change-value";
import type { ResultMetric } from "@/lib/api-client";

export function MetricsTable({ metrics }: { metrics: ResultMetric[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-border bg-surface-secondary/50 text-foreground-secondary font-medium">
            <th className="px-5 py-3 font-medium">Evaluation Metric</th>
            <th className="px-4 py-3 font-medium">Base Model</th>
            <th className="px-4 py-3 font-medium">Adapted LoRA</th>
            <th className="px-5 py-3 font-medium">Relative Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {metrics.map((metric) => (
            <tr
              key={metric.label}
              className="hover:bg-surface-secondary/40 transition-colors"
            >
              <td className="px-5 py-3.5 font-medium text-foreground">{metric.label}</td>
              <td className="px-4 py-3.5 font-mono text-foreground-muted">{metric.base}</td>
              <td className="px-4 py-3.5 font-mono text-foreground font-semibold">{metric.adapted}</td>
              <td className="px-5 py-3.5">
                <ChangeValue metric={metric} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
