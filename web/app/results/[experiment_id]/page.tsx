import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/experiments/status-badge";
import { Badge } from "@/components/ui/badge";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

type ResultPageProps = {
  params: Promise<{ experiment_id: string }>;
};

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { experiment_id } = await params;
  try {
    const experiment = await foundryApi.getExperiment(experiment_id);
    return {
      title: `Results — ${experiment.id} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Results | N-ATLAS Language Foundry",
    };
  }
}

export const instant = false;

function hasFiniteMetrics(
  results: Record<string, unknown> | null | undefined,
): boolean {
  if (!results || typeof results !== "object") return false;
  return Object.values(results).some(
    (val) => typeof val === "number" && Number.isFinite(val),
  );
}

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

export default async function ResultDetailPage({ params }: ResultPageProps) {
  const { experiment_id } = await params;

  let experiment: ExperimentDto;
  try {
    experiment = await foundryApi.getExperiment(experiment_id);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      notFound();
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to Foundry API.";
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <Link
          href="/results"
          className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          Back to results
        </Link>
        <div className="rounded-lg border border-error-border bg-error-soft p-4 text-xs text-error">
          Failed to load results for &ldquo;{experiment_id}&rdquo;: {message}
        </div>
      </div>
    );
  }

  const hasMetrics =
    hasFiniteMetrics(experiment.base_results) ||
    hasFiniteMetrics(experiment.adapted_results);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <Link
        href="/results"
        className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
      >
        Back to results
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight font-mono text-foreground sm:text-2xl">
              Evaluation — {experiment.id}
            </h1>
            <StatusBadge status={experiment.status} />
          </div>
          <p className="mt-1 text-xs text-foreground-secondary">
            Language: <span className="uppercase font-mono font-medium text-foreground">{experiment.language_code}</span> · Split:{" "}
            <span className="font-mono text-foreground">{experiment.split_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="uppercase font-mono text-xs">
            Base: {experiment.base_model}
          </Badge>
        </div>
      </div>

      {!hasMetrics ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Evaluation Results Pending
          </p>
          <p className="text-xs text-foreground-secondary max-w-md mx-auto leading-relaxed">
            Evaluation metrics for experiment <code className="font-mono text-foreground">{experiment.id}</code> are not yet computed.
            The run status is currently <span className="capitalize font-medium text-foreground">{experiment.status}</span>.
            Verified benchmark scores will be displayed once the evaluation harness completes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Base vs. Adapted Benchmark Comparison
              </h2>
              <p className="text-xs text-foreground-secondary">
                Evaluated against the held-out test split under identical generation constraints.
              </p>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
              Held-out Test Split
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-foreground-muted">
                  <th className="py-2.5 pr-4 font-medium">Metric</th>
                  <th className="px-4 py-2.5 font-medium">Base Model (N-ATLaS 8B)</th>
                  <th className="py-2.5 pl-4 font-medium text-right">Adapted Model (LoRA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">Cross-Entropy Loss</td>
                  <td className="px-4 py-3 font-mono text-foreground-muted">
                    {formatMetric(experiment.base_results, "loss", 4)}
                  </td>
                  <td className="py-3 pl-4 font-mono font-medium text-accent text-right">
                    {formatMetric(experiment.adapted_results, "loss", 4)}
                  </td>
                </tr>
                <tr className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">SacreBLEU Score</td>
                  <td className="px-4 py-3 font-mono text-foreground-muted">
                    {formatMetric(experiment.base_results, "bleu_score", 2)}
                  </td>
                  <td className="py-3 pl-4 font-mono font-medium text-accent text-right">
                    {formatMetric(experiment.adapted_results, "bleu_score", 2)}
                  </td>
                </tr>
                <tr className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">chrF++ Score</td>
                  <td className="px-4 py-3 font-mono text-foreground-muted">
                    {formatMetric(experiment.base_results, "chrf_score", 2)}
                  </td>
                  <td className="py-3 pl-4 font-mono font-medium text-accent text-right">
                    {formatMetric(experiment.adapted_results, "chrf_score", 2)}
                  </td>
                </tr>
                <tr className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">Exact Match Ratio</td>
                  <td className="px-4 py-3 font-mono text-foreground-muted">
                    {formatMetric(experiment.base_results, "exact_match_ratio", 3)}
                  </td>
                  <td className="py-3 pl-4 font-mono font-medium text-accent text-right">
                    {formatMetric(experiment.adapted_results, "exact_match_ratio", 3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
