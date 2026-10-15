import Link from "next/link";
import { ArrowRightIcon, ArrowDownIcon } from "@/components/icons";

export function StoryHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* The Central Idea */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-foreground leading-[1.12] max-w-3xl mx-auto">
          Every Nigerian language deserves a place in AI.
        </h1>

        {/* Plain Language Explanation & Platform Intro */}
        <p className="mt-6 text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-2xl mx-auto font-normal">
          Nigeria is home to over 500 indigenous languages, yet modern AI
          systems leave almost all of them behind.{" "}
          <span className="font-medium text-foreground">
            N-ATLaS Language Foundry
          </span>{" "}
          helps developers and language communities adapt open foundation
          models to Nigerian languages through clean data curation,
          native-speaker review, and verifiable evaluation.
        </p>

        {/* Action Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/workspace"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xs transition-all hover:bg-accent-hover cursor-pointer"
          >
            <span>Explore the workspace</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <a
            href="#narrative"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface/60 px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <span>See how it works</span>
            <ArrowDownIcon className="h-3.5 w-3.5 text-foreground-muted" />
          </a>
        </div>

        {/* Grounded Key Facts Row (Natural typography, no boxes) */}
        <div className="mt-16 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-lg mx-auto text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              500+
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Living indigenous languages
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              &lt; 1%
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Represented in mainstream AI
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-accent tabular-nums">
              184,099
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              Tiv sentence pairs in pilot
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
