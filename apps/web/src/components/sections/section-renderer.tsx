"use client";

import dynamic from "next/dynamic";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { motion } from "framer-motion";
import type { SectionStyle } from "@/components/storefront/storefront-types";

export type SectionData = {
  id: string;
  type: string;
  label?: string;
  visible?: boolean;
  props: Record<string, string>;
  style?: SectionStyle;
};

// ─── Section wrapper (common styles) ────────────────────────────

type WrapperProps = {
  section: SectionData;
  children: React.ReactNode;
  className?: string;
};

function animationStyle(animation: string) {
  switch (animation) {
    case "fadeIn": return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideUp": return { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideInLeft": return { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideInRight": return { initial: { opacity: 0, x: 40 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "zoomIn": return { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
    default: return {};
  }
}

export function SectionWrapper({ section, children, className = "" }: WrapperProps) {
  const p = section.props;
  const s = section.style;

  // Derived values: prefer section.style over section.props for backward compat
  const visibility = s?.hideOnDesktop ? "desktop-only"
    : s?.hideOnTablet ? "tablet-only"
    : s?.hideOnMobile ? "mobile-only"
    : p.visibility || "all";
  const bgColor = s?.backgroundColor || p.bgColor || "";
  const bgGradient = s?.backgroundGradient || p.bgGradient || "";
  const bgImage = p.bgImage || "";
  const paddingTop = s?.paddingTop ?? p.paddingTop ?? "0";
  const paddingBottom = s?.paddingBottom ?? p.paddingBottom ?? "0";
  const paddingLeft = s?.paddingLeft ?? p.paddingLeft ?? "0";
  const paddingRight = s?.paddingRight ?? p.paddingRight ?? "0";
  const marginTop = s?.marginTop ?? p.marginTop ?? "0";
  const marginBottom = s?.marginBottom ?? p.marginBottom ?? "0";
  const marginLeft = s?.marginLeft ?? "auto";
  const marginRight = s?.marginRight ?? "auto";
  const maxWidth = s?.maxWidth || p.maxWidth || "1200px";
  const borderRadius = s?.borderRadius ?? p.borderRadius ?? "0";
  const shadow = s?.shadow || p.shadow || "none";
  const borderWidth = s?.borderWidth ?? p.borderWidth ?? "0";
  const borderColor = s?.borderColor || p.borderColor || "";
  const borderStyle = s?.borderStyle || (borderWidth !== "0" ? "solid" : undefined);
  const opacity = s?.opacity || "";
  const width = s?.width || p.width || "";
  const minHeight = s?.minHeight || p.minHeight || "";
  const animation = s?.animation || p.animation || "none";
  const customCss = s?.customCss || p.customCss || "";

  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "";
  const hiddenClass = visibility === "desktop-only" ? "hidden lg:block" : visibility === "tablet-only" ? "hidden md:block lg:hidden" : visibility === "mobile-only" ? "block md:hidden" : "";

  const bg = bgGradient
    ? `linear-gradient(135deg, ${bgGradient.split(",").map((s: string) => s.trim()).join(", ")})`
    : bgImage
    ? `url(${bgImage})`
    : bgColor || "transparent";
  const isImageBg = bgImage && !bgGradient && !bgColor;

  const animProps = animationStyle(animation);

  return (
    <motion.section
      className={`relative ${hiddenClass} ${shadowClass} ${className}`}
      style={{
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        maxWidth: maxWidth === "100%" ? "100%" : maxWidth,
        background: isImageBg ? undefined : bg,
        borderRadius,
        borderWidth,
        borderStyle,
        borderColor: borderColor || undefined,
        opacity: opacity || undefined,
        width: width || undefined,
        minHeight: minHeight || undefined,
        overflow: "hidden",
      }}
      {...animProps}
    >
      {isImageBg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: bg, zIndex: 0 }}
        />
      )}
      {p.bgOverlayColor && (
        <div
          className="absolute inset-0"
          style={{
            background: p.bgOverlayColor,
            opacity: Number(p.bgOverlayOpacity || 40) / 100,
            zIndex: 1,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </motion.section>
  );
}

// ─── Section title helper ───────────────────────────────────────

export function SectionTitle({ title, subtitle, textColor, textAlignment }: {
  title?: string;
  subtitle?: string;
  textColor?: string;
  textAlignment?: string;
}) {
  if (!title) return null;
  return (
    <div className={`mb-8 sm:mb-10 ${textAlignment === "left" ? "text-left" : textAlignment === "right" ? "text-right" : "text-center"}`}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: textColor || "#18181b" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base" style={{ color: textColor ? `${textColor}cc` : "#52525b" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Column grid helper ──────────────────────────────────────────

export function ColumnGrid({ children, columns = "4", gap = "4", className = "" }: {
  children: React.ReactNode;
  columns?: string;
  gap?: string;
  className?: string;
}) {
  const colMap: Record<string, string> = {
    "2": "grid-cols-2", "3": "grid-cols-3", "4": "grid-cols-4",
    "5": "grid-cols-5", "6": "grid-cols-6",
  };
  const gapMap: Record<string, string> = {
    "4": "gap-1", "8": "gap-2", "16": "gap-4", "24": "gap-6", "32": "gap-8",
  };
  return (
    <div className={`grid ${colMap[columns] || "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"} ${gapMap[gap] || "gap-4"} ${className}`}>
      {children}
    </div>
  );
}

// ─── Lazy-loaded section components ──────────────────────────────

const HeroBanner = dynamic(() => import("./hero-banner").then((m) => ({ default: m.HeroBanner })), { ssr: false });
const SplitHero = dynamic(() => import("./split-hero").then((m) => ({ default: m.SplitHero })), { ssr: false });
const VideoHero = dynamic(() => import("./video-hero").then((m) => ({ default: m.VideoHero })), { ssr: false });
const SliderHero = dynamic(() => import("./slider-hero").then((m) => ({ default: m.SliderHero })), { ssr: false });
const ImageHero = dynamic(() => import("./image-hero").then((m) => ({ default: m.ImageHero })), { ssr: false });
const FullscreenHero = dynamic(() => import("./fullscreen-hero").then((m) => ({ default: m.FullscreenHero })), { ssr: false });
const CountdownHero = dynamic(() => import("./countdown-hero").then((m) => ({ default: m.CountdownHero })), { ssr: false });
const FlashSaleHero = dynamic(() => import("./flash-sale-hero").then((m) => ({ default: m.FlashSaleHero })), { ssr: false });
const ProductHero = dynamic(() => import("./product-hero").then((m) => ({ default: m.ProductHero })), { ssr: false });
const FeaturedProducts = dynamic(() => import("./featured-products").then((m) => ({ default: m.FeaturedProducts })), { ssr: false });
const NewArrivals = dynamic(() => import("./new-arrivals").then((m) => ({ default: m.NewArrivals })), { ssr: false });
const BestSellers = dynamic(() => import("./best-sellers").then((m) => ({ default: m.BestSellers })), { ssr: false });
const TrendingProducts = dynamic(() => import("./trending-products").then((m) => ({ default: m.TrendingProducts })), { ssr: false });
const FlashSale = dynamic(() => import("./flash-sale").then((m) => ({ default: m.FlashSale })), { ssr: false });
const ProductGrid = dynamic(() => import("./product-grid").then((m) => ({ default: m.ProductGrid })), { ssr: false });
const ProductCarousel = dynamic(() => import("./product-carousel").then((m) => ({ default: m.ProductCarousel })), { ssr: false });
const ProductTabs = dynamic(() => import("./product-tabs").then((m) => ({ default: m.ProductTabs })), { ssr: false });
const CategoryGrid = dynamic(() => import("./category-grid").then((m) => ({ default: m.CategoryGrid })), { ssr: false });
const Testimonials = dynamic(() => import("./testimonials").then((m) => ({ default: m.Testimonials })), { ssr: false });
const Newsletter = dynamic(() => import("./newsletter").then((m) => ({ default: m.Newsletter })), { ssr: false });
const FAQSection = dynamic(() => import("./faq-section").then((m) => ({ default: m.FAQSection })), { ssr: false });
const Accordion = dynamic(() => import("./accordion").then((m) => ({ default: m.Accordion })), { ssr: false });
const RichText = dynamic(() => import("./rich-text").then((m) => ({ default: m.RichText })), { ssr: false });
const ImageBanner = dynamic(() => import("./image-banner").then((m) => ({ default: m.ImageBanner })), { ssr: false });
const DiscountBanner = dynamic(() => import("./discount-banner").then((m) => ({ default: m.DiscountBanner })), { ssr: false });
const TrustBadges = dynamic(() => import("./trust-badges").then((m) => ({ default: m.TrustBadges })), { ssr: false });
const WhyChooseUs = dynamic(() => import("./why-choose-us").then((m) => ({ default: m.WhyChooseUs })), { ssr: false });
const TeamMembers = dynamic(() => import("./team-members").then((m) => ({ default: m.TeamMembers })), { ssr: false });
const AnnouncementBar = dynamic(() => import("./announcement-bar").then((m) => ({ default: m.AnnouncementBar })), { ssr: false });
const CountdownTimer = dynamic(() => import("./countdown-timer").then((m) => ({ default: m.CountdownTimer })), { ssr: false });
const InstagramFeed = dynamic(() => import("./instagram-feed").then((m) => ({ default: m.InstagramFeed })), { ssr: false });
const SimpleFooter = dynamic(() => import("./simple-footer").then((m) => ({ default: m.SimpleFooter })), { ssr: false });
const EcommerceFooter = dynamic(() => import("./ecommerce-footer").then((m) => ({ default: m.EcommerceFooter })), { ssr: false });
const CategorySlider = dynamic(() => import("./category-slider").then((m) => ({ default: m.CategorySlider })), { ssr: false });
const ProductSlider = dynamic(() => import("./product-slider").then((m) => ({ default: m.ProductSlider })), { ssr: false });
const DealOfDay = dynamic(() => import("./deal-of-day").then((m) => ({ default: m.DealOfDay })), { ssr: false });
const Gallery = dynamic(() => import("./gallery").then((m) => ({ default: m.Gallery })), { ssr: false });
const VideoSection = dynamic(() => import("./video-section").then((m) => ({ default: m.VideoSection })), { ssr: false });

// ─── Placeholder for unimplemented sections ──────────────────────

function PlaceholderSection({ section }: { section: SectionData }) {
  const def = getSectionDef(section.type);
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
        <span className="text-2xl text-zinc-400">⊞</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-700">{def?.label || section.type}</h3>
      <p className="mt-1 text-sm text-zinc-400">{def?.description || "Section placeholder"}</p>
    </div>
  );
}

// ─── Main renderer ──────────────────────────────────────────────

export function SectionRenderer({ section }: { section: SectionData }) {
  const normalizedType = normalizeSectionType(section.type);
  const normalizedSection = normalizedType === section.type ? section : { ...section, type: normalizedType };
  const def = getSectionDef(normalizedSection.type);
  if (!def) return null;

  // Hero sections
  if (normalizedSection.type === "hero-banner") return <HeroBanner section={normalizedSection} />;
  if (normalizedSection.type === "split-hero") return <SplitHero section={normalizedSection} />;
  if (normalizedSection.type === "video-hero") return <VideoHero section={normalizedSection} />;
  if (normalizedSection.type === "slider-hero") return <SliderHero section={normalizedSection} />;
  if (normalizedSection.type === "image-hero") return <ImageHero section={normalizedSection} />;
  if (normalizedSection.type === "fullscreen-hero") return <FullscreenHero section={normalizedSection} />;
  if (normalizedSection.type === "countdown-hero") return <CountdownHero section={normalizedSection} />;
  if (normalizedSection.type === "flash-sale-hero") return <FlashSaleHero section={normalizedSection} />;
  if (normalizedSection.type === "product-hero") return <ProductHero section={normalizedSection} />;

  // Products
  if (normalizedSection.type === "featured-products") return <FeaturedProducts section={normalizedSection} />;
  if (normalizedSection.type === "new-arrivals") return <NewArrivals section={normalizedSection} />;
  if (normalizedSection.type === "best-sellers") return <BestSellers section={normalizedSection} />;
  if (normalizedSection.type === "trending-products") return <TrendingProducts section={normalizedSection} />;
  if (normalizedSection.type === "flash-sale") return <FlashSale section={normalizedSection} />;
  if (normalizedSection.type === "product-grid") return <ProductGrid section={normalizedSection} />;
  if (normalizedSection.type === "product-carousel") return <ProductCarousel section={normalizedSection} />;
  if (normalizedSection.type === "product-slider") return <ProductSlider section={normalizedSection} />;
  if (normalizedSection.type === "product-tabs") return <ProductTabs section={normalizedSection} />;

  // Categories
  if (normalizedSection.type === "category-grid" || normalizedSection.type === "featured-categories" || normalizedSection.type === "mega-category-grid")
    return <CategoryGrid section={normalizedSection} />;
  if (normalizedSection.type === "category-slider") return <CategorySlider section={normalizedSection} />;

  // Promotions
  if (normalizedSection.type === "discount-banner" || normalizedSection.type === "offer-banner" || normalizedSection.type === "bogo")
    return <DiscountBanner section={normalizedSection} />;
  if (normalizedSection.type === "deal-of-day") return <DealOfDay section={normalizedSection} />;

  // Trust
  if (normalizedSection.type === "testimonials") return <Testimonials section={normalizedSection} />;
  if (normalizedSection.type === "trust-badges" || normalizedSection.type === "guarantee-section")
    return <TrustBadges section={normalizedSection} />;
  if (normalizedSection.type === "why-choose-us") return <WhyChooseUs section={normalizedSection} />;

  // Content
  if (normalizedSection.type === "rich-text") return <RichText section={normalizedSection} />;
  if (normalizedSection.type === "faq") return <FAQSection section={normalizedSection} />;
  if (normalizedSection.type === "accordion") return <Accordion section={normalizedSection} />;
  if (normalizedSection.type === "team-members") return <TeamMembers section={normalizedSection} />;

  // Media
  if (normalizedSection.type === "image-banner") return <ImageBanner section={normalizedSection} />;
  if (normalizedSection.type === "gallery" || normalizedSection.type === "image-grid" || normalizedSection.type === "masonry-gallery")
    return <Gallery section={normalizedSection} />;
  if (normalizedSection.type === "video-section" || normalizedSection.type === "youtube-embed" || normalizedSection.type === "vimeo-embed")
    return <VideoSection section={normalizedSection} />;

  // Social
  if (normalizedSection.type === "instagram-feed") return <InstagramFeed section={normalizedSection} />;

  // Marketing
  if (normalizedSection.type === "newsletter" || normalizedSection.type === "email-capture")
    return <Newsletter section={normalizedSection} />;
  if (normalizedSection.type === "announcement-bar") return <AnnouncementBar section={normalizedSection} />;

  // Advanced
  if (normalizedSection.type === "countdown-timer") return <CountdownTimer section={normalizedSection} />;

  // Footer
  if (normalizedSection.type === "simple-footer") return <SimpleFooter section={normalizedSection} />;
  if (normalizedSection.type === "ecommerce-footer" || normalizedSection.type === "mega-footer" || normalizedSection.type === "multi-column-footer")
    return <EcommerceFooter section={normalizedSection} />;

  // Layout sections - render as wrapping divs
  if (normalizedSection.type === "full-width" || normalizedSection.type === "container" || normalizedSection.type === "one-column" || normalizedSection.type === "two-column" || normalizedSection.type === "three-column" || normalizedSection.type === "four-column" || normalizedSection.type === "grid-layout" || normalizedSection.type === "masonry-layout" || normalizedSection.type === "tabs-layout") {
    return <PlaceholderSection section={normalizedSection} />;
  }

  return <PlaceholderSection section={normalizedSection} />;
}
