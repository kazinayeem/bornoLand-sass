import { StoreHero } from "@/components/storefront/store-hero";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { CatSection } from "@/components/storefront/cat-section";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { FlashSale } from "@/components/storefront/flash-sale";
import { BrandLogos } from "@/components/storefront/brand-logos";
import { ImageBanner } from "@/components/storefront/image-banner";
import { CollectionShowcase } from "@/components/storefront/collection-showcase";
import { VideoSection } from "@/components/storefront/video-section";
import { FAQAccordion } from "@/components/storefront/faq-accordion";
import { CountdownCampaign } from "@/components/storefront/countdown-campaign";
import { MultiBannerGrid } from "@/components/storefront/multi-banner-grid";
import { FeatureCards } from "@/components/storefront/feature-cards";
import { StatsCounter } from "@/components/storefront/stats-counter";
import type { StorefrontSectionLike } from "./storefront-types";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
};

export function StorefrontCanvas({ sections }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);

  if (visibleSections.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <svg className="mx-auto h-14 w-14 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">No sections yet</h2>
          <p className="mt-1 text-sm text-zinc-500">Add sections to your homepage using the builder.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {visibleSections.map((section) => {
        switch (section.type) {
          case "hero":
            return <StoreHero key={section.id} section={section} />;
          case "features":
            return <CatSection key={section.id} section={section} />;
          case "products":
            return <FeaturedProducts key={section.id} section={section} />;
          case "testimonials":
            return <TestimonialsSection key={section.id} section={section} />;
          case "cta":
            return <NewsletterSection key={section.id} section={section} />;
          case "announcement":
            return <AnnouncementBar key={section.id} section={section} />;
          case "flash-sale":
            return <FlashSale key={section.id} section={section} />;
          case "brand-logos":
            return <BrandLogos key={section.id} section={section} />;
          case "image-banner":
            return <ImageBanner key={section.id} section={section} />;
          case "collection":
            return <CollectionShowcase key={section.id} section={section} />;
          case "video":
            return <VideoSection key={section.id} section={section} />;
          case "faq":
            return <FAQAccordion key={section.id} section={section} />;
          case "countdown":
            return <CountdownCampaign key={section.id} section={section} />;
          case "multi-banner":
            return <MultiBannerGrid key={section.id} section={section} />;
          case "feature-cards":
            return <FeatureCards key={section.id} section={section} />;
          case "stats":
            return <StatsCounter key={section.id} section={section} />;
          case "footer":
            return null;
          default:
            return null;
        }
      })}
    </main>
  );
}