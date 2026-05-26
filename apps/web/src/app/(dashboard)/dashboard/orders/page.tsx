"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetStoreOrdersQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation } from "@/redux/api/store-order-api";
import type { StoreOrder } from "@/redux/api/store-order-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { getStoreDisplayDomain } from "@/utils/domain";
import {
  ShoppingCart, Store, Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight,
  Package, DollarSign, Clock, CheckCircle, AlertCircle, Truck,
  Loader2, MoreHorizontal, Eye, Edit3, CreditCard, MapPin, Phone, User,
  FileText, RefreshCw, SlidersHorizontal, Ban, ArrowUpDown, Inbox
} from "lucide-react";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; icon: any }> = {
  pending: { label: "Pending", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  confirmed: { label: "Confirmed", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", icon: CheckCircle },
  processing: { label: "Processing", dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", icon: Package },
  shipped: { label: "Shipped", dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700", icon: Truck },
  delivered: { label: "Delivered", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", icon: Ban },
};

const paymentConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: "Pending", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  paid: { label: "Paid", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  failed: { label: "Failed", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
  refunded: { label: "Refunded", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank Transfer",
  card: "Card Payment",
  stripe: "Stripe",
  paypal: "PayPal",
};

function StatusBadge({ status, config }: { status: string; config: Record<string, any> }) {
  const c = config[status] ?? config.pending;
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.bg, c.text)}>
      {Icon && <Icon className="h-3 w-3" />}
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const c = paymentConfig[status] ?? paymentConfig.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.bg, c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-100 px-6 py-4">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
      <div className="ml-auto h-8 w-8 animate-pulse rounded bg-zinc-200" />
    </div>
  );
}

export default function OrdersPage() {
  const { currentStoreId, currentStore, stores, selectStore, clearStore } = useCurrentStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [drawerOrder, setDrawerOrder] = useState<StoreOrder | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: settingsData } = useGetStoreSettingsQuery(currentStoreId, { skip: !currentStoreId });
  const storeSettings = settingsData?.data?.settings;
  const fmt = useCallback((amount: number) => formatCurrency(amount, storeSettings ?? "BDT"), [storeSettings]);

  const { data: ordersData, isLoading: ordersLoading, isError, refetch } = useGetStoreOrdersQuery(
    { storeId: currentStoreId, status: statusFilter || undefined, paymentStatus: paymentFilter || undefined, search: search || undefined, page: String(page), limit: String(perPage) },
    { skip: !currentStoreId }
  );

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: updatingPayment }] = useUpdatePaymentStatusMutation();

  const orders = ordersData?.data?.orders ?? [];
  const analytics = ordersData?.data?.analytics;
  const totalPages = ordersData?.data?.totalPages ?? 1;
  const totalOrders = ordersData?.data?.total ?? 0;

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus({ storeId: currentStoreId, orderId, status }).unwrap();
      toast.success(`Order status updated to ${statusConfig[status]?.label ?? status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: string) => {
    try {
      await updatePayment({ storeId: currentStoreId, orderId, paymentStatus }).unwrap();
      toast.success(`Payment status updated to ${paymentConfig[paymentStatus]?.label ?? paymentStatus}`);
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const analyticsCards = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: "Total Orders", value: analytics.totalOrders, icon: ShoppingCart, variant: "default" as const, prefix: "" },
      { label: "Total Revenue", value: fmt(analytics.totalRevenue), icon: DollarSign, variant: "green" as const, prefix: "" },
      { label: "Pending", value: analytics.pendingOrders, icon: Clock, variant: "amber" as const, prefix: "" },
      { label: "Delivered", value: analytics.deliveredOrders, icon: CheckCircle, variant: "blue" as const, prefix: "" },
    ];
  }, [analytics, fmt]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPaymentFilter("");
    setPage(1);
  };

  const hasFilters = search || statusFilter || paymentFilter;

  if (!currentStoreId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Orders</h2>
            <p className="mt-1 text-sm text-zinc-500">View and manage your store orders.</p>
          </div>
        </div>
        {stores.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <ShoppingCart className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store to start receiving orders.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s, i) => (
              <motion.button key={s._id} onClick={() => { selectStore(s); setPage(1); }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{getStoreDisplayDomain(s.subdomain, s.slug)}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" />{s.productCount ?? 0}</span>
                  <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{s.orderCount ?? 0}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Orders</h2>
            <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{currentStore?.name}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Manage your store orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => clearStore()} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            <Store className="h-4 w-4" /> Change Store
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {analyticsCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                card.variant === "green" ? "bg-emerald-50/50 border-emerald-200" :
                card.variant === "amber" ? "bg-amber-50/50 border-amber-200" :
                card.variant === "blue" ? "bg-blue-50/50 border-blue-200" :
                "bg-white border-zinc-200"
              )}>
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium tracking-wide text-zinc-500">{card.label}</p>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900">{card.value}</span>
                </div>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.variant === "green" ? "bg-emerald-600 text-white" :
                  card.variant === "amber" ? "bg-amber-600 text-white" :
                  card.variant === "blue" ? "bg-blue-600 text-white" :
                  "bg-blue-600 text-white"
                )}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text" placeholder="Search by order #, customer, or phone..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              showFilters ? "border-blue-200 bg-blue-50 text-blue-600" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}>
              <Filter className="h-4 w-4" /> Filters
            </button>
            {hasFilters && (
              <button onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                <X className="h-4 w-4" /> Clear
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-zinc-100">
              <div className="flex flex-wrap gap-3 p-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">Order Status</label>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">All Statuses</option>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">Payment Status</label>
                  <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">All Payments</option>
                    {Object.entries(paymentConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {ordersLoading ? (
          <div>
            <div className="border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-4">
                {["Order", "Customer", "Items", "Total", "Status", "Payment", "Date"].map((h) => (
                  <div key={h} className="h-3 w-16 animate-pulse rounded bg-zinc-200" />
                ))}
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Failed to load orders</h3>
            <p className="text-sm text-zinc-500">Something went wrong. Please try again.</p>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100">
              <Inbox className="h-10 w-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">No orders yet</h3>
            <p className="max-w-sm text-sm text-zinc-500">
              {hasFilters
                ? "No orders match your current filters. Try adjusting your search criteria."
                : "Orders will appear here once customers start purchasing from your store."}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                <X className="h-4 w-4" /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 md:grid md:grid-cols-[160px_1fr_80px_100px_110px_100px_130px_40px]">
              <span>Order</span>
              <span>Customer</span>
              <span className="text-center">Items</span>
              <span className="text-right">Total</span>
              <span>Status</span>
              <span>Payment</span>
              <span>Date</span>
              <span />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-zinc-100">
              {orders.map((order) => (
                <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="group cursor-pointer transition-colors hover:bg-blue-50/30 md:grid md:grid-cols-[160px_1fr_80px_100px_110px_100px_130px_40px] md:items-center md:px-6 md:py-3"
                  onClick={() => setDrawerOrder(order)}>
                  {/* Mobile Card */}
                  <div className="block p-4 md:hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-medium text-blue-600">{order.orderNumber}</span>
                        <p className="mt-0.5 text-sm font-medium text-zinc-900">{order.shippingAddress?.fullName}</p>
                      </div>
                      <span className="text-lg font-bold text-zinc-900">{fmt(order.total)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} config={statusConfig} />
                      <PaymentBadge status={order.paymentStatus} />
                      <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Desktop Cells */}
                  <span className="hidden font-mono text-sm font-medium text-blue-600 md:block">{order.orderNumber}</span>
                  <div className="hidden min-w-0 md:block">
                    <p className="truncate text-sm font-medium text-zinc-900">{order.shippingAddress?.fullName}</p>
                    <p className="truncate text-xs text-zinc-400">{order.customerId?.email ?? order.shippingAddress?.phone}</p>
                  </div>
                  <span className="hidden text-center text-sm text-zinc-600 md:block">{order.items?.length ?? 0}</span>
                  <span className="hidden text-right text-sm font-semibold text-zinc-900 md:block">{fmt(order.total)}</span>
                  <div className="hidden md:block"><StatusBadge status={order.status} config={statusConfig} /></div>
                  <div className="hidden md:block"><PaymentBadge status={order.paymentStatus} /></div>
                  <span className="hidden text-xs text-zinc-400 md:block">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <div className="hidden justify-center md:flex">
                    <button onClick={(e) => { e.stopPropagation(); setDrawerOrder(order); }} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
                <p className="text-sm text-zinc-500">
                  Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalOrders)} of {totalOrders}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="rounded-xl border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const num = start + i;
                    if (num > totalPages) return null;
                    return (
                      <button key={num} onClick={() => setPage(num)}
                        className={cn("min-w-[36px] rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                          num === page ? "border-blue-200 bg-blue-50 text-blue-600" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        )}>
                        {num}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="rounded-xl border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {drawerOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOrder(null)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Order Details</h3>
                  <p className="font-mono text-sm text-blue-600">{drawerOrder.orderNumber}</p>
                </div>
                <button onClick={() => setDrawerOrder(null)} className="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Status Management */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-900">Order Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, val]) => {
                      const isActive = drawerOrder.status === key;
                      const Icon = val.icon;
                      return (
                        <button key={key} onClick={() => handleStatusChange(drawerOrder._id, key)} disabled={updatingStatus}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                            isActive ? "border-2 shadow-sm scale-105" : "opacity-60 hover:opacity-100",
                            val.bg, val.text, isActive ? val.bg : "border-zinc-200 bg-white"
                          )}>
                          <Icon className="h-3.5 w-3.5" />
                          {val.label}
                          {isActive && <CheckCircle className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-900 pt-2">Payment Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(paymentConfig).map(([key, val]) => {
                      const isActive = drawerOrder.paymentStatus === key;
                      return (
                        <button key={key} onClick={() => handlePaymentChange(drawerOrder._id, key)} disabled={updatingPayment}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                            isActive ? "border-2 shadow-sm scale-105" : "opacity-60 hover:opacity-100",
                            val.bg, val.text, isActive ? val.bg : "border-zinc-200 bg-white"
                          )}>
                          {val.label}
                          {isActive && <CheckCircle className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" /> Customer
                  </h4>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                    <p className="text-sm font-medium text-zinc-900">{drawerOrder.shippingAddress?.fullName}</p>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Phone className="h-3.5 w-3.5" /> {drawerOrder.shippingAddress?.phone}
                    </div>
                    {drawerOrder.customerId?.email && (
                      <p className="text-sm text-zinc-500">{drawerOrder.customerId.email}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-400" /> Shipping Address
                  </h4>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-1 text-sm text-zinc-600">
                    <p>{drawerOrder.shippingAddress?.street}</p>
                    <p>{drawerOrder.shippingAddress?.city}{drawerOrder.shippingAddress?.state ? `, ${drawerOrder.shippingAddress.state}` : ""} {drawerOrder.shippingAddress?.zip}</p>
                    <p>{drawerOrder.shippingAddress?.country ?? "US"}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-zinc-400" /> Payment
                  </h4>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Method</span>
                      <span className="font-medium text-zinc-900">{paymentMethodLabels[drawerOrder.paymentMethod] ?? drawerOrder.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Payment Status</span>
                      <PaymentBadge status={drawerOrder.paymentStatus} />
                    </div>
                    {drawerOrder.deliveryZone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Delivery Zone</span>
                        <span className="font-medium text-zinc-900">{drawerOrder.deliveryZone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-zinc-400" /> Products ({drawerOrder.items?.length ?? 0})
                  </h4>
                  <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
                    {drawerOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg font-bold text-zinc-400">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400">Qty: {item.quantity} × {fmt(item.price)}</p>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">{fmt(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-zinc-900">{fmt(drawerOrder.subtotal)}</span>
                  </div>
                  {drawerOrder.deliveryCharge > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Delivery Charge</span>
                      <span className="font-medium text-zinc-900">{fmt(drawerOrder.deliveryCharge)}</span>
                    </div>
                  )}
                  {drawerOrder.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Discount</span>
                      <span className="font-medium text-emerald-600">-{fmt(drawerOrder.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">Total</span>
                    <span className="text-lg font-bold text-zinc-900">{fmt(drawerOrder.total)}</span>
                  </div>
                </div>

                {/* Notes */}
                {drawerOrder.notes && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" /> Notes
                    </h4>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                      {drawerOrder.notes}
                    </div>
                  </div>
                )}

                {/* Order timeline */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-400" /> Timeline
                  </h4>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <ShoppingCart className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">Order placed</p>
                        <p className="text-xs text-zinc-400">{new Date(drawerOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {drawerOrder.status !== "pending" && (
                      <div className="flex items-start gap-3">
                        <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          drawerOrder.status === "cancelled" ? "bg-red-100" : "bg-emerald-100"
                        )}>
                          {drawerOrder.status === "cancelled"
                            ? <Ban className="h-3 w-3 text-red-600" />
                            : <CheckCircle className="h-3 w-3 text-emerald-600" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{statusConfig[drawerOrder.status]?.label} {drawerOrder.updatedAt !== drawerOrder.createdAt ? "(updated)" : ""}</p>
                          <p className="text-xs text-zinc-400">{new Date(drawerOrder.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
