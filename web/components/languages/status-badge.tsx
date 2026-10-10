import { languageStatusLabels } from "@/lib/languages";
import type { LanguageStatus } from "@/lib/languages";

const statusStyles: Record<LanguageStatus, string> = {
  discovered: "bg-surface-muted text-muted",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  paused: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  deprecated: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export function StatusBadge({ status }: { status: LanguageStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {languageStatusLabels[status]}
    </span>
  );
}
