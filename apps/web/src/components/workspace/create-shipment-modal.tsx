"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Package,
  Truck,
  Wifi,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  useCreateOrderShipmentMutation,
  useGetShipmentOptionsQuery,
  type StoreOrder,
} from "@/redux/api/store-order-api";
import { formatCurrency } from "@/lib/format-currency";

type CreateShipmentModalProps = {
  open: boolean;
  onClose: () => void;
  storeId: string;
  order: StoreOrder;
  currencySettings?: Parameters<typeof formatCurrency>[1];
  onCreated?: (order: StoreOrder) => void;
};

type Step = "select" | "preview";

export function CreateShipmentModal({
  open,
  onClose,
  storeId,
  order,
  currencySettings,
  onCreated,
}: CreateShipmentModalProps) {
  const { data, isLoading, isError, error, refetch } = useGetShipmentOptionsQuery(
    { storeId, orderId: order._id },
    { skip: !open },
  );
  const [createShipment, { isLoading: creating }] = useCreateOrderShipmentMutation();

  const [step, setStep] = useState<Step>("select");
  const [provider, setProvider] = useState<string>("");
  const [weightKg, setWeightKg] = useState("0.5");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [packageType, setPackageType] = useState("parcel");
  const [codAmount, setCodAmount] = useState("0");

  const options = data?.data;
  const available = options?.available ?? [];
  const unavailable = options?.unavailable ?? [];

  useEffect(() => {
    if (!open) {
      setStep("select");
      setProvider("");
      return;
    }
    const recommended = available.find((a) => a.recommended) ?? available[0];
    if (recommended) {
      setProvider(recommended.provider);
      setWeightKg(String(recommended.defaultWeightKg ?? 0.5));
    }
    if (options?.order) {
      setCodAmount(String(options.order.codAmount ?? 0));
      setSpecialInstruction("");
      setPackageType("parcel");
    }
  }, [open, available, options?.order]);

  const selected = useMemo(
    () => available.find((a) => a.provider === provider),
    [available, provider],
  );

  const money = (v: number) => formatCurrency(v || 0, currencySettings);

  const handleCreate = async () => {
    if (!provider || creating) return;
    try {
      const result = await createShipment({
        storeId,
        orderId: order._id,
        provider,
        weightKg: Number(weightKg) || 0.5,
        specialInstruction: specialInstruction.trim() || undefined,
        packageType: packageType.trim() || "parcel",
        codAmount: Number(codAmount) || 0,
      }).unwrap();
      toast.success("Shipment created successfully");
      const nextOrder = result.data?.order;
      if (nextOrder) onCreated?.(nextOrder);
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to create shipment");
    }
  };

  const errMessage =
    isError && error && typeof error === "object" && "data" in error
      ? (error as { data?: { message?: string } }).data?.message
      : undefined;

  return (
    <Modal
      open={open}
      onClose={() => !creating && onClose()}
      title="Create Shipment"
      description={`Order ${order.orderNumber}`}
      size="xl"
      loading={creating}
      stickyFooter
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-apple-ink-muted-48">
            {step === "select"
              ? "Select a courier that covers the delivery area"
              : "Review details before creating the shipment"}
          </p>
          <div className="flex gap-2">
            {step === "preview" ? (
              <button
                type="button"
                disabled={creating}
                onClick={() => setStep("select")}
                className="h-10 rounded-full border border-apple-hairline bg-white px-4 text-sm font-medium text-apple-ink"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                disabled={creating}
                onClick={onClose}
                className="h-10 rounded-full border border-apple-hairline bg-white px-4 text-sm font-medium text-apple-ink"
              >
                Cancel
              </button>
            )}
            {step === "select" ? (
              <button
                type="button"
                disabled={!provider || available.length === 0}
                onClick={() => setStep("preview")}
                className="h-10 rounded-full bg-apple-primary px-5 text-sm font-medium text-apple-on-primary disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={creating || !provider}
                onClick={handleCreate}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-apple-primary px-5 text-sm font-medium text-apple-on-primary disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                Confirm & Create
              </button>
            )}
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : errMessage ? (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="text-sm font-medium text-red-700">{errMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-apple-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : step === "select" ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-apple-hairline bg-gradient-to-br from-apple-canvas-parchment to-white px-4 py-3 text-[12px] text-apple-ink-muted-80">
            <p className="font-semibold text-apple-ink">
              {options?.order.shippingAddress.fullName}
              <span className="font-normal text-apple-ink-muted-48">
                {" "}
                · {options?.order.shippingAddress.phone}
              </span>
            </p>
            <p className="mt-1 leading-relaxed">
              {[options?.order.shippingAddress.street, options?.order.shippingAddress.area]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="mt-1 text-[11px]">
              <span className="text-apple-ink-muted-48">District</span>{" "}
              <span className="font-medium text-apple-ink">
                {options?.order.shippingAddress.district || "—"}
              </span>
              {options?.order.shippingAddress.area ? (
                <>
                  {" "}
                  · <span className="text-apple-ink-muted-48">Area</span>{" "}
                  <span className="font-medium text-apple-ink">{options.order.shippingAddress.area}</span>
                </>
              ) : null}
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-apple-ink">Available</h4>
            {available.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-apple-ink-muted-48">
                No compatible couriers for this address
              </p>
            ) : (
              <div className="space-y-2">
                {available.map((item) => {
                  const active = provider === item.provider;
                  return (
                    <button
                      key={item.provider}
                      type="button"
                      onClick={() => setProvider(item.provider)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-apple-primary bg-apple-primary/5"
                          : "border-apple-hairline bg-white hover:bg-apple-canvas-parchment",
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                        <Package className="h-5 w-5 text-apple-ink-muted-80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-apple-ink">{item.name}</p>
                          {item.recommended ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              Recommended
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              item.environment === "sandbox"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-sky-200 bg-sky-50 text-sky-700",
                            )}
                          >
                            {item.environment === "sandbox" ? "Sandbox" : "Production"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <Wifi className="h-3 w-3" /> Connected
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-apple-ink-muted-48">
                          <span>Coverage: Supported</span>
                          {item.estimatedCharge != null ? (
                            <span>Est. charge: {money(item.estimatedCharge)}</span>
                          ) : null}
                          {item.estimatedDelivery ? (
                            <span>ETA: {item.estimatedDelivery}</span>
                          ) : null}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          active ? "border-apple-primary bg-apple-primary text-white" : "border-zinc-300",
                        )}
                      >
                        {active ? <Check className="h-3 w-3" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {unavailable.length > 0 ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-apple-ink">Unavailable</h4>
              <div className="space-y-2">
                {unavailable.map((item) => (
                  <div
                    key={item.provider}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 opacity-80"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200/60">
                      <X className="h-4 w-4 text-apple-ink-muted-48" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-apple-ink">{item.name}</p>
                      <p className="text-[12px] text-apple-ink-muted-48">Reason: {item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-apple-hairline px-4 py-3">
            <p className="text-xs text-apple-ink-muted-48">Selected courier</p>
            <p className="text-sm font-semibold text-apple-ink">
              {selected?.name} · {selected?.environment === "sandbox" ? "Sandbox" : "Production"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Customer Name" value={options?.order.shippingAddress.fullName} />
            <Info label="Phone" value={options?.order.shippingAddress.phone} />
            <Info label="Address" value={options?.order.shippingAddress.street} />
            <Info label="District" value={options?.order.shippingAddress.district} />
            <Info label="Zone" value={options?.order.shippingAddress.zone || "—"} />
            <Info label="Area" value={options?.order.shippingAddress.area || "—"} />
            <Info label="Order Total" value={money(options?.order.total ?? order.total)} />
            <Info label="Items" value={String(options?.order.itemCount ?? order.items?.length ?? 0)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">Weight (kg)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">Package Type</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
              >
                <option value="parcel">Parcel</option>
                <option value="document">Document</option>
                <option value="fragile">Fragile</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">COD Amount</label>
              <input
                type="number"
                min={0}
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                className="h-11 w-full rounded-xl border border-apple-hairline bg-white px-3 text-[13px] outline-none focus:border-apple-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                Special Instruction
              </label>
              <textarea
                rows={3}
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                placeholder="Optional delivery notes"
                className="w-full rounded-xl border border-apple-hairline bg-white px-3 py-2 text-[13px] outline-none focus:border-apple-primary"
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-apple-canvas-parchment px-3 py-2.5">
      <p className="text-[11px] text-apple-ink-muted-48">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-apple-ink">{value || "—"}</p>
    </div>
  );
}
