"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { languages, Language } from "@/lib/languages";

interface LanguageContextType {
  activeLanguage: Language;
  setActiveLanguageByCode: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [activeLanguage, setActiveLanguage] = useState<Language>(languages[0]);

  const setActiveLanguageByCode = (code: string) => {
    const lang = languages.find((l) => l.language_code === code);
    if (lang) {
      setActiveLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ activeLanguage, setActiveLanguageByCode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
