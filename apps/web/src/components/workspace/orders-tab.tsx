"use client";

import { useCallback, useEffect, useMemo, useState, lazy, Suspense, memo } from "react";
import {
  useGetStoreOrdersQuery,
  useLazyGetStoreOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from "@/redux/api/store-order-api";
import type { StoreOrder } from "@/redux/api/store-order-api";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { getStoreLogoUrl } from "@/lib/store-branding";
import { printOrderPdfReport } from "@/lib/orders/order-report-pdf";
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
  BarChart3,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { PosOrderModal } from "@/components/pos/pos-order-modal";
import { toast } from "sonner";
import { DataTable, type Column, openReportWindow } from "@/components/ui/data-table";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
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

/**
 * Isolated, memoized search input component.
 * Internal keystrokes do NOT trigger re-renders in OrdersTab until the 300ms debounce fires.
 */
type OrderSearchInputProps = {
  initialValue: string;
  onSearch: (value: string) => void;
  placeholder?: string;
};

const OrderSearchInput = memo(function OrderSearchInput({
  initialValue,
  onSearch,
  placeholder = "Search customer, phone, order #...",
}: OrderSearchInputProps) {
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    setInternalValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(internalValue.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [internalValue, onSearch]);

  return (
    <div className="relative min-w-[200px] flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
      <Input
        type="search"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9 pr-8 text-xs"
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => {
            setInternalValue("");
            onSearch("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
});

/**
 * Isolated, memoized status dropdown.
 * Shows row-level spinner and disables dropdown during mutation without flashing the entire table.
 */
type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
  isUpdating: boolean;
  onChange: (orderId: string, status: string) => void;
};

const OrderStatusSelect = memo(function OrderStatusSelect({
  orderId,
  currentStatus,
  isUpdating,
  onChange,
}: OrderStatusSelectProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={currentStatus}
        disabled={isUpdating}
        onChange={(e) => onChange(orderId, e.target.value)}
        className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-800 outline-none hover:border-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </select>
      {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 shrink-0" />}
    </div>
  );
});

export function OrdersTab({ storeId }: OrdersTabProps) {
  const [activeView, setActiveView] = useState<"completed" | "incomplete">("completed");
  const [activeTab, setActiveTab] = useState<OrderTabKey>("all");
  const today = todayInput();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paymentFilter, setPaymentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<StoreOrder | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [exportBusyLabel, setExportBusyLabel] = useState<string | null>(null);
  const [posOpen, setPosOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Store information for branding and PDF exports
  const { data: storeData } = useGetStoreQuery(storeId);
  const store = storeData?.data?.store;
  const storeName = store?.name || "Bornoland Store";
  const storeLogoUrl = getStoreLogoUrl(store);

  const applyPreset = useCallback((preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "custom") {
      return;
    }
    const range = rangeForPreset(preset);
    setFromDate(range.from);
    setToDate(range.to);
    setPage(1);
  }, []);

  const handleApplyCustomDate = useCallback(() => {
    if (customFrom && customTo && customFrom > customTo) {
      toast.error("From date cannot be after To date");
      return;
    }
    setFromDate(customFrom);
    setToDate(customTo);
    setPage(1);
    toast.success("Applied custom date range");
  }, [customFrom, customTo]);

  const handleResetCustomDate = useCallback(() => {
    setCustomFrom(today);
    setCustomTo(today);
    setFromDate(today);
    setToDate(today);
    setDatePreset("today");
    setPage(1);
  }, [today]);

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

  // Load orders for complete dataset export (PDF/CSV)
  const loadExportOrders = useCallback(
    async (overrideFilters?: Partial<typeof queryFilters>): Promise<StoreOrder[]> => {
      const active = { ...queryFilters, ...overrideFilters };
      const limit = Math.min(Math.max(total ?? 0, 100), 1000);
      const res = await fetchOrdersForExport({
        ...active,
        page: "1",
        limit: String(limit),
      }).unwrap();
      return res?.data?.orders ?? [];
    },
    [queryFilters, total, fetchOrdersForExport]
  );

  // PDF & CSV Export Handlers
  const handleExportViewPdf = useCallback(async () => {
    if (exportBusyLabel) return;
    const targetWin = openReportWindow("Generating Orders PDF...");
    setExportBusyLabel("Generating PDF...");
    try {
      const exportOrders = await loadExportOrders();
      printOrderPdfReport({
        storeName,
        storeLogoUrl,
        reportType: "filtered",
        title: "Orders Report",
        subtitle: `Orders list matching active filters`,
        dateLabel,
        orders: exportOrders,
        currencySettings: settings,
        targetWindow: targetWin,
      });
      toast.success(`Generated PDF for ${exportOrders.length} orders`);
    } catch (err) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF report");
    } finally {
      setExportBusyLabel(null);
    }
  }, [exportBusyLabel, loadExportOrders, storeName, storeLogoUrl, dateLabel, settings]);

  const handleExportViewCsv = useCallback(async () => {
    if (exportBusyLabel) return;
    setExportBusyLabel("Exporting CSV...");
    try {
      const exportOrders = await loadExportOrders();
      const rows = buildOrderReportRows(exportOrders, money);
      downloadCsv(
        `orders-report-${fromDate || "all"}-${toDate || "all"}.csv`,
        [...REPORT_HEADERS],
        rows
      );
      toast.success(`Exported ${exportOrders.length} orders to CSV`);
    } catch {
      toast.error("Failed to export orders CSV");
    } finally {
      setExportBusyLabel(null);
    }
  }, [exportBusyLabel, loadExportOrders, money, fromDate, toDate]);

  const handleExportDailyReport = useCallback(async () => {
    if (exportBusyLabel) return;
    const targetWin = openReportWindow("Generating Daily Sales Report...");
    setExportBusyLabel("Generating Daily PDF...");
    try {
      const targetDate = fromDate || today;
      const exportOrders = await loadExportOrders({
        from: targetDate,
        to: targetDate,
        status: undefined,
        paymentStatus: undefined,
        search: undefined,
      });
      printOrderPdfReport({
        storeName,
        storeLogoUrl,
        reportType: "daily",
        title: "Daily Sales & Order Report",
        subtitle: `Performance summary for ${targetDate}`,
        dateLabel: targetDate,
        orders: exportOrders,
        currencySettings: settings,
        targetWindow: targetWin,
      });
      toast.success(`Generated daily report for ${targetDate}`);
    } catch (err) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(err instanceof Error ? err.message : "Failed to generate daily report");
    } finally {
      setExportBusyLabel(null);
    }
  }, [exportBusyLabel, fromDate, today, loadExportOrders, storeName, storeLogoUrl, settings]);

  const handleExportMonthlyReport = useCallback(async () => {
    if (exportBusyLabel) return;
    const targetWin = openReportWindow("Generating Monthly Sales Report...");
    setExportBusyLabel("Generating Monthly PDF...");
    try {
      const startOfMonth = monthStartInput();
      const endOfMonth = today;
      const exportOrders = await loadExportOrders({
        from: startOfMonth,
        to: endOfMonth,
        status: undefined,
        paymentStatus: undefined,
        search: undefined,
      });
      printOrderPdfReport({
        storeName,
        storeLogoUrl,
        reportType: "monthly",
        title: "Monthly Sales Report",
        subtitle: `Monthly performance & daily sales breakdown (${startOfMonth} to ${endOfMonth})`,
        dateLabel: `${startOfMonth} → ${endOfMonth}`,
        orders: exportOrders,
        currencySettings: settings,
        targetWindow: targetWin,
      });
      toast.success(`Generated monthly report for current month`);
    } catch (err) {
      if (targetWin && !targetWin.closed) targetWin.close();
      toast.error(err instanceof Error ? err.message : "Failed to generate monthly report");
    } finally {
      setExportBusyLabel(null);
    }
  }, [exportBusyLabel, today, loadExportOrders, storeName, storeLogoUrl, settings]);

  const exportMenuItems: DropdownItem[] = useMemo(
    () => [
      {
        label: "Export View (PDF)",
        icon: FileText,
        description: "Printable PDF with KPIs & branding",
        onClick: handleExportViewPdf,
        disabled: Boolean(exportBusyLabel),
      },
      {
        label: "Export View (CSV)",
        icon: Download,
        description: "Raw tabular dataset for spreadsheet",
        onClick: handleExportViewCsv,
        disabled: Boolean(exportBusyLabel),
      },
      { divider: true },
      {
        label: "Daily Sales Report (PDF)",
        icon: Calendar,
        description: "Daily summary metrics & orders",
        onClick: handleExportDailyReport,
        disabled: Boolean(exportBusyLabel),
      },
      {
        label: "Monthly Sales Report (PDF)",
        icon: BarChart3,
        description: "Monthly breakdown by day & orders",
        onClick: handleExportMonthlyReport,
        disabled: Boolean(exportBusyLabel),
      },
    ],
    [
      exportBusyLabel,
      handleExportViewPdf,
      handleExportViewCsv,
      handleExportDailyReport,
      handleExportMonthlyReport,
    ]
  );

  const handleStatusChange = useCallback(
    async (orderId: string, status: string) => {
      if (updatingOrderId) return;
      setUpdatingOrderId(orderId);
      try {
        const result = await updateStatus({ storeId, orderId, status }).unwrap();
        toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status] ?? status}`);
        if (selectedOrder?._id === orderId && result.data?.order) {
          setSelectedOrder(result.data.order);
        }
      } catch {
        toast.error("Failed to update status");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [updatingOrderId, updateStatus, storeId, selectedOrder]
  );

  const handlePaymentChange = useCallback(
    async (orderId: string, paymentStatus: string) => {
      try {
        const result = await updatePayment({ storeId, orderId, paymentStatus }).unwrap();
        toast.success(`Payment marked as ${paymentStatus}`);
        if (selectedOrder?._id === orderId && result.data?.order) {
          setSelectedOrder(result.data.order);
        }
      } catch {
        toast.error("Failed to update payment status");
      }
    },
    [updatePayment, storeId, selectedOrder]
  );

  const openCreateShipment = (order: StoreOrder, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canCreateShipment || !canShipOrder(order) || orderHasShipment(order)) return;
    setShipmentOrder(order);
  };

  const columns: Column<StoreOrder>[] = useMemo(
    () => [
      {
        key: "order",
        label: "Order",
        render: (order) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="font-bold text-xs text-zinc-950 dark:text-zinc-100 hover:text-[#003399] dark:hover:text-[#FFDA1A] text-left block cursor-pointer transition-colors"
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
        render: (order) => (
          <OrderStatusSelect
            orderId={order._id}
            currentStatus={order.status}
            isUpdating={updatingOrderId === order._id}
            onChange={handleStatusChange}
          />
        ),
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
              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              title="View order details"
              aria-label="View order details"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => printStoreOrderInvoice(storeId, order._id)}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              title="Print invoice"
              aria-label="Print invoice"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [money, updatingOrderId, handleStatusChange, storeId]
  );

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

  const hasActiveFilters = Boolean(
    search || activeTab !== "all" || paymentFilter || datePreset !== "all"
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setActiveTab("all");
    setPaymentFilter("");
    setDatePreset("all");
    setFromDate("");
    setToDate("");
    setPage(1);
  }, []);

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
          {/* Enhanced Export Menu (PDF & CSV with instant feedback) */}
          <DropdownMenu
            trigger={
              <Button
                variant="outline"
                size="sm"
                disabled={Boolean(exportBusyLabel)}
                className="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                {exportBusyLabel ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{exportBusyLabel}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                    <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                  </>
                )}
              </Button>
            }
            items={exportMenuItems}
          />

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
          {/* ── KPI Summary Cards Strip (with skeleton when loading) ── */}
          {isLoading && !analytics ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50"
                />
              ))}
            </div>
          ) : analytics ? (
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
          ) : null}

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
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Isolated search input (keystrokes don't re-render entire page) */}
              <OrderSearchInput
                initialValue={search}
                onSearch={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
              />

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

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Custom Date Range Picker bar (when custom preset is selected) */}
            {datePreset === "custom" && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium">From:</span>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-8 w-36 text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium">To:</span>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-8 w-36 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleApplyCustomDate}
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  Apply Range
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetCustomDate}
                  className="h-8 text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Clear
                </Button>
              </div>
            )}
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
              title={hasActiveFilters ? "No matching orders found" : "No orders yet"}
              description={
                hasActiveFilters
                  ? "No customer orders match your active filter criteria."
                  : "Customer orders will appear here once customers place orders."
              }
              action={
                hasActiveFilters ? (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => setPosOpen(true)}
                    size="sm"
                    className="bg-[#003399] text-white hover:bg-[#002B80] cursor-pointer text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create POS Order
                  </Button>
                )
              }
            />
          ) : (
            <DataTable
              data={orders}
              columns={columns as any}
              keyExtractor={(o) => o._id}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={(p: number) => setPage(p)}
              onPageSizeChange={(s: number) => setPageSize(s)}
              hideSearch={true}
              isFetching={isFetching}
            />
          )}
        </div>
      )}

      {/* ── Order Details Modal ──────────────────────────────── */}
      {selectedOrder && (
        <Modal
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
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
                  onClick={() => downloadStoreOrderInvoice(storeId, selectedOrder._id, selectedOrder.orderNumber)}
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
          onClose={() => setPosOpen(false)}
          storeId={storeId}
          onSuccess={() => {
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
            onClose={() => setShipmentOrder(null)}
            order={shipmentOrder}
            storeId={storeId}
            onCreated={() => {
              setShipmentOrder(null);
              refetch();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
