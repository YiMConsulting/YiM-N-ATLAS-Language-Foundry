import axios from "axios";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/languages/status-badge";
import { foundryApi, type LanguageDto } from "@/lib/api-client";

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
      title: `${language.name} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Language | N-ATLAS Language Foundry",
    };
  }
}

export const instant = false;

export default async function LanguageDetailPage({

  params,
}: LanguagePageProps) {
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
      <div className="space-y-6">
        <Link
          href="/languages"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to languages
        </Link>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load language &ldquo;{code}&rdquo;: {message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/languages"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to languages
      </Link>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {language.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Language record · {language.code}
        </p>
      </div>

      <dl className="overflow-hidden rounded-lg border border-border bg-surface">
        <RecordRow label="Name" value={language.name} />
        <RecordRow label="Language code" value={language.code} />
        <RecordRow
          label="Status"
          value={<StatusBadge status={language.status} />}
        />
        <RecordRow
          label="Description"
          value={language.description ?? "—"}
        />
        <RecordRow
          label="Registered at"
          value={
            language.created_at
              ? new Date(language.created_at).toLocaleString()
              : "—"
          }
        />
        <RecordRow
          label="Last updated"
          value={
            language.updated_at
              ? new Date(language.updated_at).toLocaleString()
              : "—"
          }
        />
      </dl>
    </div>
  );
}

function RecordRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
