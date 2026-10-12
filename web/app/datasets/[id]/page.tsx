import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatasetStatusBadge } from "@/components/datasets/dataset-status-badge";
import { ProvenanceCard } from "@/components/datasets/provenance-card";
import { QualityAuditCard } from "@/components/datasets/quality-audit-card";
import { SplitBar } from "@/components/datasets/split-bar";
import {
  foundryApi,
  type DatasetDto,
  type DatasetSplitDto,
} from "@/lib/api-client";

type DatasetPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const dataset = await foundryApi.getDataset(id);
    return {
      title: `${dataset.name} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Dataset | N-ATLAS Language Foundry",
    };
  }
}

export const instant = false;

export default async function DatasetDetailPage({ params }: DatasetPageProps) {


  const { id } = await params;

  let dataset: DatasetDto;
  try {
    dataset = await foundryApi.getDataset(id);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      notFound();
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to Foundry API.";
    return (
      <div className="space-y-6">
        <Link
          href="/datasets"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to datasets
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load dataset &ldquo;{id}&rdquo;: {message}
        </div>
      </div>
    );
  }

  let split: DatasetSplitDto | null = null;
  try {
    const splitRes = await foundryApi.listDatasetSplits(id);
    split = splitRes.items[0] ?? null;
  } catch {
    // If splits cannot be fetched or do not exist, treat as unavailable
    split = null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/datasets"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to datasets
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {dataset.name}
            </h2>
            <DatasetStatusBadge status={dataset.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <span className="font-mono text-xs">{dataset.id}</span> · Language:{" "}
            <span className="font-mono uppercase">{dataset.language_code}</span>{" "}
            ·{" "}
            {dataset.record_count !== null ? (
              <span>{dataset.record_count.toLocaleString()} records</span>
            ) : (
              <span className="italic">Record count unavailable</span>
            )}
          </p>
        </div>
      </div>

      {dataset.description ? (
        <p className="text-sm text-muted">{dataset.description}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProvenanceCard dataset={dataset} />
        <QualityAuditCard dataset={dataset} />
      </div>

      <SplitBar split={split} />
    </div>
  );
}
