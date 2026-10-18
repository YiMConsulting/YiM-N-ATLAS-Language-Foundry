"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  foundryApi,
  type TivDemoConfigDto,
} from "@/lib/api-client";
import { StatusPill } from "@/components/ui/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLinkIcon,
  CopyIcon,
  PlaygroundIcon,
  SparklesIcon,
} from "@/components/icons";

interface TivTranslationDemoProps {
  className?: string;
  defaultEmbedOpen?: boolean;
}

export function TivTranslationDemo({
  className = "",
  defaultEmbedOpen = false,
}: TivTranslationDemoProps) {
  const [config, setConfig] = useState<TivDemoConfigDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmbedOpen, setIsEmbedOpen] = useState(defaultEmbedOpen);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchConfig() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await foundryApi.getTivDemoConfig();
        if (active) {
          setConfig(data);
        }
      } catch (err: unknown) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to connect to backend configuration endpoint.";
          setError(msg);
          setConfig({
            configured: false,
            tiv_demo_url: null,
            status: "not_configured",
            message: "Unable to reach the backend configuration service.",
            model_adapter:
              "YiMConsulting/n-atlas-slanguage-tiv-qlora-experimental-v1",
            base_model: "NCAIR1/N-ATLaS",
            is_experimental: true,
            quality_validated: false,
            disclaimer:
              "This English-to-Tiv translation demo is experimental. Its outputs have not been independently validated.",
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchConfig();

    return () => {
      active = false;
    };
  }, []);

  const handleCopyUrl = async () => {
    if (!config?.tiv_demo_url) return;
    try {
      await navigator.clipboard.writeText(config.tiv_demo_url);
      toast.success("Tiv Gradio demo URL copied to clipboard.");
    } catch {
      toast.error("Failed to copy URL to clipboard.");
    }
  };

  const isConfigured = Boolean(
    config && config.configured && config.tiv_demo_url && config.status === "ready"
  );
  const activeDemoUrl = config?.tiv_demo_url ?? "";

  return (
    <div
      id="tiv-translation-demo"
      className={[
        "rounded-2xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-subtle transition-all duration-200",
        className,
      ].join(" ")}
    >
      {/* 1. Header with Badges & Dynamic Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-base sm:text-lg text-foreground tracking-tight flex items-center gap-2">
             
              Tiv Translation Demo
            </span>
            <Badge variant="accent" size="sm">
              Experimental QLoRA
            </Badge>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary border border-border">
              en → tiv
            </span>
          </div>
          <p className="text-xs text-foreground-secondary max-w-xl leading-relaxed">
            Interactive English-to-Tiv inference running on a manual Kaggle
            notebook session with QLoRA adapter{" "}
            <code className="font-mono text-accent text-[11px]">
              {config?.model_adapter ??
                "YiMConsulting/n-atlas-slanguage-tiv-qlora-experimental-v1"}
            </code>
            .
          </p>
        </div>

        {/* Runtime Status Pill */}
        <div className="shrink-0 flex items-center">
          {isLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs text-foreground-muted bg-surface-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted animate-pulse" />
              <span>Checking demo status…</span>
            </div>
          ) : isConfigured ? (
            <StatusPill
              tone="online"
              label="Demo Online"
              sublabel="Kaggle Gradio"
              pulse
            />
          ) : config?.status === "invalid_url" ? (
            <StatusPill
              tone="warning"
              label="Config Error"
              sublabel="Invalid URL"
            />
          ) : (
            <StatusPill
              tone="standby"
              label="Kaggle Standby"
              sublabel="Offline Session"
            />
          )}
        </div>
      </div>

      {/* 2. Governance / Experimental Disclaimer Callout */}
      <div className="mt-4 rounded-xl border border-warning/20 bg-warning-soft/40 p-3.5 text-xs text-warning-contrast space-y-1">
        <div className="flex items-center gap-2 font-semibold text-[11px] uppercase tracking-wider text-warning">
          <span>Experimental Inference Notice</span>
        </div>
        <p className="text-foreground-secondary text-xs leading-relaxed">
          {config?.disclaimer ??
            "This English-to-Tiv translation demo is experimental and powered by an unvalidated QLoRA adapter on an ephemeral Kaggle runtime. Its translation outputs have NOT been independently validated and must not be treated as production quality."}
        </p>
      </div>

      {/* 3. Primary Actions & Runtime State */}
      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-foreground-muted">
            Querying backend runtime configuration…
          </div>
        ) : isConfigured && activeDemoUrl ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-secondary/60 rounded-xl p-3 border border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-medium text-foreground-muted shrink-0">
                  Active Share URL:
                </span>
                <span className="font-mono text-xs text-accent truncate max-w-xs sm:max-w-md">
                  {activeDemoUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Copy demo URL"
                  className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-tertiary transition-colors"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEmbedOpen((prev) => !prev)}
                >
                  {isEmbedOpen ? "Hide Embedded View" : "Embed Live Interface"}
                </Button>
                <a
                  href={activeDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent bg-accent text-accent-contrast shadow-subtle hover:bg-accent-hover active:opacity-90 h-8 px-3 text-xs rounded-md gap-1.5 font-semibold"
                >
                  <PlaygroundIcon className="h-3 w-3" />
                  Try Tiv Translation
                  <ExternalLinkIcon className="h-3 w-3 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* 4. Embedded Gradio Interface (Optional / Expandable) */}
            {isEmbedOpen && (
              <div className="rounded-xl border border-border overflow-hidden bg-background shadow-subtle space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-surface-secondary border-b border-border text-xs text-foreground-secondary">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Embedded Gradio Session
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-foreground-muted hidden sm:inline">
                      If frame is blocked by browser security, open directly:
                    </span>
                    <a
                      href={activeDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                    >
                      Open in New Tab
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="relative w-full h-[620px] bg-surface">
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface text-xs text-foreground-muted gap-2 z-10">
                      <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span>Loading interactive Gradio interface…</span>
                    </div>
                  )}
                  <iframe
                    src={activeDemoUrl}
                    title="N-ATLaS Tiv Translation Demo"
                    className="w-full h-full border-0"
                    allow="clipboard-write; clipboard-read"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Unconfigured / Offline State */
          <div className="rounded-xl bg-surface-secondary/40 border border-border p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground block">
                  Kaggle Notebook Session Standby
                </span>
                <p className="text-xs text-foreground-secondary leading-relaxed max-w-lg">
                  {config?.message ??
                    "The experimental Kaggle inference notebook is currently stopped or the URL is not set. To activate the live demo, run the Kaggle inference notebook and update TIV_GRADIO_URL in the backend environment."}
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-60 cursor-not-allowed"
                >
                  Demo Standby
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-[11px] text-error">
                Backend connection note: {error}
              </p>
            )}

            {/* Quick Operational Reminder */}
            <div className="pt-2 border-t border-border/60 text-[11px] text-foreground-muted flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground-secondary">
                Operator instructions:
              </span>
              <span>1. Run Kaggle inference notebook</span>
              <span>→</span>
              <span>2. Copy public Gradio link</span>
              <span>→</span>
              <span>3. Set backend <code className="font-mono text-accent">TIV_GRADIO_URL</code></span>
              <span>→</span>
              <span>4. URL updates without frontend rebuild</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
