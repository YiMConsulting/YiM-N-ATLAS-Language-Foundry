import type { Metadata } from "next";
import { DatasetList } from "@/components/datasets/dataset-list";
import { getDatasets } from "@/lib/api/datasets";

export const metadata: Metadata = {
  title: "Datasets | N-ATLAS Language Foundry",
  description: "Datasets registered in the N-ATLAS Language Foundry.",
};

export const dynamic = "force-dynamic";

export default async function DatasetsPage() {
  const { items } = await getDatasets();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Datasets</h2>
        <p className="mt-1 text-sm text-muted">
          Datasets registered in the Foundry.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No datasets registered yet.</p>
      ) : (
        <DatasetList datasets={items} />
      )}
    </div>
  );
}
