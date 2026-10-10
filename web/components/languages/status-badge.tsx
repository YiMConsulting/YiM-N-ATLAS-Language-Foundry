import { languageStatusLabels } from "@/lib/languages";
import type { LanguageStatus } from "@/lib/languages";

const statusStyles: Record<LanguageStatus, string> = {
  discovered: "bg-surface-muted text-muted",
  registered: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  data_available: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  ready: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  adapting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  adapted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
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
