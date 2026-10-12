import type { DatasetStatus } from "@/lib/api-client";

export const datasetStatusLabels: Record<DatasetStatus, string> = {
  registered: "Registered",
  provenance_checked: "Provenance Checked",
  audited: "Audited",
  reviewed: "Reviewed",
  ready: "Ready",
  rejected: "Rejected",
};

const statusStyles: Record<DatasetStatus, string> = {
  registered: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  provenance_checked: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  audited: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  reviewed: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  ready: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export function DatasetStatusBadge({ status }: { status: DatasetStatus }) {
  const label = datasetStatusLabels[status] ?? status;
  const style = statusStyles[status] ?? "bg-surface-muted text-muted";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
