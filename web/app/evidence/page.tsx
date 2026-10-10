import type { Metadata } from "next";
import { EvidenceScreen } from "@/components/EvidenceScreen";

export const metadata: Metadata = {
  title: "Evidence Dossier | N-ATLAS Language Foundry",
  description: "Section 11 reproducibility and evidence verification for Igala adaptation.",
};

export default function EvidencePage() {
  return <EvidenceScreen />;
}
