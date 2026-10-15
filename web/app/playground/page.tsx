import { Suspense } from "react";
import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground | N-ATLaS Language Foundry",
  description: "Test Nigerian language model inference and compare base model with adapted checkpoints.",
};

export const instant = false;

export default function PlaygroundPage() {
  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Inference Playground
        </h1>
        <p className="text-sm text-foreground-secondary">
          Translate prompts into Nigerian languages and inspect verified ground-truth references.
        </p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs text-foreground-muted">Loading workspace…</div>}>
        <Playground />
      </Suspense>
    </div>
  );
}
