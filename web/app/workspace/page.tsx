import type { Metadata } from "next";
import {
  foundryApi,
  type LanguageDto,
  type DatasetDto,
  type DatasetReviewEvidenceDto,
  type InferenceStatusResponse,
} from "@/lib/api-client";
import { OverviewHeader } from "@/components/overview/overview-header";
import { ContextualActions } from "@/components/overview/contextual-actions";
import { PilotProgress } from "@/components/overview/pilot-progress";

export const metadata: Metadata = {
  title: "Workspace Overview | N-ATLaS Language Foundry",
  description:
    "Operational developer environment for Nigerian low-resource language adaptation, datasets, and evaluation.",
};

export const instant = false;

export default async function WorkspaceOverviewPage() {
  let languages: LanguageDto[] = [];
  let datasets: DatasetDto[] = [];
  let tivEvidence: DatasetReviewEvidenceDto | null = null;
  let inferenceStatus: InferenceStatusResponse | null = null;

  try {
    const [langsRes, datasetsRes, infRes] = await Promise.allSettled([
      foundryApi.listLanguages(),
      foundryApi.listDatasets(),
      foundryApi.getInferenceStatus(),
    ]);

    if (langsRes.status === "fulfilled") {
      languages = langsRes.value.items;
    }
    if (datasetsRes.status === "fulfilled") {
      datasets = datasetsRes.value.items;
    }
    if (infRes.status === "fulfilled") {
      inferenceStatus = infRes.value;
    }

    try {
      tivEvidence = await foundryApi.getDatasetReviewEvidence("tiv-mt560-v1");
    } catch {
      tivEvidence = null;
    }
  } catch {
    // Graceful offline fallback
  }

  const isInferenceOnline = Boolean(
    inferenceStatus?.available && inferenceStatus?.model_loaded
  );

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      {/* 1. Operational Status & Verified Pilot Info */}
      <OverviewHeader
        languages={languages}
        datasets={datasets}
        tivEvidence={tivEvidence}
        inferenceStatus={inferenceStatus}
      />

      {/* 2. Primary Workflows & Developer Actions */}
      <ContextualActions inferenceOnline={isInferenceOnline} />

      {/* 3. Quiet Pilot Progression & Link to Roadmap */}
      <PilotProgress />
    </div>
  );
}
