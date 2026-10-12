import type { Metadata } from "next";
import { DatasetList } from "@/components/datasets/dataset-list";
import { foundryApi, type DatasetDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Datasets | N-ATLAS Language Foundry",
  description: "Datasets registered in the N-ATLAS Language Foundry.",
};

export const instant = false;

export default async function DatasetsPage() {


  let datasets: DatasetDto[] = [];
  let error: string | null = null;

  try {
    const res = await foundryApi.listDatasets();
    datasets = res.items;
  } catch (err: unknown) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to connect to Foundry API.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Datasets</h2>
        <p className="mt-1 text-sm text-muted">
          Datasets registered in the Foundry.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load datasets: {error}
        </div>
      ) : (
        <DatasetList datasets={datasets} />
      )}
    </div>
  );
}
