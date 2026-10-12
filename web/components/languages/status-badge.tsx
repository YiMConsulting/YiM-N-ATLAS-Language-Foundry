import type { LanguageStatus } from "@/lib/api-client";

export const languageStatusLabels: Record<LanguageStatus, string> = {
  discovered: "Discovered",
  registered: "Registered",
  data_available: "Data Available",
  ready: "Ready",
  adapting: "Adapting",
  adapted: "Adapted",
};

const statusStyles: Record<LanguageStatus, string> = {
  discovered: "bg-surface-muted text-muted border border-border",
  registered: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  data_available: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  ready: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  adapting: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  adapted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function StatusBadge({ status }: { status: LanguageStatus }) {
  const label = languageStatusLabels[status] ?? status;
  const style = statusStyles[status] ?? "bg-surface-muted text-muted";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
