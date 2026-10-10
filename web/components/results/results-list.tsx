import Link from "next/link";
import { ChangeValue } from "@/components/results/change-value";
import type { Experiment } from "@/lib/experiments";

function exactMatchChange(experiment: Experiment): {
  delta: number;
  displayChange: string;
} | null {
  const base = experiment.base_results?.exact_match_ratio;
  const adapted = experiment.adapted_results?.exact_match_ratio;

  if (base == null || adapted == null) {
    return null;
  }

  const delta = adapted - base;
  const sign = delta > 0 ? "+" : "";
  return {
    delta,
    displayChange: `${sign}${(delta * 100).toFixed(1)}%`,
  };
}

export function ResultsList({ experiments }: { experiments: Experiment[] }) {
  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Experiment</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Exact match change</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((experiment) => {
              const change = exactMatchChange(experiment);

              return (
                <tr
                  key={experiment.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/results/${experiment.id}`}
                      className="font-medium transition-colors hover:text-accent"
                    >
                      {experiment.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {experiment.language_code}
                  </td>
                  <td className="px-4 py-3">
                    {change ? (
                      <ChangeValue
                        delta={change.delta}
                        displayChange={change.displayChange}
                        direction="higher"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {experiments.map((experiment) => {
          const change = exactMatchChange(experiment);

          return (
            <li key={experiment.id}>
              <Link
                href={`/results/${experiment.id}`}
                className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{experiment.id}</div>
                  {change ? (
                    <ChangeValue
                      delta={change.delta}
                      displayChange={change.displayChange}
                      direction="higher"
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {experiment.language_code}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
