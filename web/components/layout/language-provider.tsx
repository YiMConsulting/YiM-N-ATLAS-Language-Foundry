"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { foundryApi, type LanguageDto } from "@/lib/api-client";

export type ActiveLanguage = LanguageDto & {
  language_code: string;
};

interface LanguageContextType {
  languages: LanguageDto[];
  activeLanguage: ActiveLanguage;
  setActiveLanguageByCode: (code: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function toActiveLanguage(dto: LanguageDto): ActiveLanguage {
  return {
    ...dto,
    language_code: dto.code,
  };
}

const DEFAULT_EMPTY_LANGUAGE: ActiveLanguage = {
  id: "",
  code: "",
  language_code: "",
  name: "",
  description: null,
  status: "discovered",
  created_at: "",
  updated_at: "",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<ActiveLanguage>(
    DEFAULT_EMPTY_LANGUAGE,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foundryApi.listLanguages();
      const items = response.items ?? [];
      setLanguages(items);

      if (items.length > 0) {
        setActiveLanguage((prev) => {
          if (
            prev.code &&
            items.some((item) => item.code.toLowerCase() === prev.code.toLowerCase())
          ) {
            const updated = items.find(
              (item) => item.code.toLowerCase() === prev.code.toLowerCase(),
            );
            return updated ? toActiveLanguage(updated) : prev;
          }
          return toActiveLanguage(items[0]);
        });
      } else {
        setActiveLanguage(DEFAULT_EMPTY_LANGUAGE);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load languages from backend.";
      setError(message);
      setLanguages([]);
      setActiveLanguage(DEFAULT_EMPTY_LANGUAGE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    foundryApi
      .listLanguages()
      .then((response) => {
        if (ignore) return;
        const items = response.items ?? [];
        setLanguages(items);
        if (items.length > 0) {
          setActiveLanguage(toActiveLanguage(items[0]));
        } else {
          setActiveLanguage(DEFAULT_EMPTY_LANGUAGE);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load languages from backend.";
        setError(message);
        setLanguages([]);
        setActiveLanguage(DEFAULT_EMPTY_LANGUAGE);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const setActiveLanguageByCode = useCallback(
    (code: string) => {
      const found = languages.find(
        (l) => l.code.toLowerCase() === code.toLowerCase(),
      );
      if (found) {
        setActiveLanguage(toActiveLanguage(found));
      }
    },
    [languages],
  );

  return (
    <LanguageContext.Provider
      value={{
        languages,
        activeLanguage,
        setActiveLanguageByCode,
        isLoading,
        error,
        refreshLanguages: fetchLanguages,
      }}
    >
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
