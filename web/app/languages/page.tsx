import type { Metadata } from "next";
import { Suspense } from "react";
import { AddLanguageButton } from "@/components/languages/add-language-button";
import { LanguageList } from "@/components/languages/language-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getLanguages } from "@/lib/api/language";

export const metadata: Metadata = {
  title: "Languages | N-ATLAS Language Foundry",
  description: "Languages registered in the N-ATLAS Language Foundry.",
};

export default function LanguagesPage() {
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

      <Suspense fallback={<Skeleton className="h-40" />}>
        <LanguagesSection />
      </Suspense>
    </div>
  );
}

async function LanguagesSection() {
  const { items } = await getLanguages();

  if (items.length === 0) {
    return <p className="text-sm text-muted">No languages registered yet.</p>;
  }

  return <LanguageList languages={items} />;
}
