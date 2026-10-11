import type { Metadata } from "next";
import { Suspense } from "react";
import { DatasetList } from "@/components/datasets/dataset-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getDatasets } from "@/lib/api/datasets";

export const metadata: Metadata = {
  title: "Datasets | N-ATLAS Language Foundry",
  description: "Datasets registered in the N-ATLAS Language Foundry.",
};

export default function DatasetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Datasets</h2>
        <p className="mt-1 text-sm text-muted">
          Datasets registered in the Foundry.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-40" />}>
        <DatasetsSection />
      </Suspense>
    </div>
  );
}

async function DatasetsSection() {
  const { items } = await getDatasets();

  if (items.length === 0) {
    return <p className="text-sm text-muted">No datasets registered yet.</p>;
  }

  return <DatasetList datasets={items} />;
}
