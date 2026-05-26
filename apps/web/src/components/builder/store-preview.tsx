"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { TenantProvider } from "@/providers/tenant-provider";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

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
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300"
        style={{
          width: previewWidth,
          maxWidth: "100%",
          fontFamily: theme.font,
          backgroundColor: theme.darkMode ? "#000000" : "#ffffff",
          color: theme.darkMode ? "#fafafa" : "#18181b"
        }}>
        <TenantProvider value={{ store, theme, products, categories, settings, sliders, pageSections: sections }}>
          <StoreNavbar />
          <StorefrontCanvas sections={navSections} />
          <StoreFooter section={footerSection ?? undefined} />
        </TenantProvider>
      </div>
    </div>
  );
}
