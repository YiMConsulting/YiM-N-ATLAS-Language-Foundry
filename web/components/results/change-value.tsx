import type { MetricDirection } from "@/lib/results";

export function ChangeValue({
  delta,
  displayChange,
  direction,
}: {
  delta: number;
  displayChange: string;
  direction: MetricDirection;
}) {
  const improved = direction === "higher" ? delta > 0 : delta < 0;
  const regressed = direction === "higher" ? delta < 0 : delta > 0;

  const tone = improved
    ? "text-emerald-600 dark:text-emerald-300"
    : regressed
      ? "text-red-600 dark:text-red-300"
      : "text-muted";

  return (
    <span className={`font-semibold tabular-nums ${tone}`}>
      {displayChange}
    </span>
  );
}
