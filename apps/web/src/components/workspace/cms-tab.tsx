"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetCmsPagesQuery } from "@/redux/api/cms-api";
import {
  FileText, HelpCircle, Truck, RotateCcw, Ruler, Mail, Shield, Info,
  ExternalLink, Loader2, Eye, EyeOff,
} from "lucide-react";

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

export function CmsTab({ storeId, storeSlug }: CmsTabProps) {
  const router = useRouter();
  const { data, isLoading } = useGetCmsPagesQuery(storeId);
  const pages = data?.data?.pages ?? [];
  const buildCmsPath = (slug: string) => {
    if (!storeSlug) return "#";
    return slug === "faq" ? `/store/${storeSlug}/cms/faqs` : `/store/${storeSlug}/cms/${slug}`;
  };

  const pageList = useMemo(
    () =>
      Object.entries(pageMeta).map(([slug, meta]) => {
        const existing = pages.find((p) => p.slug === slug);
        return { slug, ...meta, published: existing?.published ?? false, exists: !!existing };
      }),
    [pages]
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pageList.map((page, i) => {
          const Icon = page.icon;
          return (
            <motion.button
              key={page.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                router.push(buildCmsPath(page.slug));
              }}
              className="group relative overflow-hidden rounded-apple-lg border border-apple-hairline bg-white p-5 text-left transition-all hover: hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  {page.published ? (
                    <Eye className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                  )}
                  <ExternalLink className="h-3.5 w-3.5 text-apple-ink-muted-48 transition-colors group-hover:text-blue-500" />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-apple-ink">{page.label}</h3>
              <p className="mt-1 text-xs text-apple-ink-muted-48">/{page.slug}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  page.published ? "bg-emerald-50 text-emerald-700" : "bg-apple-canvas-parchment text-apple-ink-muted-48"
                }`}>
                  {page.published ? "Published" : "Draft"}
                </span>
                {!page.exists && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                    Auto-create
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Contact settings quick entry */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => storeSlug && router.push(`/store/${storeSlug}/cms/contact`)}
        className="group relative w-full overflow-hidden rounded-apple-lg border border-apple-hairline bg-white p-5 text-left transition-all hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-apple-ink">Contact information</h3>
            <p className="text-xs text-apple-ink-muted-48">Email, phone, address, hours & social links for your contact page.</p>
          </div>
          <ExternalLink className="h-5 w-5 text-apple-ink-muted-48 transition-colors group-hover:text-emerald-500" />
        </div>
      </motion.button>

      {/* FAQ quick entry */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => router.push(buildCmsPath("faq"))}
        className="group relative w-full overflow-hidden rounded-apple-lg border border-dashed border-zinc-300 bg-white p-5 text-left transition-all hover: hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <HelpCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-apple-ink">Manage FAQ Items</h3>
            <p className="text-xs text-apple-ink-muted-48">Create and manage Q&A entries for your store.</p>
          </div>
          <ExternalLink className="h-5 w-5 text-apple-ink-muted-48 group-hover:text-purple-500 transition-colors" />
        </div>
      </motion.button>
    </div>
  );
}
