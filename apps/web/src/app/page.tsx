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

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <DashboardShowcase />
        <StoreBuilder />
        <HowItWorks />
        <ProductManagement />
        <AnalyticsSection />
        <MobileApp />
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
