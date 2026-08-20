"use client";

import { landingContainer } from "./landing-ui";
import { TrendingUp, LineChart, DollarSign, Users, ShoppingBag, ArrowUpRight } from "lucide-react";

export function AnalyticsSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            BUSINESS INTELLIGENCE & ANALYTICS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Know what&apos;s happening in your store.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Gain immediate visibility into gross revenue, best-selling SKUs, traffic sources, and customer repeat rates with real-time reporting.
          </p>
        </div>

        {/* Analytics Dashboard Grid */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-zinc-200/90 bg-zinc-50/40 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">MONTHLY GROSS SALES</span>
              <p className="text-2xl font-extrabold text-zinc-950">৳ 248,500</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> +24.8% vs last month
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">TOTAL COMPLETED ORDERS</span>
              <p className="text-2xl font-extrabold text-zinc-950">1,248</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> +18.2% order volume
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">AVERAGE BASKET VALUE</span>
              <p className="text-2xl font-extrabold text-zinc-950">৳ 2,840</p>
              <p className="text-[10px] text-blue-600 font-semibold">+8.4% with cross-sells</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">CONVERSION RATE</span>
              <p className="text-2xl font-extrabold text-zinc-950">3.8%</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Above industry benchmark</p>
            </div>
          </div>

          {/* Top Products & Traffic Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-white border border-zinc-200/80 space-y-3 shadow-2xs">
              <p className="font-bold text-zinc-900">Top Performing Products This Month</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                  <span className="font-medium text-zinc-800">Nike Air Max 270 Premium</span>
                  <span className="font-bold text-zinc-950">৳ 86,400 (42 sold)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                  <span className="font-medium text-zinc-800">Apple AirPods Pro (2nd Gen)</span>
                  <span className="font-bold text-zinc-950">৳ 49,980 (20 sold)</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-medium text-zinc-800">Luxury Egyptian Cotton Bed Sheet</span>
                  <span className="font-bold text-zinc-950">৳ 38,500 (10 sold)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-zinc-200/80 space-y-3 shadow-2xs">
              <p className="font-bold text-zinc-900">Checkout Payment Split</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-600 font-medium">bKash Merchant Pay</span>
                    <span className="font-bold text-zinc-900">54%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[54%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-600 font-medium">Cash on Delivery (COD)</span>
                    <span className="font-bold text-zinc-900">32%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[32%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-600 font-medium">Nagad / Cards</span>
                    <span className="font-bold text-zinc-900">14%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[14%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
