import type { Metadata } from "next";
import { ExperimentsList } from "@/components/experiments/experiments-list";
import { Badge } from "@/components/ui/badge";
import { foundryApi, type ExperimentDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Experiments | N-ATLAS Language Foundry",
  description: "Audited registry of LoRA model adaptation runs across Nigerian languages.",
};

export const instant = false;

export default async function ExperimentsPage() {
  let experiments: ExperimentDto[] = [];
  let error: string | null = null;

  try {
    const res = await foundryApi.listExperiments();
    experiments = res.items;
  } catch (err: unknown) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to connect to Foundry API.";
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Experiments &amp; Adaptation Runs
            </h1>
            <Badge variant="neutral">
              {experiments.length} Runs Recorded
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Audited execution log of base model adaptation runs, LoRA hyperparameter schedules, and checkpoint artifacts.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
          <strong>Notice:</strong> Failed to load experiments: {error}
        </div>
      ) : (
        <ExperimentsList experiments={experiments} />
      )}
    </div>
  );
}
