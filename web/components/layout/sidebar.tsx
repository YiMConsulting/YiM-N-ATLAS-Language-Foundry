"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  XIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { coreNav, mlNav, verificationNav } from "@/lib/nav-items";
import type { NavItem } from "@/lib/nav-items";

function NavGroup({
  title,
  items,
  pathname,
  isCollapsed,
  onItemClick,
}: {
  title?: string;
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      {title && !isCollapsed ? (
        <p className="px-3 pb-1 text-[11px] font-medium tracking-tight text-foreground-muted select-none">
          {title}
        </p>
      ) : null}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onItemClick}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.label : undefined}
                className={[
                  "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-surface-secondary text-foreground shadow-2xs font-semibold"
                    : "text-foreground-secondary hover:bg-surface-secondary/60 hover:text-foreground",
                  isCollapsed ? "justify-center px-2" : "",
                ].join(" ")}
              >
                {/* Active indicator dot (restrained accent focus) */}
                {isActive && !isCollapsed && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-r bg-accent"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={[
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-foreground-muted group-hover:text-foreground",
                  ].join(" ")}
                />
                {!isCollapsed && (
                  <span className="truncate leading-normal">{item.label}</span>
                )}
                {!isCollapsed && item.badge ? (
                  <span className="ml-auto rounded-md bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-normal text-foreground-muted">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Initialize and persist preference in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("n-atlas-sidebar-collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // Fallback if storage unavailable
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("n-atlas-sidebar-collapsed", String(next));
      } catch {
        // Storage fallback
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container with smooth width transitions */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar text-foreground transition-all duration-200 ease-in-out",
          "md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-elevated w-64" : "-translate-x-full",
          isCollapsed ? "md:w-16" : "md:w-60",
        ].join(" ")}
      >
        {/* Header / Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-3.5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 min-w-0"
            title="N-ATLaS Language Foundry"
          >
            <BrandLogo size={26} />
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <span className="truncate text-xs font-semibold tracking-tight text-foreground block">
                  N-ATLaS
                </span>
                <span className="text-[10px] text-foreground-muted truncate block">
                  Language Foundry
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-secondary hover:text-foreground md:hidden cursor-pointer"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Region */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3.5">
          <NavGroup
            items={coreNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onItemClick={onClose}
          />
          <NavGroup
            title={!isCollapsed ? "Model & Execution" : undefined}
            items={mlNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onItemClick={onClose}
          />
          <NavGroup
            title={!isCollapsed ? "Verification" : undefined}
            items={verificationNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onItemClick={onClose}
          />
        </nav>

        {/* Desktop Collapse Toggle Footer — Refined with discoverable hit area, tooltip, and gentle one-time intro pulse */}
        <div className="hidden border-t border-border/70 p-2.5 md:block">
          <button
            type="button"
            onClick={toggleCollapse}
            onAnimationEnd={() => setHasAnimated(true)}
            aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            className={[
              "group flex w-full items-center rounded-lg py-2 px-2.5 text-xs font-medium text-foreground-secondary transition-all duration-150 cursor-pointer",
              "border border-border/60 bg-surface/50 hover:bg-surface-secondary hover:text-foreground hover:border-border",
              "hover:scale-[1.01] active:scale-[0.99]",
              isCollapsed ? "justify-center px-1.5" : "justify-between",
              !hasAnimated ? "animate-sidebar-hint" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isCollapsed ? (
                <PanelLeftOpenIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />
              ) : (
                <>
                  <PanelLeftCloseIcon className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />
                  <span className="truncate">Collapse sidebar</span>
                </>
              )}
            </div>

            {!isCollapsed && (
              <kbd className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-mono text-foreground-muted bg-surface-secondary border border-border/60">
                ⌘B
              </kbd>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
