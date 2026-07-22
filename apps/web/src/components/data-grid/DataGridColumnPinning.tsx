"use client";

import { memo } from "react";
import type { Table } from "@tanstack/react-table";
import { Pin, PinOff } from "lucide-react";

type DataGridColumnPinningProps<TData> = {
  table: Table<TData>;
  columnId: string;
};

function DataGridColumnPinningInner<TData>({ table, columnId }: DataGridColumnPinningProps<TData>) {
  const column = table.getColumn(columnId);
  if (!column || !column.getCanPin()) return null;
  const pinned = column.getIsPinned();

  return (
    <button
      type="button"
      onClick={() => column.pin(pinned ? false : "left")}
      className="rounded p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
      aria-label={pinned ? "Unpin column" : "Pin column"}
    >
      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
    </button>
  );
}

export const DataGridColumnPinning = memo(DataGridColumnPinningInner) as typeof DataGridColumnPinningInner;
