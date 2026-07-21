"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Loader2 } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { getApiUrl } from "@/lib/urls";
import { formatCurrency } from "@/lib/format-currency";
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
  total: number;
  currencyCode?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  timeline?: Array<{ status: string; note?: string; createdAt?: string }>;
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

  return (
    <StorefrontPage maxWidth="sm">
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

      <StorefrontCard>
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
          <StorefrontCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn("text-caption", classes.muted)}>Order</p>
                <p className={cn("text-body-strong", classes.heading)}>{order.orderNumber}</p>
              </div>
              <span
                className="rounded-apple-pill px-3 py-1 text-fine-print font-medium capitalize"
                style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
              >
                {order.status}
              </span>
            </div>
            <p className={cn("mt-4 text-body", classes.body)}>
              Total{" "}
              <span className="font-semibold">
                {formatCurrency(order.total, (order.currencyCode || settings?.currencyCode || "USD") as any)}
              </span>
            </p>
          </StorefrontCard>

          {order.timeline && order.timeline.length > 0 ? (
            <StorefrontCard>
              <p className={cn("mb-3 text-caption-strong", classes.heading)}>Timeline</p>
              <ol className="space-y-3">
                {order.timeline.map((event, i) => (
                  <li key={`${event.status}-${i}`} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <div>
                      <p className={cn("text-caption-strong capitalize", classes.heading)}>{event.status}</p>
                      {event.note ? <p className={cn("text-caption", classes.muted)}>{event.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </StorefrontCard>
          ) : null}
        </motion.div>
      ) : null}
    </StorefrontPage>
  );
}
