import Link from "next/link";
import {
  ArrowRightIcon,
  DatasetsIcon,
  LanguagesIcon,
  ReviewIcon,
  EvidenceIcon,
  PlaygroundIcon,
  ExperimentsIcon,
  ResultsIcon,
  RoadmapIcon,
} from "@/components/icons";

export function WorkspaceCTA() {
  return (
    <section className="py-20 sm:py-28 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-12">
        {/* Main CTA Block */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
            Explore the developer workspace
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Inspect the live datasets, explore deterministic split manifests,
            review native speaker audit scores, or experiment with prompts in
            the interactive playground.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xs transition-all hover:bg-accent-hover cursor-pointer"
            >
              <span>Explore the workspace</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Discreet Direct Deep-Links */}
        <div className="pt-8 border-t border-border/60 space-y-4">
          <p className="text-xs text-foreground-muted">
            Jump directly into a workspace section
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link
              href="/languages"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <LanguagesIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Languages</span>
            </Link>
            <Link
              href="/datasets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <DatasetsIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Datasets</span>
            </Link>
            <Link
              href="/review"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <ReviewIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Human Review</span>
            </Link>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <EvidenceIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Evidence</span>
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <PlaygroundIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Playground</span>
            </Link>
            <Link
              href="/experiments"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <ExperimentsIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Experiments</span>
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <ResultsIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Results</span>
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
              <RoadmapIcon className="h-3.5 w-3.5 text-foreground-muted" />
              <span>Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Minimal Editorial Footer */}
        <div className="pt-6 text-xs text-foreground-muted flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
          <div>
            N-ATLaS Language Foundry · Sovereign AI Developer Infrastructure
          </div>
          <div className="flex items-center gap-4">
            <a href="#narrative" className="hover:text-foreground transition-colors">
              Back to Story
            </a>
            <span>·</span>
            <Link href="/workspace" className="hover:text-foreground transition-colors">
              Workspace Overview
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
