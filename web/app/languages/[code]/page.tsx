import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isNotFound } from "@/lib/api/errors";
import { StatusBadge } from "@/components/languages/status-badge";
import { getLanguage } from "@/lib/api/language";
import type { Language } from "@/lib/languages";

type LanguagePageProps = {
  params: Promise<{ code: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LanguagePageProps): Promise<Metadata> {
  const { code } = await params;

  try {
    const language = await getLanguage(code);
    return {
      title: `${language.name} | N-ATLAS Language Foundry`,
    };
  } catch {
    return {
      title: "Language | N-ATLAS Language Foundry",
    };
  }
}

export default async function LanguageDetailPage({
  params,
}: LanguagePageProps) {
  const { code } = await params;

  let language: Language | null = null;
  try {
    language = await getLanguage(code);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    throw error;
  }

  if (!language) {
    notFound();
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
        <RecordRow label="ISO 639-3 code" value={language.code} />
        <RecordRow label="Native name" value={language.native_name ?? "—"} />
        <RecordRow
          label="Status"
          value={<StatusBadge status={language.status} />}
        />
        <RecordRow label="Description" value={language.description ?? "—"} />
        <RecordRow label="Created" value={language.created_at} />
        {language.updated_at ? (
          <RecordRow label="Updated" value={language.updated_at} />
        ) : null}
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
