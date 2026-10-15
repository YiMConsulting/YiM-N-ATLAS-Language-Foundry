import Link from "next/link";
import {
  CAPABILITIES,
  getCapabilitySummaryStats,
  type CapabilityRecord,
} from "@/lib/capability-registry";
import {
  RoadmapIcon,
  CheckCircleIcon,
  TerminalIcon,
  CpuIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@/components/icons";

export function RoadmapPreview() {
  const stats = getCapabilitySummaryStats();

  // Curate 4 distinct preview entries to represent each capability category and status honestly
  const previewIds = [
    "input-grouped-split",   // available
    "lora-runner",           // manual
    "streaming-inference",   // in-development
    "async-training-queue",  // planned
  ];

  const previewCapabilities = previewIds
    .map((id) => CAPABILITIES.find((c) => c.id === id))
    .filter((c): c is CapabilityRecord => Boolean(c));

  function getStatusBadge(status: CapabilityRecord["status"]) {
    switch (status) {
      case "available":
        return {
          label: "Available Today",
          classes: "bg-accent-soft text-accent",
          icon: CheckCircleIcon,
        };
      case "manual":
        return {
          label: "Manual Workflow",
          classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          icon: TerminalIcon,
        };
      case "in-development":
        return {
          label: "In Development",
          classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
          icon: CpuIcon,
        };
      case "planned":
      default:
        return {
          label: "Planned Vision",
          classes: "bg-surface-secondary text-foreground-muted border border-border/50",
          icon: SparklesIcon,
        };
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Product Roadmap &amp; Capabilities
            </h2>
            <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-mono text-foreground-muted border border-border/60">
              {stats.total} Tracked Capabilities
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            Transparent distinction between what is verified today, what requires manual engineering, and the future self-service platform.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 font-medium text-xs text-accent hover:underline shrink-0"
        >
          <span>View All {stats.total} Capabilities</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
          <div className="flex items-center gap-1.5 text-accent font-medium text-[11px]">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            <span>Available Today</span>
          </div>
          <div className="text-lg font-semibold text-foreground mt-1 tabular-nums">
            {stats.available}
          </div>
          <p className="text-foreground-muted text-[10px] mt-0.5">
            Verified in code, tests, or sealed artifacts.
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>Manual Workflows</span>
          </div>
          <div className="text-lg font-semibold text-foreground mt-1 tabular-nums">
            {stats.manual}
          </div>
          <p className="text-foreground-muted text-[10px] mt-0.5">
            Requires CLI, script, or external cloud GPU.
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium text-[11px]">
            <CpuIcon className="h-3.5 w-3.5" />
            <span>In Development</span>
          </div>
          <div className="text-lg font-semibold text-foreground mt-1 tabular-nums">
            {stats.inDev}
          </div>
          <p className="text-foreground-muted text-[10px] mt-0.5">
            Actively staged with code in the repository.
          </p>
        </div>

        <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
          <div className="flex items-center gap-1.5 text-foreground-muted font-medium text-[11px]">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Planned Vision</span>
          </div>
          <div className="text-lg font-semibold text-foreground mt-1 tabular-nums">
            {stats.planned}
          </div>
          <p className="text-foreground-muted text-[10px] mt-0.5">
            Approved self-service target architecture.
          </p>
        </div>
      </div>

      {/* Curated Preview Items */}
      <div className="rounded-xl border border-border/70 bg-surface/30 divide-y divide-border/50 overflow-hidden">
        {previewCapabilities.map((capability) => {
          const badge = getStatusBadge(capability.status);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={capability.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-secondary/40 transition-colors"
            >
              <div className="space-y-1 min-w-0 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground text-xs">
                    {capability.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.classes}`}
                  >
                    <BadgeIcon className="h-2.5 w-2.5" />
                    {badge.label}
                  </span>
                  {capability.isExperimental && (
                    <span className="rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-medium">
                      Experimental / Unverified
                    </span>
                  )}
                </div>
                <p className="text-foreground-secondary text-xs leading-relaxed">
                  {capability.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {capability.relatedRoute ? (
                  <Link
                    href={capability.relatedRoute}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground hover:text-accent transition-colors"
                  >
                    <span>View UI</span>
                    <ChevronRightIcon className="h-3 w-3 text-foreground-muted" />
                  </Link>
                ) : (
                  <span className="text-[11px] text-foreground-muted font-mono">
                    CLI/Script
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link to Full Roadmap */}
      <div className="text-center pt-1">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-xs font-medium text-foreground border border-border hover:bg-surface-secondary transition-colors"
        >
          <RoadmapIcon className="h-3.5 w-3.5 text-accent" />
          <span>Explore All 13 Capabilities in the Full Roadmap</span>
          <ChevronRightIcon className="h-3 w-3 text-foreground-muted" />
        </Link>
      </div>
    </section>
  );
}
