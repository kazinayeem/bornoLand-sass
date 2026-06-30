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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200">
        <Lock className="h-6 w-6 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">{feature.name}</h3>
      {currentPlan && (
        <p className="mt-1 text-sm text-zinc-500">
          Current plan: <span className="font-medium">{currentPlan}</span>
        </p>
      )}
      {isLimit ? (
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          <span className="font-semibold text-zinc-700">
            {feature.current} / {feature.limit} used
          </span>
          . Upgrade to increase your limit.
        </p>
      ) : isTier ? (
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Requires <span className="font-medium text-zinc-700">{planLabel}</span>
        </p>
      ) : (
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Available in <span className="font-medium text-zinc-700">{planLabel}</span>
        </p>
      )}
      <Link
        href={billingHref}
        className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Upgrade Now
      </Link>
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
          <Lock className="h-5 w-5 text-zinc-700" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900">
          {isLimit ? `${feature.name} limit reached` : `Upgrade to unlock ${feature.name}`}
        </h2>
        {currentPlan && (
          <p className="mt-1 text-sm text-zinc-500">
            Current plan: <span className="font-medium">{currentPlan}</span>
          </p>
        )}
        {isLimit ? (
          <p className="mt-3 text-sm text-zinc-600">
            You have used <span className="font-semibold">{feature.current}/{feature.limit}</span>.
            Upgrade to increase your limit.
          </p>
        ) : feature.requiredPlan ? (
          <p className="mt-3 text-sm text-zinc-600">
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
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
