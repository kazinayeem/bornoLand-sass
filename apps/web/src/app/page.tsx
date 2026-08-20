import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { WhyBornoland } from "@/components/landing/why-bornoland";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { StoreBuilder } from "@/components/landing/store-builder";
import { MultiStoreSection } from "@/components/landing/multi-store-section";
import { CommerceEngine } from "@/components/landing/commerce-engine";
import { BangladeshCommerce } from "@/components/landing/bangladesh-commerce";
import { InventorySection } from "@/components/landing/inventory-section";
import { OrderManagement } from "@/components/landing/order-management";
import { CustomDomain } from "@/components/landing/custom-domain";
import { AnalyticsSection } from "@/components/landing/analytics-section";
import { AutomationSection } from "@/components/landing/automation-section";
import { DeveloperSection } from "@/components/landing/developer-section";
import { SecuritySection } from "@/components/landing/security-section";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "BornoLand — The Modern Multi-Store E-Commerce Platform",
  description:
    "Launch your online store in minutes. Visual drag & drop builder, bKash & COD payments, courier integrations, automated PDF invoices, and multi-store management.",
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

      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem]">
        {/* 2. Hero + Floating Live Dashboard */}
        <Hero />

        {/* 3. Trust & Social Proof Strip */}
        <TrustBar />

        {/* 4. Why Bornoland: 4 Core Pillars */}
        <WhyBornoland />

        {/* 5. Tabbed Product Showcase */}
        <ProductShowcase />

        {/* 6. Visual Store Builder */}
        <StoreBuilder />

        {/* 7. Multi-Store Architecture */}
        <MultiStoreSection />

        {/* 8. Commerce Pipeline & Integrations Engine */}
        <CommerceEngine />

        {/* 9. Bangladesh-First Local Commerce */}
        <BangladeshCommerce />

        {/* 10. Inventory & Variants */}
        <InventorySection />

        {/* 11. Order Lifecycle & Status Engine */}
        <OrderManagement />

        {/* 12. Branded Custom Domains */}
        <CustomDomain />

        {/* 13. Business Analytics & Funnels */}
        <AnalyticsSection />

        {/* 14. Automated Operations */}
        <AutomationSection />

        {/* 15. Developer REST API & Webhooks */}
        <DeveloperSection />

        {/* 16. Enterprise Security & Reliability */}
        <SecuritySection />

        {/* 17. Transparent Pricing & Feature Comparison */}
        <Pricing />

        {/* 18. Merchant Testimonials */}
        <Testimonials />

        {/* 19. 3-Step Onboarding */}
        <HowItWorks />

        {/* 20. Essential FAQs */}
        <FAQ />

        {/* 21. Final High-Conversion CTA */}
        <FinalCTA />
      </main>

      {/* 22. 5-Column SaaS Footer */}
      <Footer />
    </LandingLocaleProvider>
  );
}
