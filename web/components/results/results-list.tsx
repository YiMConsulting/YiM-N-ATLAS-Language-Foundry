import Link from "next/link";
import { ChangeValue } from "@/components/results/change-value";
import type { ExperimentResult } from "@/lib/results";

function exactMatchChange(result: ExperimentResult) {
  return result.metrics.find((metric) => metric.label === "Exact match");
}

export function ResultsList({ results }: { results: ExperimentResult[] }) {
  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Experiment</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Test examples</th>
              <th className="px-4 py-3 font-medium">Exact match change</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const change = exactMatchChange(result);

              return (
                <tr
                  key={result.experiment_id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/results/${result.experiment_id}`}
                      className="font-medium transition-colors hover:text-accent"
                    >
                      {result.experiment_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{result.language}</td>
                  <td className="px-4 py-3 text-muted">
                    {result.test_examples}
                  </td>
                  <td className="px-4 py-3">
                    {change ? <ChangeValue metric={change} /> : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {results.map((result) => {
          const change = exactMatchChange(result);

          return (
            <li key={result.experiment_id}>
              <Link
                href={`/results/${result.experiment_id}`}
                className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{result.experiment_id}</div>
                  {change ? <ChangeValue metric={change} /> : null}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {result.language} · {result.test_examples} test examples
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
