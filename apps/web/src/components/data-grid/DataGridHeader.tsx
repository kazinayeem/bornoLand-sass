"use client";

import { memo } from "react";
import type { HeaderGroup } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_GRID_DENSITY_CELL_PADDING } from "./constants";
import type { DataGridColumnMeta, DataGridDensity } from "./types";
import { DataGridColumnPinning } from "./DataGridColumnPinning";
import type { Table } from "@tanstack/react-table";

type DataGridHeaderProps<TData> = {
  table: Table<TData>;
  headerGroups: HeaderGroup<TData>[];
  density: DataGridDensity;
  sticky?: boolean;
  enableSelection?: boolean;
};

function DataGridHeaderInner<TData>({
  table,
  headerGroups,
  density,
  sticky = true,
  enableSelection,
}: DataGridHeaderProps<TData>) {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className={cn(
            "border-b border-apple-divider-soft bg-apple-canvas-parchment/90",
            sticky && "sticky top-0 z-20 backdrop-blur-sm",
          )}
        >
          {enableSelection ? (
            <th className={cn("w-10", DATA_GRID_DENSITY_CELL_PADDING[density])}>
              <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                ref={(el) => {
                  if (!el) return;
                  el.indeterminate = table.getIsSomePageRowsSelected();
                }}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                className="h-4 w-4 rounded border-apple-hairline text-apple-primary focus:ring-2 focus:ring-apple-primary-focus"
                aria-label="Select all rows"
              />
            </th>
          ) : null}
          {headerGroup.headers.map((header) => {
            const meta = header.column.columnDef.meta as DataGridColumnMeta | undefined;
            const sorted = header.column.getIsSorted();
            return (
              <th
                key={header.id}
                style={{ width: header.getSize() }}
                className={cn(
                  "text-left text-caption-strong uppercase tracking-wider text-apple-ink-muted-48",
                  DATA_GRID_DENSITY_CELL_PADDING[density],
                  header.column.getCanSort() && "cursor-pointer select-none hover:text-apple-ink",
                  meta?.hideOnMobile && "hidden sm:table-cell",
                  meta?.hideOnTablet && "hidden lg:table-cell",
                  header.column.getIsPinned() === "left" && "sticky left-0 z-30 bg-apple-canvas-parchment/95",
                  header.column.getIsPinned() === "right" && "sticky right-0 z-30 bg-apple-canvas-parchment/95",
                )}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-1.5">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() ? (
                    sorted === "asc" ? (
                      <ChevronUp className="h-3.5 w-3.5 text-apple-ink" />
                    ) : sorted === "desc" ? (
                      <ChevronDown className="h-3.5 w-3.5 text-apple-ink" />
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                    )
                  ) : null}
                  <DataGridColumnPinning table={table} columnId={header.column.id} />
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export const DataGridHeader = memo(DataGridHeaderInner) as typeof DataGridHeaderInner;
