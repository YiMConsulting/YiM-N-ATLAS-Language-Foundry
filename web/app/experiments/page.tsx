import type { Metadata } from "next";
import { Suspense } from "react";
import { ExperimentsList } from "@/components/experiments/experiments-list";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Experiments | N-ATLAS Language Foundry",
  description: "Record of adaptation runs in the Foundry.",
};

export const instant = false;

export default async function ExperimentsPage() {
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
        <h2 className="text-2xl font-semibold tracking-tight">Experiments</h2>
        <p className="mt-1 text-sm text-muted">
          Record of every adaptation run in the Foundry.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load experiments: {error}
        </div>
      ) : (
        <ExperimentsList experiments={experiments} />
      )}
    </div>
  );
}

async function ExperimentsSection() {
  const { items } = await getExperiments();

  if (items.length === 0) {
    return <p className="text-sm text-muted">No experiments recorded yet.</p>;
  }

  return <ExperimentsList experiments={items} />;
}
