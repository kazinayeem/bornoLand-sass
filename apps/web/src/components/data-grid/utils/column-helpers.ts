import type { ColumnDef } from "@tanstack/react-table";
import type { LegacyColumn } from "../types";

export function legacyColumnsToColumnDefs<T>(columns: LegacyColumn<T>[]): ColumnDef<T, unknown>[] {
  return columns.map((column) => ({
    id: column.key,
    accessorKey: column.key,
    header: column.label,
    enableSorting: column.sortable ?? false,
    meta: {
      label: column.label,
      hideOnMobile: column.hideOnMobile,
      hideOnTablet: column.hideOnTablet,
      exportable: column.exportable ?? true,
      permission: column.permission,
      exportValue: column.exportValue,
    },
    cell: ({ row }) => column.render(row.original),
    size: undefined,
  }));
}
