"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/layout/theme-provider";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster theme={resolvedTheme} position="bottom-right" richColors closeButton />
  );
}
