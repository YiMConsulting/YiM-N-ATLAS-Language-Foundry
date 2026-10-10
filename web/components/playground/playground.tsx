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

  const run = () => {
    if (!prompt.trim()) {
      toast.warning("Enter a prompt or choose a sample.");
      return;
    }

    const sample = playgroundSamples.find((item) => item.prompt === prompt);
    if (!sample) {
      toast.info(
        "Live model not connected — no recorded output for this prompt.",
      );
      return;
    }

    setStatus("loading");
    setOutputs(null);
    window.setTimeout(() => {
      setOutputs({ base: sample.base_output, adapted: sample.adapted_output });
      setStatus("done");
    }, 600);
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
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Experiment</span>
        <div className="w-52">
          <Select
            options={experiments.map((experiment) => ({
              value: experiment.experiment_id,
              label: experiment.experiment_id,
            }))}
            value={experimentId}
            onChange={changeExperiment}
            ariaLabel="Select experiment"
          />
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Prompt
        </h3>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="Type Igala or English text…"
          className="mt-3 w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Running…" : "Run"}
          </button>
        </div>
      </section>

      <section>
        <p className="text-sm text-muted">Sample prompts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {playgroundSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => chooseSample(sample)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
            >
              {sample.prompt}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Outputs
          </h3>
          {status === "done" ? (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              Recorded outputs
            </span>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <OutputPanel
            title="Base N-ATLAS"
            text={outputs?.base}
            loading={status === "loading"}
          />
          <OutputPanel
            title="N-ATLAS + Igala adapter"
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
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </p>
      {loading ? (
        <div className="mt-3 h-16 animate-pulse rounded-md bg-border/50" />
      ) : (
        <p className="mt-2 min-h-16 text-sm">
          {text ?? "Output will appear here."}
        </p>
      )}
    </div>
  );
}
