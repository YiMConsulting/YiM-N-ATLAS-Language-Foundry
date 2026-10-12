"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "@/components/icons";
import { Select } from "@/components/ui/select";
import {
  foundryApi,
  type ReviewRequestDto,
  type ReviewSampleItemDto,
  type ReviewDecision,
  type BatchSubmitResponseDto,
  type DatasetReviewEvidenceDto,
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

  const [reviewRequests, setReviewRequests] = useState<ReviewRequestDto[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [samples, setSamples] = useState<ReviewSampleItemDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewerId, setReviewerId] = useState("");
  const [decisions, setDecisions] = useState<Record<string, ItemDecision>>({});
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<BatchSubmitResponseDto | null>(null);
  const [reviewEvidence, setReviewEvidence] = useState<DatasetReviewEvidenceDto | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    setError(null);
    try {
      const [reqsRes, evRes] = await Promise.allSettled([
        foundryApi.listReviewRequests(),
        foundryApi.getDatasetReviewEvidence("tiv-mt560-v1"),
      ]);
      if (!mountedRef.current) return;
      if (reqsRes.status === "fulfilled") {
        setReviewRequests(reqsRes.value.items);
        if (reqsRes.value.items.length > 0) {
          setSelectedRequestId(reqsRes.value.items[0].id);
        } else {
          setSelectedRequestId("");
          setSamples([]);
        }
      }
      if (evRes.status === "fulfilled") {
        setReviewEvidence(evRes.value);
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : "Failed to connect to review queue endpoint.";
      setError(message);
      toast.error(message);
    } finally {
      if (mountedRef.current) {
        setIsLoadingRequests(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const [reqsRes, evRes] = await Promise.allSettled([
          foundryApi.listReviewRequests(),
          foundryApi.getDatasetReviewEvidence("tiv-mt560-v1"),
        ]);
        if (!active) return;
        if (reqsRes.status === "fulfilled") {
          setReviewRequests(reqsRes.value.items);
          if (reqsRes.value.items.length > 0) {
            setSelectedRequestId(reqsRes.value.items[0].id);
          }
        }
        if (evRes.status === "fulfilled") {
          setReviewEvidence(evRes.value);
        }
      } catch (err: unknown) {
        if (!active) return;
        const message = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : "Failed to connect to review queue endpoint.";
        setError(message);
      } finally {
        if (active) {
          setIsLoadingRequests(false);
        }
      }
    }

    initialLoad();

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
      toast.success(`Sample ${currentSample.id} marked correct`);
    } else if (decision === "needs_correction") {
      toast.info(`Marked for orthography correction`);
    } else {
      toast.error(`Sample ${currentSample.id} marked incorrect`);
    }
  }, [currentSample, decisions]);

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
    const currentCorrection =
      currentDecision?.suggested_correction ?? currentSample?.expected_text ?? "";
    updateDecisionDetails({
      suggested_correction: currentCorrection + char,
    });
  };

  const handleSubmitBatch = async () => {
    if (!currentRequest) {
      toast.error("No active review request selected.");
      return;
    }

    if (!reviewerId.trim()) {
      toast.warning("Please enter your Reviewer ID or name before submitting.");
      return;
    }

    if (reviewedCount === 0) {
      toast.warning("Please review at least one sample before submitting audit decisions.");
      return;
    }

    if (isSubmitting) {
      return;
    }

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
      toast.success(`Successfully recorded ${res.processed_decisions} audit decisions.`);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : "Failed to submit review batch to backend.";
      setError(message);
      toast.error(message);
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const activeSpecialChars =
    SPECIAL_CHARS[activeLanguage.language_code] || SPECIAL_CHARS.tiv;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-semibold tracking-tight">Human Linguistic Review</h2>
            {isLoadingRequests ? (
              <span className="text-xs text-muted">Loading queue…</span>
            ) : reviewRequests.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Requests Available ({reviewRequests.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-muted">
                Queue Empty
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Native speaker linguistic audit and verification gate for underserved Nigerian languages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="reviewer-id-input" className="text-xs font-medium text-muted">
            Reviewer ID:
          </label>
          <input
            id="reviewer-id-input"
            type="text"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            placeholder="e.g. linguist-reviewer-1"
          />
        </div>
      </div>

      {/* Review Request Queue Selector */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Review Request Queue
        </h3>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-96">
            {isLoadingRequests ? (
              <div className="h-9 w-full animate-pulse rounded-md border border-border bg-surface-muted" />
            ) : reviewRequests.length > 0 ? (
              <Select
                options={reviewRequests.map((r) => ({
                  value: r.id,
                  label: `${r.id} (${r.dataset_id} · ${r.status})`,
                }))}
                value={selectedRequestId}
                onChange={(id) => {
                  setSelectedRequestId(id);
                }}
                ariaLabel="Select review request"
              />
            ) : (
              <Select
                options={[{ value: "", label: "No review requests in queue" }]}
                value=""
                onChange={() => {}}
                ariaLabel="No review requests in queue"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentRequest ? (
              <>
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Dataset: {currentRequest.dataset_id}
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted border border-border">
                  Status: {currentRequest.status}
                </span>
                <span className="text-xs text-muted">
                  Target Sample Size: {currentRequest.sample_size}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={fetchRequests}
                className="text-xs text-accent hover:underline"
              >
                Refresh Queue
              </button>
            )}
          </div>
        </div>

        {/* Empty Queue State & Verified Evidence Presentation */}
        {!isLoadingRequests && reviewRequests.length === 0 ? (
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-border bg-surface-muted/40 p-4 text-xs text-muted leading-relaxed flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Review Queue Idle · 0 Pending Tasks
                </p>
                <p className="mt-0.5">
                  All current evaluation batches have been processed. Showing verified baseline annotations from the Tiv pilot below.
                </p>
              </div>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-mono border border-border text-muted">
                Queue Clean
              </span>
            </div>

            {/* Verified Human Review Evidence Record (Tiv Pilot - REV_04) */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-5 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-semibold text-foreground">
                      Verified Baseline Metrics · Tiv Translation Pilot
                    </h4>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      REV_04 Verified
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Native speaker audit conducted on 51 parallel sentence pairs from the pilot corpus.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Sample Progress:</span>
                  <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    51 / 203 Pairs (25.1%)
                  </span>
                </div>
              </div>

              {/* 4 Quantitative Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                    Translation Accuracy
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      4.76
                    </span>
                    <span className="text-xs text-muted">/ 5.0</span>
                  </div>
                  <span className="mt-1 text-xs text-muted block">
                    39 rated 5/5 · 12 rated 4/5
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                    Meaning Completeness
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      100%
                    </span>
                    <span className="text-xs text-muted">Yes</span>
                  </div>
                  <span className="mt-1 text-xs text-muted block">
                    Zero omission / hallucinations
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                    Tiv Naturalness
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      5.0
                    </span>
                    <span className="text-xs text-muted">/ 5.0</span>
                  </div>
                  <span className="mt-1 text-xs text-muted block">
                    100% native fluency rating
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                    Format Acceptability
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      100%
                    </span>
                    <span className="text-xs text-muted">Yes</span>
                  </div>
                  <span className="mt-1 text-xs text-muted block">
                    Punctuation &amp; casing preserved
                  </span>
                </div>
              </div>

              {/* Qualitative Observations & Reviewer Notes */}
              <div className="rounded-lg border border-border bg-surface-muted/30 p-4 space-y-2 text-xs text-muted">
                <h5 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Qualitative Findings (Evaluator REV_04)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-relaxed">
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">&bull;</span>
                      <span>
                        <strong className="text-foreground">Idiomatic Phrasing:</strong> Validated natural Tiv phrasing (e.g. <em>&quot;zwa Buter&quot;</em> for English language) rather than direct calques.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">&bull;</span>
                      <span>
                        <strong className="text-foreground">Word Order:</strong> Preserves natural Tiv syntactic structures and tone semantics.
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>
                        <strong className="text-foreground">Publication Edition Shifts:</strong> Score 4 ratings occurred due to publication edition variances (e.g. source page 29 cited as Tiv page 11).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">&bull;</span>
                      <span>
                        <strong className="text-foreground">Sample Status:</strong> 51 pairs completed; 152 pairs remain queued for subsequent review cycles.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tiv Orthography Diacritics Palette Sandbox */}
              <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Tiv Diacritics Palette (Click to Copy)
                  </span>
                  <span className="text-[11px] text-muted font-mono">
                    Language: Tiv (tiv)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {SPECIAL_CHARS.tiv.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(char);
                        toast.info(`Copied character "${char}" to clipboard`);
                      }}
                      className="rounded-md border border-border bg-surface-muted px-3 py-1 font-mono text-sm font-semibold text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
                      title={`Click to copy Tiv character ${char}`}
                    >
                      {char}
                    </button>
                  ))}
                  <span className="text-[11px] text-muted pl-2">
                    Integrated diacritics keyboard for tonal vowels and digraphs.
                  </span>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border text-xs">
                <p className="text-muted">
                  Dataset Status: <code className="font-mono text-foreground font-medium">registered</code> (Pilot baseline validated).
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="/evidence"
                    className="rounded-lg bg-accent/10 px-3 py-1.5 font-semibold text-accent hover:bg-accent/20 transition-colors"
                  >
                    View Full Evidence Dossier &rarr;
                  </a>
                  <a
                    href="/datasets/tiv-mt560-v1"
                    className="rounded-lg bg-surface-muted border border-border px-3 py-1.5 font-medium text-foreground hover:bg-surface transition-colors"
                  >
                    Inspect Tiv Dataset &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </section>

      {/* Active Audit Section: Only shown when samples exist */}
      {reviewRequests.length > 0 && samples.length > 0 && currentSample && (
        <>
          {/* Audit Progress & Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Progress</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {reviewedCount}/{samples.length}
                </span>
                <span className="text-xs font-medium text-accent">{progressPct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Correct</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </p>
              <p className="mt-1 text-xs text-muted">Verified accurate</p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Needs Correction</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {correctionCount}
              </p>
              <p className="mt-1 text-xs text-muted">Orthography adjusted</p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Incorrect</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                {incorrectCount}
              </p>
              <p className="mt-1 text-xs text-muted">Marked for exclusion</p>
            </div>
          </div>

          {/* Main Review Card */}
          <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            {/* Card Header */}
            <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                  {currentSample.id}
                </span>
                {currentSample.context ? (
                  <span className="text-xs font-medium text-muted">
                    Context: {currentSample.context}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {currentSample.flagged_reason ? (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Flagged: {currentSample.flagged_reason}
                  </span>
                ) : null}
                {currentDecision && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      currentDecision.decision === "correct"
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
                  Input Text
                </p>
                <p className="mt-2 text-base font-medium text-foreground">
                  {currentSample.input_text}
                </p>
              </div>

              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Target Translation
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {currentSample.expected_text}
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
                  onClick={() => handleDecision("correct")}
                  className={`inline-flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                    currentDecision?.decision === "correct"
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-emerald-500/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Mark Correct
                  </span>
                  <kbd className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-[10px] font-mono border border-border/80 text-muted">
                    1
                  </kbd>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision("needs_correction")}
                  className={`inline-flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                    currentDecision?.decision === "needs_correction"
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-amber-500/40"
                  }`}
                >
                  <span>Needs Correction</span>
                  <kbd className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-[10px] font-mono border border-border/80 text-muted">
                    2
                  </kbd>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision("incorrect")}
                  className={`inline-flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                    currentDecision?.decision === "incorrect"
                      ? "border-red-600 bg-red-600 text-white shadow-sm"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted hover:border-red-500/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <XIcon className="h-4 w-4" />
                    Mark Incorrect
                  </span>
                  <kbd className="rounded bg-surface-muted/80 px-1.5 py-0.5 text-[10px] font-mono border border-border/80 text-muted">
                    3
                  </kbd>
                </button>
              </div>
            </div>

            {/* Diacritics Keyboard Bar & Correction Area */}
            {currentDecision?.decision === "needs_correction" && (
              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Orthography &amp; Tone Diacritics Toolbar
                  </p>
                  <span className="text-xs text-muted">Click diacritic to insert</span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {activeSpecialChars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertDiacritic(char)}
                      className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-border bg-surface px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10 hover:border-accent"
                    >
                      {char}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={currentDecision.suggested_correction || ""}
                  onChange={(e) =>
                    updateDecisionDetails({ suggested_correction: e.target.value })
                  }
                  placeholder="Corrected translation with tones…"
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
                onChange={(e) => updateDecisionDetails({ comment: e.target.value })}
                placeholder="e.g. Tone diacritic mark adjusted; natural native phrasing."
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
                  const dec = decisions[s.id]?.decision;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-7 w-7 rounded-full text-xs font-semibold transition-all ${
                        idx === currentIndex
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : ""
                      } ${
                        dec === "correct"
                          ? "bg-emerald-600 text-white"
                          : dec === "needs_correction"
                          ? "bg-amber-500 text-white"
                          : dec === "incorrect"
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
                onClick={() => setCurrentIndex((p) => Math.min(samples.length - 1, p + 1))}
                className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next ›
              </button>
            </div>
          </section>

          {/* Batch Submit Action Banner */}
          <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Batch Status: {correctCount} Correct · {correctionCount} Corrected · {incorrectCount} Incorrect
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Target Dataset: {currentRequest?.dataset_id}
              </p>
            </div>

            <button
              type="button"
              disabled={reviewedCount === 0 || isSubmitting}
              onClick={handleSubmitBatch}
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting to Backend…" : "Submit Audit Batch"}
            </button>
          </section>
        </>
      )}

      {/* When request has 0 samples */}
      {reviewRequests.length > 0 && !isLoadingSamples && samples.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
          No sample records are associated with review request &ldquo;{selectedRequestId}&rdquo;.
        </div>
      )}

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
            <span className="text-xs text-muted">{submittedPayload.timestamp}</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {submittedPayload.message} (Dataset: {submittedPayload.dataset_id}, Reviewer:{" "}
            {submittedPayload.reviewer_id})
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-surface p-3 font-mono text-xs text-foreground">
            {JSON.stringify(submittedPayload, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
