"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const isStoryPage = pathname === "/";

  if (isStoryPage) {
    return (
      <div className="relative min-h-screen w-full bg-background text-foreground selection:bg-accent/20">
        <div className="ambient-glow" aria-hidden="true" />
        <div className="relative z-10 w-full">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground selection:bg-accent/20">
      <div className="ambient-glow" aria-hidden="true" />
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <TopBar onOpenNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
