"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGetAdminOrdersQuery, useGetAdminStoresQuery } from "@/redux/api/admin-api";
import { Search, Store, ShoppingCart, Filter, Loader2, ChevronDown, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/status-badge";

const orderStatuses = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["all", "pending", "paid", "failed"];

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-purple-100 text-purple-700",
};

const paymentColors: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "10" };
  if (storeFilter !== "all") params.storeId = storeFilter;
  if (statusFilter !== "all") params.status = statusFilter;
  if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;
  if (fromDate) params.from = fromDate;
  if (toDate) params.to = toDate;

  const { data, isLoading } = useGetAdminOrdersQuery(params);
  const { data: storesData } = useGetAdminStoresQuery();

  const orders = data?.data?.orders ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;
  const stores = storesData?.data?.stores ?? [];

  const searchLower = search.toLowerCase();
  const filtered = orders.filter((o) => {
    if (!search) return true;
    const orderNum = o.orderNumber?.toLowerCase() ?? "";
    const customerName = o.customerId?.name?.toLowerCase() ?? "";
    return orderNum.includes(searchLower) || customerName.includes(searchLower);
  });

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Orders</h2>
        <p className="mt-1 text-sm text-zinc-500">{total} orders on the platform</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order # or customer..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>

        <div className="relative">
          <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <select value={storeFilter} onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
            className="h-10 w-44 rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-600 appearance-none cursor-pointer focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All Stores</option>
            {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 w-40 rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-600 appearance-none cursor-pointer focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All Status</option>
            {orderStatuses.slice(1).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Payment</option>
          {paymentStatuses.slice(1).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />

        <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />

        {(fromDate || toDate || storeFilter !== "all" || statusFilter !== "all" || paymentStatusFilter !== "all" || search) && (
          <button onClick={() => { setSearch(""); setStoreFilter("all"); setStatusFilter("all"); setPaymentStatusFilter("all"); setFromDate(""); setToDate(""); setPage(1); }}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((order) => (
                <tr key={order._id} className="group transition-colors hover:bg-zinc-50">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-zinc-900">#{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-700">
                      <Store className="h-3.5 w-3.5 text-zinc-400" />
                      {order.storeId?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-zinc-700">{order.customerId?.name ?? "—"}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                      <ShoppingCart className="h-3.5 w-3.5 text-zinc-400" />
                      {order.items?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">{formatCurrency(order.total ?? 0)}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${paymentColors[order.paymentStatus] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3.5">
                    <button className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-zinc-500">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
          <p className="text-sm text-zinc-500">
            {total > 0
              ? `Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}`
              : "No results"}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
