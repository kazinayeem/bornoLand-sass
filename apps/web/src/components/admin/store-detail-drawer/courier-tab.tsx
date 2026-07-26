"use client";

import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  useGetStoreCourierAccessQuery,
  useUpdateStoreCourierAccessMutation,
  type CourierProviderSlug,
} from "@/redux/api/courier-api";
import type { Plan } from "@/redux/api/store-api";
import type { TabHelpers } from "./types";

const ALL_PROVIDERS: Array<{ slug: CourierProviderSlug; label: string }> = [
  { slug: "pathao", label: "Pathao" },
  { slug: "redx", label: "RedX" },
  { slug: "steadfast", label: "Steadfast" },
  { slug: "paperfly", label: "Paperfly" },
  { slug: "sundarban", label: "Sundarban" },
];

function planAllowedProviders(plan: Plan | undefined): CourierProviderSlug[] {
  if (!plan) return ALL_PROVIDERS.map((p) => p.slug);
  const access = plan.courierAccess;
  if (access?.allProviders) return ALL_PROVIDERS.map((p) => p.slug);
  if (access?.providers?.length) return access.providers;
  if (plan.featureToggles?.courier || access?.enabled) return ALL_PROVIDERS.map((p) => p.slug);
  return [];
}

export function CourierTab({ helpers }: { helpers: TabHelpers }) {
  const { storeId, plans, store } = helpers;
  const planId =
    helpers.localPlanId ??
    (typeof store?.planId === "object" && store?.planId
      ? (store.planId as { _id?: string })._id
      : typeof store?.planId === "string"
        ? store.planId
        : null);
  const plan =
    plans.find((p) => p._id === planId) ??
    plans.find((p) => p.slug === store?.plan) ??
    undefined;

  const allowed = planAllowedProviders(plan);
  const { data, isLoading, refetch } = useGetStoreCourierAccessQuery(storeId, { skip: !storeId });
  const [updateAccess, { isLoading: saving }] = useUpdateStoreCourierAccessMutation();
  const [selected, setSelected] = useState<CourierProviderSlug[]>([]);

  useEffect(() => {
    const access = data?.data?.access;
    if (!access) return;
    if (access.storeProviders && access.storeProviders.length > 0) {
      setSelected(access.storeProviders);
    } else {
      setSelected(access.planProviders?.length ? access.planProviders : allowed);
    }
  }, [data, allowed]);

  const toggle = (slug: CourierProviderSlug) => {
    if (!allowed.includes(slug)) return;
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug],
    );
  };

  const handleSave = async () => {
    try {
      await updateAccess({ storeId, providers: selected }).unwrap();
      toast.success("Store courier access updated");
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to update courier access");
    }
  };

  if (!storeId) return null;

  if (allowed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-10 text-center">
        <Package className="mx-auto h-8 w-8 text-apple-ink-muted-48" />
        <p className="mt-3 text-sm font-medium text-apple-ink">Courier not available on this plan</p>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Enable courier access on the store&apos;s plan first, then assign providers here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-apple-ink">Courier Access</h4>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Assign which plan-allowed couriers this store can configure. Removing a provider does not
          affect existing orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-apple-ink-muted-48" />
        </div>
      ) : (
        <div className="space-y-2">
          {ALL_PROVIDERS.map((provider) => {
            const planAllows = allowed.includes(provider.slug);
            const checked = selected.includes(provider.slug);
            return (
              <label
                key={provider.slug}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  planAllows ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked && planAllows}
                    disabled={!planAllows}
                    onChange={() => toggle(provider.slug)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-apple-ink">{provider.label}</p>
                    <p className="text-[11px] text-apple-ink-muted-48">
                      {planAllows ? "Included in plan" : "Not included in plan"}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || isLoading}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save courier access
      </button>
    </div>
  );
}
