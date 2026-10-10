"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { experiments } from "@/lib/experiments";
import { playgroundSamples } from "@/lib/playground";
import type { PlaygroundSample } from "@/lib/playground";

type Status = "idle" | "loading" | "done";

export function Playground() {
  const [experimentId, setExperimentId] = useState(
    experiments[0]?.experiment_id ?? "",
  );
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [outputs, setOutputs] = useState<{
    base: string;
    adapted: string;
  } | null>(null);

  const currentExperiment = experiments.find(
    (exp) => exp.experiment_id === experimentId,
  );

  const isYoruba = experimentId.includes("yor");
  const targetLanguageName = isYoruba ? "Yoruba" : "Igala";

  // Filter or prioritize samples matching the selected language
  const relevantSamples = playgroundSamples.filter((sample) =>
    isYoruba ? sample.language === "yor" : sample.language === "igl",
  );

  const run = async () => {
    if (!prompt.trim()) {
      toast.warning("Enter a prompt or choose a sample.");
      return;
    }

    const sample = playgroundSamples.find((item) => item.prompt === prompt);
    if (sample) {
      setStatus("loading");
      setOutputs(null);
      window.setTimeout(() => {
        setOutputs({ base: sample.base_output, adapted: sample.adapted_output });
        setStatus("done");
      }, 500);
      return;
    }

    // Try live backend generation
    setStatus("loading");
    setOutputs(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language_code: isYoruba ? "yor" : "igl",
          experiment_id: experimentId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOutputs({
          base: data.base_output,
          adapted: data.adapted_output,
        });
        setStatus("done");
        return;
      }
    } catch {
      // Backend offline
    }

    toast.info("No recorded output found for custom un-cached prompt.");
    setStatus("idle");
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
        <span className="text-sm font-medium">Selected Adapter Experiment:</span>
        <div className="w-64">
          <Select
            options={experiments.map((experiment) => ({
              value: experiment.experiment_id,
              label: `${experiment.experiment_id} (${experiment.language.split(" ")[0]})`,
            }))}
            value={experimentId}
            onChange={changeExperiment}
            ariaLabel="Select experiment"
          />
        </div>
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
          Active: {currentExperiment?.language ?? targetLanguageName}
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
            {status === "loading" ? "Running Inference…" : "Run Comparison"}
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
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted hover:border-accent/40"
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
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Evaluated side-by-side
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
      <div className="flex items-center justify-between">
        <h4
          className={`text-xs font-semibold uppercase tracking-wider ${
            highlight ? "text-accent" : "text-muted"
          }`}
        >
          {title}
        </h4>
      </div>

      <div className="mt-3 min-h-[90px] text-sm">
        {loading ? (
          <div className="flex h-20 items-center justify-center text-muted">
            <span className="animate-pulse">Generating translation…</span>
          </div>
        ) : text ? (
          <p className="whitespace-pre-wrap font-medium text-foreground leading-relaxed">
            {text}
          </p>
        ) : (
          <p className="text-muted italic">Click 'Run Comparison' to observe model generation.</p>
        )}
      </div>
    </div>
  );
}
