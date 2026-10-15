import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/icons";
import type { ExperimentStatus } from "@/lib/api-client";

const statusVariants: Record<
  ExperimentStatus,
  "neutral" | "warning" | "accent" | "success" | "error"
> = {
  queued: "neutral",
  running: "warning",
  evaluating: "accent",
  completed: "success",
  failed: "error",
};

const statusLabels: Record<ExperimentStatus, string> = {
  queued: "Queued",
  running: "Running",
  evaluating: "Evaluating",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: ExperimentStatus }) {
  const variant = statusVariants[status] ?? "neutral";
  const label = statusLabels[status] ?? status;

  return (
    <Badge variant={variant} className="gap-1">
      {status === "completed" && <CheckIcon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
