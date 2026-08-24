"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  ShoppingBag,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Filter,
  Calendar,
  Lock,
  Sparkles,
  Search,
  Eye,
  SlidersHorizontal,
  X,
  CreditCard,
  Package,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import {
  useGetStoreIncompleteCheckoutsQuery,
  useGetStoreIncompleteCheckoutDetailQuery,
  useGenerateRecoveryLinkMutation,
  type IncompleteCheckout,
  type IncompleteCheckoutItem,
} from "@/redux/api/incomplete-checkout-api";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type IncompleteOrdersTabProps = {
  storeId: string;
  storeSlug?: string;
};

type DatePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";

const DATE_PRESETS: Array<{ id: DatePreset; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  in_progress: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "In Progress",
  },
  abandoned: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    label: "Abandoned",
  },
  recovered: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    label: "Recovered",
  },
  converted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Converted",
  },
  expired: {
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    border: "border-zinc-200",
    label: "Expired",
  },
};

function formatRelativeTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatFullDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function rangeForPreset(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (preset === "today") return { from: to, to };
  if (preset === "yesterday") {
    const y = new Date(now.getTime() - 86400000);
    const yStr = y.toISOString().slice(0, 10);
    return { from: yStr, to: yStr };
  }
  if (preset === "7d") {
    const f = new Date(now.getTime() - 7 * 86400000);
    return { from: f.toISOString().slice(0, 10), to };
  }
  if (preset === "30d") {
    const f = new Date(now.getTime() - 30 * 86400000);
    return { from: f.toISOString().slice(0, 10), to };
  }
  if (preset === "month") {
    const f = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: f.toISOString().slice(0, 10), to };
  }
  return { from: "", to: "" };
}

