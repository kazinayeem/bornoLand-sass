import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SectionData } from "./section-renderer";
import "@/lib/section-library-catalog";

const registry = new Map<string, ComponentType<{ section: SectionData }>>();

/** Register a section component for the given type(s). */
export function registerSectionComponent(
  types: string | string[],
  component: ComponentType<{ section: SectionData }>,
): void {
  for (const t of Array.isArray(types) ? types : [types]) {
    registry.set(t, component);
  }
}

/** Look up a section component by normalized type. Returns undefined for aliases that should fall through. */
export function getSectionComponent(type: string): ComponentType<{ section: SectionData }> | undefined {
  return registry.get(type);
}

// ─── Hero ───────────────────────────────────────────────────────────────────
registerSectionComponent("hero-banner", dynamic(() => import("./hero-banner").then((m) => ({ default: m.HeroBanner })), { ssr: false }));
registerSectionComponent("split-hero", dynamic(() => import("./split-hero").then((m) => ({ default: m.SplitHero })), { ssr: false }));
registerSectionComponent("video-hero", dynamic(() => import("./video-hero").then((m) => ({ default: m.VideoHero })), { ssr: false }));
registerSectionComponent("slider-hero", dynamic(() => import("./slider-hero").then((m) => ({ default: m.SliderHero })), { ssr: false }));
registerSectionComponent("image-hero", dynamic(() => import("./image-hero").then((m) => ({ default: m.ImageHero })), { ssr: false }));
registerSectionComponent("fullscreen-hero", dynamic(() => import("./fullscreen-hero").then((m) => ({ default: m.FullscreenHero })), { ssr: false }));
registerSectionComponent("countdown-hero", dynamic(() => import("./countdown-hero").then((m) => ({ default: m.CountdownHero })), { ssr: false }));
registerSectionComponent("flash-sale-hero", dynamic(() => import("./flash-sale-hero").then((m) => ({ default: m.FlashSaleHero })), { ssr: false }));
registerSectionComponent("product-hero", dynamic(() => import("./product-hero").then((m) => ({ default: m.ProductHero })), { ssr: false }));

// ─── Products ───────────────────────────────────────────────────────────────
registerSectionComponent("featured-products", dynamic(() => import("./featured-products").then((m) => ({ default: m.FeaturedProducts })), { ssr: false }));
registerSectionComponent("new-arrivals", dynamic(() => import("./new-arrivals").then((m) => ({ default: m.NewArrivals })), { ssr: false }));
registerSectionComponent("best-sellers", dynamic(() => import("./best-sellers").then((m) => ({ default: m.BestSellers })), { ssr: false }));
registerSectionComponent("trending-products", dynamic(() => import("./trending-products").then((m) => ({ default: m.TrendingProducts })), { ssr: false }));
registerSectionComponent("flash-sale", dynamic(() => import("./flash-sale").then((m) => ({ default: m.FlashSale })), { ssr: false }));
registerSectionComponent("product-grid", dynamic(() => import("./product-grid").then((m) => ({ default: m.ProductGrid })), { ssr: false }));
registerSectionComponent("product-carousel", dynamic(() => import("./product-carousel").then((m) => ({ default: m.ProductCarousel })), { ssr: false }));
registerSectionComponent("product-slider", dynamic(() => import("./product-slider").then((m) => ({ default: m.ProductSlider })), { ssr: false }));
registerSectionComponent("product-tabs", dynamic(() => import("./product-tabs").then((m) => ({ default: m.ProductTabs })), { ssr: false }));

// ─── Categories ─────────────────────────────────────────────────────────────
registerSectionComponent(
  ["category-grid", "featured-categories", "mega-category-grid"],
  dynamic(() => import("./category-grid").then((m) => ({ default: m.CategoryGrid })), { ssr: false }),
);
registerSectionComponent("category-slider", dynamic(() => import("./category-slider").then((m) => ({ default: m.CategorySlider })), { ssr: false }));

// ─── Promotions ─────────────────────────────────────────────────────────────
registerSectionComponent(
  ["discount-banner", "offer-banner", "bogo"],
  dynamic(() => import("./discount-banner").then((m) => ({ default: m.DiscountBanner })), { ssr: false }),
);
registerSectionComponent("deal-of-day", dynamic(() => import("./deal-of-day").then((m) => ({ default: m.DealOfDay })), { ssr: false }));

// ─── Trust ──────────────────────────────────────────────────────────────────
registerSectionComponent("testimonials", dynamic(() => import("./testimonials").then((m) => ({ default: m.Testimonials })), { ssr: false }));
registerSectionComponent(
  ["trust-badges", "guarantee-section"],
  dynamic(() => import("./trust-badges").then((m) => ({ default: m.TrustBadges })), { ssr: false }),
);
registerSectionComponent("why-choose-us", dynamic(() => import("./why-choose-us").then((m) => ({ default: m.WhyChooseUs })), { ssr: false }));

