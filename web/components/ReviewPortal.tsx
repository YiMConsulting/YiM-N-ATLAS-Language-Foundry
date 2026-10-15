"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "@/components/icons";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  foundryApi,
  type ReviewRequestDto,
  type ReviewSampleItemDto,
  type ReviewDecision,
  type BatchSubmitResponseDto,
} from "@/lib/api-client";
import { useLanguage } from "@/components/layout/language-provider";

const SPECIAL_CHARS: Record<string, string[]> = {
  tiv: ["ô", "û", "gh", "kp", "mb", "sh", "ts"],
  igl: ["ẹ", "ọ", "ñ", "ch", "gb", "kp", "kw", "gw", "́", "̀", "̄"],
  yor: ["ẹ", "ọ", "ṣ", "gb", "́", "̀", "̄"],
  hau: ["ɓ", "ɗ", "ƙ", "ƴ", "r̃"],
  ibo: ["ị", "ọ", "ụ", "ṅ", "ch", "gb", "gh", "gw", "kp", "kw", "nw", "ny", "sh"],
};

type ItemDecision = {
  decision: ReviewDecision;
  comment: string;
  suggested_correction?: string;
};

export function ReviewPortal() {
  const { activeLanguage } = useLanguage();
  const mountedRef = useRef(true);
  const correctionInputRef = useRef<HTMLInputElement>(null);

  const [reviewRequests, setReviewRequests] = useState<ReviewRequestDto[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [samples, setSamples] = useState<ReviewSampleItemDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewerId, setReviewerId] = useState("linguist-reviewer-1");
  const [decisions, setDecisions] = useState<Record<string, ItemDecision>>({});
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<BatchSubmitResponseDto | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoadingRequests(true);
    setError(null);
    try {
      const reqsRes = await foundryApi.listReviewRequests();
      if (!mountedRef.current) return;
      setReviewRequests(reqsRes.items);
      if (reqsRes.items.length > 0) {
        setSelectedRequestId(reqsRes.items[0].id);
      } else {
        setSelectedRequestId("");
        setSamples([]);
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setIsReadOnly(true);
        setError("Human review endpoints are operating in read-only mode on this deployment.");
      } else {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : "Failed to connect to review queue endpoint.";
        setError(message);
        toast.error(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoadingRequests(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const reqsRes = await foundryApi.listReviewRequests();
        if (!active) return;
        setReviewRequests(reqsRes.items);
        if (reqsRes.items.length > 0) {
          setSelectedRequestId(reqsRes.items[0].id);
        } else {
          setSelectedRequestId("");
          setSamples([]);
        }
      } catch (err: unknown) {
        if (!active) return;
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setIsReadOnly(true);
          setError("Human review endpoints are operating in read-only mode on this deployment.");
        } else {
          const message = axios.isAxiosError(err)
            ? err.response?.data?.detail || err.message
            : "Failed to connect to review queue endpoint.";
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoadingRequests(false);
        }
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  // Load samples whenever the selected request changes
  useEffect(() => {
    if (!selectedRequestId) return;

    let isCurrent = true;

    async function loadSamples() {
      setIsLoadingSamples(true);
      setSubmittedPayload(null);
      setDecisions({});
      setCurrentIndex(0);

      try {
        const res = await foundryApi.getReviewSamples(selectedRequestId);
        if (!isCurrent || !mountedRef.current) return;
        setSamples(res.items);
      } catch (err: unknown) {
        if (!isCurrent || !mountedRef.current) return;
        const message = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : `Failed to load samples for request ${selectedRequestId}.`;
        toast.error(message);
        setSamples([]);
      } finally {
        if (isCurrent && mountedRef.current) {
          setIsLoadingSamples(false);
        }
      }
    }

    loadSamples();

    return () => {
      isCurrent = false;
    };
  }, [selectedRequestId]);

  const currentRequest = reviewRequests.find((r) => r.id === selectedRequestId);
  const currentSample = samples[currentIndex];
  const currentDecision = currentSample ? decisions[currentSample.id] : undefined;

  // Calculate statistics
  const reviewedCount = Object.keys(decisions).length;
  const correctCount = Object.values(decisions).filter((d) => d.decision === "correct").length;
  const correctionCount = Object.values(decisions).filter((d) => d.decision === "needs_correction").length;
  const incorrectCount = Object.values(decisions).filter((d) => d.decision === "incorrect").length;
  const progressPct = samples.length > 0 ? Math.round((reviewedCount / samples.length) * 100) : 0;

  const handleDecision = useCallback((decision: ReviewDecision) => {
    if (!currentSample) return;

    const newDecisionRecord: ItemDecision = {
      decision,
      comment: decisions[currentSample.id]?.comment || "",
      suggested_correction:
        decision === "needs_correction"
          ? decisions[currentSample.id]?.suggested_correction || currentSample.expected_text
          : undefined,
    };

    setDecisions((prev) => ({
      ...prev,
      [currentSample.id]: newDecisionRecord,
    }));

    if (decision === "correct") {
      toast.success(`Sample #${currentIndex + 1} marked accurate`);
    } else if (decision === "needs_correction") {
      toast.info(`Marked for correction`);
    } else {
      toast.error(`Sample #${currentIndex + 1} marked incorrect`);
    }
  }, [currentSample, currentIndex, decisions]);

  // Keyboard shortcut listener for rapid reviewer triage
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "1" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleDecision("correct");
      } else if (e.key === "2" || e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleDecision("needs_correction");
      } else if (e.key === "3" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleDecision("incorrect");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((p) => Math.min(samples.length - 1, p + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((p) => Math.max(0, p - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [samples.length, handleDecision]);

  const updateDecisionDetails = (patch: Partial<ItemDecision>) => {
    if (!currentSample) return;
    setDecisions((prev) => {
      const existing = prev[currentSample.id] || {
        decision: "needs_correction",
        comment: "",
      };
      return {
        ...prev,
        [currentSample.id]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const insertDiacritic = (char: string) => {
    const input = correctionInputRef.current;
    const currentVal =
      currentDecision?.suggested_correction ?? currentSample?.expected_text ?? "";

    if (input) {
      const start = input.selectionStart ?? currentVal.length;
      const end = input.selectionEnd ?? currentVal.length;
      const nextVal = currentVal.substring(0, start) + char + currentVal.substring(end);
      updateDecisionDetails({ suggested_correction: nextVal });

      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + char.length, start + char.length);
      }, 10);
    } else {
      updateDecisionDetails({ suggested_correction: currentVal + char });
    }
  };

  const handleSubmitBatch = async () => {
    if (!currentRequest) {
      toast.error("No active review request selected.");
      return;
    }

    if (!reviewerId.trim()) {
      toast.warning("Please enter your Reviewer ID before submitting.");
      return;
    }

    if (reviewedCount === 0) {
      toast.warning("Please review at least one sample before submitting audit decisions.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const payloadDecisions = Object.entries(decisions).map(([sampleId, d]) => ({
      sample_id: sampleId,
      sample_item_id: sampleId,
      decision: d.decision,
      suggested_correction: d.suggested_correction,
      corrected_text: d.suggested_correction,
      comment: d.comment,
      notes: d.comment,
    }));

    try {
      const res = await foundryApi.submitReviewBatch({
        dataset_id: currentRequest.dataset_id,
        reviewer_id: reviewerId.trim(),
        decisions: payloadDecisions,
        submitted_at: new Date().toISOString(),
      });

      if (!mountedRef.current) return;
      setSubmittedPayload(res);
      toast.success(`Recorded ${res.processed_decisions} audit decisions.`);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setIsReadOnly(true);
        const msg = "Review submission rejected: System is operating in READ_ONLY_MODE.";
        setError(msg);
        toast.error(msg);
      } else {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : "Failed to submit review batch to backend.";
        setError(message);
        toast.error(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const activeSpecialChars =
    SPECIAL_CHARS[activeLanguage.language_code] || SPECIAL_CHARS.tiv;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Fluid Editorial Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Human Review
            </h1>
            <Badge variant="accent">Verification Gate</Badge>
          </div>
          <p className="mt-1.5 text-sm text-foreground-secondary">
            Native speaker validation and orthographic auditing for {activeLanguage.name} ({activeLanguage.language_code}).
          </p>
        </div>

        {/* Reviewer Identifier */}
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <span>Reviewer</span>
          <input
            id="reviewer-id-input"
            type="text"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            disabled={isReadOnly}
            className="w-36 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-mono font-medium text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50"
            placeholder="reviewer-id"
          />
        </div>
      </div>

      {isReadOnly && (
        <div className="rounded-lg border border-warning-border bg-warning-soft px-4 py-3 text-xs text-warning flex items-center justify-between">
          <span>
            <strong>Read-only mode active:</strong> Submissions are disabled on this instance. Triage actions can be practiced locally but will not persist.
          </span>
          <Badge variant="warning">Read Only</Badge>
        </div>
      )}

      {/* Interactive Queue Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1 text-sm">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-medium text-foreground-secondary shrink-0">
            Batch Queue
          </span>
          <div className="w-full sm:w-80">
            {isLoadingRequests ? (
              <div className="h-8 w-full animate-pulse rounded border border-border bg-surface-secondary" />
            ) : reviewRequests.length > 0 ? (
              <Select
                options={reviewRequests.map((r) => ({
                  value: r.id,
                  label: `${r.id} · ${r.dataset_id} (${r.status})`,
                }))}
                value={selectedRequestId}
                onChange={setSelectedRequestId}
                ariaLabel="Select review request"
              />
            ) : (
              <div className="flex h-8 items-center rounded border border-border bg-surface-secondary px-3 text-xs text-foreground-muted">
                0 active requests in queue
              </div>
            )}
          </div>

          {currentRequest && (
            <span className="text-xs text-foreground-muted">
              {currentRequest.sample_size} target pairs
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoadingRequests}
            className="font-medium text-accent hover:underline disabled:opacity-50 cursor-pointer"
          >
            {isLoadingRequests ? "Refreshing…" : "Refresh queue"}
          </button>
          <span className="text-foreground-muted">·</span>
          <Link
            href="/evidence"
            className="font-medium text-foreground-secondary hover:text-foreground transition-colors"
          >
            Offline Evidence Dossier
          </Link>
        </div>
      </div>

      {error && !isReadOnly && (
        <div className="rounded-lg border border-error-border bg-error-soft px-4 py-3 text-xs text-error">
          Notice: {error}
        </div>
      )}

      {isLoadingSamples && (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-xs text-foreground-muted">Loading review samples from queue…</p>
        </div>
      )}

      {/* ACTIVE AUDIT WORKBENCH */}
      {!isLoadingSamples && reviewRequests.length > 0 && samples.length > 0 && currentSample && (
        <div className="space-y-6">
          {/* Progress & Quick Metrics Strip (Unboxed) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border text-xs text-foreground-secondary">
            <div className="flex items-center gap-3">
              <span>
                Sample <strong className="text-foreground">{currentIndex + 1}</strong> of {samples.length}
              </span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-medium text-accent">{progressPct}%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-success font-medium">
                {correctCount} approved
              </span>
              <span className="text-foreground-muted">·</span>
              <span className="text-warning font-medium">
                {correctionCount} corrected
              </span>
              <span className="text-foreground-muted">·</span>
              <span className="text-error font-medium">
                {incorrectCount} rejected
              </span>
            </div>
          </div>

          {/* Focal Review Area */}
          <div className="space-y-6">
            {/* Sample ID & Context Header */}
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <span className="font-mono">ID: {currentSample.id}</span>
                {currentSample.context && (
                  <span className="rounded bg-surface-secondary px-2 py-0.5 text-[11px] text-foreground-secondary">
                    {currentSample.context}
                  </span>
                )}
              </div>

              {currentDecision ? (
                <Badge
                  variant={
                    currentDecision.decision === "correct"
                      ? "success"
                      : currentDecision.decision === "needs_correction"
                      ? "warning"
                      : "error"
                  }
                >
                  {currentDecision.decision.replace("_", " ")}
                </Badge>
              ) : (
                <span className="text-foreground-muted text-[11px]">Unreviewed</span>
              )}
            </div>

            {/* Parallel Bilingual Reading Layout */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Source (English) */}
              <div className="rounded-xl bg-surface-secondary/50 p-6 space-y-2">
                <div className="text-xs font-medium text-foreground-muted">
                  English source
                </div>
                <p className="text-base text-foreground leading-relaxed">
                  {currentSample.input_text}
                </p>
              </div>

              {/* Target (African Language) */}
              <div className="rounded-xl bg-accent-soft p-6 space-y-2 border border-accent/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-accent">
                    {activeLanguage.name} translation
                  </span>
                  <span className="font-mono text-[11px] text-foreground-muted uppercase">
                    {activeLanguage.language_code}
                  </span>
                </div>
                <p className="text-xl font-medium font-linguistic text-foreground leading-relaxed">
                  {currentSample.expected_text}
                </p>
              </div>
            </div>

            {/* Ergonomic Decision Dock */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>Linguistic judgment</span>
                <span className="hidden sm:inline">Shortcuts: 1, 2, 3 (or left / right keys)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* 1. Mark Correct */}
                <button
                  type="button"
                  onClick={() => handleDecision("correct")}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    currentDecision?.decision === "correct"
                      ? "border-accent bg-accent text-accent-contrast shadow-subtle"
                      : "border-border bg-surface text-foreground hover:bg-surface-secondary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Accurate &amp; Natural
                  </span>
                  <kbd className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-foreground-muted">
                    1
                  </kbd>
                </button>

                {/* 2. Needs Correction */}
                <button
                  type="button"
                  onClick={() => handleDecision("needs_correction")}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    currentDecision?.decision === "needs_correction"
                      ? "border-warning bg-warning text-white shadow-subtle"
                      : "border-border bg-surface text-foreground hover:bg-surface-secondary"
                  }`}
                >
                  <span>Suggest Correction</span>
                  <kbd className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-foreground-muted">
                    2
                  </kbd>
                </button>

                {/* 3. Mark Incorrect */}
                <button
                  type="button"
                  onClick={() => handleDecision("incorrect")}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    currentDecision?.decision === "incorrect"
                      ? "border-error bg-error text-white shadow-subtle"
                      : "border-border bg-surface text-foreground hover:bg-surface-secondary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <XIcon className="h-4 w-4" />
                    Inaccurate
                  </span>
                  <kbd className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-foreground-muted">
                    3
                  </kbd>
                </button>
              </div>
            </div>

            {/* Diacritics Keyboard Bar & Correction Workspace */}
            {currentDecision?.decision === "needs_correction" && (
              <div className="rounded-xl border border-warning-border bg-warning-soft/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-warning">
                    Insert diacritics &amp; tone marks:
                  </span>
                  <span className="text-[11px] text-foreground-muted">
                    Click character to insert at cursor
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeSpecialChars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertDiacritic(char)}
                      className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2.5 font-mono text-sm font-semibold text-foreground transition-colors hover:border-accent cursor-pointer"
                      title={`Insert ${char}`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground-secondary block">
                    Corrected text:
                  </label>
                  <input
                    ref={correctionInputRef}
                    type="text"
                    value={currentDecision.suggested_correction || ""}
                    onChange={(e) =>
                      updateDecisionDetails({ suggested_correction: e.target.value })
                    }
                    placeholder="Enter revised translation…"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium font-linguistic text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
              </div>
            )}

            {/* Reviewer Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary block">
                Reviewer field notes (optional)
              </label>
              <input
                type="text"
                value={currentDecision?.comment || ""}
                onChange={(e) => updateDecisionDetails({ comment: e.target.value })}
                placeholder="e.g. Tone diacritic mark adjusted; idiom validated."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            {/* Pagination & Jump Rail */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              >
                ‹ Previous
              </Button>

              {/* Sample Jump Pills */}
              <div className="flex gap-1 overflow-x-auto max-w-sm py-1 px-2">
                {samples.map((s, idx) => {
                  const dec = decisions[s.id]?.decision;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-6 w-6 shrink-0 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        idx === currentIndex
                          ? "ring-2 ring-accent ring-offset-1 ring-offset-background"
                          : ""
                      } ${
                        dec === "correct"
                          ? "bg-accent text-accent-contrast"
                          : dec === "needs_correction"
                          ? "bg-warning text-white"
                          : dec === "incorrect"
                          ? "bg-error text-white"
                          : "bg-surface-secondary text-foreground-muted hover:bg-surface-tertiary"
                      }`}
                      title={`Sample ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === samples.length - 1}
                onClick={() => setCurrentIndex((p) => Math.min(samples.length - 1, p + 1))}
              >
                Next ›
              </Button>
            </div>
          </div>

          {/* Submission Bar (Unboxed) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Batch session · {reviewedCount} of {samples.length} processed
              </p>
              <p className="text-xs text-foreground-secondary">
                Review decisions will be permanently committed to the dataset provenance trail.
              </p>
            </div>

            <Button
              variant="primary"
              disabled={reviewedCount === 0 || isSubmitting || isReadOnly}
              onClick={handleSubmitBatch}
            >
              {isSubmitting ? "Submitting…" : "Commit review batch"}
            </Button>
          </div>
        </div>
      )}

      {/* IDLE / EMPTY STATE */}
      {!isLoadingRequests && !isLoadingSamples && (reviewRequests.length === 0 || samples.length === 0) && (
        <div className="py-16 text-center space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CheckIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Review queue is clear
            </h2>
            <p className="text-xs text-foreground-secondary max-w-md mx-auto">
              There are no pending interactive human review requests in the queue.
              All active dataset batches have either been verified or are waiting for new audit requests.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/evidence"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-contrast hover:bg-accent-hover transition-colors"
            >
              Inspect Offline Evidence Dossier
            </Link>
            <Link
              href="/datasets"
              className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
            >
              Browse Datasets
            </Link>
          </div>
        </div>
      )}

      {/* Submission Success Confirmation */}
      {submittedPayload && (
        <div className="rounded-xl border border-success-border bg-success-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-success" />
              <p className="text-sm font-semibold text-foreground">
                Review batch successfully recorded
              </p>
            </div>
            <span className="text-xs text-foreground-muted">{submittedPayload.timestamp}</span>
          </div>
          <p className="text-xs text-foreground-secondary">
            {submittedPayload.message} (Dataset: {submittedPayload.dataset_id}, Reviewer:{" "}
            {submittedPayload.reviewer_id})
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs text-foreground">
            {JSON.stringify(submittedPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
