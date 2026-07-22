import type { ColumnDef } from "@tanstack/react-table";
import type { DataGridBulkAction, DataGridPermissions, DataGridRowAction } from "../types";
import type { DataGridColumnMeta } from "../types";

export function filterColumnsByPermission<T>(
  columns: ColumnDef<T, unknown>[],
  permissions?: DataGridPermissions,
): ColumnDef<T, unknown>[] {
  const hidden = new Set(permissions?.hiddenColumns ?? []);
  return columns.filter((column) => {
    const accessorColumn = column as ColumnDef<T, unknown> & { accessorKey?: string };
    const id = column.id ?? (typeof accessorColumn.accessorKey === "string" ? accessorColumn.accessorKey : "");
    if (hidden.has(id)) return false;
    const meta = column.meta as DataGridColumnMeta | undefined;
    if (meta?.permission && permissions?.hiddenColumns?.includes(meta.permission)) return false;
    return true;
  });
}

export function filterRowActions<T>(
  actions: DataGridRowAction<T>[] | undefined,
  permissions?: DataGridPermissions,
): DataGridRowAction<T>[] {
  const hidden = new Set(permissions?.hiddenRowActions ?? []);
  return (actions ?? []).filter((action) => !hidden.has(action.id) && !hidden.has(action.permission ?? ""));
}

export function filterBulkActions<T>(
  actions: DataGridBulkAction<T>[] | undefined,
  permissions?: DataGridPermissions,
): DataGridBulkAction<T>[] {
  const hidden = new Set(permissions?.hiddenBulkActions ?? []);
  return (actions ?? []).filter((action) => !hidden.has(action.id) && !hidden.has(action.permission ?? ""));
}
