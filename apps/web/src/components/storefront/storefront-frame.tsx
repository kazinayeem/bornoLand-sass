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
  NavigationData,
} from "@/providers/tenant-provider";
import type { PublicStoreTracking } from "@/lib/tracking/types";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

type StorefrontFrameProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  navigations?: NavigationData[];
  tracking?: PublicStoreTracking | null;
  pageSections: StorefrontSectionLike[];
  headerSections?: StorefrontSectionLike[];
  footerSections?: StorefrontSectionLike[];
  footerSection?: StorefrontSectionLike | null;
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  navLinksOverride?: Array<{ name: string; href: string }>;
  adminBarStoreId?: string;
  showAdminBar?: boolean;
  builderMode?: boolean;
  children: ReactNode;
};

export function StorefrontFrame({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  navigations,
  tracking = null,
  pageSections,
  headerSections,
  footerSections,
  footerSection,
  headerSettings,
  footerSettings,
  navLinksOverride,
  showAdminBar = false,
  builderMode = false,
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
      navigations={navigations}
      tracking={tracking}
      pageSections={stableSections}
      headerSections={headerSections}
      footerSections={footerSections}
      footerSection={footerSection}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      navLinksOverride={navLinksOverride}
      showAdminBar={showAdminBar}
      builderMode={builderMode}
    >
      {children}
    </StorefrontShell>
  );
}
