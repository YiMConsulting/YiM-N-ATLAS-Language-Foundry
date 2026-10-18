"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useStoryNavigation } from "@/components/story/story-navigation";
import {
  ArrowRightIcon,
  MenuIcon,
  XIcon,
  LanguagesIcon,
  DatasetsIcon,
  ReviewIcon,
  EvidenceIcon,
  PlaygroundIcon,
  ExperimentsIcon,
  ResultsIcon,
  RoadmapIcon,
  HomeIcon,
} from "@/components/icons";

export function StoryHeader() {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const { navigateToMoment } = useStoryNavigation();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Platform Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            title="N-ATLaS Language Foundry"
          >
            <BrandLogo size={28} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                N-ATLaS
              </span>
              <span className="text-[11px] text-foreground-muted -mt-0.5">
                Language Foundry
              </span>
            </div>
          </Link>

          {/* Editorial In-Page Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-foreground-secondary">
            <a
              href="#problem"
              onClick={(event) => {
                event.preventDefault();
                navigateToMoment(1);
              }}
              className="transition-colors hover:text-foreground"
            >
              The Problem
            </a>
            <a
              href="#solution"
              onClick={(event) => {
                event.preventDefault();
                navigateToMoment(2);
              }}
              className="transition-colors hover:text-foreground"
            >
              The Solution
            </a>
            <a
              href="#outcome"
              onClick={(event) => {
                event.preventDefault();
                navigateToMoment(3);
              }}
              className="transition-colors hover:text-foreground"
            >
              The Outcome
            </a>
            <a
              href="#journey"
              className="transition-colors hover:text-foreground"
            >
              Journey
            </a>
            <a
              href="#today"
              className="transition-colors hover:text-foreground"
            >
              Where We Are
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {/* Discreet Secondary Workspace Access */}
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-2.5 py-1.5 text-xs font-medium text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-foreground cursor-pointer"
              title="Quick access to all technical workspace pages"
              aria-expanded={workspaceMenuOpen}
              aria-label="Toggle technical workspace menu"
            >
              <MenuIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Workspace Menu</span>
            </button>

            {/* Clear Primary Action */}
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-accent-hover cursor-pointer"
              title="Explore the full developer workspace"
            >
              <span>Explore the workspace</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Discreet Workspace Drawer / Dropdown Modal */}
      {workspaceMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            onClick={() => setWorkspaceMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-16 right-4 sm:right-8 z-50 w-72 rounded-xl border border-border bg-surface p-4 shadow-elevated text-sm transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-border/70 pb-2.5 mb-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Workspace Navigation
                </p>
                <p className="text-[11px] text-foreground-muted">
                  Technical control plane & tools
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="text-foreground-muted hover:text-foreground rounded p-1 cursor-pointer"
                aria-label="Close menu"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <Link
                href="/workspace"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
              >
                <HomeIcon className="h-4 w-4 text-accent" />
                <span>Workspace Overview</span>
              </Link>
              <Link
                href="/languages"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <LanguagesIcon className="h-4 w-4 text-foreground-muted" />
                <span>Languages Registry</span>
              </Link>
              <Link
                href="/datasets"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <DatasetsIcon className="h-4 w-4 text-foreground-muted" />
                <span>Datasets & Sealed Splits</span>
              </Link>
              <Link
                href="/review"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <ReviewIcon className="h-4 w-4 text-foreground-muted" />
                <span>Human Review</span>
              </Link>
              <Link
                href="/evidence"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <EvidenceIcon className="h-4 w-4 text-foreground-muted" />
                <span>Evidence Dossier</span>
              </Link>
              <Link
                href="/playground"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <PlaygroundIcon className="h-4 w-4 text-foreground-muted" />
                <span>Inference Playground</span>
              </Link>
              <Link
                href="/experiments"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <ExperimentsIcon className="h-4 w-4 text-foreground-muted" />
                <span>Experiments & Training</span>
              </Link>
              <Link
                href="/results"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <ResultsIcon className="h-4 w-4 text-foreground-muted" />
                <span>Evaluation Results</span>
              </Link>
              <Link
                href="/roadmap"
                onClick={() => setWorkspaceMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground-secondary hover:bg-surface-secondary hover:text-foreground transition-colors"
              >
                <RoadmapIcon className="h-4 w-4 text-foreground-muted" />
                <span>Product Roadmap</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
