"use client";

import React from "react";
import { Truck, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import type { PublicDeliveryZone } from "@/lib/server/checkout-data";
import { cn } from "@/lib/utils";

type CheckoutDeliverySectionProps = {
  deliveryZones: PublicDeliveryZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  currencyCode?: string;
};

export const CheckoutDeliverySection = React.memo(function CheckoutDeliverySection({
  deliveryZones,
  selectedZoneId,
  onSelectZone,
  currencyCode = "BDT",
}: CheckoutDeliverySectionProps) {
  if (deliveryZones.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <Truck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Delivery Method</h2>
          <p className="text-xs text-zinc-500">Choose your preferred shipping option</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {deliveryZones.map((zone) => {
          const isSelected = selectedZoneId === zone._id;
          return (
            <div
              key={zone._id}
              onClick={() => onSelectZone(zone._id)}
              className={cn(
                "relative flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all",
                isSelected
                  ? "border-zinc-900 bg-zinc-900/[0.02] shadow-sm ring-1 ring-zinc-900"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                    isSelected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white",
                  )}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{zone.name}</p>
                  <p className="text-xs text-zinc-500">
                    Est. {zone.estimatedDays || "2-3 Days"}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-900">
                {zone.charge > 0 ? formatCurrency(zone.charge, (currencyCode as any) || "BDT") : "Free"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});
