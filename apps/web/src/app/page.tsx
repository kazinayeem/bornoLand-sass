import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { StoryHero } from "@/components/landing/story-hero";
import { StoryProblem } from "@/components/landing/story-problem";
import { StoryTransformation } from "@/components/landing/story-transformation";
import { StoryBuilder } from "@/components/landing/story-builder";
import { StoryProducts } from "@/components/landing/story-products";
import { StoryOrders } from "@/components/landing/story-orders";
import { StoryPaymentsDelivery } from "@/components/landing/story-payments-delivery";
import { StoryAutomation } from "@/components/landing/story-automation";
import { StoryAnalytics } from "@/components/landing/story-analytics";
import { StoryGrowth } from "@/components/landing/story-growth";
import { StoryDeveloper } from "@/components/landing/story-developer";
import { StorySocialProof } from "@/components/landing/story-social-proof";
import { StoryPricing } from "@/components/landing/story-pricing";
import { StoryFAQ } from "@/components/landing/story-faq";
import { StoryCTA } from "@/components/landing/story-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "BornoLand — The Commerce Operating System",
  description:
    "Your online store, ready in minutes. Visual storefront builder, live analytics, automated PDF invoices, bKash & COD payments, courier integrations, and multi-store management.",
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
              "The modern multi-store e-commerce operating system for building, managing, and scaling online businesses.",
          }),
        }}
      />

      {/* Translucent Navigation */}
      <Header />

      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem] bg-[#FAFAFA]">
        {/* 1. THE DREAM — Hero + Large Realistic Product Dashboard */}
        <StoryHero />

        {/* 2. THE PROBLEM — Scattered 5+ tools before Bornoland */}
        <StoryProblem />

        {/* 3. THE TRANSFORMATION — One unified platform for your entire store */}
        <StoryTransformation />

        {/* 4. BUILD — Start with your storefront */}
        <StoryBuilder />

        {/* 5. SELL — Products catalog and live sync */}
        <StoryProducts />

        {/* 6. ORDER — The business comes alive with live streaming orders */}
        <StoryOrders />

        {/* 7. PAYMENT + DELIVERY — Connected bKash/COD + Courier fulfillment */}
        <StoryPaymentsDelivery />

        {/* 8. AUTOMATION — The magic moment: store runs itself */}
        <StoryAutomation />

        {/* 9. BUSINESS INTELLIGENCE — Real-time analytics and revenue growth */}
        <StoryAnalytics />

        {/* 10. GROWTH STORY — Scale from 1 store to retail empire */}
        <StoryGrowth />

        {/* 11. DEVELOPER / POWER USER — REST API & webhooks when ready */}
        <StoryDeveloper />

        {/* 12. SOCIAL PROOF & TRUST — Featured merchant story & 50K+ stats */}
        <StorySocialProof />

        {/* 13. PRICING — The decision: clean 4-tier matrix */}
        <StoryPricing />

        {/* 14. FAQ — Remove final objections */}
        <StoryFAQ />

        {/* 15. FINAL CTA — Your store is closer than you think */}
        <StoryCTA />
      </main>

      {/* 16. SaaS Footer */}
      <Footer />
    </LandingLocaleProvider>
  );
}
