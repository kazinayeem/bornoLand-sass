"use client";

import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { DATA_GRID_DENSITY_CELL_PADDING, DATA_GRID_DENSITY_ROW_HEIGHT } from "./constants";
import type { DataGridColumnMeta, DataGridDensity, DataGridRowAction } from "./types";
import { DataGridRowActions } from "./DataGridRowActions";
import { DataGridHeader } from "./DataGridHeader";

type DataGridVirtualRowsProps<TData> = {
  table: Table<TData>;
  density: DataGridDensity;
  enableSelection?: boolean;
  rowActions?: DataGridRowAction<TData>[];
  onRowClick?: (row: TData) => void;
  estimatedRowHeight?: number;
  stickyHeader?: boolean;
};

function DataGridVirtualRowsInner<TData>({
  table,
  density,
  enableSelection,
  rowActions,
  onRowClick,
  estimatedRowHeight,
  stickyHeader = true,
}: DataGridVirtualRowsProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const rowHeight = estimatedRowHeight ?? DATA_GRID_DENSITY_ROW_HEIGHT[density];

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div ref={parentRef} className="max-h-[min(70vh,720px)] overflow-auto">
      <table className="w-full min-w-[640px]">
        <DataGridHeader
          table={table}
          headerGroups={table.getHeaderGroups()}
          density={density}
          sticky={stickyHeader}
          enableSelection={enableSelection}
        />
        <tbody>
          {paddingTop > 0 ? (
            <tr>
              <td style={{ height: paddingTop }} colSpan={table.getVisibleLeafColumns().length + (enableSelection ? 1 : 0)} />
            </tr>
          ) : null}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<TData>;
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-apple-divider-soft transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-apple-canvas-parchment",
                  row.getIsSelected() && "bg-apple-primary/5",
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {enableSelection ? (
                  <td className={cn("w-10", DATA_GRID_DENSITY_CELL_PADDING[density])}>
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-apple-hairline text-apple-primary focus:ring-2 focus:ring-apple-primary-focus"
                      aria-label="Select row"
                    />
                  </td>
                ) : null}
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as DataGridColumnMeta | undefined;
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "text-caption text-apple-ink-muted-80",
                        DATA_GRID_DENSITY_CELL_PADDING[density],
                        meta?.hideOnMobile && "hidden sm:table-cell",
                        meta?.hideOnTablet && "hidden lg:table-cell",
                        cell.column.getIsPinned() === "left" && "sticky left-0 z-10 bg-apple-canvas",
                        cell.column.getIsPinned() === "right" && "sticky right-0 z-10 bg-apple-canvas",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
                {rowActions && rowActions.length > 0 ? (
                  <td className={cn("w-12 text-right", DATA_GRID_DENSITY_CELL_PADDING[density])}>
                    <DataGridRowActions row={row.original} actions={rowActions} />
                  </td>
                ) : null}
              </tr>
            );
          })}
          {paddingBottom > 0 ? (
            <tr>
              <td style={{ height: paddingBottom }} colSpan={table.getVisibleLeafColumns().length + (enableSelection ? 1 : 0)} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export const DataGridVirtualRows = memo(DataGridVirtualRowsInner) as typeof DataGridVirtualRowsInner;
