import type { Language } from "@/lib/languages";
import type { PaginatedResponse } from "@/lib/api/types";
import api from "@/lib/api/axios";
import { ApiNotFoundError } from "@/lib/api/errors";
import { isMockMode } from "@/lib/api/mock";
import { languages as mockLanguages } from "@/lib/mocks/languages";

export async function getLanguages(): Promise<PaginatedResponse<Language>> {
  if (isMockMode()) {
    return {
      items: mockLanguages,
      total: mockLanguages.length,
      limit: 20,
      offset: 0,
    };
  }

  const { data } = await api.get<PaginatedResponse<Language>>("/languages");
  return data;
}

export async function getLanguage(code: string): Promise<Language> {
  if (isMockMode()) {
    const language = mockLanguages.find((item) => item.code === code);
    if (!language) {
      throw new ApiNotFoundError(`Language ${code} not found`);
    }
    return language;
  }

  const { data } = await api.get<Language>(`/languages/${code}`);
  return data;
}
