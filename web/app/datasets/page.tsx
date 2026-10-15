import type { Metadata } from "next";
import { DatasetList } from "@/components/datasets/dataset-list";
import { foundryApi, type DatasetDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Datasets | N-ATLaS Language Foundry",
  description: "Curated parallel text corpora, provenance records, and deterministic dataset partitions.",
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Editorial Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Datasets
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary max-w-2xl">
          Curated parallel text corpora and instruction datasets for Nigerian low-resource language adaptation.
          Partitioned using deterministic input-grouped splitting to protect against test set contamination.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-error-border bg-error-soft px-4 py-3 text-xs text-error">
          Notice: Failed to load datasets: {error}
        </div>
      ) : (
        <DatasetList datasets={datasets} />
      )}
    </div>
  );
}
