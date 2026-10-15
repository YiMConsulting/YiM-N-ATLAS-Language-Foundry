import axios from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/languages/status-badge";
import { foundryApi, type LanguageDto } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  DatasetsIcon,
  PlaygroundIcon,
  ReviewIcon,
} from "@/components/icons";

type LanguagePageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: LanguagePageProps): Promise<Metadata> {
  const { code } = await params;
  try {
    const language = await foundryApi.getLanguage(code);
    return {
      title: `${language.name} (${language.code}) | N-ATLaS Language Foundry`,
    };
  } catch {
    return {
      title: "Language Detail | N-ATLaS Language Foundry",
    };
  }
}

export const instant = false;

function DetailRow({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border text-xs gap-4">
      <span className="text-foreground-secondary font-medium">
        {label}
      </span>
      <span className={`text-foreground font-medium ${isMono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function LanguageDetailPage({ params }: LanguagePageProps) {
  const { code } = await params;

  let language: LanguageDto;
  try {
    language = await foundryApi.getLanguage(code);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      notFound();
    }
    const message =
      err instanceof Error ? err.message : "Failed to connect to Foundry API.";
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <Link
          href="/languages"
          className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          Back to Languages
        </Link>
        <div className="rounded-lg border border-error-border bg-error-soft p-4 text-xs text-error">
          Failed to load language &ldquo;{code}&rdquo;: {message}
        </div>
      </div>
    );
  }

  const isPilot = language.code.toLowerCase() === "tiv";

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <Link
        href="/languages"
        className="inline-flex items-center text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
      >
        Back to Languages
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {language.name}
            </h1>
            <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary border border-border">
              {language.code}
            </span>
            {isPilot && (
              <Badge variant="accent" size="sm">
                Active Pilot
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground-secondary max-w-2xl leading-relaxed">
            {language.description ?? "Nigerian language cataloged in N-ATLaS Language Foundry."}
          </p>
        </div>
        <StatusBadge status={language.status} />
      </div>

      {/* Pilot Workflow Callout */}
      {isPilot && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-accent block">
                Pilot Workflows Available
              </span>
              <p className="text-xs text-foreground-secondary max-w-lg leading-relaxed">
                Tiv MT560 corpus has 184,099 sentence pairs with verified grouped-by-input splits,
                human linguistic audit evidence, and inference playground support.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/datasets/tiv-mt560-v1"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
              >
                <DatasetsIcon className="h-3.5 w-3.5 text-accent" />
                Dataset
              </Link>
              <Link
                href="/review"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
              >
                <ReviewIcon className="h-3.5 w-3.5 text-accent" />
                Review
              </Link>
              <Link
                href="/playground"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-contrast text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                <PlaygroundIcon className="h-3.5 w-3.5" />
                Playground
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Metadata & Governance */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
          Metadata &amp; Governance
        </h2>
        <div className="divide-y divide-border">
          <DetailRow label="Display Name" value={language.name} />
          <DetailRow label="ISO / Foundry Code" value={language.code} isMono />
          <DetailRow label="Control Plane ID" value={language.id} isMono />
          <DetailRow
            label="Adaptation Status"
            value={<StatusBadge status={language.status} />}
          />
          <DetailRow
            label="Registered"
            value={
              language.created_at
                ? new Date(language.created_at).toUTCString()
                : "—"
            }
          />
          <DetailRow
            label="Last Updated"
            value={
              language.updated_at
                ? new Date(language.updated_at).toUTCString()
                : "—"
            }
          />
        </div>
      </div>
    </div>
  );
}
