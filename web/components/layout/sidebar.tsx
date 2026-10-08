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
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "md:justify-center lg:justify-start",
                isActive
                  ? "bg-sidebar-active text-foreground"
                  : "text-sidebar-foreground/80 hover:bg-surface-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="md:hidden lg:block">{item.label}</span>
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
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
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
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 md:justify-center lg:justify-start lg:px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            N
          </span>
          <span className="truncate text-sm font-semibold tracking-wide md:hidden lg:block">
            N-ATLAS Foundry
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-surface-muted md:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroup items={primaryNav} pathname={pathname} />

          <div className="my-4 h-px bg-border" />

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted md:hidden lg:block">
            Review
          </p>
          <NavGroup items={reviewNav} pathname={pathname} />
        </nav>
      </aside>
    </>
  );
}
