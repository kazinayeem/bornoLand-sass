"use client";

import { HeroEditor } from "./hero-editor";
import { GalleryEditor } from "./gallery-editor";
import { BeforeAfterEditor } from "./before-after-editor";
import { VideoEditor } from "./video-editor";
import { TestimonialsEditor, TeamEditor, LogoCloudEditor } from "./list-editors";
import { ProductSectionEditor } from "./product-editor";
import { CategorySectionEditor } from "./category-editor";
import { BrandSectionEditor } from "./brand-editor";
import { ContactEditor, GoogleMapEditor } from "./contact-editor";
import type { SectionEditorEntry } from "./types";
import { normalizeSectionType } from "@/lib/section-registry";

const HERO_TYPES = [
  "hero-banner", "split-hero", "video-hero", "slider-hero", "image-hero",
  "fullscreen-hero", "countdown-hero", "flash-sale-hero", "product-hero",
];

const PRODUCT_TYPES = [
  "featured-products", "new-arrivals", "best-sellers", "trending-products",
  "flash-sale", "product-grid", "product-carousel", "product-slider",
  "product-tabs", "product-collection", "product-by-category",
  "recently-viewed", "recommended-products", "related-products", "bundle-products",
];

const CATEGORY_TYPES = [
  "category-grid", "category-slider", "category-showcase", "categories", "featured-categories",
];

const BRAND_TYPES = [
  "brand-showcase", "brand-grid", "brand-slider", "brands", "featured-brands",
];

const VIDEO_TYPES = ["video-section", "youtube-embed", "vimeo-embed", "tiktok-embed"];

const GALLERY_TYPES = ["gallery", "image-grid", "masonry-gallery"];

const entries: Record<string, SectionEditorEntry> = {};

for (const type of HERO_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "animation", "advanced"], Component: HeroEditor };
}
for (const type of PRODUCT_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: ProductSectionEditor };
}
for (const type of CATEGORY_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: CategorySectionEditor };
}
for (const type of BRAND_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: BrandSectionEditor };
}
for (const type of VIDEO_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: VideoEditor };
}
for (const type of GALLERY_TYPES) {
  entries[type] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: GalleryEditor };
}

entries["before-after"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: BeforeAfterEditor };
entries.testimonials = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: TestimonialsEditor };
entries["video-testimonials"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: TestimonialsEditor };
entries["customer-reviews"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: TestimonialsEditor };
entries["team-members"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: TeamEditor };
entries["guarantee-section"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: LogoCloudEditor };
entries["contact-section"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: ContactEditor };
entries["google-map"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: GoogleMapEditor };
entries["contact-store-location"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: ContactEditor };
entries["contact-google-map"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: GoogleMapEditor };
entries["contact-cards"] = { mode: "replace", tabs: ["style", "layout", "responsive", "advanced"], Component: ContactEditor };

export function getSectionEditor(type: string): SectionEditorEntry | undefined {
  return entries[type] ?? entries[normalizeSectionType(type)];
}

export { entries as sectionEditorRegistry };
