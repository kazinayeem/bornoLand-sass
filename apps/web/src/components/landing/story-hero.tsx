"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Users,
  Building2,
  Zap,
  Activity,
  Receipt,
  ShoppingCart,
  QrCode,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { landingContainer } from "./landing-ui";
import { Reveal, AnimatedNumber, AnimatedChart } from "./motion-primitives";
import { useGetProfileQuery } from "@/redux/api/profile-api";

interface StoryHeroProps {
  onOpenDemo?: () => void;
}

const HERO_CHART_DATA = {
  Today: [
    { label: "09:00", value: 14200 },
    { label: "11:00", value: 28400 },
    { label: "13:00", value: 46800 },
    { label: "15:00", value: 72300 },
    { label: "17:00", value: 98600 },
    { label: "19:00", value: 118400 },
    { label: "21:00", value: 128450 },
  ],
  "7D": [
    { label: "Mon", value: 88000 },
    { label: "Tue", value: 115000 },
    { label: "Wed", value: 104000 },
    { label: "Thu", value: 148000 },
    { label: "Fri", value: 192000 },
    { label: "Sat", value: 224000 },
    { label: "Sun", value: 206000 },
  ],
  "30D": [
    { label: "Week 1", value: 430000 },
    { label: "Week 2", value: 595000 },
    { label: "Week 3", value: 760000 },
    { label: "Week 4", value: 940000 },
  ],
  "90D": [
    { label: "Month 1", value: 1680000 },
    { label: "Month 2", value: 2320000 },
    { label: "Month 3", value: 2980000 },
  ],
};

export function StoryHero({ onOpenDemo }: StoryHeroProps) {
  const [period, setPeriod] = useState<"Today" | "7D" | "30D" | "90D">("Today");
  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(0,51,153,0.08),rgba(255,255,255,0))]"
    >
      <div className={landingContainer}>
        {/* Eyebrow Pill */}
        <Reveal direction="down" delay={40}>
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1.5 shadow-2xs backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#0A8A00] animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider text-[#003399] uppercase">
                ALL-IN-ONE BUSINESS PLATFORM
              </span>
            </div>
          </div>
        </Reveal>

        {/* Hero Headline & Supporting Text */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Reveal direction="up" delay={80}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.12]">
              Everything Your Business Needs.{" "}
              <br />
              <span className="bg-gradient-to-r from-[#003399] via-[#002B80] to-indigo-700 bg-clip-text text-transparent">
                One Powerful Platform.
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={150}>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              Run commerce, POS, inventory, HR, finance and operations from one connected platform.
            </p>
          </Reveal>

          {/* Action CTAs */}
          <Reveal direction="up" delay={220}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#003399] text-white text-sm font-bold shadow-md hover:bg-[#002B80] hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Start Free"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {onOpenDemo ? (
                <button
                  type="button"
                  onClick={onOpenDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm font-bold shadow-2xs hover:bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Book a Demo</span>
                </button>
              ) : (
                <a
                  href="#platform"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm font-bold shadow-2xs hover:bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer"
                >
                  <span>Explore Platform</span>
                </a>
              )}
            </div>

            {/* Trust Tagline */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0" />
              <span>7-day free trial, no credit card required</span>
            </div>
          </Reveal>
        </div>

        {/* Dashboard/Product Visual with Subtle Hover/Load Animation */}
        <Reveal direction="scale" delay={280}>
          <div className="relative mt-12 sm:mt-16 max-w-5xl mx-auto">
            {/* Ambient Background Glow Behind Dashboard */}
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-b from-[#003399]/15 via-blue-400/10 to-transparent blur-xl" />

            <div className="relative rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,51,153,0.09)] ring-1 ring-zinc-900/5 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,51,153,0.13)]">
              {/* Dashboard Top Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003399] text-white shadow-xs">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-950">Aura Retail & Commerce</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00]">
                        Live Storefront
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Connected: 3 Warehouses • 2 Active POS Registers • Double-Entry Sync Active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200/80 text-[11px] font-bold text-zinc-700">
                    <span className="h-2 w-2 rounded-full bg-[#0A8A00] animate-pulse" />
                    All Systems Operational
                  </span>
                </div>
              </div>

              {/* 4 Connected Top KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-1 hover:border-[#003399]/40 transition-colors">
                  <div className="flex items-center justify-between text-zinc-500 text-xs">
                    <span className="font-semibold">Gross Revenue</span>
                    <TrendingUp className="h-3.5 w-3.5 text-[#0A8A00]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">
                    <AnimatedNumber value={128450} prefix="$" />
                  </p>
                  <p className="text-[10px] text-[#0A8A00] font-bold">+18.4% vs last period</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-1 hover:border-[#003399]/40 transition-colors">
                  <div className="flex items-center justify-between text-zinc-500 text-xs">
                    <span className="font-semibold">Gross Margin</span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#003399]">
                    <AnimatedNumber value={44.8} decimals={1} suffix="%" />
                  </p>
                  <p className="text-[10px] text-zinc-500 font-semibold">$57,545 gross profit</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-1 hover:border-[#003399]/40 transition-colors">
                  <div className="flex items-center justify-between text-zinc-500 text-xs">
                    <span className="font-semibold">Orders Processed</span>
                    <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">
                    <AnimatedNumber value={1420} />
                  </p>
                  <p className="text-[10px] text-[#0A8A00] font-bold">99.2% fulfillment rate</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-1 hover:border-[#003399]/40 transition-colors">
                  <div className="flex items-center justify-between text-zinc-500 text-xs">
                    <span className="font-semibold">Active Staff</span>
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-zinc-950">
                    <AnimatedNumber value={18} suffix=" Seats" />
                  </p>
                  <p className="text-[10px] text-[#0A8A00] font-bold">Audited & Reconciled</p>
                </div>
              </div>

              {/* Main Panel: Interactive Revenue Curve + Connected Live Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Left: Dynamic Revenue Chart */}
                <div className="lg:col-span-7 rounded-xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-[#003399]" />
                      <span className="font-extrabold text-zinc-950">Real-Time Revenue & Cash Flow</span>
                    </div>
                    <div className="flex gap-1">
                      {(["Today", "7D", "30D", "90D"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPeriod(p)}
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                            period === p
                              ? "bg-[#003399] text-white shadow-2xs"
                              : "text-zinc-500 hover:bg-zinc-100"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatedChart
                    data={HERO_CHART_DATA[period]}
                    height={135}
                    color="#003399"
                    fillOpacity={0.14}
                    valuePrefix="$"
                  />
                </div>

                {/* Right: Connected Transaction Pipeline */}
                <div className="lg:col-span-5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <span className="font-extrabold text-zinc-950">Connected Operations</span>
                    <span className="text-[10px] text-[#0A8A00] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
                      Live Sync
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between hover:border-zinc-300 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900 text-[11px]">Storefront Order #BL-9284</p>
                        <p className="text-[10px] text-zinc-500">Auto Inventory Deducted • Stripe Paid</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#0A8A00] text-xs">+$185.00</p>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          Fulfilled
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between hover:border-zinc-300 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900 text-[11px]">Retail POS Register #1042</p>
                        <p className="text-[10px] text-zinc-500">Dhanmondi Branch • Split Tender</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-zinc-900 text-xs">+$92.50</p>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Reconciled
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between hover:border-zinc-300 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900 text-[11px]">Supplier PO #PO-482 Intake</p>
                        <p className="text-[10px] text-zinc-500">Central Hub • 500 Units Received</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-purple-700 text-xs">Ledger Posted</p>
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          True Cost
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
