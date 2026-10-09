import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExampleBrowser } from "@/components/results/example-browser";
import { MetricsTable } from "@/components/results/metrics-table";
import { experimentResults } from "@/lib/results";

type ResultPageProps = {
  params: Promise<{ experiment_id: string }>;
};

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { experiment_id } = await params;
  const result = experimentResults.find(
    (item) => item.experiment_id === experiment_id,
  );

  return {
    title: result
      ? `Results — ${result.experiment_id} | N-ATLAS Language Foundry`
      : "Results | N-ATLAS Language Foundry",
  };
}

export function generateStaticParams() {
  return experimentResults.map((result) => ({
    experiment_id: result.experiment_id,
  }));
}

export default async function ResultDetailPage({ params }: ResultPageProps) {
  const { experiment_id } = await params;
  const result = experimentResults.find(
    (item) => item.experiment_id === experiment_id,
  );

  if (!result) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/results"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to results
      </Link>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Results — {result.experiment_id}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Same held-out test set ({result.test_examples} examples), same
          evaluation process.
        </p>
      </div>

      <MetricsTable metrics={result.metrics} />
      <ExampleBrowser examples={result.examples} />
    </div>
  );
}
