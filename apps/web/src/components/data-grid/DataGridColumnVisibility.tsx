"use client";

import { memo } from "react";
import type { Table } from "@tanstack/react-table";
import { Columns3 } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

type DataGridColumnVisibilityProps<TData> = {
  table: Table<TData>;
};

function DataGridColumnVisibilityInner<TData>({ table }: DataGridColumnVisibilityProps<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.id !== "select" && column.id !== "actions" && column.getCanHide());

  return (
    <DropdownMenu
      placement="bottom-end"
      minWidth={220}
      trigger={
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-apple-hairline bg-apple-canvas px-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
        >
          <Columns3 className="h-4 w-4" />
          Columns
        </button>
      }
      items={columns.map((column) => {
        const meta = column.columnDef.meta as { label?: string } | undefined;
        return {
          key: column.id,
          label: meta?.label ?? column.id,
          onClick: () => column.toggleVisibility(!column.getIsVisible()),
          badge: column.getIsVisible() ? "Shown" : "Hidden",
        };
      })}
    />
  );
}

export const DataGridColumnVisibility = memo(DataGridColumnVisibilityInner) as typeof DataGridColumnVisibilityInner;
