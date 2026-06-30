"use client";

import { formatBytes, type StorageStats } from "@/redux/api/media-api";
import Link from "next/link";

export function StorageUsageBar({
  stats,
  billingHref,
  compact,
}: {
  stats?: StorageStats;
  billingHref?: string;
  compact?: boolean;
}) {
  if (!stats) return null;

  const label =
    stats.limitGB >= 1
      ? `${formatBytes(stats.usedBytes)} / ${stats.limitGB} GB`
      : stats.limitMB > 0
        ? `${formatBytes(stats.usedBytes)} / ${formatBytes(stats.limitBytes)}`
        : `${formatBytes(stats.usedBytes)} used`;

  const almostFull = !stats.unlimited && stats.percentUsed >= 90;

  return (
    <div className={compact ? "space-y-1" : "space-y-2 rounded-xl border border-zinc-200 bg-white p-4"}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-zinc-900">Storage</span>
        <span className="text-zinc-500">{stats.unlimited ? `${formatBytes(stats.usedBytes)} · Unlimited` : label}</span>
      </div>
      {!stats.unlimited && stats.limitBytes > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-all ${almostFull ? "bg-amber-500" : "bg-zinc-900"}`}
            style={{ width: `${Math.min(100, stats.percentUsed)}%` }}
          />
        </div>
      )}
      {!compact && (
        <p className="text-xs text-zinc-500">
          {stats.fileCount} files · {stats.imageCount} images · {stats.documentCount} documents
          {!stats.unlimited && stats.limitBytes > 0 ? ` · ${stats.percentUsed}% used` : ""}
        </p>
      )}
      {almostFull && billingHref && (
        <p className="text-xs text-amber-800">
          Storage almost full.{" "}
          <Link href={billingHref} className="font-semibold underline">
            Upgrade your plan
          </Link>
        </p>
      )}
    </div>
  );
}
