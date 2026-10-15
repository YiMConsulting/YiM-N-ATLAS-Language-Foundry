import type { DatasetDto } from "@/lib/api-client";

export function QualityAuditCard({ dataset }: { dataset: DatasetDto }) {
  const isAudited =
    dataset.status === "audited" ||
    dataset.status === "reviewed" ||
    dataset.status === "ready";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-medium text-foreground">
          Quality &amp; Syntactic Audit
        </h2>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
          {isAudited ? "Audit Verified" : "Manifest Validated"}
        </span>
      </div>

      <p className="text-xs text-foreground-secondary leading-relaxed">
        {isAudited
          ? "Dataset has passed baseline UTF-8 encoding, non-empty text, deduplication, and tone-mark preservation filters during preprocessing."
          : "Dataset records are cataloged in the Foundry registry. Full automated quality checks for character distribution and language mismatches are logged during preprocessing."}
      </p>

      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
        <div className="rounded-lg bg-surface-secondary/50 p-3">
          <span className="text-foreground-muted block text-[11px]">Duplicate Filtering</span>
          <span className="font-medium text-foreground mt-0.5 block">
            Deduplicated (Seed 42)
          </span>
        </div>

        <div className="rounded-lg bg-surface-secondary/50 p-3">
          <span className="text-foreground-muted block text-[11px]">Tone Orthography</span>
          <span className="font-medium text-foreground mt-0.5 block">
            Standard Diacritics Retained
          </span>
        </div>
      </div>
    </div>
  );
}
