"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { motion } from "framer-motion";
import { Package, ShoppingBag, ChevronLeft, Clock, DollarSign, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { useGetOrderQuery } from "@/redux/api/order-api";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-cyan-50 text-cyan-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated, restored } = useSelector((s: RootState) => s.customer);

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=" + encodeURIComponent(`/orders/${orderId}`));
    }
  }, [restored, isAuthenticated, router, orderId]);

  if (!restored || !isAuthenticated) return null;

  return <OrderDetail orderId={orderId} />;
}

function OrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useGetOrderQuery(orderId);
  const order = data?.data?.order;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <Package className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-zinc-900">Order not found</h2>
        <p className="text-sm text-zinc-500">This order doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/orders" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders" className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "#71717a" }}>
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{order.orderNumber}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
        <span className={`rounded-full px-4 py-1 text-sm font-medium capitalize ${statusStyles[order.status] ?? "bg-zinc-50 text-zinc-600"}`}>
          {order.status === "delivered" && <CheckCircle className="mr-1 inline h-4 w-4" />}
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-100 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900">
            <ShoppingBag className="h-5 w-5" /> Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <span className="text-sm font-semibold text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
              <MapPin className="h-5 w-5" /> Shipping Address
            </h2>
            <div className="text-sm text-zinc-600">
              <p className="font-medium text-zinc-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{order.shippingAddress.zip ? ` ${order.shippingAddress.zip}` : ""}</p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
              <CreditCard className="h-5 w-5" /> Payment
            </h2>
            <p className="text-sm capitalize text-zinc-600">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-zinc-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {order.notes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-2 font-semibold text-zinc-900">Order Notes</h2>
            <p className="text-sm text-zinc-600">{order.notes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
