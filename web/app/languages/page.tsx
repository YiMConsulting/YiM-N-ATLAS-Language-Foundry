 import type { Metadata } from "next";
import { AddLanguageButton } from "@/components/languages/add-language-button";
import { LanguageList } from "@/components/languages/language-list";
import { getLanguages } from "@/lib/api/language";

export const metadata: Metadata = {
  title: "Languages | N-ATLAS Language Foundry",
  description: "Languages registered in the N-ATLAS Language Foundry.",
};

export const dynamic = "force-dynamic";

export default async function LanguagesPage() {
  const { items } = await getLanguages();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Languages</h2>
          <p className="mt-1 text-sm text-muted">
            Languages registered in the Foundry.
          </p>
        </div>
        <AddLanguageButton />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No languages registered yet.</p>
      ) : (
        <LanguageList languages={items} />
      )}
    </div>
  );
}
