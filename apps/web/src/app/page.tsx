import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { StoreBuilder } from "@/components/landing/store-builder";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductManagement } from "@/components/landing/product-management";
import { AnalyticsSection } from "@/components/landing/analytics-section";
import { MobileApp } from "@/components/landing/mobile-app";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { TeamGlobal } from "@/components/landing/team-global";
import { Integrations } from "@/components/landing/integrations";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { CustomerSuccess, DemoVideo, IntegrationsAndTrust, PlatformComparison, ProductTour, TemplateGallery } from "@/components/landing/growth-sections";

export const metadata: Metadata = {
  title: "BornoLand — Build, manage, and grow your online store",
  description: "Launch a premium ecommerce store with BornoLand's visual builder, product and order management, analytics, payments, and growth tools.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "BornoLand", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "An all-in-one ecommerce platform for building, managing, and growing online stores." }) }} />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <ProductTour />
        <DemoVideo />
        <Features />
        <DashboardShowcase />
        <StoreBuilder />
        <TemplateGallery />
        <HowItWorks />
        <ProductManagement />
        <AnalyticsSection />
        <MobileApp />
        <PlatformComparison />
        <IntegrationsAndTrust />
        <CustomerSuccess />
        <Testimonials />
        <Pricing />
        <Integrations />
        <FAQ />
        <TeamGlobal />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
