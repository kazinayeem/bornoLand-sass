import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { HeroRedesign } from "@/components/landing/hero-redesign";
import { TrustBar } from "@/components/landing/trust-bar";
import { ProductToolkit } from "@/components/landing/product-toolkit";
import { AnalyticsPreview } from "@/components/landing/analytics-preview";
import { ActivityTimeline } from "@/components/landing/activity-timeline";
import { WorkflowPreview } from "@/components/landing/workflow-preview";
import { StoreBuilder } from "@/components/landing/store-builder";
import { MultiStoreSection } from "@/components/landing/multi-store-section";
import { CommerceEngine } from "@/components/landing/commerce-engine";
import { BangladeshCommerce } from "@/components/landing/bangladesh-commerce";
import { InventorySection } from "@/components/landing/inventory-section";
import { OrderManagement } from "@/components/landing/order-management";
import { CustomDomain } from "@/components/landing/custom-domain";
import { DeveloperSection } from "@/components/landing/developer-section";
import { SecuritySection } from "@/components/landing/security-section";
import { PricingRedesign } from "@/components/landing/pricing-redesign";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "BornoLand — The Modern Multi-Store E-Commerce SaaS",
  description:
    "Launch your online store in minutes. Visual drag & drop builder, live analytics, bKash & COD payments, courier integrations, automated PDF invoices, and multi-store management.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <LandingLocaleProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BornoLand",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "The modern multi-store e-commerce SaaS platform for building, managing, and scaling online businesses.",
          }),
        }}
      />

      {/* 1. Translucent Sticky Navigation */}
      <Header />

      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem] bg-[#FAFAFA]">
        {/* 2. Hero + Floating Interactive Revenue & Order Visual */}
        <HeroRedesign />

        {/* 3. Trust Strip & Stat Counters */}
        <TrustBar />

        {/* 4. Complete Ecommerce Toolkit (Interactive Cards) */}
        <ProductToolkit />

        {/* 5. Dedicated Analytics Showcase & Multi-Period Breakdown */}
        <AnalyticsPreview />

        {/* 6. Real-Time Activity Timeline */}
        <ActivityTimeline />

        {/* 7. Automated Operations Workflow */}
        <WorkflowPreview />

        {/* 8. Visual Storefront Builder Studio */}
        <StoreBuilder />

        {/* 9. Multi-Store SaaS Architecture */}
        <MultiStoreSection />

        {/* 10. Commerce Pipeline Engine */}
        <CommerceEngine />

        {/* 11. Bangladesh-First Local Commerce */}
        <BangladeshCommerce />

        {/* 12. Product Variant & Inventory Tracking */}
        <InventorySection />

        {/* 13. Order Lifecycle & Status Engine */}
        <OrderManagement />

        {/* 14. Branded Custom Domains */}
        <CustomDomain />

        {/* 15. Developer REST API & Webhooks */}
        <DeveloperSection />

        {/* 16. Enterprise Security & Infrastructure */}
        <SecuritySection />

        {/* 17. Transparent Pricing & Feature Comparison Matrix */}
        <PricingRedesign />

        {/* 18. Auto-sliding Testimonial Carousel */}
        <TestimonialsCarousel />

        {/* 19. 3-Step Onboarding */}
        <HowItWorks />

        {/* 20. Essential FAQ Accordion */}
        <FAQ />

        {/* 21. High-Conversion Final CTA */}
        <FinalCTA />
      </main>

      {/* 22. 5-Column SaaS Footer */}
      <Footer />
    </LandingLocaleProvider>
  );
}
