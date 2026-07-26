import { DATE_PRESETS } from "../constants";
import type { MoneyFormatter, ReportExportPayload, ReportsFilterState } from "../types";
import type {
  CategoryReport,
  CouponReport,
  CustomerReport,
  DashboardKPIs,
  OrderReport,
  ProductReport,
  ReportDateRange,
  RevenueReport,
  SummaryReport,
} from "@/redux/api/reports-api";

export type ModuleBaseProps = {
  storeId: string;
  range: ReportDateRange;
  filters: ReportsFilterState;
  money: MoneyFormatter;
  kpis?: DashboardKPIs;
  loading?: boolean;
};

export type OverviewModuleProps = ModuleBaseProps & {
  revenue?: RevenueReport;
  summary?: SummaryReport;
};

export type SalesModuleProps = ModuleBaseProps & {
  revenue?: RevenueReport;
  summary?: SummaryReport;
};

export type OrdersModuleProps = ModuleBaseProps & {
  orderReport?: OrderReport;
};

export type ProductsModuleProps = ModuleBaseProps & {
  productReport?: ProductReport;
};

export type InventoryModuleProps = ModuleBaseProps & {
  productReport?: ProductReport;
};

export type CustomersModuleProps = ModuleBaseProps & {
  customerReport?: CustomerReport;
};

export type CategoriesModuleProps = ModuleBaseProps & {
  categoryReport?: CategoryReport;
};

export type CouponsModuleProps = ModuleBaseProps & {
  couponReport?: CouponReport;
};

export function toDateRange(filters: ReportsFilterState): ReportDateRange {
  if (filters.preset === "custom") {
    return {
      preset: "custom",
      start: filters.start || undefined,
      end: filters.end || undefined,
    };
  }
  return { preset: filters.preset };
}

export function filtersLabel(filters: ReportsFilterState): string {
  const presetLabel =
    DATE_PRESETS.find((p) => p.value === filters.preset)?.label ?? filters.preset;
  const parts = [`Period: ${presetLabel}`];
  if (filters.preset === "custom") {
    if (filters.start) parts.push(`From ${filters.start}`);
    if (filters.end) parts.push(`To ${filters.end}`);
  }
  const adv = filters.advanced;
  if (adv.orderStatus) parts.push(`Status: ${adv.orderStatus}`);
  if (adv.paymentStatus) parts.push(`Payment: ${adv.paymentStatus}`);
  if (adv.paymentMethod) parts.push(`Method: ${adv.paymentMethod}`);
  if (adv.courier) parts.push(`Courier: ${adv.courier}`);
  if (adv.search) parts.push(`Search: ${adv.search}`);
  if (adv.minAmount) parts.push(`Min: ${adv.minAmount}`);
  if (adv.maxAmount) parts.push(`Max: ${adv.maxAmount}`);
  return parts.join(" · ");
}

export function applyClientFilters<T extends Record<string, unknown>>(
  rows: T[],
  filters: ReportsFilterState,
  map: {
    status?: (row: T) => string | undefined;
    paymentStatus?: (row: T) => string | undefined;
    paymentMethod?: (row: T) => string | undefined;
    courier?: (row: T) => string | undefined;
    searchText?: (row: T) => string;
    amount?: (row: T) => number | undefined;
  },
): T[] {
  const adv = filters.advanced;
  const min = adv.minAmount ? Number(adv.minAmount) : null;
  const max = adv.maxAmount ? Number(adv.maxAmount) : null;
  const q = (adv.search ?? "").trim().toLowerCase();

  return rows.filter((row) => {
    if (adv.orderStatus && map.status && map.status(row) !== adv.orderStatus) return false;
    if (adv.paymentStatus && map.paymentStatus && map.paymentStatus(row) !== adv.paymentStatus)
      return false;
    if (adv.paymentMethod && map.paymentMethod) {
      const method = (map.paymentMethod(row) ?? "").toLowerCase();
      if (method !== adv.paymentMethod.toLowerCase()) return false;
    }
    if (adv.courier && map.courier) {
      const courier = (map.courier(row) ?? "").toLowerCase();
      if (!courier.includes(adv.courier.toLowerCase())) return false;
    }
    if (q && map.searchText && !map.searchText(row).toLowerCase().includes(q)) return false;
    if (map.amount) {
      const amount = map.amount(row) ?? 0;
      if (min != null && !Number.isNaN(min) && amount < min) return false;
      if (max != null && !Number.isNaN(max) && amount > max) return false;
    }
    return true;
  });
}

export function emptyExport(title: string): ReportExportPayload {
  return {
    title,
    headers: ["Message"],
    rows: [["No data available for this module and filter set."]],
  };
}

export function customerName(
  customer?: { name?: string; email?: string } | string | null,
): string {
  if (!customer) return "Customer";
  if (typeof customer === "string") return customer;
  return customer.name || customer.email || "Customer";
}
