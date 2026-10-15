import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/components/icons";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ComponentType<IconProps>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-14 sm:py-20 text-center max-w-md mx-auto",
        className,
      ].join(" ")}
    >
      {Icon ? (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-foreground-muted">
          <Icon className="h-5 w-5 stroke-[1.5]" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
