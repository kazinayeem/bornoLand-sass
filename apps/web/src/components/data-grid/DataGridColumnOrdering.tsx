"use client";

import { memo } from "react";
import type { Table } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

type DataGridColumnOrderingProps<TData> = {
  table: Table<TData>;
};

function DataGridColumnOrderingInner<TData>({ table }: DataGridColumnOrderingProps<TData>) {
  const columns = table.getAllLeafColumns().filter((column) => column.id !== "select" && column.id !== "actions");

  return (
    <div className="flex flex-wrap gap-2">
      {columns.map((column) => {
        const meta = column.columnDef.meta as { label?: string } | undefined;
        return (
          <button
            key={column.id}
            type="button"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", column.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromId = e.dataTransfer.getData("text/plain");
              const order = table.getState().columnOrder.length
                ? [...table.getState().columnOrder]
                : columns.map((col) => col.id);
              const fromIndex = order.indexOf(fromId);
              const toIndex = order.indexOf(column.id);
              if (fromIndex < 0 || toIndex < 0) return;
              order.splice(fromIndex, 1);
              order.splice(toIndex, 0, fromId);
              table.setColumnOrder(order);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-apple-hairline bg-apple-canvas px-2 py-1 text-xs text-apple-ink-muted-80"
          >
            <GripVertical className="h-3.5 w-3.5" />
            {meta?.label ?? column.id}
          </button>
        );
      })}
    </div>
  );
}

export const DataGridColumnOrdering = memo(DataGridColumnOrderingInner) as typeof DataGridColumnOrderingInner;
