"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Loader2, MapPin, Truck } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { getApiUrl } from "@/lib/urls";
import { formatCurrency } from "@/lib/format-currency";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { ORDER_STATUS_LABELS } from "@/lib/orders/timeline";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontButton,
  StorefrontCard,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

type TrackedOrder = {
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  deliveryCharge?: number;
  deliveryZone?: string;
  total: number;
  currencyCode?: string;
  notes?: string;
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  timeline?: Array<{ status: string; note?: string; createdBy?: string; updatedBy?: string; createdAt?: string }>;
  createdAt?: string;
};

export default function OrderTrackingPage() {
  const { store, settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    const apiUrl = getApiUrl();
    if (!apiUrl || !store._id) {
      setError("Unable to reach the server.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        storeId: store._id,
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      const res = await fetch(`${apiUrl}/public/order-track?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success || !json.data?.order) {
        setError(json.message || "Order not found. Check your details and try again.");
        return;
      }
      setOrder(json.data.order);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currency = (order?.currencyCode || settings?.currencyCode || "USD") as "USD" | "BDT" | "EUR" | "GBP" | "INR";

  return (
    <StorefrontPage maxWidth="lg">
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-apple-lg"
          style={{ backgroundColor: `${primaryColor}12` }}
        >
          <PackageSearch className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <StorefrontPageHeader
          title="Track your order"
          description="Enter your order number and email to see the latest status."
          className="mb-0 text-center"
        />
      </div>

      <StorefrontCard className="mx-auto max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Order number</label>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              placeholder="ORD-12345"
              className={classes.input}
            />
          </div>
          <div>
            <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={classes.input}
            />
          </div>
          {error ? <p className="rounded-apple-md bg-red-50 px-3 py-2 text-caption text-red-600">{error}</p> : null}
          <StorefrontButton type="submit" disabled={loading} className="h-11 w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track order"}
          </StorefrontButton>
        </form>
      </StorefrontCard>

      {order ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-4">
            <StorefrontCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("text-caption", classes.muted)}>Order number</p>
                  <p className={cn("text-body-strong", classes.heading)}>{order.orderNumber}</p>
                </div>
                <span
                  className="rounded-apple-pill px-3 py-1 text-fine-print font-medium"
                  style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
                >
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              {order.estimatedDelivery ? (
                <p className={cn("mt-3 text-caption", classes.muted)}>
                  Estimated delivery: <span className={classes.body}>{order.estimatedDelivery}</span>
                </p>
              ) : null}
            </StorefrontCard>

            <StorefrontCard>
              <p className={cn("mb-4 text-caption-strong", classes.heading)}>Timeline</p>
              <OrderTimeline
                status={order.status}
                paymentStatus={order.paymentStatus}
                timeline={order.timeline}
                accentColor={primaryColor}
              />
            </StorefrontCard>
          </div>

          <div className="space-y-4">
            <StorefrontCard>
              <p className={cn("mb-3 flex items-center gap-2 text-caption-strong", classes.heading)}>
                <MapPin className="h-4 w-4" /> Shipping address
              </p>
              {order.shippingAddress ? (
                <div className={cn("space-y-0.5 text-caption", classes.body)}>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.shippingAddress.phone ? <p>{order.shippingAddress.phone}</p> : null}
                </div>
              ) : (
                <p className={cn("text-caption", classes.muted)}>Not available</p>
              )}
            </StorefrontCard>

            <StorefrontCard>
              <p className={cn("mb-3 flex items-center gap-2 text-caption-strong", classes.heading)}>
                <Truck className="h-4 w-4" /> Shipping & payment
              </p>
              <dl className="space-y-2 text-caption">
                <div className="flex justify-between gap-3">
                  <dt className={classes.muted}>Courier</dt>
                  <dd className={classes.body}>{order.courier || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={classes.muted}>Tracking number</dt>
                  <dd className={classes.body}>{order.trackingNumber || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={classes.muted}>Zone</dt>
                  <dd className={classes.body}>{order.deliveryZone || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={classes.muted}>Payment</dt>
                  <dd className={cn("capitalize", classes.body)}>
                    {order.paymentMethod || "—"} · {order.paymentStatus || "pending"}
                  </dd>
                </div>
              </dl>
            </StorefrontCard>

            <StorefrontCard>
              <p className={cn("mb-3 text-caption-strong", classes.heading)}>Items</p>
              <ul className="space-y-2">
                {(order.items ?? []).map((item, i) => (
                  <li key={`${item.name}-${i}`} className="flex justify-between gap-3 text-caption">
                    <span className={classes.body}>
                      {item.name} × {item.quantity}
                    </span>
                    <span className={classes.heading}>{formatCurrency(item.price * item.quantity, currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1.5 border-t border-apple-hairline pt-3 text-caption">
                <div className="flex justify-between">
                  <span className={classes.muted}>Subtotal</span>
                  <span>{formatCurrency(order.subtotal ?? order.total, currency)}</span>
                </div>
                {(order.discount ?? 0) > 0 ? (
                  <div className="flex justify-between">
                    <span className={classes.muted}>Discount</span>
                    <span>−{formatCurrency(order.discount ?? 0, currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className={classes.muted}>Delivery</span>
                  <span>{formatCurrency(order.deliveryCharge ?? 0, currency)}</span>
                </div>
                {(order.tax ?? 0) > 0 ? (
                  <div className="flex justify-between">
                    <span className={classes.muted}>Tax</span>
                    <span>{formatCurrency(order.tax ?? 0, currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-1 text-body-strong">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, currency)}</span>
                </div>
              </div>
              {order.notes ? (
                <p className={cn("mt-3 text-caption", classes.muted)}>
                  Note: <span className={classes.body}>{order.notes}</span>
                </p>
              ) : null}
            </StorefrontCard>
          </div>
        </motion.div>
      ) : null}
    </StorefrontPage>
  );
}
