import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsList } from "@/components/results/results-list";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Results | N-ATLAS Language Foundry",
  description: "Base vs adapted N-ATLAS evaluation results.",
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Results</h2>
        <p className="mt-1 text-sm text-muted">
          Base vs adapted N-ATLAS evaluations.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load results: {error}
        </div>
      ) : (
        <ResultsList experiments={experiments} />
      )}
    </div>
  );
}

async function ResultsSection() {
  const results = await getResults();

  if (results.length === 0) {
    return <p className="text-sm text-muted">No completed evaluations yet.</p>;
  }

  return <ResultsList experiments={results} />;
}
