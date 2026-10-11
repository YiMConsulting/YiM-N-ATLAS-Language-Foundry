import type { Metadata } from "next";
import { Suspense } from "react";
import { ExperimentsList } from "@/components/experiments/experiments-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getExperiments } from "@/lib/api/experiments";

export const metadata: Metadata = {
  title: "Experiments | N-ATLAS Language Foundry",
  description: "Adaptation experiment records.",
};

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Experiments</h2>
        <p className="mt-1 text-sm text-muted">
          Record of every adaptation run in the Foundry.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-40" />}>
        <ExperimentsSection />
      </Suspense>
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
