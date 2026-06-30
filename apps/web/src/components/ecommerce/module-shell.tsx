"use client";

import Link from "next/link";
import { FeatureLocked } from "@/components/features/feature-gate";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import type { FeatureAccessItem } from "@/redux/api/feature-api";

export function EcommerceModuleShell({
  title,
  description,
  feature,
  billingHref,
  currentPlan,
  comingSoon,
  children,
}: {
  title: string;
  description?: string;
  feature?: FeatureAccessItem;
  billingHref: string;
  currentPlan?: string;
  comingSoon?: boolean;
  children: React.ReactNode;
}) {
  if (feature?.locked) {
    return <FeatureLocked feature={feature} billingHref={billingHref} currentPlan={currentPlan} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
        {comingSoon && <ComingSoonBadge />}
      </div>
      {comingSoon ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
          <p className="text-sm text-zinc-600">This module is visible in your dashboard and will unlock as rollout continues.</p>
          <Link href={billingHref} className="mt-4 inline-block text-sm font-semibold text-zinc-900 underline">
            View plans
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
