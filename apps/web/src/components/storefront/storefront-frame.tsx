"use client";

import { useMemo, type ReactNode } from "react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import type {
  CategoryData,
  HomepageSliderData,
  ProductData,
  StoreData,
  StoreSettingsData,
  ThemeData,
} from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

type StorefrontFrameProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  pageSections: StorefrontSectionLike[];
  headerSections?: StorefrontSectionLike[];
  footerSections?: StorefrontSectionLike[];
  footerSection?: StorefrontSectionLike | null;
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  navLinksOverride?: Array<{ name: string; href: string }>;
  adminBarStoreId?: string;
  showAdminBar?: boolean;
  children: ReactNode;
};

export function StorefrontFrame({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  pageSections,
  headerSections,
  footerSections,
  footerSection,
  headerSettings,
  footerSettings,
  navLinksOverride,
  showAdminBar = false,
  children,
}: StorefrontFrameProps) {
  const stableProducts = useMemo(() => products, [products]);
  const stableCategories = useMemo(() => categories, [categories]);
  const stableSliders = useMemo(() => sliders, [sliders]);
  const stableSections = useMemo(() => pageSections, [pageSections]);

  return (
    <StorefrontShell
      store={store}
      theme={theme}
      products={stableProducts}
      categories={stableCategories}
      settings={settings}
      sliders={stableSliders}
      pageSections={stableSections}
      headerSections={headerSections}
      footerSections={footerSections}
      footerSection={footerSection}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      navLinksOverride={navLinksOverride}
      showAdminBar={showAdminBar}
    >
      {children}
    </StorefrontShell>
  );
}
