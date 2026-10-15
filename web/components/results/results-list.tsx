import Link from "next/link";
import { StatusBadge } from "@/components/experiments/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        title="No evaluation runs recorded yet"
        description="Formal multi-epoch evaluation requires GPU execution and is scheduled for the upcoming release. In the meantime, you can inspect the diagnostic prompt harness and native review findings in the Evidence Dossier."
        action={
          <Link
            href="/evidence"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <span>Inspect Pilot Evidence Dossier</span>
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-border text-foreground-muted">
              <th className="py-2.5 pr-4 font-medium">Experiment</th>
              <th className="px-4 py-2.5 font-medium">Language</th>
              <th className="px-4 py-2.5 font-medium">Run Status</th>
              <th className="px-4 py-2.5 font-medium">Evaluation State</th>
              <th className="px-4 py-2.5 font-medium">Base Loss</th>
              <th className="px-4 py-2.5 font-medium">Adapted Loss</th>
              <th className="py-2.5 pl-4 font-medium text-right">BLEU Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {experiments.map((exp) => {
              const baseLoss = formatMetric(exp.base_results, "loss", 3);
              const adaptedLoss = formatMetric(exp.adapted_results, "loss", 3);
              const bleu = formatMetric(exp.adapted_results, "bleu_score", 1);
              const hasEvaluation =
                hasFiniteMetrics(exp.base_results) ||
                hasFiniteMetrics(exp.adapted_results);

              const baseLossNum = typeof exp.base_results?.loss === "number" ? exp.base_results.loss : null;
              const adaptedLossNum = typeof exp.adapted_results?.loss === "number" ? exp.adapted_results.loss : null;
              const isImproved = baseLossNum !== null && adaptedLossNum !== null && adaptedLossNum < baseLossNum;

              return (
                <tr
                  key={exp.id}
                  className="transition-colors hover:bg-surface-secondary/50"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/results/${exp.id}`}
                      className="font-mono text-accent hover:underline font-medium"
                    >
                      {exp.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded-full bg-surface-secondary text-foreground-secondary">
                      {exp.language_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exp.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={hasEvaluation ? "success" : "neutral"} size="sm">
                      {hasEvaluation ? "Available" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground-muted">
                    {baseLoss}
                  </td>
                  <td className={`px-4 py-3 font-mono font-medium ${isImproved ? "text-accent" : "text-foreground"}`}>
                    {adaptedLoss}
                  </td>
                  <td className="py-3 pl-4 font-mono text-foreground font-semibold text-right">
                    {bleu}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* List — mobile */}
      <ul className="divide-y divide-border md:hidden">
        {experiments.map((exp) => {
          const hasEvaluation =
            hasFiniteMetrics(exp.base_results) ||
            hasFiniteMetrics(exp.adapted_results);

          return (
            <li key={exp.id} className="py-3">
              <Link
                href={`/results/${exp.id}`}
                className="block space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-xs font-semibold text-accent">{exp.id}</div>
                  <StatusBadge status={exp.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-secondary">
                  <span>Language: <span className="font-mono uppercase font-semibold text-foreground">{exp.language_code}</span></span>
                  <Badge variant={hasEvaluation ? "success" : "neutral"} size="sm">
                    {hasEvaluation ? "Available" : "Pending"}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
