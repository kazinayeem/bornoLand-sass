"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { AdminStore } from "@/redux/api/admin-api";
import type { Plan } from "@/redux/api/store-api";
import { useUpdateStoreStorageMutation } from "@/redux/api/admin-storage-api";
import { useGetAdminStoreStorageListQuery } from "@/redux/api/admin-storage-api";
import { formatBytes } from "@/redux/api/media-api";

export function StorePlanOverridePanel({
  store,
  plans,
}: {
  store: AdminStore;
  plans: Plan[];
}) {
  const { data: storageData } = useGetAdminStoreStorageListQuery();
  const [updateStorage, { isLoading }] = useUpdateStoreStorageMutation();

  const row = storageData?.data?.stores?.find((s) => s.storeId === store._id);
  const planId = typeof store.planId === "string" ? store.planId : null;
  const assignedPlan = plans.find((p) => p._id === planId) ?? plans.find((p) => p.slug === store.plan);

  const [limitMB, setLimitMB] = useState(
    row ? Math.round(row.limitBytes / (1024 * 1024)) : assignedPlan?.limits.storage ?? 512
  );
  const [unlimited, setUnlimited] = useState(row?.unlimited ?? false);

  const handleSave = async () => {
    try {
      await updateStorage({
        storeId: store._id,
        limitMB: unlimited ? undefined : limitMB,
        unlimited,
      }).unwrap();
      toast.success("Store overrides saved (plan unchanged)");
    } catch {
      toast.error("Failed to save overrides");
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <h4 className="text-sm font-semibold text-zinc-900">Plan overrides</h4>
      <p className="mt-1 text-xs text-zinc-500">
        Override quotas for <strong>{store.name}</strong> without changing their assigned plan (
        {assignedPlan?.name ?? store.plan}).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-100 bg-white p-3 text-sm">
          <p className="text-xs text-zinc-400">Plan storage</p>
          <p className="font-semibold text-zinc-800">
            {assignedPlan?.limits.storage != null
              ? assignedPlan.limits.storage >= 1024
                ? `${(assignedPlan.limits.storage / 1024).toFixed(1)} GB`
                : `${assignedPlan.limits.storage} MB`
              : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-white p-3 text-sm">
          <p className="text-xs text-zinc-400">Currently used</p>
          <p className="font-semibold text-zinc-800">{row ? formatBytes(row.usedBytes) : "—"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
          Unlimited storage override
        </label>
        {!unlimited && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Custom storage limit (MB)</label>
            <input
              type="number"
              min={0}
              value={limitMB}
              onChange={(e) => setLimitMB(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              placeholder="e.g. 10240 for 10 GB"
            />
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Product, variant, and feature limits still follow the assigned plan. Change plan above for those limits, or edit
        the plan in Plan Builder.
      </p>

      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save storage override
      </button>
    </div>
  );
}
