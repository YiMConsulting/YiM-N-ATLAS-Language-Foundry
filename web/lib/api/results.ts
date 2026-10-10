import type { Experiment } from "@/lib/experiments";
import { getExperiment, getExperiments } from "@/lib/api/experiments";

export async function getResults(): Promise<Experiment[]> {
  const { items } = await getExperiments();
  return items.filter(
    (experiment) =>
      experiment.status === "completed" &&
      experiment.base_results != null &&
      experiment.adapted_results != null,
  );
}

export async function getResult(experimentId: string): Promise<Experiment> {
  return getExperiment(experimentId);
}
