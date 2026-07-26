"use client";

/**
 * Backward-compatible DataTable API powered by the enterprise DataGrid system.
 * Existing admin tables can migrate incrementally to `@/components/data-grid`.
 */
export {
  LegacyDataTable as DataTable,
  type LegacyColumn as Column,
  type LegacyBulkAction as BulkAction,
  type LegacySortConfig as SortConfig,
  printDataGridReport,
  openReportWindow,
  type DataGridExportMeta,
} from "@/components/data-grid";
