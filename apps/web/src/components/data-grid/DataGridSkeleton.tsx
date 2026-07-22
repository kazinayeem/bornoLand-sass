"use client";

import { TableSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DataGridSkeleton({ rows = 8, cols = 6, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-apple-hairline bg-apple-canvas p-1", className)}>
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}
