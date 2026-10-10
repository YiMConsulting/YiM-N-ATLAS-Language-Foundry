"use client";

import { toast } from "sonner";
import { PlusIcon } from "@/components/icons";

export function AddLanguageButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Language creation is coming soon.")}
      className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <PlusIcon className="h-4 w-4" />
      Add language
    </button>
  );
}
