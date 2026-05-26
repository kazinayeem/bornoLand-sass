"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreOrdersQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation,
} from "@/redux/api/store-order-api";
import type { StoreOrder } from "@/redux/api/store-order-api";
import {
  ShoppingCart, ChevronDown, Package, Truck, CheckCircle, XCircle, Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";

type OrdersTabProps = { storeId: string };

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentOptions = ["unpaid", "paid", "refunded", "partial"];

function formatBDT(v: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(v || 0);
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

const statusBadgeVariant: Record<string, "warning" | "primary" | "violet" | "success" | "danger"> = {
  pending: "warning", processing: "primary", shipped: "violet", delivered: "success", cancelled: "danger",
};

const paymentBadgeVariant: Record<string, "warning" | "success" | "danger" | "primary"> = {
  unpaid: "warning", paid: "success", refunded: "danger", partial: "primary",
};

export function OrdersTab({ storeId }: OrdersTabProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  const { data, isLoading } = useGetStoreOrdersQuery({
    storeId, status: statusFilter || undefined, page: String(page), limit: String(pageSize), search: search || undefined,
  });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatePayment] = useUpdatePaymentStatusMutation();

  const orders = data?.data?.orders ?? [];
  const analytics = data?.data?.analytics;
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total;

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

  const columns: Column<StoreOrder>[] = [
    {
      key: "order", label: "Order",
      render: (order) => (
        <div>
          <p className="text-sm font-semibold text-zinc-900">{order.orderNumber}</p>
          <p className="text-xs text-zinc-400">{formatDate(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer", label: "Customer", hideOnMobile: true,
      render: (order) => (
        <div className="text-sm">
          <p className="text-zinc-900">{order.customerId?.name || "Guest"}</p>
          <p className="text-xs text-zinc-400">{order.shippingAddress?.city || "—"}</p>
        </div>
      ),
    },
    {
      key: "items", label: "Items", hideOnTablet: true,
      render: (order) => <span className="text-sm text-zinc-600">{order.items?.length || 0} items</span>,
    },
    {
      key: "total", label: "Total", sortable: true,
      render: (order) => <span className="text-sm font-bold text-zinc-900">{formatBDT(order.total)}</span>,
    },
    {
      key: "status", label: "Status",
      render: (order) => (
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order._id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium outline-none"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      ),
    },
    {
      key: "payment", label: "Payment",
      render: (order) => (
        <select
          value={order.paymentStatus}
          onChange={(e) => handlePaymentChange(order._id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium outline-none"
        >
          {paymentOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Analytics */}
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
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-blue-400">
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        keyExtractor={(o) => o._id}
        isLoading={isLoading}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders yet"
        emptyDescription="Orders will appear here when customers start purchasing."
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={setSelectedOrder}
        hideSearch
        hidePagination
      />

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={pageSize} onPageSizeChange={setPageSize} />
      )}

      {/* Order Detail Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-500">Status</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900 capitalize">{selectedOrder.status}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-500">Payment</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900 capitalize">{selectedOrder.paymentStatus}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-500">Total</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">{formatBDT(selectedOrder.total)}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-500">Date</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity} × {formatBDT(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">{formatBDT(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 mb-2">Shipping</h4>
                <div className="rounded-xl border border-zinc-100 p-3 text-sm text-zinc-600">
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <select value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none">
                {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={selectedOrder.paymentStatus} onChange={(e) => handlePaymentChange(selectedOrder._id, e.target.value)}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none">
                {paymentOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
