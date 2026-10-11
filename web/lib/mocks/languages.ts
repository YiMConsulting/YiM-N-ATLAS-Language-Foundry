import type { Language } from "@/lib/languages";

// Explicit mock data for the pre-backend demo. Data-driven pages and the
// language provider must use the API service layer (web/lib/api/language.ts),
// which falls back to this array only when NEXT_PUBLIC_API_MOCK === "true".
export const languages: Language[] = [
  {
    id: "lang_igl",
    code: "igl",
    name: "Igala",
    description:
      "First laboratory language for the N-ATLAS Language Foundry vertical slice.",
    status: "adapted",
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-08T00:00:00Z",
  },
  {
    id: "lang_yor",
    code: "yor",
    name: "Yoruba",
    description: "Regional benchmark language for cross-evaluation.",
    status: "adapting",
    created_at: "2026-10-02T00:00:00Z",
    updated_at: "2026-10-10T00:00:00Z",
  },
  {
    id: "lang_hau",
    code: "hau",
    name: "Hausa",
    description: "Candidate language for future Foundry onboarding.",
    status: "discovered",
    created_at: "2026-10-03T00:00:00Z",
    updated_at: "2026-10-03T00:00:00Z",
  },
];
