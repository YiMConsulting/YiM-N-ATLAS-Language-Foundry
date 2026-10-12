import Link from "next/link";
import { DatasetStatusBadge } from "@/components/datasets/dataset-status-badge";
import type { DatasetDto } from "@/lib/api-client";

export function DatasetList({ datasets }: { datasets: DatasetDto[] }) {
  if (datasets.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
        No datasets registered yet.
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
              <th className="px-4 py-3 font-medium">Dataset</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Source Type</th>
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
                  <div className="text-xs text-muted font-mono">{dataset.id}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {dataset.language_code}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {dataset.format}
                </td>
                <td className="px-4 py-3 capitalize text-muted">
                  {dataset.source_type}
                </td>
                <td className="px-4 py-3">
                  {dataset.record_count !== null
                    ? dataset.record_count.toLocaleString()
                    : <span className="text-muted italic">Unavailable</span>}
                </td>
                <td className="px-4 py-3">
                  <DatasetStatusBadge status={dataset.status} />
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
                <div>
                  <div className="font-medium">{dataset.name}</div>
                  <div className="text-xs text-muted font-mono">{dataset.id}</div>
                </div>
                <DatasetStatusBadge status={dataset.status} />
              </div>
              <p className="mt-2 text-xs text-muted">
                Language: <span className="font-mono uppercase">{dataset.language_code}</span> · {dataset.format} · {dataset.source_type}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted">
                  {dataset.record_count !== null
                    ? `${dataset.record_count.toLocaleString()} records`
                    : "Records: Unavailable"}
                </span>
                <span className="text-xs text-muted">
                  {new Date(dataset.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
