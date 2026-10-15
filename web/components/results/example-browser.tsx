"use client";

import { useState } from "react";
import type { ResultExample } from "@/lib/api-client";

export function ExampleBrowser({ examples }: { examples: ResultExample[] }) {
  const [index, setIndex] = useState(0);
  const example = examples[index];

  if (!example) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-xs text-foreground-muted">No comparison examples recorded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Evaluation Examples &amp; Generation Output
        </h3>
        <span className="text-xs font-mono text-foreground-muted">
          Example {index + 1} of {examples.length}
        </span>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="text-foreground-muted block text-[11px] font-medium">
            Prompt / Input Text
          </span>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {example.prompt}
          </p>
        </div>

        <div>
          <span className="text-foreground-muted block text-[11px] font-medium">
            Ground-Truth Target Reference
          </span>
          <p className="mt-1 text-sm text-foreground font-linguistic leading-relaxed">
            {example.reference}
          </p>
        </div>
      </div>

      {/* Side-by-side Generation Output */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-1">
        <div className="rounded-lg bg-surface-secondary/50 p-4 space-y-1.5">
          <span className="text-foreground-muted block text-[11px] font-medium">
            Base Model Output
          </span>
          <p className="text-sm font-linguistic text-foreground leading-relaxed">
            {example.base_output}
          </p>
        </div>

        <div className="rounded-lg bg-accent-soft p-4 space-y-1.5 border border-accent/15">
          <span className="text-accent block text-[11px] font-medium">
            Adapted LoRA Output
          </span>
          <p className="text-sm font-medium font-linguistic text-foreground leading-relaxed">
            {example.adapted_output}
          </p>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          ‹ Previous
        </button>
        <span className="text-xs text-foreground-muted">
          {index + 1} / {examples.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(examples.length - 1, i + 1))}
          disabled={index === examples.length - 1}
          className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
