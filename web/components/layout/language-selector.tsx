"use client";

import { Select } from "@/components/ui/select";
import { useLanguage } from "@/components/layout/language-provider";

export function LanguageSelector() {
  const {
    languages,
    activeLanguage,
    setActiveLanguageByCode,
    isLoading,
    error,
  } = useLanguage();

  if (isLoading) {
    return (
      <div className="w-36">
        <div className="flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs text-muted">
          Loading…
        </div>
      </div>
    );
  }

  if (error || languages.length === 0) {
    return (
      <div className="w-36">
        <div
          className="flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs text-muted"
          title={error ?? "No languages available"}
        >
          {error ? "API Unavailable" : "No languages"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-36">
      <Select
        options={languages.map((language) => ({
          value: language.code,
          label: language.name,
        }))}
        value={activeLanguage.code || (languages[0]?.code ?? "")}
        onChange={setActiveLanguageByCode}
        ariaLabel="Select language"
      />
    </div>
  );
}
