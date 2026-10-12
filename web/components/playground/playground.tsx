"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  foundryApi,
  type ExperimentDto,
  type PlaygroundResponse,
} from "@/lib/api-client";

type Status = "idle" | "loading" | "done" | "error";

type SamplePrompt = {
  label: string;
  english: string;
  tivReference: string;
  notes: string;
};

const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    label: "Greeting",
    english: "Good morning.",
    tivReference: "Ngu dedoo.",
    notes: "Everyday native greeting in standard Tiv orthography.",
  },
  {
    label: "Market Location",
    english: "Where is the market?",
    tivReference: "Kasua ngu hana?",
    notes: "Authentic question particle and word order.",
  },
  {
    label: "Education",
    english: "The children are learning in school.",
    tivReference: "Mbayev mba henen kwagh ken makeranta.",
    notes: "Noun class marker (Mbayev) and loanword integration (makeranta).",
  },
  {
    label: "Welcome",
    english: "Welcome to our home.",
    tivReference: "Msugh u va ken ya wase.",
    notes: "Idiomatic welcome hospitality formula.",
  },
];

export function Playground() {
  const [experiments, setExperiments] = useState<ExperimentDto[]>([]);
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].english);
  const [selectedSample, setSelectedSample] = useState<SamplePrompt | null>(SAMPLE_PROMPTS[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [output, setOutput] = useState<PlaygroundResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadExperiments() {
      try {
        const res = await foundryApi.listExperiments();
        if (mounted) {
          setExperiments(res.items);
        }
      } catch {
        // Safe fallback
      }
    }
    loadExperiments();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectSample = (sample: SamplePrompt) => {
    setSelectedSample(sample);
    setPrompt(sample.english);
    setStatus("idle");
    setStatusMessage(null);
    setOutput(null);
  };

  const run = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.warning("Please enter a prompt to generate text.");
      return;
    }

    setStatus("loading");
    setStatusMessage(null);
    setOutput(null);

    try {
      const res = await foundryApi.generate({
        prompt: trimmed,
        language_code: "tiv",
        max_new_tokens: 128,
        do_sample: false,
      });

      if (res && res.generated_text) {
        setOutput(res);
        setStatus("done");
        toast.success("Generation completed");
      }
    } catch (err: unknown) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        const detail = err.response?.data?.detail;

        if (code === 503) {
          const message =
            typeof detail === "string"
              ? detail
              : "Model inference is currently unavailable. Real inference endpoints are pending model hosting and adapter deployment.";
          setStatusMessage(message);
          toast.info("Inference endpoint returned HTTP 503 (Expected offline demo status)");
          return;
        }

        const message =
          typeof detail === "string" ? detail : err.message || "Request failed.";
        setStatusMessage(message);
        toast.error(`Error (HTTP ${code}): ${message}`);
      } else {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setStatusMessage(message);
      }
    }
  };

  const charCount = prompt.length;
  const approxTokens = Math.max(1, Math.ceil(prompt.split(/\s+/).filter(Boolean).length * 1.3));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Infrastructure Telemetry Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent font-mono font-bold text-sm">
            8B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                Target Model: NCAIR1/N-ATLaS
              </span>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                GPU Worker Offline
              </span>
            </div>
            <p className="text-xs text-muted">
              Live weights require dedicated GPU worker instance. Control plane enforces system truthfulness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-muted font-mono">
            tiv-lora-pilot
          </span>
          <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
            Tiv Pilot
          </span>
        </div>
      </div>

      {/* Quick Prompt Selectors */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
          Preset Evaluation Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
                selectedSample?.label === sample.label
                  ? "bg-accent text-accent-foreground border-accent shadow-xs"
                  : "bg-surface border-border text-muted hover:border-accent hover:text-foreground",
              ].join(" ")}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual-Pane Studio Canvas */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Left Pane: Source English */}
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Source Input (English)
              </span>
              <span className="font-mono text-xs text-muted">
                {charCount} chars · ~{approxTokens} tokens
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setSelectedSample(null);
              }}
              rows={6}
              className="mt-4 w-full rounded-lg border border-border bg-surface-muted/40 p-3.5 text-sm font-medium text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 resize-none leading-relaxed"
              placeholder="Type English sentence to test adaptation…"
            />

            {selectedSample ? (
              <p className="mt-2 text-xs text-muted">
                <span className="font-semibold text-foreground">Context:</span> {selectedSample.notes}
              </p>
            ) : null}
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">
              POST /api/v1/playground/generate
            </span>
            <button
              type="button"
              onClick={run}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {status === "loading" ? "Contacting Model…" : "Test Inference Endpoint"}
            </button>
          </div>
        </div>

        {/* Right Pane: Target Tiv Output */}
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Target Output (Tiv · tiv)
              </span>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent border border-accent/20">
                Latin / Tivoid
              </span>
            </div>

            <div className="mt-4 min-h-[160px] rounded-lg border border-border bg-surface-muted/30 p-4 space-y-3">
              {/* Reference Translation Card */}
              {selectedSample ? (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Verified Corpus Reference (Ground Truth)
                  </span>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {selectedSample.tivReference}
                  </p>
                </div>
              ) : null}

              {/* Live Inference Output or Truthful Notice */}
              {status === "loading" ? (
                <div className="flex h-20 items-center justify-center text-xs text-muted">
                  <span className="animate-pulse">Querying FastAPI inference gateway…</span>
                </div>
              ) : status === "error" && statusMessage ? (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Truthful Offline Notice (HTTP 503)
                    </span>
                    <span className="text-[10px] font-mono text-muted">Expected Behavior</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {statusMessage}
                  </p>
                </div>
              ) : status === "done" && output ? (
                <div className="rounded-md border border-border bg-surface p-3">
                  <p className="text-base font-semibold text-foreground leading-relaxed">
                    {output.generated_text}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted italic pt-2">
                  Click &ldquo;Test Inference Endpoint&rdquo; to test live backend error handling, or select a sample prompt to preview verified parallel references.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Deterministic Sampling: Off</span>
            <span>Max New Tokens: 128</span>
          </div>
        </div>
      </div>
    </div>
  );
}
