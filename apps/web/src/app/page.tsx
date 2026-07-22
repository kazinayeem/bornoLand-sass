import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { StoreBuilder } from "@/components/landing/store-builder";
import { StoreManagement } from "@/components/landing/store-management";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
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
      <main className="overflow-x-hidden">
        <Hero />
        <TrustBar />
        <Features />
        <StoreBuilder />
        <StoreManagement />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </LandingLocaleProvider>
  );
}
