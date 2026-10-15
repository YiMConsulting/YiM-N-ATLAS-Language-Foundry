"use client";

import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SystemStatus } from "@/components/layout/system-status";

const ROUTE_TITLES: Record<string, { section: string; title: string }> = {
  "/": { section: "Foundry", title: "Product Story" },
  "/workspace": { section: "Foundry", title: "Workspace Overview" },
  "/roadmap": { section: "Planning", title: "Product Roadmap" },
  "/languages": { section: "Registry", title: "Languages" },
  "/datasets": { section: "Data", title: "Datasets & Splits" },
  "/evidence": { section: "Verification", title: "Evidence Dossier" },
  "/review": { section: "Verification", title: "Human Review" },
  "/experiments": { section: "Training", title: "Experiments" },
  "/results": { section: "Evaluation", title: "Results" },
  "/playground": { section: "Inference", title: "Playground" },
};

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();

  let breadcrumb = ROUTE_TITLES[pathname];
  if (!breadcrumb) {
    if (pathname.startsWith("/datasets/")) {
      breadcrumb = { section: "Data", title: "Dataset Detail" };
    } else if (pathname.startsWith("/languages/")) {
      breadcrumb = { section: "Registry", title: "Language Detail" };
    } else if (pathname.startsWith("/experiments/")) {
      breadcrumb = { section: "Training", title: "Experiment Detail" };
    } else {
      breadcrumb = { section: "Foundry", title: "Control Plane" };
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-8 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-foreground md:hidden cursor-pointer"
        >
          <MenuIcon className="h-4 w-4" />
        </button>

        {/* Quiet Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <span className="text-foreground-muted hidden sm:inline">
            {breadcrumb.section}
          </span>
          <span className="text-foreground-muted/60 hidden sm:inline">/</span>
          <span className="truncate font-medium text-foreground">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SystemStatus />
        <ThemeToggle />
      </div>
    </header>
  );
}
