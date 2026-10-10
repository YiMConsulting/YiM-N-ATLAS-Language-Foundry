"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/layout/theme-provider";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster theme={theme} position="bottom-right" richColors closeButton />
  );
}
