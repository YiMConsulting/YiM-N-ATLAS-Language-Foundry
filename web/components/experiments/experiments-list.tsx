import Link from "next/link";
import { StatusBadge } from "@/components/experiments/status-badge";
import type { ExperimentDto } from "@/lib/api-client";

export function ExperimentsList({
  experiments,
}: {
  experiments: ExperimentDto[];
}) {
  if (experiments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
        No experiments have been recorded yet. Adaptation runs submitted to the Foundry will be tracked and displayed here.
      </div>
    );
  }

  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Base Model</th>
              <th className="px-4 py-3 font-medium">Hardware</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((experiment) => (
              <tr
                key={experiment.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/experiments/${experiment.id}`}
                    className="font-medium transition-colors hover:text-accent font-mono text-xs"
                  >
                    {experiment.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {experiment.language_code}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted uppercase">
                  {experiment.adaptation.method}
                </td>
                <td className="px-4 py-3 text-muted text-xs truncate max-w-[200px]">
                  {experiment.base_model}
                </td>
                <td className="px-4 py-3 text-muted">
                  {experiment.runtime.hardware}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={experiment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {experiments.map((experiment) => (
          <li key={experiment.id}>
            <Link
              href={`/experiments/${experiment.id}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium font-mono text-sm">{experiment.id}</div>
                <StatusBadge status={experiment.status} />
              </div>
              <p className="mt-2 text-xs text-muted">
                Language: <span className="font-mono uppercase">{experiment.language_code}</span> · {experiment.adaptation.method.toUpperCase()} · {experiment.runtime.hardware}
              </p>
              <p className="mt-1 text-xs text-muted truncate">
                {experiment.base_model}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
