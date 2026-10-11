"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { experiments } from "@/lib/mocks/experiments";
import { generate } from "@/lib/api/generate";
import { isMockMode } from "@/lib/api/mock";
import { playgroundSamples } from "@/lib/playground";
import type { PlaygroundSample } from "@/lib/playground";

type Status = "idle" | "loading" | "done";

type Outputs = {
  base?: string;
  adapted?: string;
  latencyMs?: number;
};

export function Playground() {
  const mockMode = isMockMode();
  const [experimentId, setExperimentId] = useState(experiments[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [outputs, setOutputs] = useState<Outputs | null>(null);

  const currentExperiment = experiments.find((exp) => exp.id === experimentId);
  const languageCode = currentExperiment?.language_code ?? "igl";
  const targetLanguageName = languageCode === "yor" ? "Yoruba" : "Igala";

  const relevantSamples = playgroundSamples.filter(
    (sample) => sample.language === languageCode,
  );

  const run = async () => {
    if (!prompt.trim()) {
      toast.warning("Enter a prompt or choose a sample.");
      return;
    }

    if (mockMode) {
      const sample = playgroundSamples.find((item) => item.prompt === prompt);
      if (!sample) {
        toast.info("No recorded output for this prompt.");
        return;
      }

      setStatus("loading");
      setOutputs(null);
      window.setTimeout(() => {
        setOutputs({
          base: sample.base_output,
          adapted: sample.adapted_output,
        });
        setStatus("done");
      }, 500);
      return;
    }

    setStatus("loading");
    setOutputs(null);
    try {
      const response = await generate({
        prompt,
        language_code: languageCode,
        experiment_id: experimentId,
        max_new_tokens: 64,
        do_sample: false,
      });
      setOutputs({
        base: response.base_output,
        adapted: response.adapted_output,
        latencyMs: response.latency_ms,
      });
      setStatus("done");
    } catch {
      toast.error("Inference unavailable — model executor not connected.");
      setStatus("idle");
    }
  };

  const chooseSample = (sample: PlaygroundSample) => {
    setPrompt(sample.prompt);
    setOutputs(null);
    setStatus("idle");
  };

  const changeExperiment = (nextId: string) => {
    setExperimentId(nextId);
    setOutputs(null);
    setStatus("idle");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-medium">
          Selected Adapter Experiment:
        </span>
        <div className="w-64">
          <Select
            options={experiments.map((experiment) => ({
              value: experiment.id,
              label: `${experiment.id} (${experiment.language_code})`,
            }))}
            value={experimentId}
            onChange={changeExperiment}
            ariaLabel="Select experiment"
          />
        </div>
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
          Active: {targetLanguageName}
        </span>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Inference Prompt
        </h3>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder={`Type ${targetLanguageName} or English text…`}
          className="mt-3 w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading"
              ? "Running…"
              : mockMode
                ? "Run Comparison"
                : "Generate"}
          </button>
        </div>
      </section>

      <section>
        <p className="text-sm text-muted">
          Suggested sample prompts for {targetLanguageName}:
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {relevantSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => chooseSample(sample)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-surface-muted"
            >
              {sample.prompt}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Outputs Comparison
          </h3>
          {status === "done" ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                mockMode
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {mockMode ? "Recorded outputs" : "Live inference"}
            </span>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <OutputPanel
            title="Base N-ATLAS (Zero-Shot Baseline)"
            text={outputs?.base}
            loading={status === "loading"}
          />
          <OutputPanel
            title={`N-ATLAS + ${targetLanguageName} LoRA Adapter`}
            text={outputs?.adapted}
            loading={status === "loading"}
            highlight
          />
        </div>

        {!mockMode && outputs?.latencyMs != null ? (
          <p className="mt-3 text-xs text-muted">
            Latency {outputs.latencyMs.toFixed(0)} ms
          </p>
        ) : null}
      </section>
    </div>
  );
}

function OutputPanel({
  title,
  text,
  loading,
  highlight = false,
}: {
  title: string;
  text?: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-accent/30 bg-accent-soft"
          : "border-border bg-surface-muted"
      }`}
    >
      <h4
        className={`text-xs font-semibold uppercase tracking-wider ${
          highlight ? "text-accent" : "text-muted"
        }`}
      >
        {title}
      </h4>

      <div className="mt-3 min-h-[90px] text-sm">
        {loading ? (
          <div className="flex h-20 items-center justify-center text-muted">
            <span className="animate-pulse">Generating translation…</span>
          </div>
        ) : text ? (
          <p className="whitespace-pre-wrap font-medium leading-relaxed text-foreground">
            {text}
          </p>
        ) : (
          <p className="italic text-muted">
            Click Run to observe model generation.
          </p>
        )}
      </div>
    </div>
  );
}
