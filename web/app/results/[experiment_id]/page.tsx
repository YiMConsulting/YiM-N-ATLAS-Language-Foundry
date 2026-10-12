import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/experiments/status-badge";
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
      <div className="space-y-6">
        <Link
          href="/results"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to results
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load results for &ldquo;{experiment_id}&rdquo;: {message}
        </div>
      </div>
    );
  }

  const hasMetrics =
    hasFiniteMetrics(experiment.base_results) ||
    hasFiniteMetrics(experiment.adapted_results);

  return (
    <div className="space-y-6">
      <Link
        href="/results"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to results
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight font-mono">
            Results — {experiment.id}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Language: <span className="uppercase font-mono">{experiment.language_code}</span> · Split:{" "}
            <span className="font-mono text-xs">{experiment.split_id}</span>
          </p>
        </div>
        <StatusBadge status={experiment.status} />
      </div>

      {!hasMetrics ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          <p>
            Evaluation results for experiment{" "}
            <span className="font-mono font-medium text-foreground">
              {experiment.id}
            </span>{" "}
            are not yet available.
          </p>
          <p className="mt-2 text-xs">
            The experiment status is currently{" "}
            <span className="font-medium text-foreground capitalize">
              {experiment.status}
            </span>
            . Verified evaluation metrics will appear once model evaluation has completed.
          </p>
        </div>
      ) : (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Evaluation Metrics
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-2 font-medium">Metric</th>
                  <th className="px-4 py-2 font-medium">Base Model</th>
                  <th className="px-4 py-2 font-medium">Adapted Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 font-medium">Loss</td>
                  <td className="px-4 py-2.5 font-mono text-muted">
                    {formatMetric(experiment.base_results, "loss", 4)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {formatMetric(experiment.adapted_results, "loss", 4)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">BLEU Score</td>
                  <td className="px-4 py-2.5 font-mono text-muted">
                    {formatMetric(experiment.base_results, "bleu_score", 2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {formatMetric(experiment.adapted_results, "bleu_score", 2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">chrF++ Score</td>
                  <td className="px-4 py-2.5 font-mono text-muted">
                    {formatMetric(experiment.base_results, "chrf_score", 2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {formatMetric(experiment.adapted_results, "chrf_score", 2)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">Exact Match Ratio</td>
                  <td className="px-4 py-2.5 font-mono text-muted">
                    {formatMetric(experiment.base_results, "exact_match_ratio", 3)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {formatMetric(experiment.adapted_results, "exact_match_ratio", 3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
