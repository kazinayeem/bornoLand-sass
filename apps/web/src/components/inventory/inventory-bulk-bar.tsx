"use client";

import { Check, X, Archive, Trash2, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

type InventoryBulkBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAdjust?: () => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  isProcessing?: boolean;
};

export function InventoryBulkBar({
  selectedCount,
  onClearSelection,
  onBulkAdjust,
  onBulkArchive,
  onBulkDelete,
  isProcessing = false,
}: InventoryBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-xs text-white shadow-2xl dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
      <div className="flex items-center gap-2 font-semibold">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] dark:bg-zinc-900/20">
          {selectedCount}
        </span>
        <span>selected</span>
      </div>

      <div className="h-4 w-px bg-white/20 dark:bg-zinc-900/20" />

      <div className="flex items-center gap-1.5">
        {onBulkArchive && (
          <button
            type="button"
            onClick={onBulkArchive}
            disabled={isProcessing}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 font-medium transition-colors hover:bg-white/10 dark:hover:bg-zinc-900/10"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archive</span>
          </button>
        )}

        {onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            disabled={isProcessing}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 font-medium text-red-300 transition-colors hover:bg-red-500/20 dark:text-red-600 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      <div className="h-4 w-px bg-white/20 dark:bg-zinc-900/20" />

      <button
        type="button"
        onClick={onClearSelection}
        className="rounded-lg p-1 text-zinc-400 hover:text-white dark:hover:text-zinc-900"
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
