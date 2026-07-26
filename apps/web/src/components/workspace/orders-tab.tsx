"use client";

import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  useGetStoreOrdersQuery,
  useLazyGetStoreOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from "@/redux/api/store-order-api";
import type { StoreOrder } from "@/redux/api/store-order-api";
import {
  ShoppingCart,
  Search,
  Download,
  Printer,
  Mail,
  RefreshCw,
  Eye,
  ExternalLink,
  Truck,
  Copy,
  Calendar,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, printDataGridReport, openReportWindow } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import { OrderTimeline } from "@/components/orders/order-timeline";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from "@/lib/orders/timeline";
import {
  downloadStoreOrderInvoice,
  emailStoreOrderInvoice,
  printStoreOrderInvoice,
  viewStoreOrderInvoice,
} from "@/lib/order-invoice";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import { useGetStoreCouriersQuery } from "@/redux/api/courier-api";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { OrderShipmentPanel, orderHasShipment } from "@/components/workspace/order-shipment-panel";

const CreateShipmentModal = lazy(() =>
  import("@/components/workspace/create-shipment-modal").then((m) => ({
    default: m.CreateShipmentModal,
  })),
);

type OrdersTabProps = { storeId: string };
type DatePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";

const statusOptions = [...ORDER_STATUS_OPTIONS];
const paymentOptions = ["pending", "paid", "partial", "failed", "refunded"];

const SHIP_STATUS_TONE: Record<string, string> = {
  created: "bg-sky-50 text-sky-700",
  pending: "bg-amber-50 text-amber-700",
  picked: "bg-indigo-50 text-indigo-700",
  in_transit: "bg-blue-50 text-blue-700",
  hub_received: "bg-violet-50 text-violet-700",
  out_for_delivery: "bg-cyan-50 text-cyan-700",
  delivered: "bg-emerald-50 text-emerald-700",
  returned: "bg-orange-50 text-orange-700",
  cancelled: "bg-zinc-100 text-zinc-600",
  failed: "bg-red-50 text-red-700",
};

const REPORT_HEADERS = [
  "Order #",
  "Date",
  "Customer",
  "Phone",
  "City",
  "Items",
  "Total",
  "Status",
  "Payment",
  "Method",
  "Courier",
  "Tracking",
] as const;

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayInput() {
  return toDateInputValue(new Date());
}

function shiftDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function monthStartInput() {
  const date = new Date();
  return toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
}

