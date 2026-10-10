"use client";

import { Select } from "@/components/ui/select";
import { languages } from "@/lib/languages";
import { useLanguage } from "@/components/layout/language-provider";

export function LanguageSelector() {
  const { activeLanguage, setActiveLanguageByCode } = useLanguage();

  return (
    <div className="w-32">
      <Select
        options={languages.map((language) => ({
          value: language.language_code,
          label: language.name,
        }))}
        value={activeLanguage.language_code}
        onChange={setActiveLanguageByCode}
        ariaLabel="Select language"
      />
    </div>
  );
}
