import Link from "next/link";
import { StatusBadge } from "@/components/experiments/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExperimentDto } from "@/lib/api-client";

export function ExperimentsList({
  experiments,
}: {
  experiments: ExperimentDto[];
}) {
  if (experiments.length === 0) {
    return (
      <EmptyState
        title="No Experiments Recorded"
        description="Adaptation runs submitted to the N-ATLaS Language Foundry will be logged and tracked here with verified hyperparameters, git revisions, and artifact paths."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/datasets"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors"
            >
              Browse Training Datasets
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
            >
              Inference Playground
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Table — open, fluid, unboxed */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-border text-foreground-muted font-medium">
              <th className="pb-3 pr-4 font-medium">Experiment ID</th>
              <th className="pb-3 px-4 font-medium">Language</th>
              <th className="pb-3 px-4 font-medium">Method</th>
              <th className="pb-3 px-4 font-medium">Base Model</th>
              <th className="pb-3 px-4 font-medium">Hardware</th>
              <th className="pb-3 pl-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {experiments.map((experiment) => (
              <tr
                key={experiment.id}
                className="hover:bg-surface-secondary/40 transition-colors"
              >
                <td className="py-3.5 pr-4">
                  <Link
                    href={`/experiments/${experiment.id}`}
                    className="font-medium font-mono text-accent hover:underline"
                  >
                    {experiment.id}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary">
                    {experiment.language_code}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-foreground-secondary uppercase">
                  {experiment.adaptation.method}
                </td>
                <td className="py-3.5 px-4 text-foreground-secondary truncate max-w-[220px]">
                  {experiment.base_model}
                </td>
                <td className="py-3.5 px-4 text-foreground-secondary">
                  {experiment.runtime.hardware}
                </td>
                <td className="py-3.5 pl-4">
                  <StatusBadge status={experiment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-3 md:hidden">
        {experiments.map((experiment) => (
          <li key={experiment.id}>
            <Link
              href={`/experiments/${experiment.id}`}
              className="block rounded-xl bg-surface-secondary/40 p-4 transition-colors hover:bg-surface-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-mono text-xs font-semibold text-foreground">
                  {experiment.id}
                </div>
                <StatusBadge status={experiment.status} />
              </div>
              <p className="mt-2 text-xs text-foreground-secondary">
                Language: <span className="font-mono uppercase font-semibold text-foreground">{experiment.language_code}</span> · {experiment.adaptation.method.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-foreground-muted truncate">
                {experiment.base_model} · {experiment.runtime.hardware}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