export function IncompleteOrdersTab({ storeId, storeSlug }: IncompleteOrdersTabProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCheckoutId, setSelectedCheckoutId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Settings & Currency
  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const settings = settingsData?.data?.settings;
  const money = useCallback((v: number) => formatCurrency(v || 0, settings), [settings]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
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

  // Checkouts query
  const {
    data: checkoutsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetStoreIncompleteCheckoutsQuery({
    storeId,
    page,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const [generateRecovery, { isLoading: isGeneratingLink }] = useGenerateRecoveryLinkMutation();

  const entitlement = checkoutsData?.entitlement;
  const isLocked = entitlement && entitlement.allowed === false;
  const stats = checkoutsData?.data?.stats;
  const checkouts = checkoutsData?.data?.checkouts ?? [];
  const pagination = checkoutsData?.data?.pagination;

  const handleCopyRecoveryLink = async (checkout: IncompleteCheckout) => {
    try {
      const res = await generateRecovery(checkout._id ? { storeId, checkoutId: checkout._id } : { storeId, checkoutId: "" }).unwrap();
      if (res.data?.recoveryUrl) {
        await navigator.clipboard.writeText(res.data.recoveryUrl);
        setCopiedToken(checkout._id);
        toast.success("Recovery link copied to clipboard!");
        setTimeout(() => setCopiedToken(null), 2500);
      }
    } catch {
      toast.error("Failed to generate recovery link");
    }
  };

  // Locked plan state
  if (isLocked) {
    const requiredPlanName = entitlement.requiredPlan?.name || "Starter";
    return (
      <div className="rounded-2xl border border-apple-hairline bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-apple-ink">Incomplete Orders & Abandoned Checkout</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-apple-ink-muted-48">
          Save and track checkout attempts when customers enter their details but leave without placing an order. Send secure recovery links and convert lost potential revenue.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                Available on {requiredPlanName} Plan and above
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Upgrade your subscription to unlock automatic progressive checkout autosave, abandoned customer listings, and recovery link generation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={storeSlug ? `/store/${storeSlug}/billing` : "/dashboard/billing"}
            className="inline-flex items-center gap-2 rounded-xl bg-apple-primary px-6 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
          >
            Upgrade Plan to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-apple-ink">Incomplete Orders</h1>
            <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
              Abandoned Checkouts
            </span>
          </div>
          <p className="mt-0.5 text-xs text-apple-ink-muted-48">
            Customers who entered checkout information but did not complete their order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-apple-hairline bg-white px-3 text-xs font-medium text-apple-ink hover:bg-zinc-50 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-apple-hairline bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-apple-ink-muted-48">
            <span className="text-[11px] font-medium uppercase tracking-wider">Incomplete</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-apple-ink">
            {stats?.totalIncomplete ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-apple-ink-muted-48">
            {stats?.abandonedCount ?? 0} abandoned, {stats?.inProgressCount ?? 0} in progress
          </p>
        </div>

        <div className="rounded-xl border border-apple-hairline bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-apple-ink-muted-48">
            <span className="text-[11px] font-medium uppercase tracking-wider">Potential Value</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {money(stats?.incompleteValue ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-apple-ink-muted-48">Unconverted cart total</p>
        </div>

        <div className="rounded-xl border border-apple-hairline bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-apple-ink-muted-48">
            <span className="text-[11px] font-medium uppercase tracking-wider">Recovered</span>
            <CheckCircle2 className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">
            {stats?.recoveredCount ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-apple-ink-muted-48">Returned to checkout</p>
        </div>

        <div className="rounded-xl border border-apple-hairline bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-apple-ink-muted-48">
            <span className="text-[11px] font-medium uppercase tracking-wider">Converted</span>
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {stats?.convertedCount ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-apple-ink-muted-48">Completed orders</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-apple-hairline bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-apple-ink-muted-48">
            <span className="text-[11px] font-medium uppercase tracking-wider">Recovery Rate</span>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">
            {stats?.recoveryRate ?? 0}%
          </p>
          <p className="mt-1 text-[11px] text-apple-ink-muted-48">
            {stats?.conversionRate ?? 0}% overall conversion
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-apple-hairline bg-white p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customer, phone, email, item..."
              className="h-8 w-full rounded-lg border border-apple-hairline bg-apple-canvas-parchment pl-8 pr-3 text-xs outline-none transition-colors focus:border-apple-primary focus:bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-apple-ink-muted-48 hover:text-apple-ink"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "abandoned", label: "Abandoned" },
              { id: "in_progress", label: "In Progress" },
              { id: "recovered", label: "Recovered" },
              { id: "converted", label: "Converted" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                  statusFilter === st.id
                    ? "bg-apple-ink text-white"
                    : "bg-apple-canvas-parchment text-apple-ink-muted-48 hover:text-apple-ink"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Date Presets */}
          <div className="flex flex-wrap items-center gap-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                  datePreset === p.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-apple-ink-muted-48 hover:text-apple-ink"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range expander */}
        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-3 border-t border-apple-hairline pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-apple-ink-muted-48">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset("custom");
                  setPage(1);
                }}
                className="h-7 rounded-md border border-apple-hairline bg-white px-2 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-apple-ink-muted-48">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset("custom");
                  setPage(1);
                }}
                className="h-7 rounded-md border border-apple-hairline bg-white px-2 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setDatePreset("all");
                setShowAdvanced(false);
              }}
              className="text-xs text-apple-primary hover:underline font-medium"
            >
              Reset Date Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-apple-hairline bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-apple-hairline bg-apple-canvas-parchment/60 text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Potential Total</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-hairline">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-apple-ink-muted-48">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-apple-primary" />
                      Loading incomplete orders...
                    </div>
                  </td>
                </tr>
              ) : checkouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-apple-ink-muted-48">
                    <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300 mb-2" />
                    <p className="text-sm font-semibold text-apple-ink">No incomplete orders found</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {search || statusFilter !== "all" || fromDate
                        ? "Try clearing filters to view all records."
                        : "When customers start checking out and leave, their attempts will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                checkouts.map((chk) => {
                  const badge = STATUS_BADGE_STYLES[chk.status] || STATUS_BADGE_STYLES.abandoned;
                  const totalItems = (chk.items || []).reduce((s, i) => s + (i.quantity || 1), 0);

                  return (
                    <tr key={chk._id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Customer */}
                      <td className="px-4 py-3 font-medium text-apple-ink">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-apple-canvas-parchment text-[11px] font-bold text-apple-ink">
                            {(chk.customerName || chk.phone || "G").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{chk.customerName || "Anonymous Guest"}</p>
                            {chk.city && (
                              <p className="text-[10px] text-apple-ink-muted-48 flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" /> {chk.city}{chk.area ? `, ${chk.area}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        {chk.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-apple-ink">
                            <span>{chk.phone}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(chk.phone || "");
                                toast.success("Phone copied");
                              }}
                              className="text-zinc-400 hover:text-apple-ink p-0.5 rounded"
                              title="Copy phone"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                        {chk.email && (
                          <p className="text-[10px] text-apple-ink-muted-48 truncate max-w-[140px]">
                            {chk.email}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-apple-ink">{totalItems}</span>{" "}
                        <span className="text-apple-ink-muted-48">
                          {totalItems === 1 ? "item" : "items"}
                        </span>
                        {chk.items?.[0] && (
                          <p className="text-[10px] text-apple-ink-muted-48 truncate max-w-[160px]">
                            {chk.items[0].name}
                            {chk.items.length > 1 && ` +${chk.items.length - 1} more`}
                          </p>
                        )}
                      </td>

                      {/* Potential Total */}
                      <td className="px-4 py-3 font-bold text-apple-ink font-mono">
                        {money(chk.total || chk.subtotal || 0)}
                      </td>

                      {/* Started */}
                      <td className="px-4 py-3 text-apple-ink-muted-48 text-[11px] whitespace-nowrap">
                        {formatFullDateTime(chk.startedAt || chk.createdAt)}
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3 text-apple-ink text-[11px] whitespace-nowrap font-medium">
                        {formatRelativeTime(chk.lastActivityAt || chk.updatedAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border",
                            badge.bg,
                            badge.text,
                            badge.border
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {chk.status !== "converted" && (
                            <button
                              type="button"
                              onClick={() => handleCopyRecoveryLink(chk)}
                              disabled={isGeneratingLink}
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-apple-hairline bg-white px-2 text-[11px] font-medium text-apple-ink hover:bg-zinc-50"
                              title="Copy Recovery Link"
                            >
                              {copiedToken === chk._id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Share2 className="h-3 w-3 text-apple-ink-muted-48" />
                                  <span>Recovery Link</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedCheckoutId(chk._id)}
                            className="inline-flex h-7 items-center gap-1 rounded-md bg-apple-primary px-2.5 text-[11px] font-semibold text-white hover:opacity-90 shadow-2xs"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-apple-hairline px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-apple-ink-muted-48">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.total)} of {pagination.total} checkouts
            </span>
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
              total={pagination.total}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Incomplete Checkout Details Modal */}
      {selectedCheckoutId && (
        <IncompleteCheckoutDetailModal
          storeId={storeId}
          storeSlug={storeSlug}
          checkoutId={selectedCheckoutId}
          onClose={() => setSelectedCheckoutId(null)}
          money={money}
        />
      )}
    </div>
  );
}

/**
 * Detailed drawer/modal for inspecting an incomplete checkout attempt.
 */
function IncompleteCheckoutDetailModal({
  storeId,
  storeSlug,
  checkoutId,
  onClose,
  money,
}: {
  storeId: string;
  storeSlug?: string;
  checkoutId: string;
  onClose: () => void;
  money: (val: number) => string;
}) {
  const { data, isLoading } = useGetStoreIncompleteCheckoutDetailQuery({
    storeId,
    checkoutId,
  });

  const [generateRecovery, { isLoading: isGenerating }] = useGenerateRecoveryLinkMutation();
  const [copied, setCopied] = useState(false);

  const checkout = data?.data?.checkout;

  const handleCopyLink = async () => {
    if (!checkout?._id) return;
    try {
      const res = await generateRecovery({ storeId, checkoutId: checkout._id }).unwrap();
      if (res.data?.recoveryUrl) {
        await navigator.clipboard.writeText(res.data.recoveryUrl);
        setCopied(true);
        toast.success("Recovery link copied!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy recovery link");
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Incomplete Checkout Details"
      size="xl"
    >
      {isLoading || !checkout ? (
        <div className="py-12 text-center text-apple-ink-muted-48">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-apple-primary mb-2" />
          <p className="text-xs">Loading checkout details...</p>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Top Status & Converted Notice */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-apple-hairline bg-apple-canvas-parchment/60 p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-apple-ink-muted-48">Status:</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border",
                  STATUS_BADGE_STYLES[checkout.status]?.bg || "bg-zinc-100",
                  STATUS_BADGE_STYLES[checkout.status]?.text || "text-zinc-700",
                  STATUS_BADGE_STYLES[checkout.status]?.border || "border-zinc-200"
                )}
              >
                {STATUS_BADGE_STYLES[checkout.status]?.label || checkout.status}
              </span>
            </div>

            <div className="text-[11px] text-apple-ink-muted-48 font-mono">
              Session ID: {checkout.sessionId?.slice(0, 18)}...
            </div>
          </div>

          {/* Converted Order Banner */}
          {checkout.convertedOrderId && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Converted to Order <strong>#{(checkout.convertedOrderId as any).orderNumber}</strong> ({money((checkout.convertedOrderId as any).total)})
                </span>
              </div>
              <Link
                href={storeSlug ? `/store/${storeSlug}/orders` : "/dashboard/orders"}
                className="font-bold underline hover:text-emerald-950 inline-flex items-center gap-1"
              >
                View Orders <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Recovery Action Card */}
          {checkout.status !== "converted" && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-sky-700" />
                    Customer Recovery Link
                  </h4>
                  <p className="text-[11px] text-sky-800">
                    Send this link to the customer via WhatsApp, SMS, or email to restore their cart and pre-filled checkout details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={isGenerating}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Customer & Address Information */}
          <div className="rounded-xl border border-apple-hairline bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48 mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-apple-ink" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-apple-ink-muted-48">Full Name:</span>
                <p className="font-semibold text-apple-ink">{checkout.customerName || "Not provided"}</p>
              </div>
              <div>
                <span className="text-apple-ink-muted-48">Phone Number:</span>
                <p className="font-semibold text-apple-ink font-mono">{checkout.phone || "Not provided"}</p>
              </div>
              <div>
                <span className="text-apple-ink-muted-48">Email Address:</span>
                <p className="font-semibold text-apple-ink">{checkout.email || "Not provided"}</p>
              </div>
              <div>
                <span className="text-apple-ink-muted-48">Delivery Location:</span>
                <p className="font-semibold text-apple-ink">
                  {[checkout.street, checkout.apartment, checkout.area, checkout.city, checkout.country]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </p>
              </div>
              {checkout.notes && (
                <div className="sm:col-span-2">
                  <span className="text-apple-ink-muted-48">Customer Notes:</span>
                  <p className="text-apple-ink italic bg-zinc-50 p-2 rounded-md mt-1">{checkout.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items Snapshot with Live Status Check */}
          <div className="rounded-xl border border-apple-hairline bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48 mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-apple-ink" />
              Cart Items Snapshot
            </h4>
            <div className="divide-y divide-apple-hairline">
              {checkout.items?.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="h-9 w-9 rounded-lg object-cover shrink-0 border border-apple-hairline" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-apple-ink truncate">{it.name}</p>
                      {it.variantTitle && (
                        <p className="text-[10px] text-apple-ink-muted-48">Variant: {it.variantTitle}</p>
                      )}
                      {it.liveStatus && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                          {it.liveStatus.exists && it.liveStatus.active ? (
                            it.liveStatus.inStock ? (
                              <span className="text-emerald-700 font-medium">In Stock ({it.liveStatus.availableStock})</span>
                            ) : (
                              <span className="text-rose-700 font-medium">Out of Stock</span>
                            )
                          ) : (
                            <span className="text-zinc-500">Product Inactive</span>
                          )}
                          {it.liveStatus.priceChanged && (
                            <span className="text-amber-700 font-medium">(Price changed to {money(it.liveStatus.currentPrice)})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-apple-ink font-mono">{money(it.price * it.quantity)}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">{it.quantity} × {money(it.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-apple-hairline pt-3 mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-apple-ink-muted-48">
                <span>Subtotal</span>
                <span>{money(checkout.subtotal || 0)}</span>
              </div>
              {checkout.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {checkout.couponCode ? `(${checkout.couponCode})` : ""}</span>
                  <span>-{money(checkout.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-apple-ink-muted-48">
                <span>Delivery Charge {checkout.deliveryZoneName ? `(${checkout.deliveryZoneName})` : ""}</span>
                <span>{money(checkout.shippingFee || 0)}</span>
              </div>
              <div className="flex justify-between text-apple-ink-muted-48">
                <span>Payment Method</span>
                <span className="uppercase font-semibold text-apple-ink">{checkout.paymentMethod || "COD"}</span>
              </div>
              <div className="border-t border-apple-hairline pt-2 flex justify-between text-sm font-bold text-apple-ink">
                <span>Estimated Potential Total</span>
                <span className="font-mono text-apple-primary">{money(checkout.total || checkout.subtotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {checkout.timeline && checkout.timeline.length > 0 && (
            <div className="rounded-xl border border-apple-hairline bg-white p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48 mb-3 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-apple-ink" />
                Activity Timeline
              </h4>
              <div className="space-y-3">
                {checkout.timeline.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-1 h-2 w-2 rounded-full bg-apple-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-apple-ink font-medium">{evt.note || evt.status}</p>
                      <p className="text-[10px] text-apple-ink-muted-48">{formatFullDateTime(evt.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
