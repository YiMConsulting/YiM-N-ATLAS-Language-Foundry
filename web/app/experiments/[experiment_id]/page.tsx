import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupCard } from "@/components/experiments/setup-card";
import { StatusBadge } from "@/components/experiments/status-badge";
import { TrainingSettingsCard } from "@/components/experiments/training-settings-card";
import { Badge } from "@/components/ui/badge";
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
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <Link
          href="/experiments"
          className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          Back to experiments
        </Link>
        <div className="rounded-lg border border-error-border bg-error-soft p-4 text-xs text-error">
          Failed to load experiment &ldquo;{experiment_id}&rdquo;: {message}
        </div>
      </div>
    );
  }

  const hasResults =
    experiment.status === "completed" || experiment.adapted_results !== null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <Link
        href="/experiments"
        className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
      >
        Back to experiments
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight font-mono text-foreground sm:text-2xl">
              {experiment.id}
            </h1>
            <StatusBadge status={experiment.status} />
          </div>
          <p className="mt-1 text-xs text-foreground-secondary">
            Created {formatDate(experiment.created_at)}
            {experiment.git_commit && ` · commit ${experiment.git_commit.slice(0, 8)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="uppercase font-mono text-xs">
            {experiment.language_code}
          </Badge>
          <Badge variant="accent" className="uppercase font-mono text-xs">
            {experiment.adaptation.method}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SetupCard experiment={experiment} />
        <TrainingSettingsCard experiment={experiment} />
      </div>

      {/* Artifacts */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground border-b border-border pb-3">
          Artifacts &amp; File System Paths
        </h3>
        <dl className="divide-y divide-border text-xs">
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-foreground-secondary font-medium">Adapter Weights</dt>
            <dd className="font-mono text-foreground">
              {experiment.artifacts.adapter_path ?? (
                <span className="text-foreground-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-foreground-secondary font-medium">Configuration YAML</dt>
            <dd className="font-mono text-foreground">
              {experiment.artifacts.config_path ?? (
                <span className="text-foreground-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-foreground-secondary font-medium">Metrics JSON</dt>
            <dd className="font-mono text-foreground">
              {experiment.artifacts.metrics_path ?? (
                <span className="text-foreground-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:items-center">
            <dt className="text-foreground-secondary font-medium">Training Log Path</dt>
            <dd className="font-mono text-foreground">
              {experiment.artifacts.logs_path ?? (
                <span className="text-foreground-muted italic">Unavailable</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Results navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Evaluation Telemetry
          </p>
          <p className="mt-0.5 text-xs text-foreground-secondary">
            {hasResults
              ? "Base vs adapted evaluation metrics have been validated and recorded."
              : "Evaluation results will be computed and recorded upon experiment completion."}
          </p>
        </div>
        {hasResults && (
          <Link
            href={`/results/${experiment.id}`}
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors shrink-0"
          >
            View Evaluation Results
          </Link>
        )}
      </div>
    </div>
  );
}
