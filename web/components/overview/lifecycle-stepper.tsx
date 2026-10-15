"use client";

import { useState } from "react";
import Link from "next/link";
import { LIFECYCLE_STAGES, type LifecycleStage } from "@/lib/capability-registry";
import { CheckCircleIcon, TerminalIcon, CpuIcon, SparklesIcon, ChevronRightIcon } from "@/components/icons";

export function LifecycleStepper() {
  const [selectedStageId, setSelectedStageId] = useState<string>("select-language");

  const selectedStage =
    LIFECYCLE_STAGES.find((s) => s.id === selectedStageId) || LIFECYCLE_STAGES[0];

  function getStatusBadge(stage: LifecycleStage) {
    switch (stage.status) {
      case "available":
        return {
          label: stage.executionMode === "ui" ? "UI Ready" : "Verified CLI",
          classes: "bg-accent-soft text-accent",
          icon: CheckCircleIcon,
        };
      case "manual":
        return {
          label: stage.executionMode === "cloud-gpu" ? "Cloud GPU" : "Manual CLI",
          classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          icon: stage.executionMode === "cloud-gpu" ? CpuIcon : TerminalIcon,
        };
      case "in-development":
        return {
          label: "In Dev",
          classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
          icon: TerminalIcon,
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
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Adaptation &amp; Evaluation Lifecycle
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            The intended 9-stage product journey. Steps indicate current UI readiness, manual engineering workflows, or future capabilities.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-foreground-muted shrink-0">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            UI Ready / Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Manual Script/GPU
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            Planned
          </span>
        </div>
      </div>

      {/* Horizontal Step Sequence */}
      <div className="rounded-xl border border-border/70 bg-surface/50 p-3 sm:p-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {LIFECYCLE_STAGES.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const badge = getStatusBadge(stage);

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={[
                  "flex flex-col items-start justify-between rounded-lg p-2.5 text-left transition-all cursor-pointer relative",
                  isSelected
                    ? "bg-surface border border-accent/40 shadow-xs ring-1 ring-accent/20"
                    : "hover:bg-surface-secondary/70 border border-transparent",
                ].join(" ")}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-[10px] text-foreground-muted">
                    0{stage.step}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      stage.status === "available"
                        ? "bg-accent"
                        : stage.status === "manual"
                        ? "bg-amber-500"
                        : "bg-foreground-muted/40"
                    }`}
                  />
                </div>

                <span className="text-xs font-medium text-foreground line-clamp-1 block w-full">
                  {stage.name}
                </span>

                <span
                  className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-medium leading-none ${badge.classes}`}
                >
                  {badge.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        <div className="mt-3.5 pt-3.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-surface-secondary/40 rounded-lg p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-foreground-muted">
                Stage 0{selectedStage.step} of 09:
              </span>
              <span className="font-semibold text-foreground text-xs">
                {selectedStage.name}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  getStatusBadge(selectedStage).classes
                }`}
              >
                {getStatusBadge(selectedStage).label}
              </span>
            </div>
            <p className="text-foreground-secondary text-xs leading-relaxed max-w-2xl">
              {selectedStage.description}
            </p>
          </div>

          {selectedStage.relatedRoute && (
            <Link
              href={selectedStage.relatedRoute}
              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent transition-colors shrink-0 text-xs py-1 px-2.5 rounded-md bg-surface border border-border"
            >
              <span>Explore {selectedStage.relatedRoute}</span>
              <ChevronRightIcon className="h-3 w-3 text-foreground-muted" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
