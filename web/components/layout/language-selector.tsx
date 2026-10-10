"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { languages } from "@/lib/languages";

export function LanguageSelector() {
  const [selected, setSelected] = useState(languages[0]?.language_code ?? "");

  return (
    <div className="w-32">
      <Select
        options={languages.map((language) => ({
          value: language.language_code,
          label: language.name,
        }))}
        value={selected}
        onChange={setSelected}
        ariaLabel="Select language"
      />
    </div>
  );
}
