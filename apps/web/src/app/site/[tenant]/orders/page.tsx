"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, ArrowRight, Clock, DollarSign, Download, FileText } from "lucide-react";
import { useGetOrdersQuery } from "@/redux/api/order-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useRequireCustomerAuth } from "@/hooks/use-require-customer-auth";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { downloadCustomerOrderInvoice, viewCustomerOrderInvoice } from "@/lib/order-invoice";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-cyan-50 text-cyan-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersPage() {
  const { showLoader } = useRequireCustomerAuth("/orders");

  if (showLoader) return <CustomerAuthLoader />;

  return <OrdersList />;
}

function OrdersList() {
  const router = useRouter();
  const { data, isLoading } = useGetOrdersQuery();
  const { settings } = useTenant();
  const orders = data?.data?.orders ?? [];

  if (isLoading) {
    return <CustomerAuthLoader message="Loading orders…" />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <Package className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-apple-ink">No orders yet</h2>
        <p className="text-sm text-apple-ink-muted-48">When you place an order, it will appear here.</p>
        <Link href="/" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-apple-ink">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            key={order._id}
            onClick={() => router.push(`/orders/${order._id}`)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-100 p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                <Package className="h-6 w-6 text-apple-ink-muted-48" />
              </div>
              <div>
                <p className="font-semibold text-apple-ink">{order.orderNumber}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-apple-ink-muted-48">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(order.total, settings)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {order.status !== "cancelled" ? (
                <>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-medium text-apple-ink"
                    onClick={async () => {
                      try {
                        await viewCustomerOrderInvoice(order._id);
                      } catch {
                        toast.error("Could not open invoice");
                      }
                    }}
                  >
                    <FileText className="h-3 w-3" /> View
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-medium text-apple-ink"
                    onClick={async () => {
                      try {
                        await downloadCustomerOrderInvoice(order._id, order.orderNumber);
                        toast.success("Invoice downloaded");
                      } catch {
                        toast.error("Could not download invoice");
                      }
                    }}
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </>
              ) : null}
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${statusStyles[order.status] ?? "bg-apple-canvas-parchment text-apple-ink-muted-80"}`}>
                {order.status}
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
