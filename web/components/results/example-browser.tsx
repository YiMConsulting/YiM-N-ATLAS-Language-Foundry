"use client";

import { useState } from "react";
import type { ResultExample } from "@/lib/results";

export function ExampleBrowser({ examples }: { examples: ResultExample[] }) {
  const [index, setIndex] = useState(0);
  const example = examples[index];

  if (!example) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-muted">No examples recorded.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Example outputs
      </h3>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Prompt
          </p>
          <p className="mt-1 text-sm">{example.prompt}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Reference
          </p>
          <p className="mt-1 text-sm">{example.reference}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Base N-ATLAS
          </p>
          <p className="mt-2 text-sm">{example.base_output}</p>
        </div>
        <div className="rounded-md border border-accent/30 bg-accent-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Adapted
          </p>
          <p className="mt-2 text-sm">{example.adapted_output}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          ‹ Prev
        </button>
        <span className="text-sm tabular-nums text-muted">
          {index + 1} / {examples.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(examples.length - 1, i + 1))}
          disabled={index === examples.length - 1}
          className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next ›
        </button>
      </div>
    </section>
  );
}
