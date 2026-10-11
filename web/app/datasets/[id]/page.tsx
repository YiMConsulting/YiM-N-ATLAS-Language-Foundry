import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isNotFound } from "@/lib/api/errors";
import { ProvenanceCard } from "@/components/datasets/provenance-card";
import { QualityAuditCard } from "@/components/datasets/quality-audit-card";
import { SplitBar } from "@/components/datasets/split-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDataset, getDatasets, getQualityAudit } from "@/lib/api/datasets";
import type { Dataset, QualityAudit } from "@/lib/datasets";

type DatasetPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const dataset = await getDataset(id);
    return {
      title: `${dataset.name} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Dataset | N-ATLAS Language Foundry",
    };
  }
}

export async function generateStaticParams() {
  const { items } = await getDatasets();
  return items.map((dataset) => ({ id: dataset.id }));
}

export default function DatasetDetailPage({ params }: DatasetPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <DatasetDetail params={params} />
    </Suspense>
  );
}

async function DatasetDetail({ params }: DatasetPageProps) {
  const { id } = await params;

  let dataset: Dataset | null = null;
  try {
    dataset = await getDataset(id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }

  if (!dataset) {
    notFound();
  }

  let quality: QualityAudit | null = null;
  try {
    quality = await getQualityAudit(id);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/datasets"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to datasets
      </Link>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {dataset.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {dataset.record_count?.toLocaleString() ?? "—"} records ·{" "}
          {dataset.format}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProvenanceCard provenance={null} />
        <QualityAuditCard quality={quality} />
      </div>

      <SplitBar split={null} />
    </div>
  );
}
