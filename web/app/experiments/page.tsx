import type { Metadata } from "next";
import { ExperimentsList } from "@/components/experiments/experiments-list";
import { experiments } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Experiments | N-ATLAS Language Foundry",
  description: "Adaptation experiment records.",
};

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Experiments</h2>
        <p className="mt-1 text-sm text-muted">
          Record of every adaptation run in the Foundry.
        </p>
      </div>

      <ExperimentsList experiments={experiments} />
    </div>
  );
}