function rangeForPreset(preset: DatePreset): { from: string; to: string } {
  const today = todayInput();
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = shiftDays(-1);
      return { from: y, to: y };
    }
    case "7d":
      return { from: shiftDays(-6), to: today };
    case "30d":
      return { from: shiftDays(-29), to: today };
    case "month":
      return { from: monthStartInput(), to: today };
    case "all":
      return { from: "", to: "" };
    default:
      return { from: today, to: today };
  }
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function formatReportDate(d: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

function canShipOrder(order: StoreOrder) {
  return !["cancelled", "refunded"].includes(order.status);
}

function orderCourierLabel(order: StoreOrder) {
  return order.shipment?.providerName || order.shipment?.provider || order.courier || "";
}

function orderTrackingLabel(order: StoreOrder) {
  return order.shipment?.trackingNumber || order.trackingNumber || "";
}

function buildOrderReportRows(orders: StoreOrder[], money: (v: number) => string): string[][] {
  return orders.map((order) => [
    order.orderNumber || "",
    formatReportDate(order.createdAt),
    order.customerId?.name || order.shippingAddress?.fullName || "Guest",
    order.customerId?.phone || order.shippingAddress?.phone || "",
    order.shippingAddress?.city || "",
    String(order.items?.length || 0),
    money(order.total || 0),
    ORDER_STATUS_LABELS[order.status] ?? order.status,
    order.paymentStatus || "",
    order.paymentMethod || "",
    orderCourierLabel(order),
    orderTrackingLabel(order),
  ]);
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const lines = [headers.join(","), ...rows.map((row) => row.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const DATE_PRESETS: Array<{ id: DatePreset; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

const filterControlClass =
  "h-7 rounded-md border border-apple-hairline bg-white px-2 text-[11px] text-apple-ink outline-none focus:border-apple-primary";


export function OrdersTab({ storeId }: OrdersTabProps) {
  const today = todayInput();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<StoreOrder | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const applyPreset = useCallback((preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "custom") {
      setShowAdvanced(true);
      return;
    }
    const range = rangeForPreset(preset);
    setFromDate(range.from);
    setToDate(range.to);
    setPage(1);
  }, []);

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const settings = settingsData?.data?.settings;
  const money = useCallback((v: number) => formatCurrency(v || 0, settings), [settings]);

  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId);
  const courierFeature = getFeatureByKey(accessData?.data?.features ?? [], "courier");
  const courierFeatureOk = !courierFeature || !courierFeature.locked;

  const { data: couriersData } = useGetStoreCouriersQuery(storeId, {
    skip: !courierFeatureOk,
  });
  const canCreateShipment = useMemo(() => {
    if (!courierFeatureOk) return false;
    const list = couriersData?.data?.couriers ?? [];
    return list.some((c) => c.enabled && c.connectionStatus === "connected");
  }, [courierFeatureOk, couriersData?.data?.couriers]);

  const queryFilters = useMemo(
    () => ({
      storeId,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      search: search || undefined,
    }),
    [storeId, statusFilter, paymentFilter, fromDate, toDate, search],
  );

  const { data, isLoading, isFetching } = useGetStoreOrdersQuery({
    ...queryFilters,
    page: String(page),
    limit: String(pageSize),
  });
  const [fetchOrdersForExport] = useLazyGetStoreOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatePayment] = useUpdatePaymentStatusMutation();

  const orders = data?.data?.orders ?? [];
  const analytics = data?.data?.analytics;
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total;

  const dateLabel = useMemo(() => {
    if (!fromDate && !toDate) return "All time";
    if (fromDate && toDate && fromDate === toDate) return fromDate;
    if (fromDate && toDate) return `${fromDate} → ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    return `Until ${toDate}`;
  }, [fromDate, toDate]);

  const reportSubtitle = useMemo(() => {
    const parts = ["Store orders report", dateLabel];
    if (statusFilter) parts.push(`Status: ${ORDER_STATUS_LABELS[statusFilter] ?? statusFilter}`);
    if (paymentFilter) parts.push(`Payment: ${paymentFilter}`);
    if (search) parts.push(`Search: “${search}”`);
    return parts.join(" · ");
  }, [dateLabel, statusFilter, paymentFilter, search]);

  const reportSummary = useMemo(() => {
    if (!analytics) return undefined;
    return [
      { label: "Orders", value: String(analytics.totalOrders) },
      { label: "Revenue", value: money(analytics.totalRevenue) },
      { label: "Pending", value: String(analytics.pendingOrders) },
      { label: "Processing", value: String(analytics.processingOrders) },
      { label: "Delivered", value: String(analytics.deliveredOrders) },
    ];
  }, [analytics, money]);

  const loadExportOrders = useCallback(async () => {
    const result = await fetchOrdersForExport({
      ...queryFilters,
      page: "1",
      limit: "500",
    }).unwrap();
    return {
      orders: result.data?.orders ?? [],
      total: result.data?.total ?? 0,
      analytics: result.data?.analytics,
    };
  }, [fetchOrdersForExport, queryFilters]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPaymentFilter("");
    applyPreset("today");
    setShowAdvanced(false);
  }, [applyPreset]);

  const handleExportPdf = useCallback(async () => {
    // Must open the window during the click gesture — after await browsers leave about:blank.
    const printWindow = openReportWindow("Generating orders report…");
    if (!printWindow) {
      toast.error("Popup blocked. Allow popups for this site and try again.");
      return;
    }

    try {
      setExportBusy(true);
      const exported = await loadExportOrders();
      const rows = buildOrderReportRows(exported.orders, money);
      const summary = exported.analytics
        ? [
            { label: "Orders", value: String(exported.analytics.totalOrders) },
            { label: "Revenue", value: money(exported.analytics.totalRevenue) },
            { label: "Pending", value: String(exported.analytics.pendingOrders) },
            { label: "Processing", value: String(exported.analytics.processingOrders) },
            { label: "Delivered", value: String(exported.analytics.deliveredOrders) },
          ]
        : reportSummary;

      printDataGridReport(
        {
          title: "Orders Report",
          subtitle: reportSubtitle,
          summary,
          headers: [...REPORT_HEADERS],
          rows,
          footerNote:
            exported.total > exported.orders.length
              ? `Showing ${exported.orders.length} of ${exported.total} matching orders`
              : `All ${exported.orders.length} matching orders`,
        },
        printWindow,
      );
    } catch {
      try {
        printWindow.close();
      } catch {
        // ignore
      }
      toast.error("Failed to export orders report");
    } finally {
      setExportBusy(false);
    }
  }, [loadExportOrders, money, reportSubtitle, reportSummary]);

  const handleExportCsv = useCallback(async () => {
    try {
      setExportBusy(true);
      const exported = await loadExportOrders();
      const rows = buildOrderReportRows(exported.orders, money);
      downloadCsv(`orders-report-${fromDate || "all"}-${toDate || "all"}.csv`, [...REPORT_HEADERS], rows);
      toast.success(`Exported ${exported.orders.length} orders`);
    } catch {
      toast.error("Failed to export orders CSV");
    } finally {
      setExportBusy(false);
    }
  }, [loadExportOrders, money, fromDate, toDate]);

  const showCreateInModal =
    Boolean(selectedOrder) &&
    canCreateShipment &&
    selectedOrder &&
    !orderHasShipment(selectedOrder) &&
    canShipOrder(selectedOrder);

  const runInvoice = async (action: () => Promise<unknown>, success?: string) => {
    setInvoiceBusy(true);
    try {
      await action();
      if (success) toast.success(success);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invoice action failed");
    } finally {
      setInvoiceBusy(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const result = await updateStatus({ storeId, orderId, status }).unwrap();
      toast.success(`Order ${status}`);
      if (selectedOrder?._id === orderId && result.data?.order) setSelectedOrder(result.data.order);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: string) => {
    try {
      const result = await updatePayment({ storeId, orderId, paymentStatus }).unwrap();
      toast.success(`Payment ${paymentStatus}`);
      if (selectedOrder?._id === orderId && result.data?.order) setSelectedOrder(result.data.order);
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const openCreateShipment = (order: StoreOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canCreateShipment || !canShipOrder(order) || orderHasShipment(order)) return;
    setShipmentOrder(order);
  };

  const columns: Column<StoreOrder>[] = [
    {
      key: "order",
      label: "Order",
      exportValue: (order) => order.orderNumber,
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-apple-ink">{order.orderNumber}</p>
          <p className="text-[9px] text-apple-ink-muted-48">{formatDate(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      hideOnMobile: true,
      exportValue: (order) => order.customerId?.name || order.shippingAddress?.fullName || "Guest",
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate text-[11px] text-apple-ink">
            {order.customerId?.name || order.shippingAddress?.fullName || "Guest"}
          </p>
          <p className="truncate text-[9px] text-apple-ink-muted-48">
            {order.shippingAddress?.city || order.customerId?.phone || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      hideOnTablet: true,
      exportValue: (order) => order.items?.length || 0,
      render: (order) => (
        <span className="text-[10px] tabular-nums text-apple-ink-muted-80">{order.items?.length || 0}</span>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      exportValue: (order) => money(order.total),
      render: (order) => (
        <span className="text-[11px] font-semibold tabular-nums text-apple-ink">{money(order.total)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      exportValue: (order) => ORDER_STATUS_LABELS[order.status] ?? order.status,
      render: (order) => (
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order._id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-6 max-w-[100px] rounded border border-apple-hairline bg-white px-1 text-[9px] font-medium outline-none"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "payment",
      label: "Pay",
      exportValue: (order) => order.paymentStatus,
      render: (order) => (
        <select
          value={order.paymentStatus}
          onChange={(e) => handlePaymentChange(order._id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-6 max-w-[80px] rounded border border-apple-hairline bg-white px-1 text-[9px] font-medium outline-none"
        >
          {paymentOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "courier",
      label: "Courier",
      exportValue: (order) => {
        const courier = orderCourierLabel(order);
        const tracking = orderTrackingLabel(order);
        return [courier, tracking].filter(Boolean).join(" · ") || "—";
      },
      render: (order) => {
        const shipment = order.shipment;
        const shipped = orderHasShipment(order);
        const tracking = shipment?.trackingNumber || order.trackingNumber;

        if (shipped && tracking) {
          return (
            <div className="min-w-[110px]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "rounded px-1 py-0.5 text-[8px] font-semibold capitalize",
                    SHIP_STATUS_TONE[shipment?.status || "created"] ?? SHIP_STATUS_TONE.created,
                  )}
                >
                  {(shipment?.providerName || shipment?.provider || order.courier || "Sent").slice(0, 10)}
                </span>
              </div>
              <button
                type="button"
                title={tracking}
                onClick={() => {
                  void navigator.clipboard.writeText(tracking);
                  toast.success("Tracking copied");
                }}
                className="mt-0.5 flex max-w-[120px] items-center gap-1 truncate font-mono text-[8px] text-apple-ink-muted-80 hover:text-apple-primary"
              >
                <Copy className="h-2 w-2 shrink-0" />
                <span className="truncate">{tracking}</span>
              </button>
            </div>
          );
        }

        if (canCreateShipment && canShipOrder(order)) {
          return (
            <button
              type="button"
              onClick={(e) => openCreateShipment(order, e)}
              className="inline-flex h-6 items-center gap-1 rounded bg-apple-primary/10 px-1.5 text-[9px] font-semibold text-apple-primary hover:bg-apple-primary/15"
            >
              <Truck className="h-2.5 w-2.5" />
              Send
            </button>
          );
        }

        return <span className="text-[9px] text-apple-ink-muted-48">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-2.5">
      {analytics && (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {[
            { label: "Orders", value: String(analytics.totalOrders), color: "text-apple-ink" },
            { label: "Revenue", value: money(analytics.totalRevenue), color: "text-emerald-600" },
            { label: "Pending", value: String(analytics.pendingOrders), color: "text-amber-600" },
            { label: "Processing", value: String(analytics.processingOrders), color: "text-blue-600" },
            { label: "Delivered", value: String(analytics.deliveredOrders), color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-apple-hairline bg-white px-2.5 py-1.5">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                {s.label}
              </p>
              <p className={cn("mt-0.5 text-[13px] font-bold tabular-nums leading-tight", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-apple-hairline bg-white p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customer name, phone, or order ID…"
              className="h-7 w-full rounded-md border border-apple-hairline bg-apple-canvas-parchment/40 pl-7 pr-7 text-[11px] outline-none focus:border-apple-primary focus:bg-white"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-apple-ink-muted-48 hover:text-apple-ink"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={filterControlClass}
          >
            <option value="">All status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className={filterControlClass}
          >
            <option value="">All payment</option>
            {paymentOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium",
              showAdvanced || datePreset === "custom"
                ? "border-apple-primary/30 bg-apple-primary/5 text-apple-primary"
                : "border-apple-hairline bg-white text-apple-ink-muted-80",
            )}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Advanced
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-apple-hairline bg-white px-2 text-[11px] text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="mr-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
            <Calendar className="h-3 w-3" />
            Date
          </span>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "h-6 rounded-full px-2 text-[10px] font-medium transition-colors",
                datePreset === preset.id
                  ? "bg-apple-ink text-white"
                  : "bg-apple-canvas-parchment text-apple-ink-muted-80 hover:bg-zinc-200/70",
              )}
            >
              {preset.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-apple-ink-muted-48">{dateLabel}</span>
        </div>

        {showAdvanced || datePreset === "custom" ? (
          <div className="mt-2 grid gap-2 rounded-lg border border-dashed border-apple-hairline bg-apple-canvas-parchment/40 p-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setDatePreset("custom");
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className={cn(filterControlClass, "w-full")}
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">To</span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setDatePreset("custom");
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className={cn(filterControlClass, "w-full")}
              />
            </label>
            <div className="flex items-end gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="inline-flex h-7 items-center rounded-md border border-apple-hairline bg-white px-2 text-[10px] font-medium text-apple-ink"
              >
                Today only
              </button>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="inline-flex h-7 items-center rounded-md border border-apple-hairline bg-white px-2 text-[10px] font-medium text-apple-ink"
              >
                Clear dates
              </button>
            </div>
          </div>
        ) : null}

        <p className="mt-1.5 text-[10px] text-apple-ink-muted-48">
          {isFetching ? "Updating…" : `${total ?? 0} order${total === 1 ? "" : "s"}`}
          {search ? ` · matching “${search}”` : ""}
          {" · "}
          report uses the same filters
        </p>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        keyExtractor={(o) => o._id}
        isLoading={isLoading || exportBusy}
        emptyIcon={ShoppingCart}
        emptyTitle={fromDate || search || statusFilter ? "No orders found" : "No orders yet"}
        emptyDescription={
          fromDate || search || statusFilter
            ? "Try another date range, status, or search term."
            : "Orders will appear here when customers start purchasing."
        }
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={setSelectedOrder}
        hideSearch
        hidePagination
        exportMeta={{
          title: "Orders Report",
          subtitle: reportSubtitle,
          summary: reportSummary,
          filename: "orders-report.csv",
          footerNote: "Store orders report",
        }}
        onExportOverride={{
          csv: () => {
            void handleExportCsv();
          },
          pdf: () => {
            void handleExportPdf();
          },
        }}
      />

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      )}

      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? selectedOrder.orderNumber : "Order"}
        description={selectedOrder ? formatDate(selectedOrder.createdAt) : undefined}
        size="xl"
        stickyFooter
        footer={
          selectedOrder ? (
            <div className="flex flex-wrap items-center gap-2">
              {showCreateInModal ? (
                <button
                  type="button"
                  onClick={() => {
                    setShipmentOrder(selectedOrder);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-apple-primary px-4 text-[12px] font-medium text-white"
                >
                  <Truck className="h-3.5 w-3.5" /> Send Courier
                </button>
              ) : null}
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() => runInvoice(() => viewStoreOrderInvoice(storeId, selectedOrder._id))}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
              >
                <Eye className="h-3.5 w-3.5" /> Invoice
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() =>
                  runInvoice(
                    () => downloadStoreOrderInvoice(storeId, selectedOrder._id, selectedOrder.orderNumber),
                    "Invoice downloaded",
                  )
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() => runInvoice(() => printStoreOrderInvoice(storeId, selectedOrder._id))}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() =>
                  runInvoice(() => emailStoreOrderInvoice(storeId, selectedOrder._id), "Invoice emailed")
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() =>
                  runInvoice(
                    () => downloadStoreOrderInvoice(storeId, selectedOrder._id, selectedOrder.orderNumber),
                    "Invoice regenerated",
                  )
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regen
              </button>
              {selectedOrder.verificationToken ? (
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/invoice/verify/${selectedOrder.verificationToken}`;
                    void navigator.clipboard.writeText(url);
                    setCopied("verification");
                    toast.success("Verification link copied");
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-apple-hairline bg-white px-3 text-[12px] font-medium text-apple-ink"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {copied === "verification" ? "Copied" : "Verify link"}
                </button>
              ) : null}
            </div>
          ) : null
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Status", value: selectedOrder.status },
                { label: "Payment", value: selectedOrder.paymentStatus },
                { label: "Total", value: money(selectedOrder.total) },
                { label: "Items", value: String(selectedOrder.items?.length ?? 0) },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-apple-hairline bg-gradient-to-b from-white to-apple-canvas-parchment px-3 py-2.5"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-apple-ink-muted-48">
                    {card.label}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] font-semibold capitalize text-apple-ink">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                className="h-8 rounded-lg border border-apple-hairline bg-white px-2 text-[12px] outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
              <select
                value={selectedOrder.paymentStatus}
                onChange={(e) => handlePaymentChange(selectedOrder._id, e.target.value)}
                className="h-8 rounded-lg border border-apple-hairline bg-white px-2 text-[12px] outline-none"
              >
                {paymentOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <section>
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                Items
              </h4>
              <div className="divide-y divide-apple-hairline overflow-hidden rounded-xl border border-apple-hairline">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 bg-white px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-apple-ink">{item.name}</p>
                      <p className="text-[10px] text-apple-ink-muted-48">
                        {item.variantTitle ? `${item.variantTitle} · ` : ""}
                        Qty {item.quantity} × {money(item.price)}
                      </p>
                    </div>
                    <p className="shrink-0 text-[12px] font-semibold text-apple-ink">
                      {money(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {selectedOrder.shippingAddress ? (
              <section>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                  Shipping
                </h4>
                <div className="rounded-xl border border-apple-hairline bg-white px-3 py-2.5 text-[12px] leading-relaxed text-apple-ink-muted-80">
                  <p className="font-medium text-apple-ink">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </section>
            ) : null}

            {selectedOrder.shipment?.trackingNumber ? (
              <OrderShipmentPanel
                storeId={storeId}
                order={selectedOrder}
                onUpdated={(next) => setSelectedOrder(next)}
              />
            ) : null}

            <section>
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                Timeline
              </h4>
              <OrderTimeline
                status={selectedOrder.status}
                paymentStatus={selectedOrder.paymentStatus}
                timeline={selectedOrder.timeline}
              />
            </section>
          </div>
        )}
      </Modal>

      {shipmentOrder ? (
        <Suspense fallback={null}>
          <CreateShipmentModal
            open={!!shipmentOrder}
            onClose={() => setShipmentOrder(null)}
            storeId={storeId}
            order={shipmentOrder}
            currencySettings={settings}
            onCreated={(next) => {
              if (selectedOrder?._id === next._id) setSelectedOrder(next);
              setShipmentOrder(null);
            }}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
