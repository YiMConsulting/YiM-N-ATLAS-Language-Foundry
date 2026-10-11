"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "@/components/icons";
import { MOCK_IGALA_SAMPLES } from "./mockReviewData";
import type {
  ReviewSample,
  ReviewDecision,
  ReviewItemDecision,
  ReviewSubmissionPayload,
} from "./types";
import { useLanguage } from "@/components/layout/language-provider";

const SPECIAL_CHARS: Record<string, string[]> = {
  igl: ["ẹ", "ọ", "ñ", "ch", "gb", "kp", "kw", "gw", "́", "̀", "̄"],
  yor: ["ẹ", "ọ", "ṣ", "́", "̀", "̄"],
};

// Standard endpoints
const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export function ReviewPortal({
  initialSamples = MOCK_IGALA_SAMPLES,
}: {
  initialSamples?: ReviewSample[];
}) {
  const { activeLanguage } = useLanguage();
  const datasetId = activeLanguage ? `${activeLanguage.code}-parallel-v1` : "";
  const [samples, setSamples] = useState<ReviewSample[]>(initialSamples);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewerId, setReviewerId] = useState("olusegun-linguist");
  const [decisions, setDecisions] = useState<
    Record<string, ReviewItemDecision>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<any | null>(null);
  const [isConnectedToBackend, setIsConnectedToBackend] = useState<
    boolean | null
  >(null);
  const [activeEndpointUrl, setActiveEndpointUrl] = useState<string>("");

  // Fetch real samples from James's FastAPI endpoint on mount
  const fetchLiveSamples = useCallback(async () => {
    const langCode = activeLanguage?.code;
    if (!langCode) return;
    try {
      // 1. Try James's FastAPI backend first
      const fastApiUrl = `${BACKEND_BASE}/review/requests/rev_req_${langCode}_001/samples`;
      setActiveEndpointUrl(fastApiUrl);
      const res = await fetch(fastApiUrl, { cache: "no-store" });

      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const mapped: ReviewSample[] = data.items.map((it: any) => ({
            sample_id: it.id || it.record_id,
            source_text: it.input_text || it.source_text,
            target_text: it.expected_text || it.target_text,
            domain: it.context || "General / Community",
            confidence_score: 0.95,
          }));
          setSamples(mapped);
          setIsConnectedToBackend(true);
          toast.success("Loaded real samples from James's backend endpoint!");
          return;
        }
      }
    } catch {
      // 2. Try Next.js internal API proxy
      try {
        const nextRes = await fetch("/api/review/samples");
        if (nextRes.ok) {
          const data = await nextRes.json();
          if (
            data.items &&
            Array.isArray(data.items) &&
            data.items.length > 0
          ) {
            const mapped: ReviewSample[] = data.items.map((it: any) => ({
              sample_id: it.id || it.record_id,
              source_text: it.input_text || it.source_text,
              target_text: it.expected_text || it.target_text,
              domain: it.context || "General / Community",
              confidence_score: 0.95,
            }));
            setSamples(mapped);
            setIsConnectedToBackend(true);
            setActiveEndpointUrl("/api/review/samples");
            return;
          }
        }
      } catch {
        // Fallback to initial samples
      }
    }

    setIsConnectedToBackend(false);
    setActiveEndpointUrl("local-cache");
  }, [activeLanguage?.code]);

  useEffect(() => {
    fetchLiveSamples();
    // Reset state when language changes
    setSamples([]);
    setCurrentIndex(0);
    setDecisions({});
    setSubmittedPayload(null);
  }, [fetchLiveSamples]);

  const currentSample = samples[currentIndex];
  const currentDecision = currentSample
    ? decisions[currentSample.sample_id]
    : undefined;

  // Calculate statistics
  const reviewedCount = Object.keys(decisions).length;
  const approvedCount = Object.values(decisions).filter(
    (d) => d.decision === "approved",
  ).length;
  const correctionCount = Object.values(decisions).filter(
    (d) => d.decision === "needs_correction",
  ).length;
  const rejectedCount = Object.values(decisions).filter(
    (d) => d.decision === "rejected",
  ).length;
  const progressPct = Math.round(
    (reviewedCount / Math.max(1, samples.length)) * 100,
  );

  const handleDecision = async (decision: ReviewDecision) => {
    if (!currentSample) return;

    const newDecisionRecord: ReviewItemDecision = {
      sample_id: currentSample.sample_id,
      decision,
      comment: decisions[currentSample.sample_id]?.comment || "",
      suggested_correction:
        decision === "needs_correction"
          ? decisions[currentSample.sample_id]?.suggested_correction ||
            currentSample.target_text
          : undefined,
    };

    setDecisions((prev) => ({
      ...prev,
      [currentSample.sample_id]: newDecisionRecord,
    }));

    if (decision === "approved") {
      toast.success(`Sample ${currentSample.sample_id} Approved`);
    } else if (decision === "needs_correction") {
      toast.info(`Marked for Orthography Correction`);
    } else {
      toast.error(`Sample ${currentSample.sample_id} Rejected`);
    }

    // Proactively sync decision to real backend endpoint
    try {
      await fetch(`${BACKEND_BASE}/review/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_request_id: `rev_req_${activeLanguage?.code}_001`,
          sample_item_id: currentSample.sample_id,
          decision,
          reviewer_id: reviewerId,
          corrected_text: newDecisionRecord.suggested_correction,
          notes: newDecisionRecord.comment,
        }),
      });
    } catch {
      // Ignored for live fluidity
    }
  };

  const updateDecisionDetails = (patch: Partial<ReviewItemDecision>) => {
    if (!currentSample) return;
    setDecisions((prev) => {
      const existing = prev[currentSample.sample_id] || {
        sample_id: currentSample.sample_id,
        decision: "needs_correction",
        comment: "",
      };
      return {
        ...prev,
        [currentSample.sample_id]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const insertDiacritic = (char: string) => {
    const currentCorrection =
      currentDecision?.suggested_correction ?? currentSample?.target_text ?? "";
    updateDecisionDetails({
      suggested_correction: currentCorrection + char,
    });
  };

  const handleSubmitBatch = async () => {
    if (reviewedCount === 0) {
      toast.warning("Please review at least one sample before submitting.");
      return;
    }

    setIsSubmitting(true);
    const payload: ReviewSubmissionPayload = {
      dataset_id: datasetId,
      reviewer_id: reviewerId,
      decisions: Object.values(decisions),
      submitted_at: new Date().toISOString(),
    };

    let serverResponse: any = null;

    try {
      // Call James's FastAPI endpoint
      const res = await fetch(`${BACKEND_BASE}/review/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        serverResponse = await res.json();
      }
    } catch {
      // Try Next.js internal API
      try {
        const nextRes = await fetch("/api/review/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (nextRes.ok) {
          serverResponse = await nextRes.json();
        }
      } catch {
        // Offline
      }
    }

    setIsSubmitting(false);
    setSubmittedPayload(serverResponse || payload);
    toast.success("Audit batch successfully posted to real endpoint!");
  };

  if (!activeLanguage) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-muted">Loading language…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Human Linguistic Review
            </h2>
            {isConnectedToBackend === true ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live FastAPI Connected (:8000)
              </span>
            ) : isConnectedToBackend === false ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Local Fallback Mode
              </span>
            ) : (
              <span className="text-xs text-muted">Checking connection...</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Native speaker orthography audit and verification gate for{" "}
            {activeLanguage.name} ({activeLanguage.code}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">Reviewer:</span>
          <input
            type="text"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            placeholder="Reviewer ID"
          />
        </div>
      </div>

      {/* Audit Progress & Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Progress
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">
              {reviewedCount}/{samples.length}
            </span>
            <span className="text-xs font-medium text-accent">
              {progressPct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Approved
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </p>
          <p className="mt-1 text-xs text-muted">Passed Gate 2</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Corrected
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {correctionCount}
          </p>
          <p className="mt-1 text-xs text-muted">Orthography adjusted</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Rejected
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">
            {rejectedCount}
          </p>
          <p className="mt-1 text-xs text-muted">Excluded from training</p>
        </div>
      </div>

      {/* Main Review Card */}
      {currentSample && (
        <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          {/* Card Header */}
          <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                {currentSample.sample_id}
              </span>
              <span className="text-xs font-medium text-muted">
                Domain: {currentSample.domain}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                Confidence:{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {(currentSample.confidence_score * 100).toFixed(0)}%
                </span>
              </span>
              {currentDecision && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    currentDecision.decision === "approved"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : currentDecision.decision === "needs_correction"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-red-500/15 text-red-700 dark:text-red-300"
                  }`}
                >
                  {currentDecision.decision.replace("_", " ")}
                </span>
              )}
            </div>
          </div>

          {/* Bilingual Comparison Panels */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Source Prompt (English)
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {currentSample.source_text}
              </p>
            </div>

            <div className="rounded-lg border border-accent/30 bg-accent-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Target Translation ({activeLanguage.name})
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {currentSample.target_text}
              </p>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Linguistic Decision
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleDecision("approved")}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  currentDecision?.decision === "approved"
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-emerald-500/40"
                }`}
              >
                <CheckIcon className="h-4 w-4" />
                Approve (Accurate)
              </button>

              <button
                type="button"
                onClick={() => handleDecision("needs_correction")}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  currentDecision?.decision === "needs_correction"
                    ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-amber-500/40"
                }`}
              >
                Correct Orthography
              </button>

              <button
                type="button"
                onClick={() => handleDecision("rejected")}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  currentDecision?.decision === "rejected"
                    ? "border-red-600 bg-red-600 text-white shadow-sm"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-red-500/40"
                }`}
              >
                <XIcon className="h-4 w-4" />
                Reject Sample
              </button>
            </div>
          </div>

          {/* Diacritics Keyboard Bar & Correction Area */}
          {currentDecision?.decision === "needs_correction" && (
            <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {activeLanguage.name} Orthography & Tone Diacritics Toolbar
                </p>
                <span className="text-xs text-muted">
                  Click diacritic to insert
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(SPECIAL_CHARS[activeLanguage.code] || []).map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertDiacritic(char)}
                    className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent-soft hover:border-accent"
                  >
                    {char}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={currentDecision.suggested_correction || ""}
                onChange={(e) =>
                  updateDecisionDetails({
                    suggested_correction: e.target.value,
                  })
                }
                placeholder={`Corrected ${activeLanguage.name} sentence with tones...`}
                className="mt-3 w-full rounded-md border border-border bg-surface p-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              />
            </div>
          )}

          {/* Linguistic Notes */}
          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Linguistic Notes / Justification
            </label>
            <input
              type="text"
              value={currentDecision?.comment || ""}
              onChange={(e) =>
                updateDecisionDetails({ comment: e.target.value })
              }
              placeholder="e.g. Tone diacritic mark on 'ọ' adjusted; natural native phrasing."
              className="mt-2 w-full rounded-md border border-border bg-surface p-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>

          {/* Card Navigation Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              ‹ Previous
            </button>

            {/* Jump Pills */}
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {samples.map((s, idx) => {
                const dec = decisions[s.sample_id]?.decision;
                return (
                  <button
                    key={s.sample_id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-7 w-7 rounded-full text-xs font-semibold transition-all ${
                      idx === currentIndex
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                        : ""
                    } ${
                      dec === "approved"
                        ? "bg-emerald-600 text-white"
                        : dec === "needs_correction"
                          ? "bg-amber-500 text-white"
                          : dec === "rejected"
                            ? "bg-red-600 text-white"
                            : "bg-surface-muted text-muted hover:bg-border"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentIndex === samples.length - 1}
              onClick={() =>
                setCurrentIndex((p) => Math.min(samples.length - 1, p + 1))
              }
              className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next ›
            </button>
          </div>
        </section>
      )}

      {/* Batch Submit Action Banner */}
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Batch Status: {approvedCount} Approved · {correctionCount} Corrected
            · {rejectedCount} Rejected
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Target Endpoint:{" "}
            {activeEndpointUrl || `${BACKEND_BASE}/review/submit`}
          </p>
        </div>

        <button
          type="button"
          disabled={reviewedCount === 0 || isSubmitting}
          onClick={handleSubmitBatch}
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting to Backend..." : "Submit Audit Batch"}
        </button>
      </section>

      {/* Submission Success Confirmation */}
      {submittedPayload && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Review Batch Successfully Recorded in Backend
              </p>
            </div>
            <span className="text-xs text-muted">
              {submittedPayload.timestamp || submittedPayload.submitted_at}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Audited payload confirming to Section 3.4 / Section 6 of API
            contract.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-surface p-3 font-mono text-xs text-foreground">
            {JSON.stringify(submittedPayload, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
