import { CheckIcon } from "@/components/icons";
import type { ExperimentStatus } from "@/lib/api-client";

const statusStyles: Record<ExperimentStatus, string> = {
  queued: "bg-surface-muted text-muted border border-border",
  running: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  evaluating: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-red-500/15 text-red-700 dark:text-red-300",
};

const statusLabels: Record<ExperimentStatus, string> = {
  queued: "Queued",
  running: "Running",
  evaluating: "Evaluating",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: ExperimentStatus }) {
  const style = statusStyles[status] ?? "bg-surface-muted text-muted";
  const label = statusLabels[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status === "completed" ? <CheckIcon className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}
