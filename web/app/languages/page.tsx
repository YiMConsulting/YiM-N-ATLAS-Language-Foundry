import type { Metadata } from "next";
import { AddLanguageButton } from "@/components/languages/add-language-button";
import { LanguageList } from "@/components/languages/language-list";
import { foundryApi, type LanguageDto } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Languages | N-ATLAS Language Foundry",
  description: "Languages registered in the N-ATLAS Language Foundry.",
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Languages</h2>
          <p className="mt-1 text-sm text-muted">
            Languages registered in the Foundry.
          </p>
        </div>
        {/* <AddLanguageButton /> */}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          Failed to load languages: {error}
        </div>
      ) : (
        <LanguageList languages={languages} />
      )}
    </div>
  );
}
