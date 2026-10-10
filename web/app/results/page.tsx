import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsList } from "@/components/results/results-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getResults } from "@/lib/api/results";

export const metadata: Metadata = {
  title: "Results | N-ATLAS Language Foundry",
  description: "Base vs adapted N-ATLAS evaluation results.",
};

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Results</h2>
        <p className="mt-1 text-sm text-muted">
          Base vs adapted N-ATLAS evaluations.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-40" />}>
        <ResultsSection />
      </Suspense>
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
