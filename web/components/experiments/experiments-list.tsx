import Link from "next/link";
import { StatusBadge } from "@/components/experiments/status-badge";
import type { Experiment } from "@/lib/experiments";

function methodLabel(method: Experiment["adaptation"]["method"]): string {
  return method === "qlora" ? "QLoRA" : "LoRA";
}

export function ExperimentsList({
  experiments,
}: {
  experiments: Experiment[];
}) {
  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Method</th>
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
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {experiment.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {methodLabel(experiment.adaptation.method)}
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
                <div className="font-medium">{experiment.id}</div>
                <StatusBadge status={experiment.status} />
              </div>
              <p className="mt-2 text-sm text-muted">
                {methodLabel(experiment.adaptation.method)} ·{" "}
                {experiment.runtime.hardware}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
