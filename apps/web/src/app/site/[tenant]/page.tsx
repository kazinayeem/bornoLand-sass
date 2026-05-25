import { StoreHero } from "@/components/storefront/store-hero";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { CatSection } from "@/components/storefront/cat-section";

export default function TenantSitePage() {
  return (
    <main>
      <StoreHero />
      <CatSection />
      <FeaturedProducts />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
