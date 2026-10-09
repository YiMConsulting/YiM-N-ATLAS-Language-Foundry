import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LossChart } from "@/components/experiments/loss-chart";
import { SetupCard } from "@/components/experiments/setup-card";
import { StatusBadge } from "@/components/experiments/status-badge";
import { TrainingSettingsCard } from "@/components/experiments/training-settings-card";
import { experiments } from "@/lib/experiments";

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
  const experiment = experiments.find(
    (item) => item.experiment_id === experiment_id,
  );

  return {
    title: experiment
      ? `${experiment.experiment_id} | N-ATLAS Language Foundry`
      : "Experiment | N-ATLAS Language Foundry",
  };
}

export function generateStaticParams() {
  return experiments.map((experiment) => ({
    experiment_id: experiment.experiment_id,
  }));
}

export default async function ExperimentDetailPage({
  params,
}: ExperimentPageProps) {
  const { experiment_id } = await params;
  const experiment = experiments.find(
    (item) => item.experiment_id === experiment_id,
  );

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
            {experiment.experiment_id}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Created {formatDate(experiment.created_at)} · commit{" "}
            {experiment.git_commit}
          </p>
        </div>
        <StatusBadge status={experiment.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SetupCard experiment={experiment} />
        <TrainingSettingsCard experiment={experiment} />
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Training loss
        </h3>
        <div className="mt-4">
          <LossChart data={experiment.loss} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Adapter path
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {experiment.adapter_path}
          </p>
        </div>
        <Link
          href={`/results/${experiment.experiment_id}`}
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          View results →
        </Link>
      </section>
    </div>
  );
}