// ─── Content ────────────────────────────────────────────────────────────────
registerSectionComponent("rich-text", dynamic(() => import("./rich-text").then((m) => ({ default: m.RichText })), { ssr: false }));
registerSectionComponent("faq", dynamic(() => import("./faq-section").then((m) => ({ default: m.FAQSection })), { ssr: false }));
registerSectionComponent("accordion", dynamic(() => import("./accordion").then((m) => ({ default: m.Accordion })), { ssr: false }));
registerSectionComponent("team-members", dynamic(() => import("./team-members").then((m) => ({ default: m.TeamMembers })), { ssr: false }));

// ─── Media ──────────────────────────────────────────────────────────────────
registerSectionComponent("image-banner", dynamic(() => import("./image-banner").then((m) => ({ default: m.ImageBanner })), { ssr: false }));
registerSectionComponent("image-carousel", dynamic(() => import("./image-carousel").then((m) => ({ default: m.ImageCarousel })), { ssr: false }));
registerSectionComponent(
  ["gallery", "image-grid", "masonry-gallery"],
  dynamic(() => import("./gallery").then((m) => ({ default: m.Gallery })), { ssr: false }),
);
registerSectionComponent("before-after", dynamic(() => import("./before-after").then((m) => ({ default: m.BeforeAfter })), { ssr: false }));
registerSectionComponent(
  ["google-map", "contact-google-map"],
  dynamic(() => import("./google-map").then((m) => ({ default: m.GoogleMapSection })), { ssr: false }),
);
registerSectionComponent(
  ["contact-section", "contact-store-location", "contact-cards"],
  dynamic(() => import("./google-map").then((m) => ({ default: m.ContactSection })), { ssr: false }),
);
registerSectionComponent(
  ["video-section", "youtube-embed", "vimeo-embed"],
  dynamic(() => import("./video-section").then((m) => ({ default: m.VideoSection })), { ssr: false }),
);

// ─── Social ─────────────────────────────────────────────────────────────────
registerSectionComponent("instagram-feed", dynamic(() => import("./instagram-feed").then((m) => ({ default: m.InstagramFeed })), { ssr: false }));

// ─── Marketing ──────────────────────────────────────────────────────────────
registerSectionComponent(
  ["newsletter", "email-capture"],
  dynamic(() => import("./newsletter").then((m) => ({ default: m.Newsletter })), { ssr: false }),
);
registerSectionComponent("announcement-bar", dynamic(() => import("./announcement-bar").then((m) => ({ default: m.AnnouncementBar })), { ssr: false }));

// ─── Advanced ───────────────────────────────────────────────────────────────
registerSectionComponent("countdown-timer", dynamic(() => import("./countdown-timer").then((m) => ({ default: m.CountdownTimer })), { ssr: false }));

// ─── Header ─────────────────────────────────────────────────────────────────
registerSectionComponent(
  [
    "header-bar",
    "header-minimal", "header-modern", "header-center-logo", "header-mega",
    "header-transparent", "header-sticky", "header-luxury", "header-fashion",
    "header-electronics", "header-grocery", "header-mobile", "header-search-focus",
    "header-brand", "header-marketplace", "header-light", "header-split",
  ],
  dynamic(() => import("./header-bar").then((m) => ({ default: m.HeaderBar })), { ssr: false }),
);
registerSectionComponent("header-logo", dynamic(() => import("./header-logo").then((m) => ({ default: m.HeaderLogo })), { ssr: false }));
registerSectionComponent("header-nav", dynamic(() => import("./header-nav").then((m) => ({ default: m.HeaderNav })), { ssr: false }));
registerSectionComponent("header-icons", dynamic(() => import("./header-icons").then((m) => ({ default: m.HeaderIcons })), { ssr: false }));

// ─── Footer ─────────────────────────────────────────────────────────────────
registerSectionComponent(
  [
    "simple-footer",
    "footer-simple-light", "footer-luxury", "footer-dark", "footer-minimal-light",
    "footer-split", "footer-social-focus",
  ],
  dynamic(() => import("./simple-footer").then((m) => ({ default: m.SimpleFooter })), { ssr: false }),
);
registerSectionComponent(
  [
    "ecommerce-footer", "mega-footer", "multi-column-footer",
    "footer-ecommerce", "footer-newsletter", "footer-multi-column", "footer-brand",
    "footer-corporate", "footer-marketplace", "footer-contact-heavy", "footer-payment",
    "footer-wide", "footer-store-info",
  ],
  dynamic(() => import("./ecommerce-footer").then((m) => ({ default: m.EcommerceFooter })), { ssr: false }),
);
registerSectionComponent("footer-links", dynamic(() => import("./footer-links").then((m) => ({ default: m.FooterLinks })), { ssr: false }));
registerSectionComponent("footer-social", dynamic(() => import("./footer-social").then((m) => ({ default: m.FooterSocial })), { ssr: false }));
registerSectionComponent("footer-copyright", dynamic(() => import("./footer-copyright").then((m) => ({ default: m.FooterCopyright })), { ssr: false }));
