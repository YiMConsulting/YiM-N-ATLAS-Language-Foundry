import { ChangeValue } from "@/components/results/change-value";
import type { ResultMetric } from "@/lib/results";

export function MetricsTable({ metrics }: { metrics: ResultMetric[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-medium">Metric</th>
            <th className="px-4 py-3 font-medium">Base N-ATLAS</th>
            <th className="px-4 py-3 font-medium">Adapted</th>
            <th className="px-4 py-3 font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr
              key={metric.label}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3 font-medium">{metric.label}</td>
              <td className="px-4 py-3 text-muted">{metric.base}</td>
              <td className="px-4 py-3 text-muted">{metric.adapted}</td>
              <td className="px-4 py-3">
                <ChangeValue
                  delta={metric.delta}
                  displayChange={metric.displayChange}
                  direction={metric.direction}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
