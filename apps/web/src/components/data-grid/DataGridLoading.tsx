"use client";

import { Loader2 } from "lucide-react";
import { TableLoadingOverlay } from "@/components/loading/table-loading-overlay";
import { cn } from "@/lib/utils";

export function DataGridLoading({ show, label = "Updating results" }: { show?: boolean; label?: string }) {
  if (!show) return null;
  return <TableLoadingOverlay show label={label} />;
}

export function DataGridInlineLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-10 text-sm text-apple-ink-muted-48", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}
