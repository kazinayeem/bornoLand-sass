"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, HelpCircle, Shield, Truck, RotateCcw, Ruler } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import type { CmsPageData } from "@/lib/cms-page-types";
import type { LucideIcon } from "lucide-react";
import { getApiUrl } from "@/lib/urls";

const ICON_MAP = {
  help: HelpCircle,
  file: FileText,
  shield: Shield,
  truck: Truck,
  returns: RotateCcw,
  ruler: Ruler,
} as const;

type CmsPageViewProps = {
  slug: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconName?: keyof typeof ICON_MAP;
  initialPage?: CmsPageData | null;
};

export default function CmsPageView({ slug, title, description, icon: IconProp, iconName, initialPage }: CmsPageViewProps) {
  const { store, theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;
  const DisplayIcon = IconProp ?? (iconName ? ICON_MAP[iconName] : FileText);

  const [page, setPage] = useState<CmsPageData | null>(initialPage ?? null);
  const [loading, setLoading] = useState(!initialPage);

  useEffect(() => {
    if (initialPage || !store._id) return;
    setLoading(true);
    const apiUrl = getApiUrl();
    if (!apiUrl) return;
    fetch(`${apiUrl}/public/page/${slug}?storeId=${store._id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.page) {
          setPage(json.data.page);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id, slug, initialPage]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
        </div>
      </div>
    );
  }

  if (page?.html) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-zinc max-w-none"
          style={{
            color: isDark ? "#a1a1aa" : "#52525b",
            "--tw-prose-headings": isDark ? "#fafafa" : "#18181b",
            "--tw-prose-links": primaryColor,
            "--tw-prose-bold": isDark ? "#fafafa" : "#18181b",
            "--tw-prose-quotes": isDark ? "#a1a1aa" : "#52525b",
            "--tw-prose-code": isDark ? "#fafafa" : "#18181b",
            "--tw-prose-pre-bg": isDark ? "#27272a" : "#f4f4f5",
            "--tw-prose-pre-code": isDark ? "#fafafa" : "#18181b",
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        {(IconProp || iconName) && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${primaryColor}12` }}>
            <DisplayIcon className="h-6 w-6" style={{ color: primaryColor }} />
          </div>
        )}
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{title}</h1>
        {description && (
          <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{description}</p>
        )}
      </div>
      <div className="rounded-2xl border p-8 text-center"
        style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
        <FileText className="mx-auto h-8 w-8" style={{ color: isDark ? "#52525b" : "#a1a1aa" }} />
        <p className="mt-2 text-sm" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>
          No content published yet. Check back soon.
        </p>
      </div>
    </div>
  );
}
