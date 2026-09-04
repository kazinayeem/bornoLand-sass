"use client";

import { useState } from "react";
import { Header } from "@/components/landing/header";
import { StoryHero } from "@/components/landing/story-hero";
import { StorySocialProof } from "@/components/landing/story-social-proof";
import { StoryProblem } from "@/components/landing/story-problem";
import { StoryTransformation } from "@/components/landing/story-transformation";
import { Features } from "@/components/landing/features";
import { StoryPricing } from "@/components/landing/story-pricing";
import { StoryFAQ } from "@/components/landing/story-faq";
import { StoryCTA } from "@/components/landing/story-cta";
import { Footer } from "@/components/landing/footer";
import { DemoModal } from "@/components/landing/demo-modal";

export function LandingPageClient() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-[#003399]/15 selection:text-[#003399]">
      {/* 1. Sticky Glass Navbar */}
      <Header onOpenDemo={() => setDemoOpen(true)} />

      <main className="overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem]">
        {/* 2. Hero Section */}
        <StoryHero onOpenDemo={() => setDemoOpen(true)} />

        {/* 3. Compact Trust & Real Value Social Proof */}
        <StorySocialProof />

        {/* 4. Problem → Solution Comparison */}
        <StoryProblem />

        {/* 5. Platform Overview & Interactive Feature Showcase (6 Tabs) */}
        <StoryTransformation />

        {/* 6. Core Value Differentiators */}
        <Features />

        {/* 7. Dynamic Pricing Section */}
        <StoryPricing />

        {/* 8. Compact FAQ Accordion */}
        <StoryFAQ />

        {/* 9. Premium Compact Final CTA Banner */}
        <StoryCTA onOpenDemo={() => setDemoOpen(true)} />
      </main>

      {/* 10. Clean Professional SaaS Footer */}
      <Footer />

      {/* Book a Demo Interactive Modal */}
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
