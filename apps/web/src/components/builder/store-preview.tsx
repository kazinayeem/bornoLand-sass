"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { setHoveredSection, setSelectedSection } from "@/redux/slices/builder-slice";
import { normalizeSectionType } from "@/lib/section-registry";

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
  const dispatch = useDispatch();
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const hoveredSectionId = useSelector((s: RootState) => s.builder.hoveredSectionId);
  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 820 : 1280;

  const footerSection = sections.find((s) => ["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type))) ?? null;
  const navSections = sections.filter((s) => !["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type)));

  return (
    <div className="flex items-start justify-center overflow-y-auto p-6"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#f4f4f5", minHeight: "100%" }}>
      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_90px_-32px_rgba(0,0,0,0.35)] transition-all duration-300"
        style={{ width: previewWidth, maxWidth: "100%", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
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
          <StorefrontCanvas
            sections={navSections}
            selectedSectionId={selectedSectionId}
            hoveredSectionId={hoveredSectionId}
            onSelectSection={(sectionId) => dispatch(setSelectedSection(sectionId))}
            onHoverSection={(sectionId) => dispatch(setHoveredSection(sectionId))}
          />
        </StorefrontFrame>
      </div>
    </div>
  );
}
