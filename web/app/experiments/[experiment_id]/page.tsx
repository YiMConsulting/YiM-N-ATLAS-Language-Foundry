import axios from "axios";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupCard } from "@/components/experiments/setup-card";
import { StatusBadge } from "@/components/experiments/status-badge";
import { TrainingSettingsCard } from "@/components/experiments/training-settings-card";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

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
    const experiment = await foundryApi.getExperiment(experiment_id);
    return {
      title: `${experiment.id} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Experiment | N-ATLAS Language Foundry",
    };
  }
}

export const instant = false;

export default async function ExperimentDetailPage({
  params,
}: ExperimentPageProps) {
  const { experiment_id } = await params;

  let experiment: ExperimentDto;
  try {
    experiment = await foundryApi.getExperiment(experiment_id);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      notFound();
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to Foundry API.";
    return (
      <div className="space-y-6">
        <Link
          href="/experiments"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to experiments
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load experiment &ldquo;{experiment_id}&rdquo;: {message}
        </div>
      </div>
    );
  }

  const hasResults =
    experiment.status === "completed" || experiment.adapted_results !== null;

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
          <h2 className="text-2xl font-semibold tracking-tight font-mono">
            {experiment.id}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Created {formatDate(experiment.created_at)}
            {experiment.git_commit ? ` · commit ${experiment.git_commit.slice(0, 8)}` : ""}
          </p>
        </div>
        <StatusBadge status={experiment.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SetupCard experiment={experiment} />
        <TrainingSettingsCard experiment={experiment} />
      </div>

      {/* Artifacts */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Artifacts & Paths
        </h3>
        <dl className="mt-3 divide-y divide-border text-sm">
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-muted text-xs">Adapter path</dt>
            <dd className="font-mono text-xs">
              {experiment.artifacts.adapter_path ?? (
                <span className="text-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-muted text-xs">Config path</dt>
            <dd className="font-mono text-xs">
              {experiment.artifacts.config_path ?? (
                <span className="text-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-muted text-xs">Metrics path</dt>
            <dd className="font-mono text-xs">
              {experiment.artifacts.metrics_path ?? (
                <span className="text-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-muted text-xs">Logs path</dt>
            <dd className="font-mono text-xs">
              {experiment.artifacts.logs_path ?? (
                <span className="text-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* Results navigation */}
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Evaluation Results
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasResults
              ? "Base vs adapted evaluation metrics are available."
              : "Evaluation results will be recorded upon experiment completion."}
          </p>
        </div>
        {hasResults ? (
          <Link
            href={`/results/${experiment.id}`}
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            View results →
          </Link>
        ) : null}
      </section>
    </div>
  );
}
