import type { Experiment } from "@/lib/experiments";
import type { PaginatedResponse } from "@/lib/api/types";
import api from "@/lib/api/axios";
import { ApiNotFoundError } from "@/lib/api/errors";
import { isMockMode } from "@/lib/api/mock";
import { experiments as mockExperiments } from "@/lib/mocks/experiments";

export async function getExperiments(): Promise<PaginatedResponse<Experiment>> {
  if (isMockMode()) {
    return {
      items: mockExperiments,
      total: mockExperiments.length,
      limit: 20,
      offset: 0,
    };
  }

  const { data } = await api.get<PaginatedResponse<Experiment>>("/experiments");
  return data;
}

export async function getExperiment(experimentId: string): Promise<Experiment> {
  if (isMockMode()) {
    const experiment = mockExperiments.find((item) => item.id === experimentId);
    if (!experiment) {
      throw new ApiNotFoundError(`Experiment ${experimentId} not found`);
    }
    return experiment;
  }

  const { data } = await api.get<Experiment>(`/experiments/${experimentId}`);
  return data;
}
