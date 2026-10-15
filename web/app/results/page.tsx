import type { Metadata } from "next";
import { ResultsList } from "@/components/results/results-list";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Evaluation Results | N-ATLaS Language Foundry",
  description:
    "Comparative benchmark evaluations for base vs. adapted Nigerian language models.",
};

export const instant = false;

export default async function ResultsPage() {
  let experiments: ExperimentDto[] = [];
  let error: string | null = null;

  try {
    const res = await foundryApi.listExperiments();
    experiments = res.items;
  } catch (err: unknown) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to connect to Foundry API.";
  }

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      {/* Header */}
      <div className="space-y-2 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>Evaluation</span>
          <span>/</span>
          <span className="font-medium text-foreground">Benchmark Results</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
          Evaluation Results
        </h1>
        <p className="text-sm text-foreground-secondary max-w-2xl leading-relaxed">
          Standardized translation benchmarks (Cross-Entropy Loss, SacreBLEU,
          chrF++, and Exact Match) evaluated against held-out test partitions.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg bg-surface-secondary/50 p-4 text-xs text-foreground-secondary border border-border">
          <strong className="text-foreground">Service Notice:</strong> Unable to retrieve results ({error}).
        </div>
      ) : (
        <ResultsList experiments={experiments} />
      )}
    </div>
  );
}
