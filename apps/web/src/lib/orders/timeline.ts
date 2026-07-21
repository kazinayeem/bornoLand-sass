/** Shared order fulfillment pipeline (storefront + dashboard). */

export const ORDER_FULFILLMENT_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STEPS)[number];

export const ORDER_TERMINAL_STATUSES = ["cancelled", "refunded", "partial_refund"] as const;

export const ALL_ORDER_STATUSES = [
  ...ORDER_FULFILLMENT_STEPS,
  ...ORDER_TERMINAL_STATUSES,
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "partial", "failed", "refunded"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  payment_pending: "Payment Pending",
  paid: "Payment Received",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partial_refund: "Partially Refunded",
};

export const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type TimelineEventLike = {
  status: string;
  note?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string | Date;
};

export type TimelineDisplayStep = {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming" | "cancelled";
  at?: string | Date;
  by?: string;
  note?: string;
};

/** Build: Placed → Payment → Confirmed → … → Delivered (or Cancelled). */
export function buildOrderTimeline(
  events: TimelineEventLike[] | undefined,
  currentStatus: string,
  paymentStatus?: string,
): TimelineDisplayStep[] {
  const sorted = [...(events ?? [])].sort(
    (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
  );

  const byStatus = new Map<string, TimelineEventLike>();
  for (const event of sorted) {
    byStatus.set(event.status, event);
  }

  const mk = (
    key: string,
    state: TimelineDisplayStep["state"],
    event?: TimelineEventLike,
  ): TimelineDisplayStep => ({
    key,
    label: ORDER_STATUS_LABELS[key] ?? key,
    state,
    at: event?.createdAt,
    by: event?.updatedBy || event?.createdBy,
    note: event?.note,
  });

  if (currentStatus === "cancelled" || currentStatus === "refunded" || currentStatus === "partial_refund") {
    const steps: TimelineDisplayStep[] = [];
    const placed = byStatus.get("pending") ?? sorted[0];
    if (placed) steps.push(mk("pending", "done", placed));
    const paid = byStatus.get("paid") ?? byStatus.get("payment_pending");
    if (paid) steps.push(mk(paid.status === "paid" ? "paid" : "payment_pending", "done", paid));
    for (const status of ORDER_FULFILLMENT_STEPS.slice(1)) {
      const event = byStatus.get(status);
      if (event) steps.push(mk(status, "done", event));
    }
    const terminal = byStatus.get(currentStatus) ?? sorted[sorted.length - 1];
    steps.push(mk(currentStatus, "cancelled", terminal));
    return steps;
  }

  const currentIndex = Math.max(
    0,
    ORDER_FULFILLMENT_STEPS.indexOf(currentStatus as OrderFulfillmentStatus),
  );
  const paymentPaid = paymentStatus === "paid" || byStatus.has("paid");
  const paymentKey = paymentPaid ? "paid" : "payment_pending";
  const paymentEvent =
    byStatus.get(paymentKey) ??
    byStatus.get(paymentPaid ? "paid" : "payment_pending") ??
    sorted.find((e) => e.status === "paid" || e.status === "payment_pending");

  const steps: TimelineDisplayStep[] = [];

  // 1) Order Placed
  steps.push(
    mk(
      "pending",
      currentIndex === 0 ? "current" : "done",
      byStatus.get("pending") ?? sorted[0],
    ),
  );

  // 2) Payment
  let paymentState: TimelineDisplayStep["state"] = "upcoming";
  if (paymentPaid) paymentState = "done";
  else if (currentIndex === 0) paymentState = "current";
  steps.push(mk(paymentKey, paymentState, paymentEvent));

  // 3+) Fulfillment after pending
  for (let i = 1; i < ORDER_FULFILLMENT_STEPS.length; i++) {
    const status = ORDER_FULFILLMENT_STEPS[i];
    const event = byStatus.get(status);
    let state: TimelineDisplayStep["state"] = "upcoming";
    if (i < currentIndex) state = "done";
    else if (i === currentIndex) state = currentStatus === "delivered" ? "done" : "current";
    else if (event) state = "done";
    steps.push(mk(status, state, event));
  }

  return steps;
}

export function formatTimelineDate(value?: string | Date) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date),
  };
}
