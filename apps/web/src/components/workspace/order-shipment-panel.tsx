"use client";

import { useState } from "react";
import {
  Copy,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  useCancelOrderShipmentMutation,
  useTrackOrderShipmentMutation,
  type OrderShipment,
  type StoreOrder,
} from "@/redux/api/store-order-api";

const STATUS_TONES: Record<string, string> = {
  created: "bg-sky-50 text-sky-700 border-sky-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  picked: "bg-indigo-50 text-indigo-700 border-indigo-200",
  in_transit: "bg-blue-50 text-blue-700 border-blue-200",
  hub_received: "bg-violet-50 text-violet-700 border-violet-200",
  out_for_delivery: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-zinc-100 text-zinc-600 border-zinc-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

type OrderShipmentPanelProps = {
  storeId: string;
  order: StoreOrder;
  onUpdated?: (order: StoreOrder) => void;
};

function hasShipmentRecord(shipment?: OrderShipment | null) {
  return Boolean(shipment?.trackingNumber && shipment.status);
}

function hasActiveShipment(shipment?: OrderShipment | null) {
  if (!hasShipmentRecord(shipment)) return false;
  return !["failed", "cancelled"].includes(String(shipment?.status));
}

export function OrderShipmentPanel({ storeId, order, onUpdated }: OrderShipmentPanelProps) {
  const shipment = order.shipment;
  const [rawOpen, setRawOpen] = useState(false);
  const [cancelShipment, { isLoading: cancelling }] = useCancelOrderShipmentMutation();
  const [trackShipment, { isLoading: tracking }] = useTrackOrderShipmentMutation();

  if (!hasShipmentRecord(shipment)) return null;

  const status = shipment?.status || "created";
  const canCancel = !["cancelled", "delivered", "returned"].includes(status);
  const trackingNo = shipment?.trackingNumber || order.trackingNumber || "";

  const copyTracking = () => {
    if (!trackingNo) return;
    void navigator.clipboard.writeText(trackingNo);
    toast.success("Tracking number copied");
  };

  const handleTrack = async () => {
    try {
      const result = await trackShipment({ storeId, orderId: order._id }).unwrap();
      toast.success(`Status: ${result.data?.shipmentStatus ?? "updated"}`);
      if (result.data?.order) onUpdated?.(result.data.order);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to sync tracking");
    }
  };

  const handleCancel = async () => {
    if (!canCancel || cancelling) return;
    try {
      const result = await cancelShipment({ storeId, orderId: order._id }).unwrap();
      toast.success("Shipment cancelled");
      if (result.data?.order) onUpdated?.(result.data.order);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to cancel shipment");
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-white to-white">
        <div className="flex items-center gap-2.5 border-b border-emerald-100 px-3.5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Truck className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-apple-ink">Shipment Created</p>
            <p className="text-[10px] text-apple-ink-muted-48">
              {shipment?.environment === "sandbox" ? "Sandbox" : "Production"}
              {shipment?.autoCreated ? " · Auto" : ""}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
              STATUS_TONES[status] ?? STATUS_TONES.created,
            )}
          >
            {status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-apple-hairline">
            <p className="text-[9px] font-medium uppercase tracking-wide text-apple-ink-muted-48">
              Provider
            </p>
            <p className="mt-0.5 text-[12px] font-semibold text-apple-ink">
              {shipment?.providerName || shipment?.provider || order.courier || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-apple-hairline">
            <p className="text-[9px] font-medium uppercase tracking-wide text-apple-ink-muted-48">
              Tracking
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-apple-ink">
              {trackingNo || "—"}
            </p>
          </div>
          {shipment?.consignmentId ? (
            <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-apple-hairline sm:col-span-2">
              <p className="text-[9px] font-medium uppercase tracking-wide text-apple-ink-muted-48">
                Consignment
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] font-medium text-apple-ink">
                {shipment.consignmentId}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-emerald-100 px-3 py-2.5">
          <button
            type="button"
            onClick={handleTrack}
            disabled={tracking}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-apple-hairline bg-white px-2.5 text-[11px] font-medium text-apple-ink disabled:opacity-50"
          >
            {tracking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Track
          </button>
          <button
            type="button"
            onClick={copyTracking}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-apple-hairline bg-white px-2.5 text-[11px] font-medium text-apple-ink"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
          <button
            type="button"
            onClick={() => setRawOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-apple-hairline bg-white px-2.5 text-[11px] font-medium text-apple-ink"
          >
            <Package className="h-3 w-3" /> Response
          </button>
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-medium text-red-700 disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <Modal open={rawOpen} onClose={() => setRawOpen(false)} title="Courier Response" size="lg">
        <pre className="max-h-[50vh] overflow-auto rounded-xl bg-zinc-950 p-4 text-[11px] text-zinc-100">
          {JSON.stringify(shipment?.rawResponse ?? {}, null, 2)}
        </pre>
      </Modal>
    </>
  );
}

export function orderHasShipment(order: StoreOrder) {
  return hasActiveShipment(order.shipment);
}
