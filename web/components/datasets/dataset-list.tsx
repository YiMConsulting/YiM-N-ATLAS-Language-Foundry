import Link from "next/link";

import {
  datasetStatusLabels,
  type Dataset,
  type DatasetStatus,
} from "@/lib/datasets";

function StatusPill({ status }: { status: DatasetStatus }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted">
      {datasetStatusLabels[status]}
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
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Records</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr
                key={dataset.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/datasets/${dataset.id}`}
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {dataset.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {dataset.language_code}
                </td>
                <td className="px-4 py-3 text-muted">{dataset.format}</td>
                <td className="px-4 py-3 text-muted">{dataset.source_type}</td>
                <td className="px-4 py-3">
                  {dataset.record_count?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={dataset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <ul className="grid gap-4 md:hidden">
        {datasets.map((dataset) => (
          <li key={dataset.id}>
            <Link
              href={`/datasets/${dataset.id}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium">{dataset.name}</div>
                <StatusPill status={dataset.status} />
              </div>
              <p className="mt-2 text-sm text-muted">
                {dataset.language_code} · {dataset.format}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">
                  {dataset.record_count?.toLocaleString() ?? "—"} records
                </span>
                <span className="text-muted">{dataset.source_type}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
