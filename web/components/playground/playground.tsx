"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/experiments/status-badge";
import { Select } from "@/components/ui/select";
import {
  foundryApi,
  type ExperimentDto,
  type PlaygroundResponse,
} from "@/lib/api-client";

type Status = "idle" | "loading" | "done" | "error";

type ErrorInfo = {
  statusText: string;
  statusCode?: number;
  message: string;
};

export function Playground() {
  const [experiments, setExperiments] = useState<ExperimentDto[]>([]);
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(true);
  const [experimentId, setExperimentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [output, setOutput] = useState<PlaygroundResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadExperiments() {
      try {
        const res = await foundryApi.listExperiments();
        if (mounted) {
          setExperiments(res.items);
          if (res.items.length > 0) {
            setExperimentId(res.items[0].id);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load experiment registry.";
          toast.error(msg);
        }
      } finally {
        if (mounted) {
          setIsLoadingExperiments(false);
        }
      }
    }

    loadExperiments();

    return () => {
      mounted = false;
    };
  }, []);

  const currentExperiment = experiments.find((exp) => exp.id === experimentId);
  const hasExperiments = experiments.length > 0;
  const isExperimentReady =
    currentExperiment?.status === "completed" &&
    Boolean(currentExperiment.artifacts?.adapter_path);

  const run = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.warning("Please enter a prompt to generate text.");
      return;
    }

    if (status === "loading") {
      return;
    }

    if (!hasExperiments || !isExperimentReady) {
      toast.warning("Inference requires an eligible, completed experiment.");
      return;
    }

    setStatus("loading");
    setErrorInfo(null);
    setOutput(null);

    try {
      const res = await foundryApi.generate({
        prompt: trimmed,
        language_code: currentExperiment?.language_code ?? "tiv",
        experiment_id: currentExperiment?.id || undefined,
        max_new_tokens: 64,
        do_sample: false,
      });

      if (
        res &&
        typeof res.generated_text === "string" &&
        res.generated_text.trim().length > 0
      ) {
        setOutput(res);
        setStatus("done");
      } else {
        setStatus("error");
        setErrorInfo({
          statusText: "Invalid Response",
          message: "API did not return valid generated text in the response body.",
        });
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
          setErrorInfo({
            statusText: "Inference Unavailable (HTTP 503)",
            statusCode: 503,
            message,
          });
          toast.info("Inference unavailable (HTTP 503)");
          return;
        }

        if (code === 422) {
          const message =
            typeof detail === "string"
              ? detail
              : "Request rejected by schema validation. Check input prompt and parameters.";
          setErrorInfo({
            statusText: "Validation Error (HTTP 422)",
            statusCode: 422,
            message,
          });
          toast.error("Validation error (HTTP 422)");
          return;
        }

        if (!err.response) {
          setErrorInfo({
            statusText: "Network Error",
            message:
              "Unable to connect to Foundry API. Verify that the backend server is running and accessible.",
          });
          toast.error("Network error connecting to API");
          return;
        }

        const message =
          typeof detail === "string" ? detail : err.message || "Request failed.";
        setErrorInfo({
          statusText: `API Error (HTTP ${code})`,
          statusCode: code,
          message,
        });
        toast.error(`API Error (HTTP ${code})`);
      } else {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setErrorInfo({
          statusText: "Unexpected Error",
          message,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Experiment Selector */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Adapter Experiment Selection
        </h3>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-80">
            {isLoadingExperiments ? (
              <div className="h-9 w-full animate-pulse rounded-md border border-border bg-surface-muted" />
            ) : hasExperiments ? (
              <Select
                options={experiments.map((exp) => ({
                  value: exp.id,
                  label: `${exp.id} (${exp.language_code.toUpperCase()})`,
                }))}
                value={experimentId}
                onChange={(id) => {
                  setExperimentId(id);
                  setOutput(null);
                  setErrorInfo(null);
                  setStatus("idle");
                }}
                ariaLabel="Select experiment"
              />
            ) : (
              <Select
                options={[{ value: "", label: "No experiments registered" }]}
                value=""
                onChange={() => {}}
                ariaLabel="No experiments registered"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentExperiment ? (
              <>
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Language: {currentExperiment.language_code.toUpperCase()}
                </span>
                <StatusBadge status={currentExperiment.status} />
              </>
            ) : (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted border border-border">
                {isLoadingExperiments
                  ? "Loading registry…"
                  : "No experiments registered"}
              </span>
            )}
          </div>
        </div>

        {!isLoadingExperiments && !hasExperiments ? (
          <div className="mt-4 rounded-md border border-border bg-surface-muted/40 p-4 text-xs text-muted">
            The experiment registry contains no recorded adaptation runs.
            Inference generation requires an experiment checkpoint registered in the Foundry.
          </div>
        ) : null}

        {currentExperiment && !isExperimentReady ? (
          <div className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Note: Experiment &ldquo;{currentExperiment.id || "unspecified"}&rdquo; is currently in{" "}
            <strong className="capitalize">{currentExperiment.status || "pending"}</strong> status. Live adapter inference
            requires completed checkpoint artifacts.
          </div>
        ) : null}
      </section>

      {/* Inference Prompt Input */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Inference Prompt
        </h3>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder={
            currentExperiment
              ? `Enter text to generate in ${currentExperiment.language_code.toUpperCase()}…`
              : "Enter prompt text for generation…"
          }
          className="mt-3 w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            max_new_tokens: 64 · do_sample: false
          </span>
          <button
            type="button"
            onClick={run}
            disabled={status === "loading" || !hasExperiments || !isExperimentReady}
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading"
              ? "Running Inference…"
              : !hasExperiments
              ? "Inference Unavailable (No Experiments)"
              : !isExperimentReady
              ? "Inference Unavailable (Experiment Ineligible)"
              : "Generate"}
          </button>
        </div>
      </section>

      {/* Output & Inference Status */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Inference Response
          </h3>
          {status === "done" ? (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Generated Successfully
            </span>
          ) : status === "error" && errorInfo?.statusCode === 503 ? (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              Service Unavailable (503)
            </span>
          ) : status === "error" ? (
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
              {errorInfo?.statusText ?? "Error"}
            </span>
          ) : null}
        </div>

        <div className="mt-4 min-h-[120px] rounded-md border border-border bg-surface-muted/50 p-4 text-sm">
          {status === "loading" ? (
            <div className="flex h-20 items-center justify-center text-muted">
              <span className="animate-pulse">Contacting inference endpoint…</span>
            </div>
          ) : status === "error" && errorInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {errorInfo.statusText}
                </span>
                <button
                  type="button"
                  onClick={run}
                  disabled={!hasExperiments || !isExperimentReady}
                  className="text-xs text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                >
                  Retry request
                </button>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {errorInfo.message}
              </p>
            </div>
          ) : status === "done" && output && typeof output.generated_text === "string" ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap font-medium text-foreground leading-relaxed">
                {output.generated_text}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-xs text-muted font-mono">
                {output.model ? <span>Model: {output.model}</span> : null}
                {output.language_code ? (
                  <span>Language: {output.language_code.toUpperCase()}</span>
                ) : null}
                {typeof output.latency_ms === "number" ? (
                  <span>Latency: {output.latency_ms} ms</span>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted italic">
              {hasExperiments
                ? "Enter an inference prompt above and click 'Generate' to query the model."
                : "Generation is currently disabled because no adapter experiments exist in the registry."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
