import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast shadow-subtle hover:bg-accent-hover active:opacity-90 disabled:opacity-50",
  secondary:
    "bg-surface-secondary text-foreground border border-border hover:bg-surface-tertiary active:opacity-90 disabled:opacity-50",
  outline:
    "bg-surface text-foreground border border-border hover:bg-surface-secondary active:opacity-90 disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground-secondary hover:bg-surface-secondary hover:text-foreground active:opacity-90 disabled:opacity-50",
  danger:
    "bg-error text-white hover:opacity-90 active:opacity-80 disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-xs rounded-md gap-1.5",
  md: "h-9 px-3.5 text-sm rounded-md gap-2",
  lg: "h-11 px-5 text-sm font-semibold rounded-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={[
          "inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
