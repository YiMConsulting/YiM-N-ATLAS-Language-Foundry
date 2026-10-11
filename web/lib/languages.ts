export type LanguageStatus =
  | "discovered"
  | "registered"
  | "data_available"
  | "ready"
  | "adapting"
  | "adapted";

export const languageStatusLabels: Record<LanguageStatus, string> = {
  discovered: "Discovered",
  registered: "Registered",
  data_available: "Data available",
  ready: "Ready",
  adapting: "Adapting",
  adapted: "Adapted",
};

export type Language = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: LanguageStatus;
  created_at: string;
  updated_at: string;
};
