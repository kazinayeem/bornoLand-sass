"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { DashboardPageHeader } from "@/components/store-dashboard/dashboard-ui";
import {
  useGetReportDashboardQuery,
  useGetRevenueReportQuery,
  useGetSummaryReportQuery,
  useGetOrderReportQuery,
  useGetCustomerReportQuery,
  useGetProductReportQuery,
  useGetCategoryReportQuery,
  useGetCouponReportQuery,
  type DashboardKPIs,
} from "@/redux/api/reports-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import { DEFAULT_FILTER_STATE, REPORT_MODULES } from "./constants";
import type { ReportExportFormat, ReportExportPayload, ReportModuleId, ReportsFilterState } from "./types";
import { ReportsFilterBar } from "./ReportsFilterBar";
import { ReportsModuleNav } from "./ReportsModuleNav";
import { KpiCard } from "./shared/KpiCard";
import { EmptyState } from "./shared/EmptyState";
import {
  exportRowsToCsv,
  exportRowsToExcel,
  exportRowsToJson,
  printReportPdf,
} from "./export/report-export";
import {
  customerName,
  emptyExport,
  filtersLabel,
  toDateRange,
} from "./modules/module-types";
import { OverviewModule } from "./modules/OverviewModule";
import { SalesModule } from "./modules/SalesModule";
import { OrdersModule } from "./modules/OrdersModule";
import { ProductsModule } from "./modules/ProductsModule";
import { InventoryModule } from "./modules/InventoryModule";
import { CustomersModule } from "./modules/CustomersModule";
import { PaymentsModule } from "./modules/PaymentsModule";
import { ShippingModule } from "./modules/ShippingModule";
import { CourierModule } from "./modules/CourierModule";
import { CategoriesModule } from "./modules/CategoriesModule";
import { CouponsModule } from "./modules/CouponsModule";
import { TaxModule } from "./modules/TaxModule";
import { ExpenseModule } from "./modules/ExpenseModule";
import { ProfitLossModule } from "./modules/ProfitLossModule";
import { PerformanceModule } from "./modules/PerformanceModule";
import { StaffModule } from "./modules/StaffModule";
import { RefundsModule } from "./modules/RefundsModule";
import { ReturnsModule } from "./modules/ReturnsModule";
import { WalletModule } from "./modules/WalletModule";
import { SubscriptionModule } from "./modules/SubscriptionModule";
import { CustomModule } from "./modules/CustomModule";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

