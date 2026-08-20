"use client";

import { landingContainer } from "./landing-ui";
import { Layers, ShoppingCart, Activity, LineChart, ArrowRight } from "lucide-react";
import Link from "next/link";

const PILLARS = [
  {
    num: "01",
    title: "Build",
    subtitle: "Create a beautiful storefront without writing frontend code.",
    description:
      "Visual drag & drop store builder with responsive typography, curated e-commerce section blocks, and custom branding presets ready out of the box.",
    icon: Layers,
    preview: {
      tag: "Visual Builder",
      highlight: "Drag & Drop Canvas",
      detail: "15+ Production-grade Sections",
    },
  },
  {
    num: "02",
    title: "Sell",
    subtitle: "Products, variants, inventory, coupons and checkout.",
    description:
      "Full product catalog system supporting unlimited variants, SKU level tracking, discount codes, fast guest checkout, and dynamic tax rules.",
    icon: ShoppingCart,
    preview: {
      tag: "Commerce Engine",
      highlight: "Instant Fast Checkout",
      detail: "Guest Checkout & Mobile Pay",
    },
  },
  {
    num: "03",
    title: "Operate",
    subtitle: "Orders, customers, payments, shipping and invoices.",
    description:
      "Manage incoming orders with live status pipelines, automated PDF invoice generation, local delivery zones, and courier integrations.",
    icon: Activity,
    preview: {
      tag: "Operations Hub",
      highlight: "Automated PDF Invoices",
      detail: "Steadfast & Pathao Ready",
    },
  },
  {
    num: "04",
    title: "Grow",
    subtitle: "Analytics, marketing tools, custom domains and automation.",
    description:
      "Gain real-time insights into store performance, connect your custom apex domain, and automate order notifications for peak customer retention.",
    icon: LineChart,
    preview: {
      tag: "Growth Suite",
      highlight: "Custom Apex Domain",
      detail: "Real-time Sales Insights",
    },
  },
];

export function WhyBornoland() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            THE PLATFORM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Everything you need to run commerce.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            From your first product to thousands of orders, Bornoland handles the infrastructure behind your store.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="group relative rounded-2xl border border-zinc-200/90 bg-zinc-50/40 p-7 sm:p-9 transition-all hover:bg-white hover:shadow-xl hover:border-zinc-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      {pillar.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs text-zinc-900 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {pillar.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Pillar UI Preview Snippet */}
                <div className="mt-6 pt-6 border-t border-zinc-200/60 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {pillar.preview.tag}
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {pillar.preview.highlight}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {pillar.preview.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
