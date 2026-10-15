import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { DatasetStatus } from "@/lib/api-client";

export const datasetStatusLabels: Record<DatasetStatus, string> = {
  registered: "Registered",
  provenance_checked: "Provenance Verified",
  audited: "Quality Audited",
  reviewed: "Linguistically Reviewed",
  ready: "Ready for Training",
  rejected: "Rejected",
};

const statusVariantMap: Record<DatasetStatus, BadgeVariant> = {
  registered: "neutral",
  provenance_checked: "accent",
  audited: "warning",
  reviewed: "accent",
  ready: "success",
  rejected: "error",
};

export function DatasetStatusBadge({ status }: { status: DatasetStatus }) {
  const label = datasetStatusLabels[status] ?? status;
  const variant = statusVariantMap[status] ?? "neutral";

  return <Badge variant={variant}>{label}</Badge>;
}
