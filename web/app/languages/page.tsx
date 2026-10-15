import type { Metadata } from "next";
import { LanguageList } from "@/components/languages/language-list";
import { foundryApi, type LanguageDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Languages | N-ATLaS Language Foundry",
  description: "Nigerian languages cataloged in the N-ATLaS Language Foundry control plane.",
};

export const instant = false;

export default async function LanguagesPage() {
  let languages: LanguageDto[] = [];
  let error: string | null = null;

  try {
    const res = await foundryApi.listLanguages();
    languages = res.items;
  } catch (err: unknown) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to connect to Foundry API.";
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Editorial Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Languages
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary max-w-2xl">
          Catalog of Nigerian underserved languages and foundational baselines. Languages progress
          from initial discovery through corpus collection, provenance verification, human audit, and LoRA adaptation.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-error-border bg-error-soft px-4 py-3 text-xs text-error">
          Notice: Failed to load language registry: {error}
        </div>
      ) : (
        <LanguageList languages={languages} />
      )}
    </div>
  );
}
