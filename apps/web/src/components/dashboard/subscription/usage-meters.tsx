"use client";

import { useMemo } from "react";
import { HardDrive, Package, ShoppingCart, Users, FileText, Tags, Image, Star, Percent, Shield } from "lucide-react";
import type { UsageItem, StorageInfo } from "@/redux/api/subscription-api";

type Props = {
  usage: UsageItem[];
  storage: StorageInfo;
  planName: string;
  trialEndsAt?: string | null;
};

function UsageBar({ current, limit, percent, label, isDisabled, isUnlimited, icon: Icon }: UsageItem & { icon: React.ElementType; label: string }) {
  if (isDisabled) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="text-sm text-zinc-500">{label}</span>
        </div>
        <span className="text-xs font-medium text-zinc-400">Not available</span>
      </div>
    );
  }

  if (isUnlimited) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-700">{label}</span>
        </div>
        <span className="text-xs font-medium text-emerald-600">Unlimited</span>
      </div>
    );
  }

  const barColor = percent >= 90 ? "bg-red-500" : percent >= 75 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-700">{label}</span>
        </div>
        <span className="text-xs font-medium text-zinc-600">
          <span className={percent >= 90 ? "text-red-600" : percent >= 75 ? "text-amber-600" : ""}>
            {current}
          </span>
          {" / "}{limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

const ICONS: Record<string, React.ElementType> = {
  products: Package,
  categories: Tags,
  collections: Tags,
  orders: ShoppingCart,
  customers: Users,
  staff: Users,
  pages: FileText,
  coupons: Percent,
  reviews: Star,
  media: Image,
};

export function UsageMeters({ usage, storage, planName, trialEndsAt }: Props) {
  const trialInfo = useMemo(() => {
    if (!trialEndsAt) return null;
    const now = new Date();
    const end = new Date(trialEndsAt);
    const remaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { remaining, expired: remaining === 0 };
  }, [trialEndsAt]);

  return (
    <div className="space-y-5">
      {/* Plan header */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Current Plan</p>
            <p className="text-lg font-bold text-zinc-900">{planName}</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
            Upgrade
          </button>
        </div>
        {trialInfo && (
          <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${trialInfo.expired ? "bg-red-50 text-red-600" : trialInfo.remaining <= 3 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
            {trialInfo.expired
              ? "Trial expired. Upgrade to continue."
              : `${trialInfo.remaining} day${trialInfo.remaining === 1 ? "" : "s"} remaining in trial`}
          </div>
        )}
      </div>

      {/* Storage */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Storage</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-zinc-900">{storage.usedFormatted}</span>
          <span className="text-sm text-zinc-500">/ {storage.limitFormatted}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-all ${
              storage.percent >= 90 ? "bg-red-500" : storage.percent >= 75 ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(storage.percent, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-400">{storage.percent}% used</p>
      </div>

      {/* Usage meters */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Resource Usage</p>
        <div className="space-y-3">
          {usage.map((item) => {
            const { key: _key, label, ...rest } = item;
            return <UsageBar key={_key} {...rest} label={label} icon={ICONS[_key] || Shield} />;
          })}
        </div>
      </div>
    </div>
  );
}
