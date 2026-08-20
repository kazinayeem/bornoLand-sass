"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { landingContainer } from "./landing-ui";
import { RevenueChart } from "./revenue-chart";
import { OrderActivity } from "./order-activity";
import { LiveIndicator } from "./live-indicator";

export function HeroRedesign() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.08),rgba(255,255,255,0))]">
      <div className={landingContainer}>
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <LiveIndicator
            label="THE MODERN COMMERCE PLATFORM"
            sublabel="Multi-Store SaaS"
            className="bg-white/90 border-zinc-200/80 shadow-2xs text-zinc-800"
          />
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08]">
            Your online store, <br />
            <span className="bg-gradient-to-r from-zinc-950 via-blue-900 to-blue-600 bg-clip-text text-transparent">
              ready in minutes.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Launch a beautiful storefront, manage multi-store inventory, process orders, accept bKash and COD, and grow your brand — without the technical complexity.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-all"
            >
              Explore Demo
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>

          <p className="text-xs text-zinc-400 font-medium">
            No credit card required · 7-day free trial · Instant setup
          </p>
        </div>

        {/* Live Interactive Hero Composition (Revenue Chart + Live Orders) */}
        <div className="relative mt-14 sm:mt-18 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Revenue Chart (8 cols) */}
          <div className="lg:col-span-8">
            <RevenueChart />
          </div>

          {/* Live Order Stream (4 cols) */}
          <div className="lg:col-span-4">
            <OrderActivity />
          </div>
        </div>
      </div>
    </section>
  );
}
