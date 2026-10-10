"use client";

import { MenuIcon } from "@/components/icons";
import { LanguageSelector } from "@/components/layout/language-selector";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-muted md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold sm:text-base">
          Language Foundry
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageSelector />
        <span
          className="relative inline-flex h-2.5 w-2.5"
          title="All systems operational"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
