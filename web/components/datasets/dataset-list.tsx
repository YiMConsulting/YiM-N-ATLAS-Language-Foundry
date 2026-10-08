import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import type { Dataset, DatasetQualityStatus } from "@/lib/datasets";

function QualityStatus({ status }: { status: DatasetQualityStatus }) {
  if (status === "passed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-300">
        <CheckIcon className="h-4 w-4" />
        Passed
      </span>
    );
  }

  return (
    <span className="text-sm font-medium capitalize text-amber-600 dark:text-amber-300">
      {status.replace("_", " ")}
    </span>
  );
}

function UseIndicator({ allowed }: { allowed: boolean }) {
  if (allowed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-300">
        <CheckIcon className="h-4 w-4" />
        Allowed
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-red-600 dark:text-red-300">
      Review
    </span>
  );
}

export function DatasetList({ datasets }: { datasets: Dataset[] }) {
  return (
    <>
      {/* Table — desktop and tablet */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">License</th>
              <th className="px-4 py-3 font-medium">Rows</th>
              <th className="px-4 py-3 font-medium">Quality</th>
              <th className="px-4 py-3 font-medium">Use</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr
                key={dataset.dataset_id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/datasets/${dataset.dataset_id}`}
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {dataset.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{dataset.source}</td>
                <td className="px-4 py-3 text-muted">{dataset.license}</td>
                <td className="px-4 py-3">{dataset.rows.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <QualityStatus status={dataset.quality_status} />
                </td>
                <td className="px-4 py-3">
                  <UseIndicator allowed={dataset.intended_use_allowed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {datasets.map((dataset) => (
          <li key={dataset.dataset_id}>
            <Link
              href={`/datasets/${dataset.dataset_id}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium">{dataset.name}</div>
                <QualityStatus status={dataset.quality_status} />
              </div>
              <p className="mt-2 text-sm text-muted">
                {dataset.source} · {dataset.license}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">
                  {dataset.rows.toLocaleString()} rows
                </span>
                <UseIndicator allowed={dataset.intended_use_allowed} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
