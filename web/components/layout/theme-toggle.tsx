"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/components/layout/theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? `Dark theme active${theme === "system" ? " (system)" : ""}. Switch to light theme.`
          : `Light theme active${theme === "system" ? " (system)" : ""}. Switch to dark theme.`
      }
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {isDark ? (
        <SunIcon className="h-4 w-4 text-warning" />
      ) : (
        <MoonIcon className="h-4 w-4 text-foreground-secondary" />
      )}
    </button>
  );
}
