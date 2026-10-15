"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DatasetStatusBadge } from "@/components/datasets/dataset-status-badge";
import { SearchIcon, DatasetsIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { DatasetDto } from "@/lib/api-client";

export function DatasetList({ datasets }: { datasets: DatasetDto[] }) {
  const [search, setSearch] = useState("");

  const filteredDatasets = useMemo(() => {
    return datasets.filter((ds) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        ds.name.toLowerCase().includes(q) ||
        ds.id.toLowerCase().includes(q) ||
        ds.language_code.toLowerCase().includes(q) ||
        (ds.description && ds.description.toLowerCase().includes(q))
      );
    });
  }, [datasets, search]);

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={DatasetsIcon}
        title="No datasets cataloged"
        description="The control plane currently contains no registered dataset records."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets by name, ID, or language…"
            aria-label="Filter datasets"
            className="w-full rounded-full border border-border bg-surface pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
        <span className="text-xs text-foreground-muted">
          {filteredDatasets.length} of {datasets.length} dataset{datasets.length === 1 ? "" : "s"}
        </span>
      </div>

      {filteredDatasets.length === 0 ? (
        <EmptyState
          icon={DatasetsIcon}
          title="No matching datasets"
          description={`No datasets match your search term "${search}".`}
          action={
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              Clear search
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View — Open, Fluid, Unboxed */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-foreground-muted font-medium">
                  <th className="pb-3 pr-4 font-medium">Dataset</th>
                  <th className="pb-3 px-4 font-medium">Language</th>
                  <th className="pb-3 px-4 font-medium">Format &amp; Source</th>
                  <th className="pb-3 px-4 font-medium">Sentence Pairs</th>
                  <th className="pb-3 px-4 font-medium">Partition Strategy</th>
                  <th className="pb-3 px-4 font-medium">Status</th>
                  <th className="pb-3 pl-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDatasets.map((dataset) => {
                  const isPilot = dataset.language_code.toLowerCase() === "tiv";

                  return (
                    <tr
                      key={dataset.id}
                      className="group hover:bg-surface-secondary/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/datasets/${dataset.id}`}
                          className="font-medium text-foreground group-hover:text-accent transition-colors inline-flex items-center gap-2"
                        >
                          {dataset.name}
                          {isPilot && (
                            <Badge variant="accent" size="sm">
                              Pilot
                            </Badge>
                          )}
                        </Link>
                        <div className="font-mono text-[11px] text-foreground-muted mt-0.5">
                          {dataset.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary">
                          {dataset.language_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono uppercase text-foreground">
                          {dataset.format}
                        </div>
                        <div className="text-[11px] text-foreground-muted capitalize">
                          {dataset.source_type}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-foreground">
                          {dataset.record_count !== null
                            ? dataset.record_count.toLocaleString()
                            : "—"}
                        </span>
                        <span className="text-[11px] text-foreground-muted block">pairs</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-foreground-secondary">
                          Grouped by Input
                        </span>
                        <span className="text-[11px] text-foreground-muted block">
                          Deterministic seed 42
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <DatasetStatusBadge status={dataset.status} />
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          href={`/datasets/${dataset.id}`}
                          className="font-medium text-accent hover:underline"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredDatasets.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/datasets/${dataset.id}`}
                className="rounded-xl bg-surface-secondary/40 p-4 transition-all hover:bg-surface-secondary block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground text-sm flex items-center gap-2">
                      {dataset.name}
                      {dataset.language_code.toLowerCase() === "tiv" && (
                        <Badge variant="accent" size="sm">
                          Pilot
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-foreground-muted mt-0.5 block">
                      {dataset.id}
                    </span>
                  </div>
                  <DatasetStatusBadge status={dataset.status} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <div>
                    <span className="text-[11px] text-foreground-muted block">Language</span>
                    <span className="font-mono uppercase text-foreground">{dataset.language_code}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-foreground-muted block">Format</span>
                    <span className="font-mono uppercase text-foreground">{dataset.format}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-foreground-muted block">Pairs</span>
                    <span className="font-medium text-foreground">
                      {dataset.record_count !== null ? dataset.record_count.toLocaleString() : "—"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
