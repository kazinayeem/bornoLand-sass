"use client";

import { StoreHero } from "@/components/storefront/store-hero";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { CatSection } from "@/components/storefront/cat-section";

export type StorefrontSectionLike = {
  id: string;
  type: string;
  visible?: boolean;
  props?: Record<string, string>;
};

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
};

export function StorefrontCanvas({ sections }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);

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
          case "footer":
            return null;
          default:
            return null;
        }
      })}
    </main>
  );
}