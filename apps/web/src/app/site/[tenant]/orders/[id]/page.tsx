"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ShoppingBag, ChevronLeft, Clock, DollarSign, MapPin, CreditCard, CheckCircle, Download, Eye, Share2, Printer } from "lucide-react";
import { useGetOrderQuery } from "@/redux/api/order-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useRequireCustomerAuth } from "@/hooks/use-require-customer-auth";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { ORDER_STATUS_LABELS } from "@/lib/orders/timeline";
import {
  downloadCustomerOrderInvoice,
  printCustomerOrderInvoice,
  shareCustomerOrderInvoice,
  viewCustomerOrderInvoice,
} from "@/lib/order-invoice";
import { toast } from "sonner";
import { useState } from "react";

const statusLabels = ORDER_STATUS_LABELS;

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
  const orderId = params.id as string;
  const { showLoader } = useRequireCustomerAuth(`/orders/${orderId}`);

  if (showLoader) return <CustomerAuthLoader />;

  return <OrderDetail orderId={orderId} />;
}

function OrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useGetOrderQuery(orderId);
  const { settings } = useTenant();
  const order = data?.data?.order;
  const [invoiceBusy, setInvoiceBusy] = useState(false);

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

  if (isLoading) {
    return <CustomerAuthLoader message="Loading order…" />;
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <Package className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-apple-ink">Order not found</h2>
        <p className="text-sm text-apple-ink-muted-48">This order doesn&apos;t exist or you don&apos;t have access.</p>
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

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-apple-ink">{order.orderNumber}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-apple-ink-muted-48">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(order.total, settings)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className={`rounded-full px-4 py-1 text-sm font-medium capitalize ${statusStyles[order.status] ?? "bg-apple-canvas-parchment text-apple-ink-muted-80"}`}>
            {order.status === "delivered" && <CheckCircle className="mr-1 inline h-4 w-4" />}
            {statusLabels[order.status] ?? order.status}
          </span>
          {order.status !== "cancelled" ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() => runInvoice(() => viewCustomerOrderInvoice(order._id))}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
              >
                <Eye className="h-3.5 w-3.5" /> View Invoice
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() =>
                  runInvoice(() => downloadCustomerOrderInvoice(order._id, order.orderNumber), "Invoice downloaded")
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() => runInvoice(() => printCustomerOrderInvoice(order._id))}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() =>
                  runInvoice(() => shareCustomerOrderInvoice(order._id, order.orderNumber), "Invoice shared")
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-medium text-white"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-100 p-5">
          <h2 className="mb-4 font-semibold text-apple-ink">Order timeline</h2>
          <OrderTimeline
            status={order.status}
            paymentStatus={order.paymentStatus}
            timeline={order.timeline}
          />
          {(order.courier || order.trackingNumber || order.estimatedDelivery) ? (
            <div className="mt-4 grid gap-2 rounded-xl bg-apple-canvas-parchment p-3 text-sm text-apple-ink-muted-80 sm:grid-cols-3">
              <p>Courier: <span className="font-medium text-apple-ink">{order.courier || "—"}</span></p>
              <p>Tracking: <span className="font-medium text-apple-ink">{order.trackingNumber || "—"}</span></p>
              <p>ETA: <span className="font-medium text-apple-ink">{order.estimatedDelivery || "—"}</span></p>
            </div>
          ) : null}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-100 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-apple-ink">
            <ShoppingBag className="h-5 w-5" /> Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-apple-canvas-parchment">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-apple-ink">{item.name}</p>
                  {item.variantTitle && <p className="text-xs text-apple-ink-muted-48">{item.variantTitle}</p>}
                  <p className="text-xs text-apple-ink-muted-48">Qty: {item.quantity} × {formatCurrency(item.price, settings)}</p>
                </div>
                <span className="text-sm font-semibold text-apple-ink">{formatCurrency(item.price * item.quantity, settings)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-apple-ink">
              <MapPin className="h-5 w-5" /> Shipping Address
            </h2>
            <div className="text-sm text-apple-ink-muted-80">
              <p className="font-medium text-apple-ink">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{order.shippingAddress.zip ? ` ${order.shippingAddress.zip}` : ""}</p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-apple-ink">
              <CreditCard className="h-5 w-5" /> Payment
            </h2>
            <p className="text-sm capitalize text-apple-ink-muted-80">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-apple-ink-muted-48">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, settings)}</span>
              </div>
              <div className="flex justify-between text-apple-ink-muted-48">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping, settings)}</span>
              </div>
              <div className="flex justify-between font-semibold text-apple-ink">
                <span>Total</span>
                <span>{formatCurrency(order.total, settings)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {order.notes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-zinc-100 p-5">
            <h2 className="mb-2 font-semibold text-apple-ink">Order Notes</h2>
            <p className="text-sm text-apple-ink-muted-80">{order.notes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
