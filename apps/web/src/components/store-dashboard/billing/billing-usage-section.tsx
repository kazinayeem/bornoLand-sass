"use client";

import type { DashboardStatsResponse } from "@/redux/api/subscription-api";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export function BillingUsageSection({ stats }: { stats?: DashboardStatsResponse }) {
  if (!stats) return null;

  const storagePercent = stats.storage?.percent ?? 0;
  const storageColor = storagePercent > 90 ? "bg-red-500" : storagePercent > 75 ? "bg-amber-500" : "bg-indigo-600";

  const usageItems = stats.usage ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-apple-ink">Storage Usage</h2>
            <p className="text-sm text-apple-ink-muted-48">Total media library storage used by your store.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-apple-ink">{stats.storage?.usedFormatted ?? "0 MB"}</span>
            <span className="text-apple-ink-muted-48">{stats.storage?.limitFormatted ?? "Unlimited"}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
            <div className={cn("h-full transition-all duration-500", storageColor)} style={{ width: `${Math.min(100, storagePercent)}%` }} />
          </div>
          <p className="text-xs text-apple-ink-muted-48 text-right">{storagePercent.toFixed(1)}% used</p>
        </div>
      </div>

      <div className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-apple-ink">Feature Limits</h2>
          <p className="text-sm text-apple-ink-muted-48">Monitor your usage against your current plan limits.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {usageItems.map((item) => {
            const isUnlimited = item.isUnlimited;
            const percent = isUnlimited ? 0 : item.percent;
            const indicatorColor = percent > 90 ? "bg-red-500" : percent > 75 ? "bg-amber-500" : "bg-indigo-600";

            return (
              <div key={item.key} className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="capitalize text-apple-ink">{item.label}</span>
                  <span className="text-apple-ink-muted-48">
                    {item.current} / {isUnlimited ? "Unlimited" : item.limit}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
                  <div className={cn("h-full transition-all duration-500", indicatorColor)} style={{ width: `${Math.min(100, percent)}%` }} />
                </div>
                {!isUnlimited && (
                  <p className="text-xs text-apple-ink-muted-48 text-right">{percent.toFixed(1)}% used</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
