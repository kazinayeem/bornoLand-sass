"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import type { LucideIcon } from "lucide-react";
import { config } from "@/lib/config";

type CmsPage = {
  _id: string;
  storeId: string;
  slug: string;
  title: string;
  html: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  published: boolean;
  layout: string;
};

type CmsPageViewProps = {
  slug: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
};

export default function CmsPageView({ slug, title, description, icon: Icon }: CmsPageViewProps) {
  const { store, theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;
  const DisplayIcon = Icon ?? FileText;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store._id) return;
    setLoading(true);
    const apiUrl = config.apiUrl;
    fetch(`${apiUrl}/public/page/${slug}?storeId=${store._id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.page) {
          setPage(json.data.page);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id, slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
          <DisplayIcon className="mx-auto h-12 w-12" style={{ color: isDark ? "#3f3f46" : "#d4d4d8" }} />
          <h2 className="mt-4 text-xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{title}</h2>
          {description && <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>{description}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
          {title}
        </span>
        {page.seoTitle && (
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {page.seoTitle}
          </h1>
        )}
        {page.seoDescription && (
          <p className="mt-3 text-lg" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
            {page.seoDescription}
          </p>
        )}
        <div className="mt-8 prose prose-zinc max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.html }}
          style={{ color: isDark ? "#d4d4d8" : "#52525b" }} />
      </motion.article>
    </div>
  );
}
