import type { ReportAdvancedFilters, ReportPreset } from "@/redux/api/reports-api";

export type ReportModuleId =
  | "overview"
  | "sales"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "payments"
  | "shipping"
  | "courier"
  | "categories"
  | "coupons"
  | "tax"
  | "expense"
  | "profit-loss"
  | "performance"
  | "staff"
  | "refunds"
  | "returns"
  | "wallet"
  | "subscription"
  | "custom";

export type ReportsFilterState = {
  preset: ReportPreset;
  start: string;
  end: string;
  advanced: ReportAdvancedFilters;
  showAdvanced: boolean;
};

export type CustomAggregate = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export type SavedReportTemplate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  fields: string[];
  groupBy: string;
  aggregate: CustomAggregate;
  aggregateField?: string;
};

export type ReportExportFormat = "pdf" | "excel" | "csv" | "print" | "json";

export type ReportTableColumn = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  visible?: boolean;
};

export type ReportExportPayload = {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string }[];
};

export type MoneyFormatter = (value: number) => string;
