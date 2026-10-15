import { CheckCircleIcon, AlertTriangleIcon } from "@/components/icons";

export function WhereWeAreToday() {
  return (
    <section id="today" className="py-20 sm:py-28 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2 mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
            Where we are today
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            What exists and has been verified in this repository today, versus
            the capabilities we are building toward next.
          </p>
        </div>

        {/* Dual Column: Verified Today vs Future Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Column 1: Verified Today */}
          <div className="space-y-6 rounded-xl border border-border/80 bg-surface/60 p-6 sm:p-7">
            <div className="border-b border-border/70 pb-3">
              <h3 className="text-base font-semibold text-foreground">
                Verified in the repository today
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Functional components backed by code, tests, and manifests.
              </p>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-foreground-secondary">
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-foreground">
                    Curated Pilot Corpus:
                  </strong>{" "}
                  184,099 verified English-Tiv sentence pairs indexed with provenance.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-foreground">
                    Leak-Free Grouped Splits:
                  </strong>{" "}
                  Deterministic 75/10/15 partition with 0.0% validation or test contamination.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-foreground">
                    Native-Speaker Review Evidence:
                  </strong>{" "}
                  Pilot sample audited by native speakers with a 4.76/5.0 accuracy rating.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-foreground">
                    Adaptation Pipeline &amp; Collator:
                  </strong>{" "}
                  LoRA training scripts, tokenization collators, and chat formatting for N-ATLaS 8B.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-foreground">
                    Evaluation Harness:
                  </strong>{" "}
                  Standard prompt builder that strictly isolates user prompts from target answers.
                </div>
              </li>
            </ul>

            <div className="pt-3 border-t border-border/60 text-xs text-foreground-muted leading-relaxed">
              <span className="font-medium text-foreground">Manual Execution Note:</span>{" "}
              Model training runs and review spreadsheets currently require manual execution by engineers.
            </div>
          </div>

          {/* Column 2: The Future Vision */}
          <div className="space-y-6 rounded-xl border border-border/70 bg-surface/30 p-6 sm:p-7">
            <div className="border-b border-border/70 pb-3">
              <h3 className="text-base font-semibold text-foreground">
                Future capabilities
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Roadmap goals planned for subsequent platform releases.
              </p>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-foreground-secondary">
              <li className="flex items-start gap-2.5">
                <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-foreground-muted font-mono">
                  1
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    Self-Service Training:
                  </strong>{" "}
                  Launch and monitor adaptation runs directly from the browser without terminal execution.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-foreground-muted font-mono">
                  2
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    Automated GPU Scheduling:
                  </strong>{" "}
                  Dynamic cloud and local hardware cluster allocation with automated queues.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-foreground-muted font-mono">
                  3
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    One-Click Adapter Hub:
                  </strong>{" "}
                  Direct publishing and sharing of verified adapter checkpoints to community hubs.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-foreground-muted font-mono">
                  4
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    Continuous Retraining:
                  </strong>{" "}
                  Automated quality gates that re-adapt models when new native reviews arrive.
                </div>
              </li>
            </ul>

            <div className="pt-3 border-t border-border/60 text-xs text-foreground-muted leading-relaxed">
              These capabilities represent upcoming milestones and are not yet automated in the current repository.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
