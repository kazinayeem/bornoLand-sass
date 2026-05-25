"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { Package, ArrowRight, Clock, DollarSign } from "lucide-react";
import { useGetOrdersQuery } from "@/redux/api/order-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-cyan-50 text-cyan-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, restored } = useSelector((s: RootState) => s.customer);

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=/orders");
    }
  }, [restored, isAuthenticated, router]);

  if (!restored || !isAuthenticated) return null;

  return <OrdersList />;
}

function OrdersList() {
  const router = useRouter();
  const { data, isLoading } = useGetOrdersQuery();
  const { settings } = useTenant();
  const orders = data?.data?.orders ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <Package className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-zinc-900">No orders yet</h2>
        <p className="text-sm text-zinc-500">When you place an order, it will appear here.</p>
        <Link href="/" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            key={order._id}
            onClick={() => router.push(`/orders/${order._id}`)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-100 p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50">
                <Package className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{order.orderNumber}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
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
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-medium capitalize ${statusStyles[order.status] ?? "bg-zinc-50 text-zinc-600"}`}>
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
