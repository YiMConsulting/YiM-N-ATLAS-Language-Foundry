import type { ResultMetric } from "@/lib/results";

export function ChangeValue({ metric }: { metric: ResultMetric }) {
  const tone =
    metric.delta > 0
      ? "text-emerald-600 dark:text-emerald-300"
      : metric.delta < 0
        ? "text-red-600 dark:text-red-300"
        : "text-muted";

  return (
    <span className={`font-semibold tabular-nums ${tone}`}>
      {metric.displayChange}
    </span>
  );
}
