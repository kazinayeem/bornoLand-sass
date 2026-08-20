"use client";

import { landingContainer } from "./landing-ui";
import {
  Layers,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  LineChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ProductToolkit() {
  const TOOLS = [
    {
      id: "builder",
      title: "Store Builder",
      desc: "Visual drag & drop canvas with responsive section blocks, custom fonts, and real-time live preview.",
      icon: Layers,
      preview: {
        tag: "VISUAL CANVAS",
        body: "Hero Slider · Product Grid · Flash Deals",
        metric: "100% Mobile Ready",
      },
    },
    {
      id: "products",
      title: "Product Management",
      desc: "Create complex multidimensional variants (size, color, material) with distinct prices and SKUs.",
      icon: Package,
      preview: {
        tag: "VARIANT MATRIX",
        body: "Nike Air Max · 4 Sizes · 2 Colors",
        metric: "SKU Level Barcode Sync",
      },
    },
    {
      id: "inventory",
      title: "Real-Time Inventory",
      desc: "Live stock deduction on checkout completion, low-stock notifications, and automatic safety margins.",
      icon: Boxes,
      preview: {
        tag: "STOCK MOVEMENT",
        body: "128 In Stock → 42 Sold → 86 Available",
        metric: "Auto Low-Stock Alert",
      },
    },
    {
      id: "orders",
      title: "Order Fulfillment",
      desc: "Track orders across life-cycle stages, print verified A4 PDF invoices, and dispatch with Steadfast.",
      icon: ShoppingCart,
      preview: {
        tag: "ORDER LIFECYCLE",
        body: "Placed → Confirmed → Courier Picked",
        metric: "Instant A4 PDF Invoice",
      },
    },
    {
      id: "customers",
      title: "Customer Intelligence",
      desc: "Comprehensive customer profiles, lifetime purchase histories, order notes, and VIP status segmentation.",
      icon: Users,
      preview: {
        tag: "CUSTOMER 360",
        body: "Mohammad Ali Nayeem · 6 Orders",
        metric: "৳ 84,200 Lifetime Value",
      },
    },
    {
      id: "analytics",
      title: "Actionable Analytics",
      desc: "Track gross revenue, average basket size, checkout conversion rates, and top revenue drivers in real-time.",
      icon: LineChart,
      preview: {
        tag: "LIVE METRICS",
        body: "৳ 248,500 Gross Sales (+24.8%)",
        metric: "4.9% Checkout Conversion",
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            BUILT-IN INFRASTRUCTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Your complete ecommerce toolkit.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Everything you need to launch, manage, and scale your commerce operations — engineered into one cohesive ecosystem.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-6 sm:p-7 hover:bg-white hover:border-blue-500/80 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs text-zinc-950 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                {/* Mini UI Preview Box */}
                <div className="p-3 rounded-xl border border-zinc-200/60 bg-white/90 group-hover:bg-blue-50/30 group-hover:border-blue-200/60 transition-colors space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      {tool.preview.tag}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {tool.preview.metric}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-900 truncate">
                    {tool.preview.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
