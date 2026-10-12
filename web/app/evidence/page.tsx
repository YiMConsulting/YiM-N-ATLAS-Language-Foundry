import type { Metadata } from "next";
import { EvidenceScreen } from "@/components/EvidenceScreen";

export const metadata: Metadata = {
  title: "Evidence Dossier | N-ATLAS Language Foundry",
  description:
    "Reproducibility, data provenance, and empirical human verification evidence for N-ATLaS Tiv adaptation.",
};

export default function EvidencePage() {
  return <EvidenceScreen />;
}
