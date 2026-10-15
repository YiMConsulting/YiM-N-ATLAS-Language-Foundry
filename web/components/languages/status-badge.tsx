import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { LanguageStatus } from "@/lib/api-client";

export const languageStatusLabels: Record<LanguageStatus, string> = {
  data_available: "Data Available (Pilot)",
  ready: "Ready for Adaptation",
  discovered: "Discovered Baseline",
  registered: "Registered",
  adapting: "Adapting",
  adapted: "Adapted",
};

const statusVariantMap: Record<LanguageStatus, BadgeVariant> = {
  data_available: "accent",
  ready: "success",
  discovered: "neutral",
  registered: "neutral",
  adapting: "warning",
  adapted: "success",
};

export function StatusBadge({ status }: { status: LanguageStatus }) {
  const label = languageStatusLabels[status] ?? status;
  const variant = statusVariantMap[status] ?? "neutral";

  return <Badge variant={variant}>{label}</Badge>;
}
