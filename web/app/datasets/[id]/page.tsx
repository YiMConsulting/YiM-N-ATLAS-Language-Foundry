import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProvenanceCard } from "@/components/datasets/provenance-card";
import { QualityAuditCard } from "@/components/datasets/quality-audit-card";
import { SplitBar } from "@/components/datasets/split-bar";
import { datasets } from "@/lib/datasets";

type DatasetPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const { id } = await params;
  const dataset = datasets.find((item) => item.dataset_id === id);

  return {
    title: dataset
      ? `${dataset.name} | N-ATLAS Language Foundry`
      : "Dataset | N-ATLAS Language Foundry",
  };
}

export function generateStaticParams() {
  return datasets.map((dataset) => ({ id: dataset.dataset_id }));
}

export default async function DatasetDetailPage({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = datasets.find((item) => item.dataset_id === id);

  if (!dataset) {
    notFound();
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
          {dataset.rows.toLocaleString()} rows · {dataset.license}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProvenanceCard dataset={dataset} />
        <QualityAuditCard quality={dataset.quality} />
      </div>

      <SplitBar split={dataset.split} />
    </div>
  );
}