function buildModuleExport(
  module: ReportModuleId,
  kpis: DashboardKPIs | undefined,
  money: (v: number) => string,
): ReportExportPayload {
  const title = REPORT_MODULES.find((m) => m.id === module)?.label ?? "Report";

  switch (module) {
    case "orders": {
      const rows = (kpis?.latestOrders ?? []).map((o) => [
        o.orderNumber,
        customerName(o.customerId),
        o.status,
        o.paymentStatus ?? "",
        o.paymentMethod ?? "",
        money(o.total),
        new Date(o.createdAt).toLocaleString(),
      ]);
      return {
        title: `${title} report`,
        headers: ["Order", "Customer", "Status", "Payment", "Method", "Total", "Date"],
        rows,
        summary: [
          { label: "Orders", value: String(kpis?.totalOrders ?? 0) },
          { label: "Pending", value: String(kpis?.pendingOrders ?? 0) },
        ],
      };
    }
    case "products":
    case "inventory": {
      const rows = (kpis?.topProducts ?? []).map((p) => [
        p.name,
        p.totalSold,
        money(p.revenue),
      ]);
      return {
        title: `${title} report`,
        headers: ["Product", "Sold", "Revenue"],
        rows,
      };
    }
    case "customers": {
      const rows = (kpis?.topCustomers ?? []).map((c) => [
        c.name || "Customer",
        c.email || "",
        c.orderCount,
        money(c.totalSpent),
      ]);
      return {
        title: `${title} report`,
        headers: ["Name", "Email", "Orders", "Spent"],
        rows,
      };
    }
    case "payments": {
      const rows = (kpis?.paymentMethods ?? []).map((m) => [
        String(m._id || "unknown"),
        m.count,
        money(m.total),
      ]);
      return {
        title: `${title} report`,
        headers: ["Method", "Count", "Total"],
        rows,
      };
    }
    case "shipping": {
      const rows = (kpis?.shippingMethods ?? []).map((m) => [
        String(m._id || "Unspecified"),
        m.count,
        money(m.total),
      ]);
      return {
        title: `${title} report`,
        headers: ["Method", "Shipments", "Amount"],
        rows,
      };
    }
    case "courier": {
      const rows = (kpis?.courierBreakdown ?? []).map((m) => [
        String(m._id || "Unspecified"),
        m.count,
        money(m.total),
      ]);
      return {
        title: `${title} report`,
        headers: ["Courier", "Shipments", "Value"],
        rows,
      };
    }
    case "categories": {
      const rows = (kpis?.topCategories ?? []).map((c) => [
        String(c._id),
        c.units,
        money(c.revenue),
      ]);
      return {
        title: `${title} report`,
        headers: ["Category", "Units", "Revenue"],
        rows,
      };
    }
    case "profit-loss": {
      const expense =
        kpis?.totalExpense ??
        (kpis?.shippingCost ?? 0) + (kpis?.refundAmount ?? 0) + (kpis?.discountTotal ?? 0);
      const net = kpis?.netIncome ?? kpis?.netProfit ?? (kpis?.totalRevenue ?? 0) - expense;
      return {
        title: "Profit & loss",
        headers: ["Line", "Amount"],
        rows: [
          ["Revenue", money(kpis?.totalRevenue ?? 0)],
          ["Expense", money(expense)],
          ["Net income", money(net)],
        ],
      };
    }
    case "staff":
    case "wallet":
      return emptyExport(`${title} — coming soon`);
    default: {
      const rows = (kpis?.latestOrders ?? []).map((o) => [
        o.orderNumber,
        o.status,
        money(o.total),
        new Date(o.createdAt).toLocaleDateString(),
      ]);
      return {
        title: `${title} report`,
        headers: ["Order", "Status", "Total", "Date"],
        rows:
          rows.length > 0
            ? rows
            : [
                [
                  "Revenue",
                  money(kpis?.totalRevenue ?? 0),
                  "Orders",
                  String(kpis?.totalOrders ?? 0),
                ],
              ],
        summary: [
          { label: "Revenue", value: money(kpis?.totalRevenue ?? 0) },
          { label: "Orders", value: String(kpis?.totalOrders ?? 0) },
          { label: "AOV", value: money(kpis?.avgOrderValue ?? 0) },
          { label: "Customers", value: String(kpis?.totalCustomers ?? 0) },
        ],
      };
    }
  }
}

