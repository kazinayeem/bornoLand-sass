"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { ArrowRight, FileText, Package, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { formatCurrency } from "@/lib/format-currency";
import { downloadCustomerOrderInvoice } from "@/lib/order-invoice";

import { useGetOrdersQuery } from "@/redux/api/order-api";
import { addToCart } from "@/redux/slices/cart-slice";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import { ORDER_STATUS_LABELS } from "@/lib/orders/timeline";
import { resolveStoreHref } from "@/lib/store-href";

type FilterKey = "all" | "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function matchesFilter(order: any, filter: FilterKey) {
  const status = String(order.status ?? "").toLowerCase();
  const paymentStatus = String(order.paymentStatus ?? "").toLowerCase();

  if (filter === "all") return true;
  if (filter === "pending") return status === "pending";
  if (filter === "paid") return paymentStatus === "paid";
  if (filter === "processing") return ["processing", "packed"].includes(status);
  if (filter === "shipped") return ["shipped", "out_for_delivery"].includes(status);
  if (filter === "delivered") return status === "delivered";
  if (filter === "cancelled") return status === "cancelled" || ["refunded", "partial_refund"].includes(status);
  return true;
}

export default function OrdersAccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const { settings } = useTenant();

  const [filter, setFilter] = useState<FilterKey>("all");
  const { data, isLoading, isFetching } = useGetOrdersQuery();
  const orders = data?.data?.orders ?? [];
  const filtered = useMemo(() => orders.filter((o) => matchesFilter(o, filter)), [orders, filter]);

  const buyAgain = (order: any) => {
    for (const item of order.items ?? []) {
      dispatch(
        addToCart({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1,
        } as any),
      );
    }
    toast.success("Added to cart");
    router.push(resolveStoreHref("/cart", pathname));
  };

  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              Download invoices, track shipments, and buy again.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-apple-pill border px-3 py-2 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "border-apple-primary bg-apple-canvas-parchment text-apple-ink"
                    : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-apple-lg bg-apple-canvas-parchment" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Package className="h-12 w-12 text-zinc-300" />
            <h2 className="text-lg font-semibold">No orders found</h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {filter === "all" ? "When you place an order, it will appear here." : "Try a different filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order: any, idx: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-apple-lg border p-4"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <span
                        className="rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: "#E5E7EB", color: "#111111" }}
                      >
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                      {new Date(order.createdAt).toLocaleDateString()} · Total {formatCurrency(order.total, settings)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> View Details
                    </Link>

                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
                      onClick={() => void downloadCustomerOrderInvoice(order._id, order.orderNumber)}
                    >
                      <FileText className="h-3.5 w-3.5" /> Download Invoice
                    </button>

                    <Link
                      href="/order-tracking"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-apple-ink"
                    >
                      <Truck className="h-3.5 w-3.5" /> Track Order
                    </Link>

                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-medium text-white"
                      style={{ backgroundColor: "#111111" }}
                      onClick={() => void buyAgain(order)}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Buy Again
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {isFetching && !isLoading ? <p className="text-xs" style={{ color: "#6B7280" }}>Updating…</p> : null}
      </div>
    </CustomerAccountShell>
  );
}
