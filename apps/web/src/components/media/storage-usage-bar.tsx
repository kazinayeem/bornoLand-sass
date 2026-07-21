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

  const noStorage = !stats.unlimited && stats.limitBytes <= 0;
  const almostFull = !stats.unlimited && stats.limitBytes > 0 && stats.percentUsed >= 90;

  if (compact) {
    return (
      <div className="min-w-[180px] space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-apple-ink-muted-80">Storage</span>
          <span className="tabular-nums text-apple-ink-muted-48">
            {noStorage
              ? "Not included"
              : stats.unlimited
                ? `${usedLabel} · Unlimited`
                : `${usedLabel} / ${limitLabel}`}
          </span>
        </div>
        {!noStorage && !stats.unlimited && stats.limitBytes > 0 && (
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, stats.percentUsed)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${almostFull ? "bg-amber-500" : "bg-blue-600"}`}
            />
          </div>
        )}
        {noStorage && billingHref && (
          <Link
            href={billingHref}
            className="block text-[11px] font-semibold text-blue-600 underline"
          >
            Upgrade to add storage
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-apple-hairline bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-apple-ink">Storage usage</span>
        <span className="tabular-nums text-apple-ink-muted-48">
          {noStorage
            ? "Not included"
            : stats.unlimited
              ? `${usedLabel} · Unlimited`
              : `${usedLabel} / ${limitLabel}`}
        </span>
      </div>
      {noStorage ? (
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "0%" }}
            className="h-full rounded-full bg-zinc-300"
          />
        </div>
      ) : !stats.unlimited && stats.limitBytes > 0 ? (
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, stats.percentUsed)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${almostFull ? "bg-amber-500" : "bg-blue-600"}`}
          />
        </div>
      ) : null}
      <p className="text-xs text-apple-ink-muted-48">
        {noStorage
          ? "Your current plan does not include media storage."
          : `${stats.fileCount} files · ${stats.imageCount} images · ${stats.documentCount} documents
        ${!stats.unlimited && stats.limitBytes > 0 ? ` · ${stats.percentUsed}% used` : ""}`}
      </p>
      {noStorage && billingHref && (
        <p className="text-xs text-blue-700">
          <Link href={billingHref} className="font-semibold underline">
            Upgrade your plan to add media storage
          </Link>
        </p>
      )}
      {almostFull && billingHref && !noStorage && (
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