export function ReportsDashboard() {
  const { store, storeId, isLoading: storeLoading } = useStorePage();
  const [module, setModule] = useState<ReportModuleId>("overview");
  const [filters, setFilters] = useState<ReportsFilterState>(DEFAULT_FILTER_STATE);

  const range = useMemo(() => toDateRange(filters), [filters]);
  const filterText = useMemo(() => filtersLabel(filters), [filters]);

  const { data: settingsData } = useGetStoreSettingsQuery(storeId ?? "", { skip: !storeId });
  const settings = settingsData?.data?.settings;
  const money = (v: number) => formatCurrency(v || 0, settings);

  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
    refetch: refetchDash,
  } = useGetReportDashboardQuery(
    { storeId: storeId ?? "", range, advanced: filters.advanced },
    { skip: !storeId },
  );

  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId },
  );

  const { data: summaryData } = useGetSummaryReportQuery(
    { storeId: storeId ?? "", period: "monthly" },
    { skip: !storeId },
  );

  const { data: orderData } = useGetOrderReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId || (module !== "orders" && module !== "overview") },
  );

  const { data: customerData } = useGetCustomerReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId || module !== "customers" },
  );

  const { data: productData } = useGetProductReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId || (module !== "products" && module !== "inventory") },
  );

  const { data: categoryData } = useGetCategoryReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId || module !== "categories" },
  );

  const { data: couponData } = useGetCouponReportQuery(
    { storeId: storeId ?? "", range },
    { skip: !storeId || module !== "coupons" },
  );

  const kpis = dashData?.data;
  const revenue = revenueData?.data;
  const summary = summaryData?.data;
  const storeName = store?.name || "Store";

  const baseProps = {
    storeId: storeId ?? "",
    range,
    filters,
    money,
    kpis,
    loading: dashLoading,
  };

  const handleExport = (format: ReportExportFormat) => {
    const payload = buildModuleExport(module, kpis, money);
    const slug = module.replace(/[^a-z0-9-]/gi, "-");
    const filename = `bornoland-${slug}-report`;

    if (format === "csv") {
      exportRowsToCsv(filename, payload.headers, payload.rows);
      return;
    }
    if (format === "json") {
      exportRowsToJson(filename, {
        module,
        filters: filterText,
        summary: payload.summary,
        headers: payload.headers,
        rows: payload.rows,
      });
      return;
    }
    if (format === "excel") {
      exportRowsToExcel(filename, [
        { name: payload.title.slice(0, 31), headers: payload.headers, rows: payload.rows },
      ]);
      return;
    }
    // pdf + print share HTML report
    printReportPdf({
      title: payload.title,
      storeName,
      subtitle: REPORT_MODULES.find((m) => m.id === module)?.description,
      filtersLabel: filterText,
      summary: payload.summary,
      headers: payload.headers,
      rows: payload.rows,
      generatedBy: "Bornoland Reports",
    });
  };

  if (storeLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      <DashboardPageHeader
        title="Reports & Analytics"
        description="ERP-grade ecommerce intelligence for your store."
      />

      <ReportsFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            ...DEFAULT_FILTER_STATE,
            advanced: { ...DEFAULT_FILTER_STATE.advanced },
          })
        }
        onExport={handleExport}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={money(kpis?.totalRevenue ?? 0)}
          icon={DollarSign}
          tone="success"
          changePct={kpis?.comparison?.revenueChange}
          compact
        />
        <KpiCard
          label="Orders"
          value={kpis?.totalOrders ?? 0}
          icon={ShoppingCart}
          tone="warning"
          changePct={kpis?.comparison?.ordersChange}
          compact
        />
        <KpiCard
          label="AOV"
          value={money(kpis?.avgOrderValue ?? 0)}
          icon={TrendingUp}
          tone="info"
          compact
        />
        <KpiCard
          label="Customers"
          value={kpis?.totalCustomers ?? 0}
          icon={Users}
          tone="info"
          compact
        />
      </div>

      <ReportsModuleNav active={module} onChange={setModule} />

      {dashError ? (
        <EmptyState
          title="Could not load reports"
          description="Check your connection and try again."
          action={
            <button
              type="button"
              onClick={() => refetchDash()}
              className="h-8 rounded-md border border-apple-hairline px-3 text-[11px]"
            >
              Retry
            </button>
          }
        />
      ) : dashLoading && !kpis ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-apple-canvas-parchment" />
          ))}
        </div>
      ) : (
        <>
          {module === "overview" && (
            <OverviewModule
              {...baseProps}
              revenue={revenue}
              summary={summary}
              loading={dashLoading || revenueLoading}
            />
          )}
          {module === "sales" && (
            <SalesModule {...baseProps} revenue={revenue} summary={summary} />
          )}
          {module === "orders" && (
            <OrdersModule {...baseProps} orderReport={orderData?.data} />
          )}
          {module === "products" && (
            <ProductsModule {...baseProps} productReport={productData?.data} />
          )}
          {module === "inventory" && (
            <InventoryModule {...baseProps} productReport={productData?.data} />
          )}
          {module === "customers" && (
            <CustomersModule {...baseProps} customerReport={customerData?.data} />
          )}
          {module === "payments" && <PaymentsModule {...baseProps} />}
          {module === "shipping" && <ShippingModule {...baseProps} />}
          {module === "courier" && <CourierModule {...baseProps} />}
          {module === "categories" && (
            <CategoriesModule {...baseProps} categoryReport={categoryData?.data} />
          )}
          {module === "coupons" && (
            <CouponsModule {...baseProps} couponReport={couponData?.data} />
          )}
          {module === "tax" && <TaxModule {...baseProps} />}
          {module === "expense" && <ExpenseModule {...baseProps} />}
          {module === "profit-loss" && <ProfitLossModule {...baseProps} />}
          {module === "performance" && <PerformanceModule {...baseProps} />}
          {module === "staff" && <StaffModule {...baseProps} />}
          {module === "refunds" && <RefundsModule {...baseProps} />}
          {module === "returns" && <ReturnsModule {...baseProps} />}
          {module === "wallet" && <WalletModule {...baseProps} />}
          {module === "subscription" && <SubscriptionModule {...baseProps} />}
          {module === "custom" && <CustomModule {...baseProps} />}
        </>
      )}
    </div>
  );
}
