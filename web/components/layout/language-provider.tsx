"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Language } from "@/lib/languages";
import { getLanguages } from "@/lib/api/language";

type LanguageContextValue = {
  languages: Language[];
  activeLanguage: Language | null;
  loading: boolean;
  setActiveLanguageByCode: (code: string) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getLanguages()
      .then(({ items }) => {
        if (cancelled) return;
        setLanguages(items);
        setActiveLanguage(
          (prev) =>
            prev ??
            items.find((language) => language.code === "igl") ??
            items[0] ??
            null,
        );
      })
      .catch(() => {
        // Keep the empty state; consumers render their own loading/empty UI.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveLanguageByCode = useCallback(
    (code: string) => {
      setActiveLanguage((prev) => {
        const next = languages.find((language) => language.code === code);
        return next ?? prev;
      });
    },
    [languages],
  );

  const value = useMemo(
    () => ({ languages, activeLanguage, loading, setActiveLanguageByCode }),
    [languages, activeLanguage, loading, setActiveLanguageByCode],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
