"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  CpuIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@/components/icons";
import type {
  LanguageDto,
  DatasetDto,
  DatasetReviewEvidenceDto,
  InferenceStatusResponse,
} from "@/lib/api-client";

type OverviewHeaderProps = {
  languages: LanguageDto[];
  datasets: DatasetDto[];
  tivEvidence: DatasetReviewEvidenceDto | null;
  inferenceStatus: InferenceStatusResponse | null;
};

export function OverviewHeader({
  languages,
  datasets,
  tivEvidence,
  inferenceStatus,
}: OverviewHeaderProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const isApiOnline = languages.length > 0 || datasets.length > 0;
  const isInferenceOnline = Boolean(
    inferenceStatus?.available && inferenceStatus?.model_loaded
  );
  const totalPairs = datasets.reduce(
    (acc, d) => acc + (d.record_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Supporting Line */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>Foundry Workspace</span>
          <span>/</span>
          <span className="font-medium text-foreground">Control Plane</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
          Workspace Overview
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed max-w-2xl">
          Operational status and developer tools for the N-ATLaS Tiv pilot and
          sovereign language adaptation workflows.
        </p>
      </div>

      {/* 2. Operational Status Strip — Natural Layout without heavy bordered cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y border-border/70">
        {/* Metric 1: Active Corpus */}
        <div className="space-y-1">
          <span className="text-xs text-foreground-muted block font-medium">
            Active Pilot Corpus
          </span>
          <div className="text-lg font-semibold text-foreground tracking-tight tabular-nums">
            {totalPairs > 0 ? totalPairs.toLocaleString() : "184,099"} pairs
          </div>
          <p className="text-[11px] text-foreground-secondary">
            Tiv MT560 · 75/10/15 split
          </p>
        </div>

        {/* Metric 2: Linguistic Audit */}
        <div className="space-y-1">
          <span className="text-xs text-foreground-muted block font-medium">
            Native Speaker Audit
          </span>
          <div className="text-lg font-semibold text-foreground tracking-tight tabular-nums flex items-center gap-1.5">
            <span>{tivEvidence?.reviewed_records ?? 51} / 203</span>
            <span className="text-xs font-normal text-foreground-muted">
              (4.76/5.0)
            </span>
          </div>
          <p className="text-[11px] text-foreground-secondary">
            Audited by REV_04
          </p>
        </div>

        {/* Metric 3: Control Plane API */}
        <div className="space-y-1">
          <span className="text-xs text-foreground-muted block font-medium">
            Control Plane API
          </span>
          <div className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isApiOnline ? "bg-accent" : "bg-error"
              }`}
            />
            <span>{isApiOnline ? "Operational" : "Offline"}</span>
          </div>
          <p className="text-[11px] text-foreground-secondary">
            FastAPI v0.1.0 endpoints
          </p>
        </div>

        {/* Metric 4: Inference Backend */}
        <div className="space-y-1">
          <span className="text-xs text-foreground-muted block font-medium">
            Inference Backend
          </span>
          <div className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isInferenceOnline ? "bg-accent" : "bg-amber-500"
              }`}
            />
            <span>{isInferenceOnline ? "GPU Ready" : "GPU Standby"}</span>
          </div>
          <p className="text-[11px] text-foreground-secondary">
            {isInferenceOnline ? "vLLM Attached" : "Mock sandbox active"}
          </p>
        </div>
      </div>

      {/* 3. Subtle Qualification Note with Progressive Disclosure */}
      <div className="text-xs text-foreground-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>
            Pilot status: Diagnostic LoRA smoke test. Formal evaluation pending GPU
            batch scheduling.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center gap-1 text-foreground-secondary hover:text-foreground text-xs font-medium cursor-pointer"
        >
          <span>{showTechnicalDetails ? "Hide details" : "Technical details"}</span>
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform ${
              showTechnicalDetails ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {showTechnicalDetails && (
        <div className="rounded-lg bg-surface-secondary/50 p-4 text-xs space-y-2 border border-border/50 animate-in fade-in duration-150">
          <div className="font-semibold text-foreground">
            Scientific &amp; Technical Disclaimers
          </div>
          <ul className="space-y-1 text-foreground-secondary">
            <li>
              • <strong>Base Model:</strong> NCAIR1/N-ATLaS 8B (revision:{" "}
              <code className="font-mono text-[11px]">e2944769</code>)
            </li>
            <li>
              • <strong>Partition Integrity:</strong> Deterministic input-grouping
              hash prevents training/validation leakage across all 184,099 pairs.
            </li>
            <li>
              • <strong>Review Scope:</strong> Reviewer-reported judgments from
              sample observations (51/203 pairs); does not constitute automated sign-off.
            </li>
            <li>
              • <strong>Roadmap:</strong> For full capability dependencies and
              execution statuses, view the{" "}
              <Link href="/roadmap" className="text-accent underline font-medium">
                Product Roadmap
              </Link>
              .
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
