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
          <h1 className="text-xl font-semibold text-apple-ink">{title}</h1>
          {description && <p className="mt-1 text-sm text-apple-ink-muted-48">{description}</p>}
        </div>
        {comingSoon && <ComingSoonBadge />}
      </div>
      {comingSoon ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-apple-ink">Upcoming</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-apple-ink-muted-48">
            This feature is on the way. Please wait — we&apos;re rolling it out soon.
          </p>
          <Link href={billingHref} className="mt-6 text-sm font-semibold text-apple-ink-muted-80 underline hover:text-apple-ink">
            View plans
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
