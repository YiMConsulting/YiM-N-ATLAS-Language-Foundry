import type { Metadata } from "next";
import { ResultsList } from "@/components/results/results-list";
import { experimentResults } from "@/lib/results";

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

      <ResultsList results={experimentResults} />
    </div>
  );
}
