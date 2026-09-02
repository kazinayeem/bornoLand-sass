import type { Metadata } from "next";
import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { StoryHero } from "@/components/landing/story-hero";
import { StoryProblem } from "@/components/landing/story-problem";
import { StoryTransformation } from "@/components/landing/story-transformation";
import { StoryBuilder } from "@/components/landing/story-builder";
import { StoryOrders } from "@/components/landing/story-orders";
import { StoryProducts } from "@/components/landing/story-products";
import { StoryAutomation } from "@/components/landing/story-automation";
import { StoryDeveloper } from "@/components/landing/story-developer";
import { StoryAnalytics } from "@/components/landing/story-analytics";
import { StorySocialProof } from "@/components/landing/story-social-proof";
import { StoryPricing } from "@/components/landing/story-pricing";
import { StoryFAQ } from "@/components/landing/story-faq";
import { StoryCTA } from "@/components/landing/story-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "BornoLand — One Powerful Platform for Your Entire Business",
  description:
    "The complete Business Operating System (BOS) unifying Commerce, Cloud POS, Multi-Warehouse Inventory, Audited Payroll, Double-Entry Accounting, CRM, and Real-Time Analytics.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BornoLand — The Complete Business Operating System",
    description:
      "Unify your online storefront, retail POS, inventory, accounting, and payroll in one high-performance platform.",
    url: "https://bornoland.com",
    siteName: "BornoLand",
    locale: "en_US",
    type: "website",
  },
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
              "The modern multi-store Business Operating System (BOS) for building, managing, and scaling commerce enterprises.",
          }),
        }}
      />

      {/* Sticky Translucent Navigation with Instant Language Switcher */}
      <Header />

      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem] bg-[#FAFAFA]">
        {/* 1. HERO — Value Proposition + Living Interactive Multi-Module Dashboard Mockup */}
        <StoryHero />

        {/* 2. THE PROBLEM — Fragmented Tools vs. BornoLand Unified Pipeline */}
        <StoryProblem />

        {/* 3. PLATFORM ARCHITECTURE — Interconnected BOS Data Pipeline */}
        <StoryTransformation />

        {/* 4. COMMERCE & STOREFRONT — Drag & Drop Visual Builder with Multi-Device Preview */}
        <StoryBuilder />

        {/* 5. RETAIL POS — High-Speed In-Store Register with Split Tender & Receipt */}
        <StoryOrders />

        {/* 6. INVENTORY & WAREHOUSE — Multi-Warehouse Stock Movement & True Cost Ledger */}
        <StoryProducts />

        {/* 7. ACCOUNTING & FINANCE — Real-Time Double-Entry Journal & P&L Statement */}
        <StoryAutomation />

        {/* 8. PEOPLE & HRM — Biometric Attendance, Shift Rules & 1-Click Payroll */}
        <StoryDeveloper />

        {/* 9. BUSINESS INTELLIGENCE — Live Command Center with Interactive SVG Chart */}
        <StoryAnalytics />

        {/* 10. SOCIAL PROOF — Verified Merchants & Platform Growth Trust Bar */}
        <StorySocialProof />

        {/* 11. PRICING — Clean 4-Tier Matrix with Monthly/Yearly Switch & 20% Discount */}
        <StoryPricing />

        {/* 12. FAQ — Accessible & Smooth Accordion */}
        <StoryFAQ />

        {/* 13. FINAL CTA — Luxury Dark Banner */}
        <StoryCTA />
      </main>

      {/* 14. 5-Column SaaS Footer */}
      <Footer />
    </LandingLocaleProvider>
  );
}
