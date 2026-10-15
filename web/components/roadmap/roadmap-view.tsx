"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CAPABILITIES,
  type CapabilityRecord,
  type CapabilityStatus,
} from "@/lib/capability-registry";
import {
  SearchIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@/components/icons";

export function RoadmapView() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["input-grouped-split", "lora-runner"])
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCapabilities = useMemo(() => {
    return CAPABILITIES.filter((item) => {
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.implementedScope.toLowerCase().includes(query) ||
          item.limitations.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: CAPABILITIES.length,
      available: CAPABILITIES.filter((c) => c.status === "available").length,
      manual: CAPABILITIES.filter((c) => c.status === "manual").length,
      planned: CAPABILITIES.filter((c) => c.status === "planned" || c.status === "in-development").length,
    };
  }, []);

  function renderStatusDot(status: CapabilityStatus) {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Available</span>
          </span>
        );
      case "manual":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Manual CLI</span>
          </span>
        );
      case "in-development":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>In Dev</span>
          </span>
        );
      case "planned":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span>Planned</span>
          </span>
        );
    }
  }

  return (
    <div className="space-y-8 max-w-4xl pb-24">
      {/* 1. Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>Planning</span>
          <span>/</span>
          <span className="font-medium text-foreground">Capabilities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
          Product Roadmap
        </h1>
        <p className="text-sm text-foreground-secondary max-w-2xl leading-relaxed">
          A clear view of verified features, manual engineering workflows, and
          upcoming platform goals. Click any entry to inspect implementation
          scope, limitations, and evidence.
        </p>
      </div>

      {/* 2. Controls Toolbar: Status Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-border/70 pb-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: "all", label: "All Capabilities", count: counts.all },
            { id: "available", label: "Available Today", count: counts.available },
            { id: "manual", label: "Manual Workflows", count: counts.manual },
            { id: "planned", label: "Future Vision", count: counts.planned },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-surface-secondary text-foreground font-semibold"
                  : "text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[11px] text-foreground-muted font-normal">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search capabilities..."
            className="w-full rounded-lg border border-border/70 bg-surface pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Capability List (Unboxed, natural expandable rows) */}
      <div className="divide-y divide-border/60">
        {filteredCapabilities.map((item) => {
          const isExpanded = expandedIds.has(item.id);

          return (
            <div
              key={item.id}
              className="py-4 transition-colors hover:bg-surface-secondary/20 px-2 -mx-2 rounded-lg"
            >
              {/* Row Header (Click to expand) */}
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-start justify-between gap-4 text-left cursor-pointer group"
                aria-expanded={isExpanded}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-foreground-muted capitalize">
                      · {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                  {renderStatusDot(item.status)}
                  <ChevronDownIcon
                    className={`h-4 w-4 text-foreground-muted transition-transform duration-150 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expandable Details (Progressive Disclosure) */}
              {isExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-border/40 text-xs space-y-3 animate-in fade-in duration-150 pl-1">
                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">
                      Verified Implementation Scope
                    </span>
                    <p className="text-foreground-secondary leading-relaxed font-sans">
                      {item.implementedScope}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">
                      Limitations &amp; Workarounds
                    </span>
                    <p className="text-foreground-secondary leading-relaxed font-sans">
                      {item.limitations}
                    </p>
                  </div>

                  {item.nextMilestone && (
                    <div className="text-[11px] text-foreground-muted">
                      <strong>Next milestone:</strong> {item.nextMilestone}
                    </div>
                  )}

                  {item.relatedRoute && (
                    <div className="pt-1">
                      <Link
                        href={item.relatedRoute}
                        className="inline-flex items-center gap-1.5 text-accent hover:underline font-medium"
                      >
                        <span>Open related workspace page</span>
                        <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
