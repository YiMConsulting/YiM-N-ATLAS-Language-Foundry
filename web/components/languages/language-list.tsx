"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/languages/status-badge";
import { SearchIcon, LanguagesIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { LanguageDto } from "@/lib/api-client";

type FilterTab = "all" | "pilot" | "discovered";

export function LanguageList({ languages }: { languages: LanguageDto[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        (lang.description && lang.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filter === "pilot") {
        return lang.status === "data_available" || lang.status === "ready";
      }
      if (filter === "discovered") {
        return lang.status === "discovered" || lang.status === "registered";
      }
      return true;
    });
  }, [languages, search, filter]);

  if (languages.length === 0) {
    return (
      <EmptyState
        icon={LanguagesIcon}
        title="No languages registered"
        description="The control plane registry currently contains no language records."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code (e.g. tiv, igl)…"
            aria-label="Filter languages"
            className="w-full rounded-full border border-border bg-surface pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-secondary text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={[
              "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              filter === "all"
                ? "bg-surface text-foreground shadow-subtle font-semibold"
                : "text-foreground-secondary hover:text-foreground",
            ].join(" ")}
          >
            All ({languages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pilot")}
            className={[
              "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              filter === "pilot"
                ? "bg-surface text-foreground shadow-subtle font-semibold"
                : "text-foreground-secondary hover:text-foreground",
            ].join(" ")}
          >
            Pilot ({languages.filter((l) => l.status === "data_available" || l.status === "ready").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("discovered")}
            className={[
              "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              filter === "discovered"
                ? "bg-surface text-foreground shadow-subtle font-semibold"
                : "text-foreground-secondary hover:text-foreground",
            ].join(" ")}
          >
            Discovered ({languages.filter((l) => l.status === "discovered" || l.status === "registered").length})
          </button>
        </div>
      </div>

      {filteredLanguages.length === 0 ? (
        <EmptyState
          icon={LanguagesIcon}
          title="No matching languages found"
          description={`No languages match your search "${search}".`}
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              Reset filters
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
                  <th className="pb-3 pr-4 font-medium">Language</th>
                  <th className="pb-3 px-4 font-medium">Code</th>
                  <th className="pb-3 px-4 font-medium">Status</th>
                  <th className="pb-3 px-4 font-medium">Description</th>
                  <th className="pb-3 pl-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLanguages.map((language) => {
                  const isPilot = language.code.toLowerCase() === "tiv";

                  return (
                    <tr
                      key={language.code}
                      className="group hover:bg-surface-secondary/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/languages/${language.code}`}
                          className="font-medium text-foreground group-hover:text-accent transition-colors inline-flex items-center gap-2"
                        >
                          {language.name}
                          {isPilot && (
                            <Badge variant="accent" size="sm">
                              Pilot
                            </Badge>
                          )}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-surface-secondary text-foreground-secondary">
                          {language.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={language.status} />
                      </td>
                      <td className="py-3.5 px-4 text-foreground-secondary max-w-md leading-relaxed">
                        {language.description ?? "—"}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          href={`/languages/${language.code}`}
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
            {filteredLanguages.map((language) => (
              <Link
                key={language.code}
                href={`/languages/${language.code}`}
                className="rounded-xl bg-surface-secondary/40 p-4 transition-all hover:bg-surface-secondary block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground text-sm flex items-center gap-2">
                      {language.name}
                      {language.code.toLowerCase() === "tiv" && (
                        <Badge variant="accent" size="sm">
                          Pilot
                        </Badge>
                      )}
                    </div>
                    <span className="mt-1 inline-block font-mono text-[11px] uppercase text-foreground-muted">
                      ISO: {language.code}
                    </span>
                  </div>
                  <StatusBadge status={language.status} />
                </div>
                {language.description && (
                  <p className="mt-2.5 text-xs text-foreground-secondary leading-relaxed">
                    {language.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
