import type { HTMLAttributes } from "react";

export type StatusTone = "online" | "standby" | "offline" | "preview" | "warning";

export interface StatusPillProps extends HTMLAttributes<HTMLDivElement> {
  tone: StatusTone;
  label: string;
  sublabel?: string;
  pulse?: boolean;
}

const toneDotStyles: Record<StatusTone, string> = {
  online: "bg-success",
  standby: "bg-warning",
  offline: "bg-foreground-muted",
  preview: "bg-accent",
  warning: "bg-warning",
};

const tonePillStyles: Record<StatusTone, string> = {
  online: "bg-success-soft text-success border-success-border",
  standby: "bg-warning-soft text-warning border-warning-border",
  offline: "bg-surface-secondary text-foreground-secondary border-border",
  preview: "bg-accent-soft text-accent border-accent/20",
  warning: "bg-warning-soft text-warning border-warning-border",
};

export function StatusPill({
  tone,
  label,
  sublabel,
  pulse = false,
  className = "",
  ...props
}: StatusPillProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium tracking-tight select-none",
        tonePillStyles[tone],
        className,
      ].join(" ")}
      {...props}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (tone === "online" || tone === "preview") ? (
          <span
            className={[
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              toneDotStyles[tone],
            ].join(" ")}
          />
        ) : null}
        <span
          className={[
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            toneDotStyles[tone],
          ].join(" ")}
        />
      </span>
      <span>{label}</span>
      {sublabel ? (
        <span className="opacity-75 font-normal text-[11px]">· {sublabel}</span>
      ) : null}
    </div>
  );
}
