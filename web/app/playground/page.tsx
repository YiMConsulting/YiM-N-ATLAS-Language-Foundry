import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground | N-ATLAS Language Foundry",
  description: "Compare base N-ATLAS with the adapted model side by side.",
};

export default function PlaygroundPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Playground</h2>
        <p className="mt-1 text-sm text-muted">
          Compare base N-ATLAS with the adapted model.
        </p>
      </div>

      <Playground />
    </div>
  );
}
