import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isNotFound } from "@/lib/api/errors";
import { ExampleBrowser } from "@/components/results/example-browser";
import { MetricsTable } from "@/components/results/metrics-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getResult, getResults } from "@/lib/api/results";
import { buildExamples, buildMetrics } from "@/lib/results";
import type { Experiment } from "@/lib/experiments";

type ResultPageProps = {
  params: Promise<{ experiment_id: string }>;
};

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { experiment_id } = await params;

  try {
    const result = await getResult(experiment_id);
    return {
      title: `Results — ${result.id} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Results | N-ATLAS Language Foundry",
    };
  }
}

export async function generateStaticParams() {
  const results = await getResults();
  return results.map((result) => ({ experiment_id: result.id }));
}

export default function ResultDetailPage({ params }: ResultPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ResultDetail params={params} />
    </Suspense>
  );
}

async function ResultDetail({ params }: ResultPageProps) {
  const { experiment_id } = await params;

  let result: Experiment | null = null;
  try {
    result = await getResult(experiment_id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }

  if (!result || !result.base_results || !result.adapted_results) {
    notFound();
  }

  const metrics = buildMetrics(result.base_results, result.adapted_results);
  const examples = buildExamples(result.base_results, result.adapted_results);

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
          Results — {result.id}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Same held-out test set, same evaluation process ·{" "}
          {result.language_code}
        </p>
      </div>

      <MetricsTable metrics={metrics} />
      <ExampleBrowser examples={examples} />
    </div>
  );
}
