import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/icons";

export function PilotProgress() {
  const steps = [
    { title: "Curate Parallel Corpus", state: "done", note: "184,099 pairs" },
    { title: "Seal Grouped Split", state: "done", note: "0.0% leakage" },
    { title: "Native Speaker Audit", state: "current", note: "51/203 reviewed" },
    { title: "Diagnostic LoRA Run", state: "done", note: "Smoke preview" },
    { title: "Formal Evaluation", state: "upcoming", note: "Pending GPU batch" },
  ];

  return (
    <section className="space-y-4 pt-4 border-t border-border/70">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Tiv Pilot Progression
          </h2>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Current execution status for the primary language pilot.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <span>View full capability roadmap</span>
          <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className={`rounded-lg p-3 text-xs space-y-1 transition-colors ${
              step.state === "done"
                ? "bg-surface-secondary/60 text-foreground"
                : step.state === "current"
                ? "bg-accent-soft text-foreground border border-accent/30"
                : "bg-surface-secondary/20 text-foreground-muted"
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-foreground-muted">0{idx + 1}</span>
              {step.state === "done" && (
                <CheckCircleIcon className="h-3.5 w-3.5 text-accent" />
              )}
              {step.state === "current" && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              )}
            </div>
            <div className="font-medium text-foreground text-xs leading-snug">
              {step.title}
            </div>
            <div className="text-[11px] text-foreground-secondary">
              {step.note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
