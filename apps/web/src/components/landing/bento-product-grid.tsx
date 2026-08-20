"use client";

import { landingContainer } from "./landing-ui";
import {
  Layers,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Move,
  CheckCircle2,
  Boxes,
  Monitor,
} from "lucide-react";

export function BentoProductGrid() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            UNIFIED PLATFORM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Everything your store needs.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            From your visual storefront builder to inventory tracking, order management, and real-time analytics.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-6xl mx-auto">
          {/* Card 1: Large Visual Store Builder (8 cols, row-span-2) */}
          <div className="md:col-span-8 rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <Layers className="h-4 w-4" />
                <span>VISUAL STOREFRONT BUILDER</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950">
                Drag, drop, and launch without code.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-xl leading-relaxed">
                Assemble high-converting storefront layouts using reusable section blocks, live responsiveness controls, and instant publishing.
              </p>
            </div>

            {/* Mini Builder Interface Preview */}
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-900 text-white p-4 shadow-lg space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-zinc-300 font-medium">Home Page Canvas</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">100% Responsive</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400">HERO BANNER</span>
                  <p className="font-semibold text-zinc-200 text-[11px]">Eid Special 50% Off</p>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400">PRODUCT GRID</span>
                  <p className="font-semibold text-zinc-200 text-[11px]">Best Sellers (4 Cols)</p>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400">DEAL OF DAY</span>
                  <p className="font-semibold text-zinc-200 text-[11px]">Flash Sale Countdown</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Medium Analytics Card (4 cols) */}
          <div className="md:col-span-4 rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>REAL-TIME ANALYTICS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                Live Sales & Conversion
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Track gross sales and conversion rates without waiting for nightly batch jobs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400">THIS MONTH</span>
              <p className="text-2xl font-extrabold text-zinc-950">৳ 248,500</p>
              <p className="text-[10px] text-emerald-600 font-semibold">+24.8% revenue growth</p>
            </div>
          </div>

          {/* Card 3: Small Live Order Stream (4 cols) */}
          <div className="md:col-span-4 rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-6 sm:p-7 space-y-4 hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
                <span>Live Orders</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                LIVE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <div className="flex justify-between items-center font-semibold text-zinc-900">
                  <span>#ORD-1042</span>
                  <span className="text-zinc-950 font-bold">৳ 26,774</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Mohammad Ali · bKash Paid</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-zinc-200/70 shadow-2xs">
                <div className="flex justify-between items-center font-semibold text-zinc-900">
                  <span>#ORD-1041</span>
                  <span className="text-zinc-950 font-bold">৳ 24,990</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Tanvir Ahmed · COD Confirmed</p>
              </div>
            </div>
          </div>

          {/* Card 4: Small Inventory Stock Movement (4 cols) */}
          <div className="md:col-span-4 rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-6 sm:p-7 space-y-4 hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
              <Boxes className="h-4 w-4 text-purple-600" />
              <span>Inventory Sync</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2 text-xs">
              <p className="font-bold text-zinc-900">Nike Air Max 270</p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-zinc-500">128 Start</span>
                <span className="text-blue-600 font-semibold">42 Sold</span>
                <span className="text-emerald-700 font-bold">86 Left</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[67%]" />
              </div>
            </div>
          </div>

          {/* Card 5: Medium Customer 360 Profiles (4 cols) */}
          <div className="md:col-span-4 rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-6 sm:p-7 space-y-4 hover:shadow-xl hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
              <Users className="h-4 w-4 text-amber-600" />
              <span>Customer Intelligence</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-900">Mohammad Ali Nayeem</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  VIP
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">6 lifetime orders · nayeem@example.com</p>
              <p className="text-[11px] font-bold text-zinc-900 pt-1 border-t border-zinc-100">
                ৳ 84,200 Total Spent
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
