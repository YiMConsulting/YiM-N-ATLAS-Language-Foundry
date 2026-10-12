"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "@/components/icons";
import { primaryNav, reviewNav } from "@/lib/nav-items";
import type { NavItem } from "@/lib/nav-items";

function NavGroup({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                "md:justify-center lg:justify-start",
                isActive
                  ? "bg-accent/10 text-accent font-semibold shadow-xs"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className={["h-4 w-4 shrink-0 transition-transform duration-150", isActive ? "text-accent scale-105" : "text-muted"].join(" ")} />
              <span className="md:hidden lg:block">{item.label}</span>
              {isActive ? (
                <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-accent md:hidden lg:block" />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
          "md:static md:z-auto md:w-20 md:translate-x-0 lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-3 md:justify-center lg:justify-start lg:px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 p-[1.5px] shadow-xs">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-surface text-foreground">
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent font-black text-sm">
                N
              </span>
            </div>
          </div>
          <div className="min-w-0 md:hidden lg:block">
            <span className="truncate text-sm font-bold tracking-tight text-foreground block">
              N-ATLAS Foundry
            </span>
            <span className="text-[10px] text-muted tracking-wide uppercase font-semibold block">
              Language Forge
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground md:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted md:hidden lg:block">
              Core Platform
            </p>
            <NavGroup items={primaryNav} pathname={pathname} />
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted md:hidden lg:block">
              Verification &amp; Quality
            </p>
            <NavGroup items={reviewNav} pathname={pathname} />
          </div>
        </nav>

        {/* Sidebar Footer Indicator */}
        <div className="p-3 border-t border-border md:hidden lg:block">
          <div className="rounded-lg bg-surface-muted/60 p-3 border border-border/50 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground">Active Pilot</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                Tiv (tiv)
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted truncate">
              184k clean sentence pairs
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
