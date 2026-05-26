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
    <div className="flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#e4e4e7", minHeight: "100%" }}>
      {device !== "desktop" && (
        <div className="relative" style={{ width: previewWidth + 24, maxWidth: "100%" }}>
          <div className="absolute inset-x-0 top-0 z-20 mx-auto h-5 w-32 rounded-b-xl bg-zinc-900 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            <span className="h-1.5 w-6 rounded-full bg-zinc-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-zinc-900 bg-white shadow-2xl transition-all duration-300"
            style={{
              width: previewWidth + 12,
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
      )}
      {device === "desktop" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300"
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
      )}
    </div>
  );
}
