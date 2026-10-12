import Link from "next/link";
import { StatusBadge } from "@/components/experiments/status-badge";
import type { ExperimentDto } from "@/lib/api-client";

function formatMetric(
  results: Record<string, unknown> | null | undefined,
  key: string,
  digits: number,
): string {
  if (!results || typeof results !== "object") return "—";
  const val = results[key];
  if (typeof val === "number" && Number.isFinite(val)) {
    return val.toFixed(digits);
  }
  return "—";
}

function hasFiniteMetrics(
  results: Record<string, unknown> | null | undefined,
): boolean {
  if (!results || typeof results !== "object") return false;
  return Object.values(results).some(
    (val) => typeof val === "number" && Number.isFinite(val),
  );
}

export function ResultsList({
  experiments,
}: {
  experiments: ExperimentDto[];
}) {
  if (experiments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
        No evaluation results recorded yet. Completed adaptation experiments with verified evaluation metrics will appear here.
      </div>
    );
  }

  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Experiment</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Evaluation</th>
              <th className="px-4 py-3 font-medium">Base Loss</th>
              <th className="px-4 py-3 font-medium">Adapted Loss</th>
              <th className="px-4 py-3 font-medium">BLEU Score</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp) => {
              const baseLoss = formatMetric(exp.base_results, "loss", 3);
              const adaptedLoss = formatMetric(exp.adapted_results, "loss", 3);
              const bleu = formatMetric(exp.adapted_results, "bleu_score", 1);
              const hasEvaluation =
                hasFiniteMetrics(exp.base_results) ||
                hasFiniteMetrics(exp.adapted_results);

              return (
                <tr
                  key={exp.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/results/${exp.id}`}
                      className="font-mono text-xs font-medium transition-colors hover:text-accent"
                    >
                      {exp.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs uppercase">
                      {exp.language_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        hasEvaluation
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-surface-muted text-muted border border-border"
                      }`}
                    >
                      {hasEvaluation ? "Available" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {baseLoss}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {adaptedLoss}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {bleu}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {experiments.map((exp) => {
          const hasEvaluation =
            hasFiniteMetrics(exp.base_results) ||
            hasFiniteMetrics(exp.adapted_results);

          return (
            <li key={exp.id}>
              <Link
                href={`/results/${exp.id}`}
                className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono text-sm font-medium">{exp.id}</div>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>Language: <span className="font-mono uppercase">{exp.language_code}</span></span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      hasEvaluation
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-surface-muted text-muted"
                    }`}
                  >
                    {hasEvaluation ? "Results Available" : "Evaluation Pending"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
