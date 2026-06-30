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
  footerSection?: StorefrontSectionLike | null;
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
  footerSection,
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
      footerSection={footerSection}
      showAdminBar={showAdminBar}
    >
      {children}
    </StorefrontShell>
  );
}
