"use client";

import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  TrendingUp,
  ShoppingBag,
  Users,
  Zap,
  CheckCircle2,
  Package,
} from "lucide-react";
import { landingContainer } from "./landing-ui";
import { LiveIndicator } from "./live-indicator";
import { LandingButton } from "./landing-button";
import { REVENUE_DATA } from "./landing-tokens";

export function StoryHero() {
  const [period, setPeriod] = useState<"Today" | "7D" | "30D" | "90D">("Today");
  const data = REVENUE_DATA[period];
  const maxVal = Math.max(...data.map((d) => d.revenue));

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.08),rgba(255,255,255,0))]">
      <div className={landingContainer}>
        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <LiveIndicator
            label="THE ALL-IN-ONE COMMERCE PLATFORM"
            sublabel="One Unified System"
            className="bg-white/90 border-zinc-200/80 shadow-2xs text-zinc-800"
          />
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.06]">
            Your online store, <br />
            <span className="bg-gradient-to-r from-zinc-950 via-blue-900 to-blue-600 bg-clip-text text-transparent">
              ready in minutes.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Build, sell, manage, and grow your business from one powerful platform — without stitching together separate tools.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <LandingButton
              variant="primary"
              size="hero"
              href="/register"
              className="w-full sm:w-auto"
            >
              Start Free
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </LandingButton>

            <LandingButton
              variant="secondary"
              size="hero"
              href="/explore"
              className="w-full sm:w-auto"
            >
              Explore Demo
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400 ml-0.5" />
            </LandingButton>
          </div>

          <p className="text-xs text-zinc-400 font-medium pt-1">
            No credit card required · Start free in 60 seconds
          </p>
        </div>

        {/* ONE Large Realistic Bornoland Product Dashboard UI */}
        <div className="relative mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-2xl shadow-zinc-200/60 backdrop-blur-xl">
            {/* Top Workspace Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100/80 font-mono text-[11px] text-zinc-600">
                  <span>techgear.bornoland.com</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  LIVE STOREFRONT
                </span>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Total Revenue</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-950">৳ 1,24,800</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+18.4% this week</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Active Orders</span>
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-950">1,248</p>
                <p className="text-[10px] text-blue-600 font-semibold">+12.8% volume</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Customers</span>
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-950">2,540</p>
                <p className="text-[10px] text-purple-600 font-semibold">+9.2% growth</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span>Conversion Rate</span>
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-950">4.9%</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+0.8% checkout</p>
              </div>
            </div>

            {/* Live Chart & Orders Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* Line Graph (7 cols) */}
              <div className="lg:col-span-7 rounded-xl border border-zinc-100 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">Revenue Growth Flow</span>
                  <div className="flex gap-1">
                    {(["Today", "7D", "30D", "90D"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          period === p ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-36 w-full pt-2">
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="storyHeroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 0 100 ${data
                        .map((d, i) => {
                          const x = (i / (data.length - 1)) * 500;
                          const y = 100 - (d.revenue / maxVal) * 80;
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} L 500 100 Z`}
                      fill="url(#storyHeroGrad)"
                    />
                    <path
                      d={`M 0 ${100 - (data[0].revenue / maxVal) * 80} ${data
                        .map((d, i) => {
                          const x = (i / (data.length - 1)) * 500;
                          const y = 100 - (d.revenue / maxVal) * 80;
                          return `L ${x} ${y}`;
                        })
                        .join(" ")}`}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex justify-between pt-1 text-[9px] text-zinc-400 font-mono">
                    {data.map((d, i) => (
                      <span key={i}>{d.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders List (5 cols) */}
              <div className="lg:col-span-5 rounded-xl border border-zinc-100 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-900">Live Orders</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">● Streaming</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/70">
                    <div>
                      <p className="font-semibold text-zinc-900">#ORD-1042 · Mohammad Ali</p>
                      <p className="text-[10px] text-zinc-500">Nike Air Max 270 (×2)</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-zinc-950">৳ 26,774</span>
                      <span className="block text-[9px] text-emerald-600 font-semibold">bKash Paid</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/70">
                    <div>
                      <p className="font-semibold text-zinc-900">#ORD-1041 · Tanvir Ahmed</p>
                      <p className="text-[10px] text-zinc-500">AirPods Pro (2nd Gen)</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-zinc-950">৳ 24,990</span>
                      <span className="block text-[9px] text-amber-600 font-semibold">COD Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Badges */}
          <div className="hidden lg:flex absolute -top-4 -left-6 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 shadow-lg shadow-zinc-200/50 backdrop-blur-md animate-bounce [animation-duration:5s]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-bold text-zinc-900">+৳12,450 today</p>
          </div>

          <div className="hidden lg:flex absolute -bottom-4 -left-4 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 shadow-lg shadow-zinc-200/50 backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-bold text-zinc-900">Payment received · bKash</p>
          </div>

          <div className="hidden lg:flex absolute -top-4 -right-6 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 shadow-lg shadow-zinc-200/50 backdrop-blur-md animate-bounce [animation-duration:6s]">
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold text-zinc-900">12 new orders</p>
          </div>

          <div className="hidden lg:flex absolute -bottom-4 -right-4 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 shadow-lg shadow-zinc-200/50 backdrop-blur-md">
            <Package className="h-4 w-4 text-purple-600" />
            <p className="text-xs font-bold text-zinc-900">Inventory synced across stores</p>
          </div>
        </div>
      </div>
    </section>
  );
}
