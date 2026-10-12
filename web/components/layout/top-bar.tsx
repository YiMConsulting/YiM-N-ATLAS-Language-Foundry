"use client";

import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import { LanguageSelector } from "@/components/layout/language-selector";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Overview & Health",
  "/languages": "Language Registry",
  "/datasets": "Datasets & Provenance",
  "/evidence": "Evidence Dossier",
  "/review": "Human Linguistic Review",
  "/experiments": "Experiment Registry",
  "/playground": "Inference Studio",
};

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const currentTitle =
    ROUTE_TITLES[pathname] ||
    (pathname.startsWith("/datasets/")
      ? "Dataset Detail"
      : pathname.startsWith("/languages/")
      ? "Language Detail"
      : pathname.startsWith("/experiments/")
      ? "Experiment Detail"
      : pathname.startsWith("/results/")
      ? "Benchmark Results"
      : "Control Plane");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6 transition-colors">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-muted md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-muted hidden sm:inline">Foundry /</span>
        <h1 className="truncate text-sm font-semibold sm:text-base text-foreground tracking-tight">
          {currentTitle}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Service Liveness Beacon */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-surface-muted/50 px-2.5 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-muted">API Online</span>
        </div>

        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
