"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { DataGridBulkAction } from "./types";

type DataGridBulkActionsProps<T> = {
  count: number;
  rows: T[];
  actions: DataGridBulkAction<T>[];
  onClear: () => void;
};

function DataGridBulkActionsInner<T>({ count, rows, actions, onClear }: DataGridBulkActionsProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-apple-hairline bg-apple-canvas-parchment px-3 py-2">
      <span className="text-sm font-medium text-apple-ink">{count} selected</span>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => void action.onClick(rows)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
              action.variant === "danger"
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : action.variant === "warning"
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-white text-apple-ink-muted-80 hover:bg-apple-surface-pearl",
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {action.label}
          </button>
        );
      })}
      <button type="button" onClick={onClear} className="ml-1 text-xs text-apple-ink-muted-48 hover:text-apple-ink">
        Clear
      </button>
    </div>
  );
}

export const DataGridBulkActions = memo(DataGridBulkActionsInner) as typeof DataGridBulkActionsInner;
