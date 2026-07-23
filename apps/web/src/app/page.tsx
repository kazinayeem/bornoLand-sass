import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { FaqPreviewBanner } from "@/components/landing/faq-preview-banner";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { MobileApp } from "@/components/landing/mobile-app";
import { FAQ } from "@/components/landing/faq";
import { TeamGlobal } from "@/components/landing/team-global";
import { Integrations } from "@/components/landing/integrations";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "BornoLand — Build, manage, and grow your online store",
  description:
    "Create your online store, manage products, track inventory, receive orders, accept payments, and customize your homepage — all from one dashboard.",
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
              "An all-in-one ecommerce platform for building, managing, and growing online stores.",
          }),
        }}
      />
      <Header />
      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem]">
        {/* 1–3: Navbar + Hero + Dashboard showcase */}
        <Hero />

        {/* 4: Trust logos */}
        <TrustBar />

        {/* 5: Toolkit / tilted phones */}
        <Features />

        {/* 6: Mini FAQ + Demo banner */}
        <FaqPreviewBanner />

        {/* 7: Simple steps */}
        <HowItWorks />

        {/* 8: Testimonials */}
        <Testimonials />

        {/* 9–10: Pricing + comparison table */}
        <Pricing />

        {/* 11: App download banner */}
        <MobileApp />

        {/* 12: Full FAQ */}
        <FAQ />

        {/* 13–14: Team + world map */}
        <TeamGlobal />

        {/* 15: Partner / payment logos */}
        <Integrations />
      </main>
      {/* 16: Footer */}
      <Footer />
    </LandingLocaleProvider>
  );
}
