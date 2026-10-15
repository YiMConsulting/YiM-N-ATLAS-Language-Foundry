import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatasetStatusBadge } from "@/components/datasets/dataset-status-badge";
import { ProvenanceCard } from "@/components/datasets/provenance-card";
import { QualityAuditCard } from "@/components/datasets/quality-audit-card";
import { ReviewEvidenceCard } from "@/components/datasets/review-evidence-card";
import { SplitBar } from "@/components/datasets/split-bar";
import {
  foundryApi,
  type DatasetDto,
  type DatasetReviewEvidenceDto,
  type DatasetSplitDto,
} from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

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
      title: `${dataset.name} | N-ATLaS Language Foundry`,
    };
  } catch {
    return {
      title: "Dataset Detail | N-ATLaS Language Foundry",
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
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <Link
          href="/datasets"
          className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          Back to Datasets
        </Link>
        <div className="rounded-lg border border-error-border bg-error-soft p-4 text-xs text-error">
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
    split = null;
  }

  let reviewEvidence: DatasetReviewEvidenceDto | null = null;
  try {
    reviewEvidence = await foundryApi.getDatasetReviewEvidence(id);
  } catch {
    reviewEvidence = null;
  }

  const isPilot = dataset.language_code.toLowerCase() === "tiv";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <Link
        href="/datasets"
        className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
      >
        Back to Datasets
      </Link>

      {/* Dataset Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary border border-border">
                {dataset.language_code}
              </span>
              <span className="font-mono text-xs text-foreground-muted">
                {dataset.id}
              </span>
              {isPilot && (
                <Badge variant="accent" size="sm">
                  Pilot Corpus
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {dataset.name}
            </h1>
            <p className="mt-1.5 text-sm text-foreground-secondary max-w-2xl leading-relaxed">
              {dataset.description ?? "Parallel training corpus cataloged in N-ATLaS Language Foundry."}
            </p>
          </div>
          <DatasetStatusBadge status={dataset.status} />
        </div>

        {/* Quick Attribute Strip */}
        <div className="mt-5 flex flex-wrap gap-5 text-xs text-foreground-secondary pt-4 border-t border-border">
          <div>
            Total Records:{" "}
            <strong className="text-foreground">
              {dataset.record_count ? dataset.record_count.toLocaleString() : "—"}
            </strong>{" "}
            pairs
          </div>
          <div>
            Format: <span className="font-mono uppercase text-foreground">{dataset.format}</span>
          </div>
          <div>
            Source:{" "}
            <span className="capitalize text-foreground">{dataset.source_type}</span>
          </div>
          {split && (
            <div>
              Partition Strategy:{" "}
              <span className="font-mono text-foreground">{split.strategy}</span>
            </div>
          )}
        </div>
      </div>

      {/* Split Distribution Bar */}
      <SplitBar split={split} />

      {/* Human Linguistic Review Evidence Card */}
      <ReviewEvidenceCard evidence={reviewEvidence} />

      {/* Grid: Provenance and Automated Quality Audit */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProvenanceCard dataset={dataset} />
        <QualityAuditCard dataset={dataset} />
      </div>
    </div>
  );
}
