"use client";

import { useMemo, useState } from "react";
import { HardDrive, Loader2, TrendingUp, Upload, Users, Ban, Infinity, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/redux/api/media-api";
import {
  useGetPlatformStorageAnalyticsQuery,
  useGetAdminStoreStorageListQuery,
  useUpdateStoreStorageMutation,
  useCleanupStoreStorageMutation,
} from "@/redux/api/admin-storage-api";
import { StatCard } from "@/components/admin/stat-card";
import { AdminTabs } from "@/components/admin/admin-tabs";

export function PlatformStoragePanel() {
  const [tab, setTab] = useState("overview");
  const { data: analyticsData, isLoading: loadingAnalytics } = useGetPlatformStorageAnalyticsQuery();
  const { data: storesData, isLoading: loadingStores } = useGetAdminStoreStorageListQuery();
  const [updateStorage] = useUpdateStoreStorageMutation();
  const [cleanupStorage] = useCleanupStoreStorageMutation();

  const analytics = analyticsData?.data?.analytics;
  const stores = storesData?.data?.stores ?? [];
  const topConsumers = useMemo(
    () => [...stores].sort((a, b) => b.usedBytes - a.usedBytes).slice(0, 10),
    [stores]
  );

  if (loadingAnalytics || loadingStores) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const usedPct =
    analytics && analytics.totalLimitBytes > 0
      ? Math.round((analytics.totalUsedBytes / analytics.totalLimitBytes) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-apple-ink-muted-48">
        Platform-wide storage analytics. Per-plan quotas are configured in Plan Builder → Storage tab.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Platform used" value={analytics ? `${analytics.totalUsedGB} GB` : "—"} icon={HardDrive} variant="blue" />
        <StatCard title="Available" value={analytics ? formatBytes(analytics.totalFreeBytes) : "—"} icon={TrendingUp} variant="green" />
        <StatCard title="Total files" value={analytics?.totalFiles ?? 0} icon={Upload} variant="purple" />
        <StatCard title="Stores" value={analytics?.totalStores ?? 0} icon={Users} variant="amber" />
      </div>

      {analytics && analytics.totalLimitBytes > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-apple-canvas-parchment p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-apple-ink-muted-80">Capacity</span>
            <span className="text-apple-ink-muted-48">{usedPct}% used</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(usedPct, 100)}%` }} />
          </div>
        </div>
      )}

      <AdminTabs
        tabs={[
          { id: "overview", label: "Top consumers", count: topConsumers.length },
          { id: "stores", label: "All stores", count: stores.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead className="bg-apple-canvas-parchment text-left text-xs uppercase text-apple-ink-muted-48">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Limit</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tab === "overview" ? topConsumers : stores).map((row) => (
              <tr key={row.storeId} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium">{row.storeName}</td>
                <td className="px-4 py-3">{row.plan?.name ?? "—"}</td>
                <td className="px-4 py-3">{formatBytes(row.usedBytes)}</td>
                <td className="px-4 py-3">{row.unlimited ? "Unlimited" : formatBytes(row.limitBytes)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    title="Cleanup"
                    onClick={async () => {
                      if (!confirm(`Delete all media for ${row.storeName}?`)) return;
                      try {
                        const r = await cleanupStorage(row.storeId).unwrap();
                        toast.success(`Cleaned ${r.data?.cleaned ?? 0} files`);
                      } catch {
                        toast.error("Cleanup failed");
                      }
                    }}
                    className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
