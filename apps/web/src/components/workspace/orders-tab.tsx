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
  ShoppingBag,
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
  Plus,
  CheckCircle2,
  Clock,
  Package,
  User,
  MapPin,
  FileText,
  CreditCard,
  Phone,
} from "lucide-react";
import { PosOrderModal } from "@/components/pos/pos-order-modal";
import { toast } from "sonner";
import { DataTable, type Column, printDataGridReport, openReportWindow } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";
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
import { IncompleteOrdersTab } from "@/components/orders/incomplete-orders-tab";
import { motion } from "framer-motion";

const CreateShipmentModal = lazy(() =>
  import("@/components/workspace/create-shipment-modal").then((m) => ({
    default: m.CreateShipmentModal,
  }))
);

type OrdersTabProps = { storeId: string };
type DatePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";
type OrderTabKey = "all" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

const statusOptions = [...ORDER_STATUS_OPTIONS];
const paymentOptions = ["pending", "paid", "partial", "failed", "refunded"];

const SHIP_STATUS_TONE: Record<string, string> = {
  created: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  picked: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  in_transit: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  hub_received: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  out_for_delivery: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  returned: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
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

export function OrdersTab({ storeId }: OrdersTabProps) {
  const [activeView, setActiveView] = useState<"completed" | "incomplete">("completed");
  const [activeTab, setActiveTab] = useState<OrderTabKey>("all");
  const today = todayInput();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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
  const [posOpen, setPosOpen] = useState(false);

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

  const derivedStatusFilter = useMemo(() => {
    if (activeTab === "all") return undefined;
    return activeTab;
  }, [activeTab]);

  const queryFilters = useMemo(
    () => ({
      storeId,
      status: derivedStatusFilter,
      paymentStatus: paymentFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      search: search || undefined,
    }),
    [storeId, derivedStatusFilter, paymentFilter, fromDate, toDate, search]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetStoreOrdersQuery({
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
  const total = data?.data?.total ?? orders.length;

  const dateLabel = useMemo(() => {
    if (!fromDate && !toDate) return "All time";
    if (fromDate && toDate && fromDate === toDate) return fromDate;
    if (fromDate && toDate) return `${fromDate} → ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    return `Until ${toDate}`;
  }, [fromDate, toDate]);

  const loadExportOrders = useCallback(async (): Promise<{
    orders: StoreOrder[];
    title: string;
    subtitle: string;
  }> => {
    const limit = Math.min(Math.max(total ?? 0, 100), 500);
    const res = await fetchOrdersForExport({
      ...queryFilters,
      page: "1",
      limit: String(limit),
    }).unwrap();
    const fetched = res?.data?.orders ?? [];
    return {
      orders: fetched,
      title: "Orders Report",
      subtitle: `Exported ${dateLabel}`,
    };
  }, [total, fetchOrdersForExport, queryFilters, dateLabel]);

  const handleExportCsv = useCallback(async () => {
    setExportBusy(true);
    try {
      const exported = await loadExportOrders();
      const rows = buildOrderReportRows(exported.orders, money);
      downloadCsv(
        `orders-report-${fromDate || "all"}-${toDate || "all"}.csv`,
        [...REPORT_HEADERS],
        rows
      );
      toast.success(`Exported ${exported.orders.length} orders`);
    } catch {
      toast.error("Failed to export orders CSV");
    } finally {
      setExportBusy(false);
    }
  }, [loadExportOrders, money, fromDate, toDate]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const result = await updateStatus({ storeId, orderId, status }).unwrap();
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status] ?? status}`);
      if (selectedOrder?._id === orderId && result.data?.order) {
        setSelectedOrder(result.data.order);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: string) => {
    try {
      const result = await updatePayment({ storeId, orderId, paymentStatus }).unwrap();
      toast.success(`Payment marked as ${paymentStatus}`);
      if (selectedOrder?._id === orderId && result.data?.order) {
        setSelectedOrder(result.data.order);
      }
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const openCreateShipment = (order: StoreOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canCreateShipment || !canShipOrder(order) || orderHasShipment(order)) return;
    setShipmentOrder(order);
  };

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

  const columns: Column<StoreOrder>[] = [
    {
      key: "order",
      label: "Order",
      render: (order) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setSelectedOrder(order)}
            className="font-bold text-xs text-zinc-950 dark:text-zinc-100 hover:text-[#003399] dark:hover:text-[#FFDA1A] text-left block"
          >
            #{order.orderNumber}
          </button>
          <p className="text-[11px] text-zinc-400">{formatDate(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => {
        const customerName =
          order.customerId?.name || order.shippingAddress?.fullName || "Guest Customer";
        const phone = order.customerId?.phone || order.shippingAddress?.phone || "";
        const city = order.shippingAddress?.city || "";
        return (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
              {customerName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {phone} {city ? `• ${city}` : ""}
            </p>
          </div>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      hideOnMobile: true,
      render: (order) => (
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {order.items?.length || 0} items
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order) => (
        <div>
          <span className="text-xs font-bold text-zinc-950 dark:text-white">
            {money(order.total)}
          </span>
          <p className="text-[10px] text-zinc-400 capitalize">{order.paymentMethod || "COD"}</p>
        </div>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      hideOnMobile: true,
      render: (order) => {
        const isPaid = order.paymentStatus === "paid";
        return (
          <Badge variant={isPaid ? "success" : "warning"}>
            {order.paymentStatus || "unpaid"}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (order) => {
        const badge = statusBadge(order.status);
        return (
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
            className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-800 outline-none hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "_actions",
      label: "",
      className: "w-28 text-right",
      render: (order) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedOrder(order)}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 cursor-pointer"
            title="View order details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => printStoreOrderInvoice(storeId, order._id)}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 cursor-pointer"
            title="Print invoice"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const orderTabs: Array<{ id: OrderTabKey; label: string }> = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
    { id: "returned", label: "Returned" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Top Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("completed")}
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight transition-colors cursor-pointer",
                activeView === "completed"
                  ? "text-zinc-950 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700"
              )}
            >
              Orders
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <button
              type="button"
              onClick={() => setActiveView("incomplete")}
              className={cn(
                "text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5",
                activeView === "incomplete"
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-700"
              )}
            >
              <span>Incomplete / Abandoned</span>
              <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-1.5 py-0.2 text-[10px] font-bold">
                Recovery
              </span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage customer purchases, shipment tracking, fulfillment status, and invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={exportBusy}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{exportBusy ? "Exporting..." : "Export CSV"}</span>
          </Button>

          <Button
            onClick={() => setPosOpen(true)}
            size="sm"
            className="gap-1.5 bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Order (POS)</span>
          </Button>
        </div>
      </div>

      {activeView === "incomplete" ? (
        <IncompleteOrdersTab storeId={storeId} />
      ) : (
        <div className="space-y-4">
          {/* ── KPI Summary Cards Strip ──────────────────────── */}
          {analytics && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
                  {analytics.totalOrders}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Revenue
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {money(analytics.totalRevenue)}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Pending
                </p>
                <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
                  {analytics.pendingOrders}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Processing
                </p>
                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {analytics.processingOrders}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Delivered
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {analytics.deliveredOrders}
                </p>
              </div>
            </div>
          )}

          {/* ── Status Tabs ──────────────────────────────────── */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            {orderTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={cn(
                    "relative py-2.5 px-4 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                    isActive
                      ? "text-[#003399] dark:text-[#FFDA1A] font-bold"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="order-active-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#003399] dark:bg-[#FFDA1A]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Filter & Search Toolbar ──────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search customer, phone, order #..."
                  className="h-9 pl-9 text-xs"
                />
              </div>

              {/* Date presets */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                      datePreset === preset.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 outline-none hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="">All Payments</option>
                {paymentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Orders Table Area ────────────────────────────── */}
          {isLoading ? (
            <TablePageSkeleton rows={8} cols={6} />
          ) : isError ? (
            <ErrorState
              title="Unable to load orders"
              message="Check your network connection and try again."
              onRetry={refetch}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="No customer orders match your active filter criteria."
              action={
                <Button
                  onClick={() => setPosOpen(true)}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] cursor-pointer text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create POS Order
                </Button>
              }
            />
          ) : (
            <DataTable
              data={orders}
              columns={columns}
              keyField="_id"
              searchable={false}
              pagination={
                totalPages > 1
                  ? {
                      page,
                      pageSize,
                      total,
                      onPageChange: (p) => setPage(p),
                      onPageSizeChange: (s) => setPageSize(s),
                    }
                  : undefined
              }
            />
          )}
        </div>
      )}

      {/* ── Order Details Modal ──────────────────────────────── */}
      {selectedOrder && (
        <Modal
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          className="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top header summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-950 dark:text-white text-sm">
                    {money(selectedOrder.total)}
                  </span>
                  <Badge variant={statusBadge(selectedOrder.status).variant}>
                    {selectedOrder.status}
                  </Badge>
                  <Badge variant={selectedOrder.paymentStatus === "paid" ? "success" : "warning"}>
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Created {formatDate(selectedOrder.createdAt)} • Via {selectedOrder.paymentMethod || "COD"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printStoreOrderInvoice(storeId, selectedOrder._id)}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadStoreOrderInvoice(storeId, selectedOrder._id)}
                  className="h-8 gap-1 text-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Customer & Shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200/80 p-3.5 space-y-2 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <User className="h-3.5 w-3.5" />
                  <span>Customer Details</span>
                </div>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedOrder.customerId?.name || selectedOrder.shippingAddress?.fullName || "Guest"}
                </p>
                <p className="text-zinc-500">{selectedOrder.customerId?.phone || selectedOrder.shippingAddress?.phone || "No phone"}</p>
                <p className="text-zinc-500">{selectedOrder.customerId?.email || "No email"}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 p-3.5 space-y-2 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Shipping Address</span>
                </div>
                <p className="text-zinc-900 dark:text-zinc-100">
                  {selectedOrder.shippingAddress?.street || "No street address"}
                </p>
                <p className="text-zinc-500">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state || ""}{" "}
                  {selectedOrder.shippingAddress?.zip || ""}
                </p>
              </div>
            </div>

            {/* Line items list */}
            <div className="rounded-xl border border-zinc-200/80 p-3.5 space-y-3 dark:border-zinc-800">
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>Items Ordered ({selectedOrder.items?.length || 0})</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotals & calculations */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2.5 space-y-1 text-right">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{money(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery Charge</span>
                  <span>{money(selectedOrder.deliveryCharge || selectedOrder.shipping || 0)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{money(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Total</span>
                  <span>{money(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Courier & Shipment section if present */}
            {selectedOrder.shipment && (
              <div className="rounded-xl border border-zinc-200/80 p-3.5 space-y-2 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Courier Tracking ({selectedOrder.shipment.providerName || selectedOrder.shipment.provider})</span>
                  </div>
                  <Badge variant="primary">{selectedOrder.shipment.status || "In Transit"}</Badge>
                </div>
                <p className="font-mono text-zinc-900 dark:text-zinc-100">
                  Tracking: {selectedOrder.shipment.trackingNumber || "N/A"}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* POS Modal */}
      {posOpen && (
        <PosOrderModal
          open={posOpen}
          onOpenChange={setPosOpen}
          storeId={storeId}
          onOrderCreated={() => {
            setPosOpen(false);
            refetch();
          }}
        />
      )}

      {/* Shipment Modal */}
      {shipmentOrder && (
        <Suspense fallback={null}>
          <CreateShipmentModal
            open={Boolean(shipmentOrder)}
            onOpenChange={(open) => !open && setShipmentOrder(null)}
            order={shipmentOrder}
            storeId={storeId}
            onSuccess={() => {
              setShipmentOrder(null);
              refetch();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
