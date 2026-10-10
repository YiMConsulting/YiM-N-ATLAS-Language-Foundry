export type LanguageStatus = "pilot_active" | "planned";

export const languageStatusLabels: Record<LanguageStatus, string> = {
  pilot_active: "Pilot Active",
  planned: "Planned",
};

export type Language = {
  name: string;
  language_code: string;
  region: string;
  status: LanguageStatus;
  description: string;
};

export const languages: Language[] = [
  {
    name: "Igala",
    language_code: "igl",
    region: "Kogi State, Nigeria (Middle Belt)",
    status: "pilot_active",
    description:
      "Primary pilot language for N-ATLAS parameter-efficient adaptation, instruction tuning, and human review.",
  },
  {
    name: "Yoruba",
    language_code: "yor",
    region: "Southwestern Nigeria",
    status: "pilot_active",
    description:
      "Regional benchmark language active for multi-adapter cross-evaluation, tone diacritics, and downstream generation.",
  },
  {
    name: "Hausa",
    language_code: "hau",
    region: "Northern Nigeria",
    status: "planned",
    description:
      "Chadic language planned for cross-family downstream generation benchmarking.",
  },
];
