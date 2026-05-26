"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreOrdersQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation,
} from "@/redux/api/store-order-api";
import type { StoreOrder } from "@/redux/api/store-order-api";
import {
  ShoppingCart, Loader2, Search, ChevronDown, Package,
  Truck, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";

type OrdersTabProps = { storeId: string };

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-red-50 text-red-700",
  partial: "bg-blue-50 text-blue-700",
};

function formatBDT(v: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v || 0);
}

export function OrdersTab({ storeId }: OrdersTabProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetStoreOrdersQuery({
    storeId, status: statusFilter || undefined, page: String(page), limit: "20", search: search || undefined,
  });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatePayment] = useUpdatePaymentStatusMutation();

  const orders = data?.data?.orders ?? [];
  const analytics = data?.data?.analytics;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus({ storeId, orderId, status }).unwrap();
      toast.success(`Order ${status}`);
    } catch { toast.error("Failed to update status"); }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: string) => {
    try {
      await updatePayment({ storeId, orderId, paymentStatus }).unwrap();
      toast.success(`Payment ${paymentStatus}`);
    } catch { toast.error("Failed to update payment status"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "Total Orders", value: String(analytics.totalOrders), color: "text-zinc-900" },
            { label: "Revenue", value: formatBDT(analytics.totalRevenue), color: "text-emerald-600" },
            { label: "Pending", value: String(analytics.pendingOrders), color: "text-amber-600" },
            { label: "Processing", value: String(analytics.processingOrders), color: "text-blue-600" },
            { label: "Delivered", value: String(analytics.deliveredOrders), color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{s.label}</p>
              <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search orders..."
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">No orders yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Orders will appear here when customers start purchasing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900">{order.orderNumber}</h4>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {order.status}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${paymentColors[order.paymentStatus] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {order.customerId?.name || "Guest"} &middot; {order.items?.length || 0} items &middot; {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 truncate">
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-zinc-900">{formatBDT(order.total)}</p>
                  <p className="text-[10px] text-zinc-400">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-zinc-100">
                <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select value={order.paymentStatus} onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                  className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
