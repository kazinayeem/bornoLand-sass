"use client";

import { motion } from "framer-motion";
import { formatBytes } from "@/redux/api/media-api";
import type { StorageStats } from "@/redux/api/media-api";
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

  const usedLabel = formatBytes(stats.usedBytes);
  const limitLabel = stats.unlimited
    ? "Unlimited"
    : stats.limitGB >= 1
      ? `${stats.limitGB} GB`
      : formatBytes(stats.limitBytes);

  const almostFull = !stats.unlimited && stats.percentUsed >= 90;

  if (compact) {
    return (
      <div className="min-w-[180px] space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-zinc-600">Storage</span>
          <span className="tabular-nums text-zinc-500">
            {stats.unlimited ? `${usedLabel} · Unlimited` : `${usedLabel} / ${limitLabel}`}
          </span>
        </div>
        {!stats.unlimited && stats.limitBytes > 0 && (
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, stats.percentUsed)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${almostFull ? "bg-amber-500" : "bg-blue-600"}`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-zinc-900">Storage usage</span>
        <span className="tabular-nums text-zinc-500">
          {stats.unlimited ? `${usedLabel} · Unlimited` : `${usedLabel} / ${limitLabel}`}
        </span>
      </div>
      {!stats.unlimited && stats.limitBytes > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, stats.percentUsed)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${almostFull ? "bg-amber-500" : "bg-blue-600"}`}
          />
        </div>
      )}
      <p className="text-xs text-zinc-500">
        {stats.fileCount} files · {stats.imageCount} images · {stats.documentCount} documents
        {!stats.unlimited && stats.limitBytes > 0 ? ` · ${stats.percentUsed}% used` : ""}
      </p>
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
