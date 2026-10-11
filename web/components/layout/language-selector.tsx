"use client";

import { Select } from "@/components/ui/select";
import { useLanguage } from "@/components/layout/language-provider";

export function LanguageSelector() {
  const { languages, activeLanguage, setActiveLanguageByCode } = useLanguage();

  return (
    <div className="w-32">
      <Select
        options={languages.map((language) => ({
          value: language.code,
          label: language.name,
        }))}
        value={activeLanguage?.code ?? ""}
        onChange={setActiveLanguageByCode}
        ariaLabel="Select language"
      />
    </div>
  );
}
