"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { FeatureAccessItem } from "@/redux/api/feature-api";

export function FeatureLocked({
  feature,
  billingHref,
  currentPlan,
}: {
  feature: FeatureAccessItem;
  billingHref: string;
  currentPlan?: string;
}) {
  const planLabel = feature.requiredPlan?.name ?? "a higher plan";
  const isLimit = feature.type === "limit" && feature.lockReason === "limit_reached";
  const isTier = feature.type === "tier";

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-gradient-to-b from-zinc-50/80 to-white px-6 py-16 text-center shadow-xs">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-8 ring-amber-500/5">
        <Lock className="h-6 w-6" />
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
        <Lock className="h-3 w-3" />
        <span>Plan Upgrade Required</span>
      </div>
      <h3 className="mt-3 text-xl font-bold tracking-tight text-apple-ink">{feature.name}</h3>
      {feature.description && (
        <p className="mt-1.5 max-w-md text-sm text-apple-ink-muted-48">
          {feature.description}
        </p>
      )}
      {currentPlan && (
        <p className="mt-2 text-xs text-apple-ink-muted-48">
          Current plan: <span className="font-semibold text-apple-ink">{currentPlan}</span>
        </p>
      )}
      <div className="mt-4 max-w-sm rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-xs text-apple-ink-muted-80">
        {isLimit ? (
          <p>
            You have reached the limit (<span className="font-semibold text-apple-ink">{feature.current} / {feature.limit}</span>). Upgrade your plan to increase limit.
          </p>
        ) : isTier ? (
          <p>
            Requires <span className="font-semibold text-apple-ink">{planLabel}</span> or higher.
          </p>
        ) : (
          <p>
            This feature is unlocked in <span className="font-semibold text-apple-ink">{planLabel}</span> and higher plans.
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={billingHref}
          className="inline-flex items-center gap-2 rounded-xl bg-apple-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-apple-primary/90 transition-colors"
        >
          <span>Upgrade Plan</span>
        </Link>
        <Link
          href={billingHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-apple-hairline bg-white px-4 py-2.5 text-sm font-medium text-apple-ink hover:bg-zinc-50 transition-colors"
        >
          <span>View All Plans</span>
        </Link>
      </div>
    </div>
  );
}

export function LimitBanner({
  feature,
  billingHref,
}: {
  feature: FeatureAccessItem;
  billingHref: string;
}) {
  if (feature.type !== "limit" || feature.limit === 0) return null;
  if (feature.current < feature.limit) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-sm text-amber-900">
        <span className="font-semibold">Limit reached.</span> {feature.name}: {feature.current}/{feature.limit}
        {feature.unit ? ` ${feature.unit}` : ""}. Upgrade your subscription to continue.
      </p>
      <Link href={billingHref} className="text-sm font-semibold text-amber-900 underline">
        Upgrade
      </Link>
    </div>
  );
}

export function UpgradeModal({
  open,
  onClose,
  feature,
  currentPlan,
  billingHref,
}: {
  open: boolean;
  onClose: () => void;
  feature: FeatureAccessItem;
  currentPlan?: string;
  billingHref: string;
}) {
  if (!open) return null;

  const isLimit = feature.type === "limit" && feature.lockReason === "limit_reached";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
          <Lock className="h-5 w-5 text-apple-ink-muted-80" />
        </div>
        <h2 className="text-xl font-semibold text-apple-ink">
          {isLimit ? `${feature.name} limit reached` : `Upgrade to unlock ${feature.name}`}
        </h2>
        {currentPlan && (
          <p className="mt-1 text-sm text-apple-ink-muted-48">
            Current plan: <span className="font-medium">{currentPlan}</span>
          </p>
        )}
        {isLimit ? (
          <p className="mt-3 text-sm text-apple-ink-muted-80">
            You have used <span className="font-semibold">{feature.current}/{feature.limit}</span>.
            Upgrade to increase your limit.
          </p>
        ) : feature.requiredPlan ? (
          <p className="mt-3 text-sm text-apple-ink-muted-80">
            Available from <span className="font-semibold">{feature.requiredPlan.name}</span>
            {feature.requiredPlan.priceBDT ? ` — ৳${feature.requiredPlan.priceBDT}/mo` : ""}
          </p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <Link
            href={billingHref}
            className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-center text-sm font-semibold text-white"
          >
            Upgrade
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-apple-ink-muted-80"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
