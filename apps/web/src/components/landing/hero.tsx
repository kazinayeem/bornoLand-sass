"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { landingContainer } from "./landing-ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className={landingContainer}>
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs backdrop-blur-md transition-transform hover:scale-[1.02]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
              THE MODERN COMMERCE PLATFORM
            </span>
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08]">
            Your online store, <br />
            <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-500 bg-clip-text text-transparent">
              ready in minutes.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Launch a beautiful online store, manage your products and orders, accept payments,
            and grow your business — without building everything from scratch.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 hover:shadow-lg transition-all"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-all"
            >
              Explore demo
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>

          <p className="text-xs text-zinc-400 font-medium">
            7-day free trial · No credit card required · Instant setup
          </p>
        </div>

        {/* Hero Product Visual — Floating Live Dashboard Composition */}
        <div className="relative mt-14 sm:mt-18 max-w-5xl mx-auto">
          {/* Main Dashboard Frame */}
          <div className="relative rounded-2xl border border-zinc-200/90 bg-white/95 p-3 sm:p-5 shadow-2xl shadow-zinc-200/50 backdrop-blur-xl">
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                </div>
                <div className="ml-3 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100/80 font-mono text-[11px] text-zinc-600">
                  <span>techgear.bornoland.store</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  LIVE STOREFRONT
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* Stat 1: Revenue */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-medium">Total Revenue</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-base sm:text-xl font-bold text-zinc-950">৳ 248,500</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+24.8% this month</p>
              </div>

              {/* Stat 2: Orders */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-medium">Active Orders</span>
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-base sm:text-xl font-bold text-zinc-950">1,248</p>
                <p className="text-[10px] text-blue-600 font-semibold">+18.2% vs last week</p>
              </div>

              {/* Stat 3: Products */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-medium">Products</span>
                  <Package className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <p className="text-base sm:text-xl font-bold text-zinc-950">2,540</p>
                <p className="text-[10px] text-zinc-500 font-medium">48 in low stock</p>
              </div>

              {/* Stat 4: Conversion Rate */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 sm:p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[11px] font-medium">Conversion</span>
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-base sm:text-xl font-bold text-zinc-950">3.8%</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+0.6% uplift</p>
              </div>
            </div>

            {/* Simulated Live Orders Table Preview */}
            <div className="rounded-xl border border-zinc-100 overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-600">
                <span>Recent Live Orders</span>
                <span className="text-[10px] text-zinc-400 font-normal">Real-time sync</span>
              </div>
              <div className="divide-y divide-zinc-50 text-xs">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400">#ORD-94812</span>
                    <span className="font-medium text-zinc-900">Mohammad Ali Nayeem</span>
                    <span className="text-zinc-500 hidden sm:inline">Nike Air Max 270 (×2)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">৳ 26,774</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PAID (bKash)
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400">#ORD-94811</span>
                    <span className="font-medium text-zinc-900">Tanvir Ahmed</span>
                    <span className="text-zinc-500 hidden sm:inline">Wireless Noise-Canceling Earbuds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">৳ 4,850</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      CONFIRMED (COD)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Pill: Verified Payment */}
          <div className="hidden md:flex absolute -bottom-5 -left-4 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 shadow-lg shadow-zinc-200/50 backdrop-blur-md animate-bounce [animation-duration:4s]">
            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-900">৳ 13,387 Received</p>
              <p className="text-[10px] text-zinc-400">bKash Merchant Instant</p>
            </div>
          </div>

          {/* Floating Pill: Storefront Speed */}
          <div className="hidden md:flex absolute -top-4 -right-4 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 shadow-lg shadow-zinc-200/50 backdrop-blur-md">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-900">99.8ms TTFB</p>
              <p className="text-[10px] text-zinc-400">Global Edge Storefront</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
