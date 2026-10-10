import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isNotFound } from "@/lib/api/errors";
import { SetupCard } from "@/components/experiments/setup-card";
import { StatusBadge } from "@/components/experiments/status-badge";
import { TrainingSettingsCard } from "@/components/experiments/training-settings-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getExperiment, getExperiments } from "@/lib/api/experiments";
import type { Experiment } from "@/lib/experiments";

type ExperimentPageProps = {
  params: Promise<{ experiment_id: string }>;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: ExperimentPageProps): Promise<Metadata> {
  const { experiment_id } = await params;

  try {
    const experiment = await getExperiment(experiment_id);
    return {
      title: `${experiment.id} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Experiment | N-ATLAS Language Foundry",
    };
  }
}

export async function generateStaticParams() {
  const { items } = await getExperiments();
  return items.map((experiment) => ({ experiment_id: experiment.id }));
}

export default function ExperimentDetailPage({ params }: ExperimentPageProps) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ExperimentDetail params={params} />
    </Suspense>
  );
}

async function ExperimentDetail({ params }: ExperimentPageProps) {
  const { experiment_id } = await params;

  let experiment: Experiment | null = null;
  try {
    experiment = await getExperiment(experiment_id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }

  if (!experiment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/experiments"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to experiments
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {experiment.id}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Created {formatDate(experiment.created_at)} · commit{" "}
            {experiment.git_commit ?? "—"}
          </p>
        </div>
        <StatusBadge status={experiment.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SetupCard experiment={experiment} />
        <TrainingSettingsCard experiment={experiment} />
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Adapter path
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {experiment.artifacts.adapter_path ?? "—"}
          </p>
        </div>
        <Link
          href={`/results/${experiment.id}`}
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          View results →
        </Link>
      </section>
    </div>
  );
}
