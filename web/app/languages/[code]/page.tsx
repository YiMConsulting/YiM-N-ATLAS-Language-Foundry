import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/languages/status-badge";
import { languages } from "@/lib/languages";

type LanguagePageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: LanguagePageProps): Promise<Metadata> {
  const { code } = await params;
  const language = languages.find((item) => item.language_code === code);

  return {
    title: language
      ? `${language.name} | N-ATLAS Language Foundry`
      : "Language | N-ATLAS Language Foundry",
  };
}

export function generateStaticParams() {
  return languages.map((language) => ({ code: language.language_code }));
}

export default async function LanguageDetailPage({
  params,
}: LanguagePageProps) {
  const { code } = await params;
  const language = languages.find((item) => item.language_code === code);

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
          Language record · {language.language_code}
        </p>
      </div>

      <dl className="overflow-hidden rounded-lg border border-border bg-surface">
        <RecordRow label="Name" value={language.name} />
        <RecordRow label="ISO 639-3 code" value={language.language_code} />
        <RecordRow label="Region" value={language.region} />
        <RecordRow
          label="Status"
          value={<StatusBadge status={language.status} />}
        />
        <RecordRow label="Description" value={language.description} />
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
