"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, HelpCircle, Shield, Truck, RotateCcw, Ruler } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { useTrackCmsPageView } from "@/hooks/use-analytics-tracker";
import type { CmsPageData } from "@/lib/cms-page-types";
import type { LucideIcon } from "lucide-react";
import { getApiUrl } from "@/lib/urls";
import { StorefrontPage, useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";

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
  useTrackCmsPageView(slug, title);

  const { store } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
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
      <StorefrontPage maxWidth="sm">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-apple-primary" style={{ color: primaryColor }} />
        </div>
      </StorefrontPage>
    );
  }

  if (page?.html) {
    return (
      <StorefrontPage maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="storefront-prose prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </StorefrontPage>
    );
  }

  return (
    <StorefrontPage maxWidth="sm">
      <div className="mb-12 text-center">
        {(IconProp || iconName) && (
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-apple-lg"
            style={{ backgroundColor: `${primaryColor}12` }}
          >
            <DisplayIcon className="h-6 w-6 text-apple-primary" style={{ color: primaryColor }} />
          </div>
        )}
        <h1 className={cn("text-display-md", classes.heading)}>{title}</h1>
        {description && <p className={cn("mt-2 text-body", classes.muted)}>{description}</p>}
      </div>
      <div className={cn("p-8 text-center", classes.card)}>
        <FileText className={cn("mx-auto h-8 w-8", classes.muted)} />
        <p className={cn("mt-2 text-caption", classes.muted)}>No content published yet. Check back soon.</p>
      </div>
    </StorefrontPage>
  );
}
