"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetCmsPagesQuery } from "@/redux/api/cms-api";
import {
  FileText, HelpCircle, Truck, RotateCcw, Ruler, Mail, Shield, Info, Loader2,
} from "lucide-react";
import { useStorePage } from "@/components/store-dashboard/store-page";
import {
  buildSettingsContactHref,
  buildSettingsContentHref,
  buildSettingsFaqItemsHref,
  buildSettingsFaqPageHref,
} from "@/lib/settings-content-routes";
import { SettingsContentCard } from "@/components/workspace/settings-content-card";

type CmsTabProps = { storeId: string; storeSlug?: string };

const pageMeta: Record<string, { label: string; icon: typeof FileText }> = {
  faq: { label: "FAQ", icon: HelpCircle },
  "shipping-info": { label: "Shipping Info", icon: Truck },
  returns: { label: "Returns Policy", icon: RotateCcw },
  "size-guide": { label: "Size Guide", icon: Ruler },
  "contact-us": { label: "Contact Us", icon: Mail },
  "privacy-policy": { label: "Privacy Policy", icon: Shield },
  "terms-conditions": { label: "Terms & Conditions", icon: FileText },
  "about-us": { label: "About Us", icon: Info },
};

export function CmsTab({ storeId, storeSlug: storeSlugProp }: CmsTabProps) {
  const params = useParams();
  const { store } = useStorePage();
  const storeSlug =
    storeSlugProp ||
    (typeof params.storeSlug === "string" ? params.storeSlug : "") ||
    store?.slug ||
    "";

  const { data, isLoading, isFetching } = useGetCmsPagesQuery(storeId);
  const pages = data?.data?.pages ?? [];

  const pageList = useMemo(
    () =>
      Object.entries(pageMeta).map(([slug, meta]) => {
        const existing = pages.find((p) => p.slug === slug);
        return {
          slug,
          href:
            slug === "faq"
              ? storeSlug
                ? buildSettingsFaqPageHref(storeSlug)
                : "#"
              : storeSlug
                ? buildSettingsContentHref(storeSlug, slug)
                : "#",
          ...meta,
          published: existing?.published ?? false,
          exists: !!existing,
        };
      }),
    [pages, storeSlug],
  );

  const contactHref = storeSlug ? buildSettingsContactHref(storeSlug) : "#";
  const faqItemsHref = storeSlug ? buildSettingsFaqItemsHref(storeSlug) : "#";

  if (isLoading && !pages.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(pageMeta).map((slug) => (
            <div
              key={slug}
              className="h-36 animate-pulse rounded-apple-lg border border-apple-hairline bg-apple-canvas-parchment"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFetching && !isLoading ? (
        <p className="text-xs text-apple-ink-muted-48">Refreshing pages…</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pageList.map((page, i) => {
          const Icon = page.icon;
          return (
            <SettingsContentCard
              key={page.slug}
              href={page.href}
              title={page.label}
              subtitle={`/${page.slug}`}
              icon={Icon}
              published={page.published}
              exists={page.exists}
              index={i}
            />
          );
        })}
      </div>

      <SettingsContentCard
        href={contactHref}
        title="Contact information"
        subtitle="Email, phone, address, hours & social links for your contact page."
        icon={Mail}
        iconWrapClassName="bg-emerald-100"
        iconClassName="h-6 w-6 text-emerald-600"
        layout="row"
        index={pageList.length}
        className="border-apple-hairline"
      />

      <SettingsContentCard
        href={faqItemsHref}
        title="Manage FAQ Items"
        subtitle="Create and manage Q&A entries for your store."
        icon={HelpCircle}
        iconWrapClassName="bg-purple-100"
        iconClassName="h-6 w-6 text-purple-600"
        layout="row"
        index={pageList.length + 1}
        className="border-dashed border-zinc-300"
      />
    </div>
  );
}
