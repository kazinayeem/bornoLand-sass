"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";

type StorePreviewProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  sections: StorefrontSectionLike[];
};

export function StorePreview({ store, theme, products, categories, settings, sliders, sections }: StorePreviewProps) {
  const device = useSelector((s: RootState) => s.preview.device);
  const previewWidth = device === "mobile" ? 375 : device === "tablet" ? 768 : 1280;

  const footerSection = sections.find((s) => s.type === "footer") ?? null;
  const navSections = sections.filter((s) => s.type !== "footer");

  return (
    <div className="flex items-start justify-center overflow-y-auto p-4"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#f4f4f5", minHeight: "100%" }}>
      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_90px_-32px_rgba(0,0,0,0.35)] transition-all duration-300"
        style={{ width: previewWidth, maxWidth: "100%" }}>
        <StorefrontFrame
          store={store}
          theme={theme}
          products={products}
          categories={categories}
          settings={settings}
          sliders={sliders}
          pageSections={sections}
          footerSection={footerSection}
        >
          <StorefrontCanvas sections={navSections} />
        </StorefrontFrame>
      </div>
    </div>
  );
}
