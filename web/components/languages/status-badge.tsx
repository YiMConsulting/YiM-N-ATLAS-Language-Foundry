import { languageStatusLabels } from "@/lib/languages";
import type { LanguageStatus } from "@/lib/languages";

const statusStyles: Record<LanguageStatus, string> = {
  pilot_active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  planned: "bg-surface-muted text-muted",
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
