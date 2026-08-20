"use client";

import { useEffect, useState } from "react";
import {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
} from "@/redux/api/store-settings-api";
import { DeliveryTab } from "@/components/workspace/delivery-tab";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";


type ShippingSettingsTabProps = { storeId: string };

export function ShippingSettingsTab({ storeId }: ShippingSettingsTabProps) {
  const { data, isLoading } = useGetStoreSettingsQuery(storeId);
  const [updateSettings, { isLoading: saving }] = useUpdateStoreSettingsMutation();
  const settings = data?.data?.settings;

  const [shippingEnabled, setShippingEnabled] = useState(true);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingMin, setFreeShippingMin] = useState("0");
  const [taxIncluded, setTaxIncluded] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setShippingEnabled(settings.shippingEnabled ?? true);
    setFreeShippingEnabled(settings.freeShippingEnabled ?? false);
    setFreeShippingMin(String(settings.freeShippingMin ?? 0));
    setTaxIncluded(settings.taxIncluded ?? false);
  }, [settings]);

  const saveGeneral = async () => {

    try {
      await updateSettings({
        storeId,
        data: {
          shippingEnabled,
          freeShippingEnabled,
          freeShippingMin: Number(freeShippingMin) || 0,
          taxIncluded,
        },
      }).unwrap();

      try {
        await revalidateStorefrontForStore({ _id: storeId }, { scope: "all" });
      } catch {}

      toast.success("Shipping settings saved successfully");
    } catch {
      toast.error("Could not save shipping settings");
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  const symbol = settings?.currencySymbol ?? "৳";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-apple-hairline bg-apple-canvas p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment">
            <Truck className="h-5 w-5 text-apple-ink-muted-80" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-apple-ink">General</h2>
            <p className="text-[12px] text-apple-ink-muted-48">Enable shipping and free-shipping rules</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
            <span className="text-[13px] font-medium text-apple-ink">Enable shipping</span>
            <input
              type="checkbox"
              checked={shippingEnabled}
              onChange={(e) => setShippingEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-apple-hairline"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
            <span className="text-[13px] font-medium text-apple-ink">Prices include tax</span>
            <input
              type="checkbox"
              checked={taxIncluded}
              onChange={(e) => setTaxIncluded(e.target.checked)}
              className="h-4 w-4 rounded border-apple-hairline"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-apple-hairline px-4 py-3">
            <span className="text-[13px] font-medium text-apple-ink">Enable free shipping</span>
            <input
              type="checkbox"
              checked={freeShippingEnabled}
              onChange={(e) => setFreeShippingEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-apple-hairline"
            />
          </label>

          {freeShippingEnabled ? (
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-apple-ink-muted-80">
                Free over (minimum order)
              </label>
              <div className="relative max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-apple-ink-muted-48">
                  {symbol}
                </span>
                <input
                  type="number"
                  min={0}
                  value={freeShippingMin}
                  onChange={(e) => setFreeShippingMin(e.target.value)}
                  className="h-11 w-full rounded-xl border border-apple-hairline bg-white pl-8 pr-3 text-[13px] outline-none focus:border-apple-primary"
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={saveGeneral}
            disabled={saving}
            className="inline-flex h-10 items-center rounded-full bg-apple-primary px-5 text-[13px] font-medium text-apple-on-primary disabled:opacity-60"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save shipping settings
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">Delivery zones</h2>
          <p className="text-[12px] text-apple-ink-muted-48">
            Create unlimited zones with charges and estimated delivery times.
          </p>
        </div>
        <DeliveryTab storeId={storeId} />
      </section>
    </div>
  );
}
