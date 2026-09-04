"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  Star,
  ChevronDown,
  Lock,
  RefreshCw,
  Store,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Users,
  Building2,
  Wallet,
  HeartHandshake,
  Truck,
  LineChart,
  QrCode,
  WifiOff,
  Fingerprint,
  Calculator,
  FileText,
  Layers,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/branding";
import {
  BornoLandBrandLogo,
  CompanyAttributionLink,
  ProductOwnershipBadge,
} from "@/components/brand/brand-attribution";

export function LandingPageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "YTD">("7D");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqItems = [
    {
      q: "What exactly is BornoLand?",
      a: "BornoLand is a unified business operating platform designed to consolidate your online storefront, physical retail POS, warehouse inventory, HR, payroll, and accounting into one single connected database. It eliminates the need for separate disjointed subscriptions.",
    },
    {
      q: "Is BornoLand suitable for small businesses?",
      a: "Yes, absolutely. Our Starter plan is explicitly tailored for boutique brands, solopreneurs, and single-outlet retail operators who want enterprise-grade organization without enterprise complexity or heavy software bills.",
    },
    {
      q: "Can I manage multiple physical store branches?",
      a: "Yes. BornoLand supports unlimited stores, branches, and central warehouses. You can monitor stock levels per location, transfer merchandise with stock-transfer notes, and assign register access rights specifically per cashier.",
    },
    {
      q: "Does BornoLand include a real-time POS terminal?",
      a: "Yes! Our Point of Sale operates seamlessly on web browsers, touch tablets, and specialized desktop POS terminals. It works offline if internet drops out and synchronizes cleanly once reconnected.",
    },
    {
      q: "Does it support staff HR, attendance, and payroll?",
      a: "Yes. BornoLand handles shift scheduling, biometric attendance device sync, leave policies, advance salary loans, festival bonuses, and generates compliant bank disbursal sheets along with downloadable employee payslips.",
    },
    {
      q: "Can I connect my own custom web domain?",
      a: "Yes. You can link your custom .com, .com.bd, or any domain with automatic zero-configuration SSL certificates generated and renewed by BornoLand at no added charge.",
    },
    {
      q: "Can I start for free without committing?",
      a: "Yes! Every new account includes a full-featured 7-day trial. You do not need to enter a credit card or bank account to set up your store and test all features.",
    },
    {
      q: "Can I upgrade or adjust my plan later?",
      a: "You can upgrade, downgrade, or add additional outlet registers at any time right from your billing settings dashboard. Upgrades are pro-rated instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9ff] font-sans text-[#181c20] antialiased selection:bg-[#1664d9]/15 selection:text-[#1664d9]">
      {/* ── HEADER / TOPBAR ───────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e8ee]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo with subtle parent attribution */}
          <BornoLandBrandLogo showParentAttribution attributionVariant="inline" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            <a
              href="#unified-section"
              className="px-3 py-1.5 text-[13px] font-medium text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] rounded-lg transition-colors"
            >
              Platform
            </a>
            <a
              href="#modules-section"
              className="px-3 py-1.5 text-[13px] font-medium text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] rounded-lg transition-colors"
            >
              Solutions
            </a>
            <a
              href="#pricing-plans"
              className="px-3 py-1.5 text-[13px] font-medium text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] rounded-lg transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq-section"
              className="px-3 py-1.5 text-[13px] font-medium text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] rounded-lg transition-colors"
            >
              Resources
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-medium px-3.5 py-1.5 text-[#424754] hover:text-[#181c20] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-semibold px-4 py-2 bg-[#1664d9] text-white rounded-xl hover:bg-[#004caf] transition-all shadow-xs"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="w-8 h-8 rounded-full bg-[#1664d9]/10 text-[#1664d9] flex items-center justify-center hover:bg-[#1664d9]/20 transition-colors"
            >
              <Users className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="text-xs font-semibold px-3 py-1.5 bg-[#1664d9] text-white rounded-lg"
            >
              Start Free
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] rounded-lg cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#e5e8ee] bg-white px-4 py-3 space-y-2">
            <a
              href="#unified-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#424754] hover:bg-[#f1f4fa] rounded-lg"
            >
              Platform
            </a>
            <a
              href="#modules-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#424754] hover:bg-[#f1f4fa] rounded-lg"
            >
              Solutions
            </a>
            <a
              href="#pricing-plans"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#424754] hover:bg-[#f1f4fa] rounded-lg"
            >
              Pricing
            </a>
            <a
              href="#faq-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#424754] hover:bg-[#f1f4fa] rounded-lg"
            >
              Resources &amp; FAQ
            </a>
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <Link href="/login" className="text-sm font-semibold text-[#1664d9] px-2 py-1">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 bg-[#1664d9] text-white rounded-lg"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-16">
        {/* ── SECTION 1: HERO SECTION ─────────────────────────────────── */}
        <section className="relative w-full pt-12 pb-16 lg:pb-20 overflow-hidden">
          {/* Ambient Background Lighting */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#1664d9]/5 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            {/* Eyebrow Badge with subtle BornoSoft attribution */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#ebeef4] rounded-full mb-4 shadow-2xs border border-[#dfe3e8]/60">
              <span className="w-2 h-2 rounded-full bg-[#006e2a]" />
              <span className="text-[11px] uppercase tracking-wider text-[#424754] font-semibold">
                The Business Operating System
              </span>
              <span className="text-[#c2c6d6] hidden sm:inline">•</span>
              <span className="text-[11px] text-[#727785] font-medium hidden sm:inline">
                {BRAND_CONFIG.parentCompany.attributionLabel}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] lg:leading-[62px] max-w-4xl text-[#181c20] font-bold tracking-tight mb-4">
              Everything Your Business Needs.{" "}
              <span className="text-[#1664d9]">One Powerful Platform.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#424754] max-w-2xl mb-8 leading-relaxed">
              Run your store, people, inventory, finance, and operations from one connected platform built for modern businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-7 py-3 bg-[#1664d9] text-white text-[14px] font-semibold rounded-xl hover:bg-[#004caf] transition-all shadow-sm cursor-pointer"
              >
                Start Free
              </Link>
              <a
                href="#unified-section"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#181c20] text-[14px] font-semibold rounded-xl hover:bg-[#f1f4fa] transition-all shadow-xs border border-[#dfe3e8]"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4 text-[#1664d9]" />
              </a>
            </div>

            {/* Trust Line */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[#424754] text-xs mb-10">
              <div className="flex items-center gap-1 text-[#006e2a] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Free for 7 days</span>
              </div>
              <span className="text-[#c2c6d6]">•</span>
              <span>No credit card required</span>
              <span className="text-[#c2c6d6]">•</span>
              <span>Instant setup in 3 minutes</span>
            </div>

            {/* Full-bleed Real SaaS Dashboard Mockup */}
            <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl border border-[#dfe3e8] overflow-hidden text-left">
              {/* Browser / Chrome Top Bar */}
              <div className="bg-[#ebeef4] px-4 py-2.5 flex items-center justify-between border-b border-[#dfe3e8]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
                  <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                  <div className="w-3 h-3 rounded-full bg-[#34A853]" />
                  <div className="ml-3 px-3 py-0.5 bg-white rounded text-[#424754] text-[11px] font-mono flex items-center gap-1.5 shadow-2xs border border-[#dfe3e8]">
                    <Lock className="w-3 h-3 text-[#727785]" />
                    <span>app.bornoland.com/workspace/dhaka-main</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse" />
                  <span className="text-[11px] text-[#006e2a] font-semibold hidden sm:inline">
                    Live Realtime Sync
                  </span>
                </div>
              </div>

              {/* Dashboard App Shell Frame */}
              <div className="flex flex-col lg:flex-row min-h-[540px] bg-white">
                {/* Mini Sidebar Navigation Rail */}
                <aside className="w-full lg:w-48 bg-[#f1f4fa] p-3 flex lg:flex-col gap-1 shrink-0 overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-[#dfe3e8]">
                  <div className="hidden lg:flex items-center gap-2 px-2 py-2 mb-2 bg-white rounded-lg border border-[#dfe3e8] shadow-2xs">
                    <div className="w-6 h-6 rounded bg-[#1664d9] flex items-center justify-center text-white font-bold text-xs">
                      B
                    </div>
                    <span className="text-[13px] font-semibold text-[#181c20] truncate">
                      Artisan Crafts BD
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#e5e8ee] text-[#004caf] text-[13px] font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Commerce</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <QrCode className="w-4 h-4" />
                    <span>POS Store</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <Boxes className="w-4 h-4" />
                    <span>Inventory</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <Users className="w-4 h-4" />
                    <span>HRM &amp; Payroll</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <Wallet className="w-4 h-4" />
                    <span>Finance</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#424754] hover:bg-[#e5e8ee]/60 text-[13px] font-medium transition-colors">
                    <LineChart className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                </aside>

                {/* Main Operating Area */}
                <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 bg-[#f7f9ff]">
                  {/* Top Controls Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1">
                    <div>
                      <h2 className="text-lg font-bold text-[#181c20]">Consolidated Hub Overview</h2>
                      <p className="text-xs text-[#424754]">
                        Today&apos;s live cross-channel performance &amp; store activity
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#f1f4fa] text-[#424754] rounded-lg text-xs border border-[#dfe3e8]">
                        Dhaka, Chittagong, Sylhet
                      </span>
                      <span className="px-3 py-1 bg-[#1664d9] text-white rounded-lg text-xs font-semibold shadow-2xs">
                        + New Action
                      </span>
                    </div>
                  </div>

                  {/* KPI Metric Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 bg-white rounded-xl shadow-2xs border border-[#dfe3e8]">
                      <span className="text-[11px] text-[#424754] uppercase font-semibold tracking-wider">
                        Total Revenue
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#181c20]">৳ 1,482,900</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[#006e2a] text-[11px] font-semibold">
                        <span>↑ +18.4% vs last week</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl shadow-2xs border border-[#dfe3e8]">
                      <span className="text-[11px] text-[#424754] uppercase font-semibold tracking-wider">
                        Active Orders
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#181c20]">342</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[#1664d9] text-[11px] font-semibold">
                        <span>→ 42 ready for dispatch</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl shadow-2xs border border-[#dfe3e8]">
                      <span className="text-[11px] text-[#424754] uppercase font-semibold tracking-wider">
                        In-Stock Items
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#181c20]">12,480</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[#424754] text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a] inline-block" />
                        <span>98.6% fulfillment rate</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl shadow-2xs border border-[#dfe3e8]">
                      <span className="text-[11px] text-[#424754] uppercase font-semibold tracking-wider">
                        On-Duty Staff
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold text-[#181c20]">48 / 52</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[#006e2a] text-[11px] font-semibold">
                        <span>✓ All biometric shifts sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Central Split: Sales Area Chart & Live Orders Table */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Chart Section */}
                    <div className="lg:col-span-7 bg-white p-4 rounded-xl shadow-2xs border border-[#dfe3e8] flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-[#181c20]">
                            Revenue Velocity (Online &amp; POS)
                          </h3>
                          <p className="text-xs text-[#424754]">Real-time combined transaction stream</p>
                        </div>
                        <div className="flex gap-1 bg-[#f1f4fa] p-1 rounded-lg border border-[#dfe3e8]">
                          {(["7D", "30D", "YTD"] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                                chartRange === range
                                  ? "bg-white text-[#181c20] shadow-2xs"
                                  : "text-[#424754] hover:text-[#181c20]"
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inline Chart SVG */}
                      <div className="w-full h-40 flex items-end pt-2">
                        <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 500 160">
                          <defs>
                            <linearGradient id="heroGradientReact" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#1664D9" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#1664D9" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,130 C70,110 110,140 180,75 C240,25 310,95 380,45 C430,10 470,30 500,20 L500,160 L0,160 Z"
                            fill="url(#heroGradientReact)"
                          />
                          <path
                            d="M0,130 C70,110 110,140 180,75 C240,25 310,95 380,45 C430,10 470,30 500,20"
                            stroke="#1664D9"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                          />
                          <circle cx="180" cy="75" fill="#1664D9" r="4" />
                          <circle cx="380" cy="45" fill="#1664D9" r="4" />
                          <circle cx="500" cy="20" fill="#1664D9" r="4" />
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[#424754] text-[11px] pt-2 border-t border-[#f1f4fa]">
                        <span>Mon (৳ 180k)</span>
                        <span>Wed (৳ 245k)</span>
                        <span>Fri (৳ 310k)</span>
                        <span className="font-semibold text-[#1664d9]">Sun (৳ 428k Peak)</span>
                      </div>
                    </div>

                    {/* Right Recent Orders Feed */}
                    <div className="lg:col-span-5 bg-white p-4 rounded-xl shadow-2xs border border-[#dfe3e8] flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-[#181c20]">Recent Multi-Channel Sales</h3>
                        <span className="text-xs text-[#1664d9] font-semibold cursor-pointer">View All</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[#f1f4fa] text-[#424754] text-[11px] font-semibold">
                              <th className="py-2 px-2 rounded-l">Order</th>
                              <th className="py-2 px-2">Channel</th>
                              <th className="py-2 px-2 text-right">Amount</th>
                              <th className="py-2 px-2 text-right rounded-r">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f4fa]">
                            <tr>
                              <td className="py-2 px-2 font-semibold text-[#181c20]">#ORD-9821</td>
                              <td className="py-2 px-2 text-[#424754]">Storefront Web</td>
                              <td className="py-2 px-2 text-right font-bold text-[#181c20]">৳ 4,850</td>
                              <td className="py-2 px-2 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[10px] font-bold">
                                  Paid
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-2 font-semibold text-[#181c20]">#ORD-9820</td>
                              <td className="py-2 px-2 text-[#424754]">POS Banani Hub</td>
                              <td className="py-2 px-2 text-right font-bold text-[#181c20]">৳ 12,400</td>
                              <td className="py-2 px-2 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[10px] font-bold">
                                  Paid
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-2 font-semibold text-[#181c20]">#ORD-9819</td>
                              <td className="py-2 px-2 text-[#424754]">bKash Checkout</td>
                              <td className="py-2 px-2 text-right font-bold text-[#181c20]">৳ 1,920</td>
                              <td className="py-2 px-2 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-[#d9e2ff] text-[#001944] text-[10px] font-bold">
                                  Processing
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-2 font-semibold text-[#181c20]">#ORD-9818</td>
                              <td className="py-2 px-2 text-[#424754]">POS Sylhet Store</td>
                              <td className="py-2 px-2 text-right font-bold text-[#181c20]">৳ 8,350</td>
                              <td className="py-2 px-2 text-right">
                                <span className="px-2 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[10px] font-bold">
                                  Paid
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-auto pt-2 flex items-center justify-between text-[#424754] text-xs bg-[#f1f4fa] px-2.5 py-1.5 rounded-lg border border-[#dfe3e8]">
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-[#006e2a]" />
                          <span>Inventory reconciled across 3 locations</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#1664d9]">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: THE PROBLEM (Fragmented vs Unified) ─────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#824000] uppercase tracking-wider">
                The Operational Reality
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Why Run Your Business Across 7 Disconnected Tools?
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Traditional businesses waste hundreds of hours manually syncing spreadsheets, reconciling mismatched inventory, and paying multiple steep subscriptions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Disconnected Tools Side */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#ffdad6] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] text-xs font-bold rounded-full uppercase tracking-wider">
                      The Disconnected Nightmare
                    </span>
                    <XCircle className="w-6 h-6 text-[#ba1a1a]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#181c20] mb-2">
                    Multiple subscriptions, broken data flows
                  </h3>
                  <p className="text-xs sm:text-sm text-[#424754] mb-6 leading-relaxed">
                    One software for POS, another for accounting, an isolated Shopify or WooCommerce store, and human resources tracked on loose spreadsheets.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Duplicate Data Entry
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          Manual transfer between online store orders and warehouse dispatch notes causes constant human errors.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Hours Lost in Manual Reconciliation
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          Reconciling physical store POS cash drawers with bank accounts and bKash merchant wallets takes hours daily.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Fragmented Business Visibility
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          Executive leaders lack an immediate unified picture of true gross margins, stock holding costs, and operational payroll overhead.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 p-3.5 bg-[#ebeef4] rounded-xl flex items-center justify-between text-[#424754] text-xs font-medium border border-[#dfe3e8]">
                  <span>Average monthly spend:</span>
                  <span className="text-[#ba1a1a] font-bold text-sm">৳ 32,000+ across 5 distinct licenses</span>
                </div>
              </div>

              {/* BornoLand Unified OS Side */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#8ffa9b] flex flex-col justify-between ring-2 ring-[#006e2a]/10">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-[#8ffa9b] text-[#002108] text-xs font-bold rounded-full uppercase tracking-wider">
                      The BornoLand Approach
                    </span>
                    <CheckCircle2 className="w-6 h-6 text-[#006e2a]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#181c20] mb-2">
                    One connected source of truth for everything
                  </h3>
                  <p className="text-xs sm:text-sm text-[#424754] mb-6 leading-relaxed">
                    A native, unified architecture where orders update inventory in real time, payroll automatically links to business expenses, and reports compile effortlessly.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#006e2a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Zero Redundancy &amp; Instant Sync
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          When an item sells on your online storefront or in your physical retail outlet, stock automatically updates everywhere instantly.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#006e2a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Automated Financial Books
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          Sales transactions, supplier purchasing POs, staff salaries, and tax deductions post seamlessly to real-time ledgers.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#006e2a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-[#181c20] block font-semibold">
                          Single Secure Sign-On &amp; Transparent Billing
                        </strong>
                        <span className="text-xs text-[#424754] leading-relaxed block mt-0.5">
                          One simple monthly subscription paid directly in BDT with role-based team access controls for store managers and accountants.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 p-3.5 bg-[#d9e2ff] text-[#001944] rounded-xl flex items-center justify-between text-xs font-semibold border border-[#afc6ff]">
                  <span>Predictable unified cost:</span>
                  <span className="text-[#004caf] font-bold text-sm">From ৳ 2,499/mo (All core modules included)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: UNIFIED PLATFORM (Visual Architecture Topology) ── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]" id="unified-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Seamless Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                One Unified Source of Truth for Every Department
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Rather than gluing mismatched apps with fragile webhooks, BornoLand modules share a native database engine designed for zero latency and uncompromised consistency.
              </p>
            </div>

            {/* Interactive Unified Radial Grid Canvas */}
            <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-[#dfe3e8]">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 relative z-10">
                {[
                  { icon: Store, name: "Commerce", desc: "Direct to Consumer" },
                  { icon: Boxes, name: "Inventory", desc: "Multi-Warehouse" },
                  { icon: ShoppingCart, name: "Purchasing", desc: "Supplier POs" },
                  { icon: QrCode, name: "POS", desc: "Physical Outlets" },
                  { icon: Users, name: "HRM", desc: "Attendance & Staff" },
                  { icon: FileText, name: "Payroll", desc: "Automated Salary" },
                  { icon: Building2, name: "Finance", desc: "Ledgers & Tax" },
                  { icon: HeartHandshake, name: "CRM", desc: "Retention & Points" },
                  { icon: Truck, name: "Operations", desc: "Fulfillment Rules" },
                  { icon: LineChart, name: "Analytics", desc: "Executive Reports" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#f1f4fa] flex flex-col items-center text-center shadow-2xs hover:bg-[#e5e8ee] transition-colors border border-[#dfe3e8]/70 group cursor-default"
                  >
                    <item.icon className="w-7 h-7 text-[#1664d9] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-[#181c20] font-bold">{item.name}</span>
                    <span className="text-[11px] text-[#424754] mt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>

              {/* Central Core Pulse Band */}
              <div className="mt-6 p-4 bg-[#1664d9] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Unified Enterprise Data Engine</h4>
                    <p className="text-xs text-[#e5eaff] mt-0.5">
                      Sub-millisecond read/write latency across online, retail, and back-office nodes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    99.99% Guaranteed SLA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: PRODUCT MODULES (9-Card Grid) ───────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]" id="modules-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Modular Breadth
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Everything Your Business Needs, Connected
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Activate what you need today, seamlessly turn on advanced operational capabilities as your retail footprint or online store scales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Store,
                  title: "Commerce",
                  desc: "Sell online and manage customer orders with high-conversion checkout, custom themes, and local payment integration.",
                  linkText: "Explore Commerce",
                },
                {
                  icon: Boxes,
                  title: "Inventory",
                  desc: "Know exactly what you have. Real-time multi-warehouse tracking, batch management, and automated low-stock reorders.",
                  linkText: "Explore Inventory",
                },
                {
                  icon: QrCode,
                  title: "POS",
                  desc: "Fast checkout for physical stores. Barcode scanning, offline-ready sync, bKash QR codes, and multi-register support.",
                  linkText: "Explore POS",
                },
                {
                  icon: Users,
                  title: "HRM",
                  desc: "Manage employees, attendance, shifts, and leave approvals without the chaos of paper forms or unstructured chats.",
                  linkText: "Explore HRM",
                },
                {
                  icon: FileText,
                  title: "Payroll",
                  desc: "Automate salary calculations, provident fund withholdings, festival bonuses, and one-click downloadable PDF payslips.",
                  linkText: "Explore Payroll",
                },
                {
                  icon: Wallet,
                  title: "Finance",
                  desc: "Track money, overhead expenses, supplier payables, VAT obligations, and consolidated real-time profit & loss.",
                  linkText: "Explore Finance",
                },
                {
                  icon: HeartHandshake,
                  title: "CRM & Loyalty",
                  desc: "Understand and retain customers. Track order history across online and physical stores, and trigger SMS promotional campaigns.",
                  linkText: "Explore CRM",
                },
                {
                  icon: Truck,
                  title: "Operations & Logistics",
                  desc: "Connect local courier logistics (Pathao, RedX, Steadfast), generate bulk shipping labels, and track delivery status automatically.",
                  linkText: "Explore Operations",
                },
                {
                  icon: LineChart,
                  title: "Analytics",
                  desc: "Turn business data into decisions. Monitor conversion funnels, top GMV products, staff sales efficiency, and shrinkage risks.",
                  linkText: "Explore Analytics",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#dfe3e8]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#d9e2ff] flex items-center justify-center text-[#1664d9] mb-4">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#181c20] mb-1.5">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-[#424754] leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-5 pt-2 flex items-center text-[#1664d9] text-xs font-semibold">
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 5: E-COMMERCE DEEP DIVE ─────────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Content Left */}
              <div className="lg:col-span-6">
                <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                  Commerce Engine
                </span>
                <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5 mb-4">
                  Design Beautiful Storefronts Without the Complexity
                </h2>
                <p className="text-sm sm:text-base text-[#424754] mb-6 leading-relaxed">
                  Build your high-performance direct-to-consumer digital store in minutes. Complete with local payment processing, automated shipping label generation, and lightning-fast SEO.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#006e2a]" />
                    <span>Custom Domain Setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#006e2a]" />
                    <span>bKash, Nagad, Card Gateways</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#006e2a]" />
                    <span>Product Variant Matrix</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#006e2a]" />
                    <span>Built-in SEO &amp; OpenGraph</span>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1664d9] text-white text-xs font-semibold rounded-xl hover:bg-[#004caf] transition-colors shadow-2xs"
                >
                  <span>Explore Commerce Features</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Realistic Storefront Builder Mockup Right */}
              <div className="lg:col-span-6 bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-[#dfe3e8]">
                <div className="flex items-center justify-between pb-2 mb-3 bg-[#f1f4fa] p-2 rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#181c20]">Store Preview:</span>
                    <span className="px-2 py-0.5 bg-white rounded text-[#1664d9] text-xs font-mono border border-[#dfe3e8]">
                      mystore.bornoland.store
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[11px] font-bold">
                    Live SSL
                  </span>
                </div>

                {/* Storefront Header Preview */}
                <div className="p-3.5 bg-[#f1f4fa] rounded-xl mb-3 flex items-center justify-between border border-[#dfe3e8]">
                  <span className="text-sm font-black text-[#181c20] tracking-wider">NOIR APPAREL</span>
                  <div className="flex items-center gap-3 text-[#424754] text-xs font-medium">
                    <span>Men</span>
                    <span>Women</span>
                    <span>Accessories</span>
                    <div className="relative">
                      <ShoppingBag className="w-4 h-4 text-[#181c20]" />
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#1664d9] text-white text-[9px] flex items-center justify-center font-bold">
                        2
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Mini Grid Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f7f9ff] p-2.5 rounded-xl border border-[#dfe3e8]">
                    <img
                      className="w-full h-28 rounded-lg object-cover mb-2"
                      alt="Minimalist modern premium black linen men kurta"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAcN5sqS1Yk-QO548ZIg55loqbSOsQbbyooN73lT8sZBo45octfwLlHV6ccynUq69cKo5ln5FcGJ5QGn3PvcynH2ITjxf6L1olnTXgnd8l46VqrzgfSWcp886eCPvWSXi0x6wvkCOppbGB9j1vt_ObfdxI7G_umxoUlkLiQ0LmM7x4h8DQECQKhZ-qhWMpOE3DAQqe_R8ppXjDBik8_2IsQR8WqWtMCf-NL42GRnj1qhFNMP_Abspl"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[#181c20] truncate">Linen Heritage Kurta</h4>
                        <span className="text-[11px] text-[#424754]">Black / M</span>
                      </div>
                      <span className="text-xs font-bold text-[#1664d9]">৳ 3,250</span>
                    </div>
                  </div>

                  <div className="bg-[#f7f9ff] p-2.5 rounded-xl border border-[#dfe3e8]">
                    <img
                      className="w-full h-28 rounded-lg object-cover mb-2"
                      alt="Elegant structured leather folio"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2fTHV1jLVrKIHOdpsMd5C_O_Jl_zMIx_s8vye4AfLha2zLxy5dhfLAo9swmi9fD6qcCFNSWe4IAPi_YxOw3CUCWFRo-d8tQrMNchiSuHwGYuXjtoQs1niA_vJwzSkjZ1xjshhTNm4bllcEddOl4gpaR2_HsTAUn2sbhKs6_6fwe0ysylOSbWTfvklePQ6UO0oTpLLCl2TBUwMZR8-17tYFwYmn62xYthW8Vdmmo44twELtg9JFvQQ"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[#181c20] truncate">Classic Leather Folio</h4>
                        <span className="text-[11px] text-[#424754]">Cognac Tan</span>
                      </div>
                      <span className="text-xs font-bold text-[#1664d9]">৳ 4,800</span>
                    </div>
                  </div>
                </div>

                {/* Cart Checkout Drawer Preview */}
                <div className="mt-3 p-2.5 bg-[#f1f4fa] rounded-xl flex items-center justify-between border border-[#dfe3e8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#181c20]">
                    <ShieldCheck className="w-4 h-4 text-[#006e2a]" />
                    <span>One-Click Checkout Enabled (bKash &amp; Cards)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1664d9]">3.2s load time</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: POS (Alternating, Left Visual) ─────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Realistic POS Terminal UI Mockup Left */}
              <div className="lg:col-span-7 bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-[#dfe3e8] order-2 lg:order-1">
                {/* POS Top Bar */}
                <div className="flex items-center justify-between pb-2 mb-3 bg-[#f1f4fa] p-2 rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006e2a]" />
                    <span className="text-xs font-bold text-[#181c20]">Banani Store Register #01</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#424754]">
                    <span>Cashier: Fahim A.</span>
                    <span className="px-2 py-0.5 rounded bg-[#8ffa9b] text-[#002108] text-[10px] font-bold">
                      Offline Sync Active
                    </span>
                  </div>
                </div>

                {/* POS Split: Catalog Quick Tap & Active Register Cart */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Left Items Quick Select */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex items-center gap-2 bg-[#f1f4fa] p-2 rounded-lg border border-[#dfe3e8]">
                      <QrCode className="w-4 h-4 text-[#424754]" />
                      <input
                        className="bg-transparent text-xs w-full outline-none text-[#181c20]"
                        placeholder="Scan SKU or search product..."
                        readOnly
                        value="Silk"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-[#f1f4fa] hover:bg-[#e5e8ee] rounded-lg cursor-pointer transition-colors border border-[#dfe3e8]">
                        <span className="text-xs text-[#181c20] font-bold block truncate">Jamdani Silk Scarf</span>
                        <span className="text-[10px] text-[#424754] block">SKU-7729</span>
                        <span className="text-xs font-bold text-[#1664d9] mt-1 block">৳ 1,850</span>
                      </div>
                      <div className="p-2.5 bg-[#f1f4fa] hover:bg-[#e5e8ee] rounded-lg cursor-pointer transition-colors border border-[#dfe3e8]">
                        <span className="text-xs text-[#181c20] font-bold block truncate">Silk Blend Panjabi</span>
                        <span className="text-[10px] text-[#424754] block">SKU-8104</span>
                        <span className="text-xs font-bold text-[#1664d9] mt-1 block">৳ 3,900</span>
                      </div>
                      <div className="p-2.5 bg-[#f1f4fa] hover:bg-[#e5e8ee] rounded-lg cursor-pointer transition-colors border border-[#dfe3e8]">
                        <span className="text-xs text-[#181c20] font-bold block truncate">Embroidered Dupatta</span>
                        <span className="text-[10px] text-[#424754] block">SKU-4412</span>
                        <span className="text-xs font-bold text-[#1664d9] mt-1 block">৳ 1,200</span>
                      </div>
                      <div className="p-2.5 bg-[#f1f4fa] hover:bg-[#e5e8ee] rounded-lg cursor-pointer transition-colors border border-[#dfe3e8]">
                        <span className="text-xs text-[#181c20] font-bold block truncate">Cotton Silk Waistcoat</span>
                        <span className="text-[10px] text-[#424754] block">SKU-5201</span>
                        <span className="text-xs font-bold text-[#1664d9] mt-1 block">৳ 2,450</span>
                      </div>
                    </div>
                  </div>

                  {/* Right POS Register Cart */}
                  <div className="md:col-span-5 bg-[#f1f4fa] p-3 rounded-xl flex flex-col justify-between border border-[#dfe3e8]">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#dfe3e8]">
                        <span className="text-xs font-bold text-[#181c20]">Customer: Walk-in</span>
                        <span className="text-[11px] text-[#1664d9] font-bold cursor-pointer">+ Add CRM</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <div>
                            <span className="text-[#181c20] block font-semibold">Silk Blend Panjabi</span>
                            <span className="text-[#424754] text-[10px]">Qty: 1 x ৳ 3,900</span>
                          </div>
                          <span className="font-bold text-[#181c20]">৳ 3,900</span>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <span className="text-[#181c20] block font-semibold">Jamdani Scarf</span>
                            <span className="text-[#424754] text-[10px]">Qty: 1 x ৳ 1,850</span>
                          </div>
                          <span className="font-bold text-[#181c20]">৳ 1,850</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 mt-3 border-t border-[#dfe3e8]">
                      <div className="flex justify-between text-xs font-bold text-[#181c20] mb-2">
                        <span>Total Due:</span>
                        <span className="text-sm text-[#1664d9] font-extrabold">৳ 5,750</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button className="py-1.5 bg-[#dfe3e8] text-[#181c20] rounded text-[11px] font-bold">
                          Cash
                        </button>
                        <button className="py-1.5 bg-[#dfe3e8] text-[#181c20] rounded text-[11px] font-bold">
                          Card
                        </button>
                        <button className="py-1.5 bg-[#1664d9] text-white rounded text-[11px] font-bold">
                          bKash QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Right */}
              <div className="lg:col-span-5 order-1 lg:order-2">
                <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                  Point of Sale
                </span>
                <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5 mb-4">
                  Lightning-Fast POS, Built for Real Retail
                </h2>
                <p className="text-sm sm:text-base text-[#424754] mb-6 leading-relaxed">
                  Keep physical lines moving quickly. Runs directly on your iPad, Android tablet, or desktop browser with instant offline resilience if internet drops out.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <WifiOff className="w-5 h-5 text-[#006e2a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-[#181c20] block font-semibold">
                        Offline-First Architecture
                      </strong>
                      <p className="text-xs text-[#424754] mt-0.5 leading-relaxed">
                        Continue making sales during power or broadband disruptions. Transacted receipts automatically sync back to cloud when restored.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-[#006e2a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-[#181c20] block font-semibold">
                        Native Mobile Financial Services (MFS)
                      </strong>
                      <p className="text-xs text-[#424754] mt-0.5 leading-relaxed">
                        One-tap dynamic QR generation for bKash, Nagad, and Rocket payments with immediate terminal webhook confirmation.
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#181c20] text-xs font-semibold rounded-xl hover:bg-[#f1f4fa] transition-colors shadow-2xs border border-[#dfe3e8]"
                >
                  <span>See POS Hardware Support</span>
                  <ArrowRight className="w-4 h-4 text-[#1664d9]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: INVENTORY (Multi-Warehouse) ─────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Multi-Location Inventory
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Know What You Have. Wherever It Is.
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Keep stock levels accurate across all your retail outlets, main warehouses, and returns hubs with automated low-stock warnings.
              </p>
            </div>

            {/* Warehouse UI Dashboard Grid */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-[#dfe3e8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#dfe3e8]">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#181c20]">Warehouse Overview</span>
                  <span className="px-2.5 py-0.5 bg-[#f1f4fa] text-[#181c20] text-xs font-semibold rounded-full border border-[#dfe3e8]">
                    3 Active Hubs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-[#f1f4fa] text-[#181c20] rounded-lg text-xs font-semibold border border-[#dfe3e8]">
                    Transfer Stock
                  </button>
                  <button className="px-3 py-1.5 bg-[#1664d9] text-white rounded-lg text-xs font-semibold shadow-2xs">
                    + Purchase Requisition
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Hub 1: Dhaka Central */}
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181c20]">Dhaka Central Depot</span>
                    <span className="w-2 h-2 rounded-full bg-[#006e2a]" />
                  </div>
                  <p className="text-xs text-[#424754] mb-3">Tejgaon Industrial Area</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#424754]">Capacity Used</span>
                      <span className="font-bold text-[#181c20]">82%</span>
                    </div>
                    <div className="w-full bg-[#dfe3e8] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1664d9] h-full w-[82%]" />
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-[#424754]">Active SKUs: 1,420</span>
                      <span className="font-semibold text-[#006e2a]">Healthy</span>
                    </div>
                  </div>
                </div>

                {/* Hub 2: Chattogram Hub */}
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181c20]">Chattogram Port Hub</span>
                    <span className="w-2 h-2 rounded-full bg-[#006e2a]" />
                  </div>
                  <p className="text-xs text-[#424754] mb-3">Agrabad Commercial Area</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#424754]">Capacity Used</span>
                      <span className="font-bold text-[#181c20]">64%</span>
                    </div>
                    <div className="w-full bg-[#dfe3e8] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1664d9] h-full w-[64%]" />
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-[#424754]">Active SKUs: 890</span>
                      <span className="font-semibold text-[#006e2a]">Healthy</span>
                    </div>
                  </div>
                </div>

                {/* Hub 3: Sylhet Outlet */}
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#181c20]">Sylhet Retail Hub</span>
                    <span className="w-2 h-2 rounded-full bg-[#824000]" />
                  </div>
                  <p className="text-xs text-[#424754] mb-3">Zindabazar Mall</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#424754]">Capacity Used</span>
                      <span className="font-bold text-[#181c20]">94%</span>
                    </div>
                    <div className="w-full bg-[#dfe3e8] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#a65300] h-full w-[94%]" />
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-[#424754]">Active SKUs: 430</span>
                      <span className="font-semibold text-[#824000]">3 Low Stock Alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f1f4fa] text-[#424754] text-[11px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l">SKU / Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Dhaka Central</th>
                      <th className="py-2.5 px-3">Chattogram</th>
                      <th className="py-2.5 px-3">Sylhet</th>
                      <th className="py-2.5 px-3 text-right rounded-r">Reorder Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f4fa]">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#181c20]">Premium Linen Shirt (Navy / L)</td>
                      <td className="py-3 px-3 text-[#424754]">Men&apos;s Apparel</td>
                      <td className="py-3 px-3 font-semibold">420 units</td>
                      <td className="py-3 px-3 font-semibold">180 units</td>
                      <td className="py-3 px-3 font-bold text-[#ba1a1a]">8 units</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-bold text-[10px]">
                          Auto PO Generated
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#181c20]">Wireless POS Barcode Scanner</td>
                      <td className="py-3 px-3 text-[#424754]">Hardware</td>
                      <td className="py-3 px-3 font-semibold">64 units</td>
                      <td className="py-3 px-3 font-semibold">22 units</td>
                      <td className="py-3 px-3 font-semibold">14 units</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] font-bold text-[10px]">
                          Optimal
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 8: HRM & PAYROLL ───────────────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Content Left */}
              <div className="lg:col-span-5">
                <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                  Human Resources
                </span>
                <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5 mb-4">
                  Manage Your People Without the Paperwork
                </h2>
                <p className="text-sm sm:text-base text-[#424754] mb-6 leading-relaxed">
                  Track biometric attendance, manage leave requests, and calculate accurate monthly salaries with tax deductions in a single click.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <Fingerprint className="w-5 h-5 text-[#006e2a]" />
                    <span>Biometric Machine &amp; App Geofence Check-in</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <Calculator className="w-5 h-5 text-[#006e2a]" />
                    <span>Tax &amp; Provident Fund Automation</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#181c20] text-sm font-semibold">
                    <FileText className="w-5 h-5 text-[#006e2a]" />
                    <span>Bulk PDF Payslips Sent to WhatsApp &amp; Email</span>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1664d9] text-white text-xs font-semibold rounded-xl hover:bg-[#004caf] transition-colors shadow-2xs"
                >
                  <span>Explore HRM Tools</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Realistic HRM Dashboard Card Right */}
              <div className="lg:col-span-7 bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-[#dfe3e8]">
                <div className="flex items-center justify-between pb-2.5 mb-3 bg-[#f1f4fa] p-2.5 rounded-xl border border-[#dfe3e8]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#181c20]">March 2026 Payroll Run</span>
                    <span className="px-2 py-0.5 bg-[#8ffa9b] text-[#002108] text-[10px] font-bold rounded-full">
                      Ready for Disbursal
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#1664d9]">Total: ৳ 1,840,000</span>
                </div>

                {/* Staff Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f1f4fa] text-[#424754] text-[11px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-2 rounded-l">Employee</th>
                        <th className="py-2.5 px-2">Role</th>
                        <th className="py-2.5 px-2">Attendance</th>
                        <th className="py-2.5 px-2 text-right">Net Salary</th>
                        <th className="py-2.5 px-2 text-right rounded-r">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f4fa]">
                      <tr>
                        <td className="py-3 px-2 flex items-center gap-2">
                          <img
                            className="w-7 h-7 rounded-full object-cover"
                            alt="Tanvir Hasan"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLBxny-MVJ2dpjBI1eTa3RoMpEV3ZDfxmLPwDQaiFQxTuLubkjbxGHP1VUMO6-O8vdEOcdE3sWH00RVXUqZB2wEekDp0MKzzjewVd65goa7nFCqXfPVt1oTOp3b7MUWsAU0qH_qw1qZslEYcjrDmv-qnJWrwroFApeabjnp6jgmArCFJzS6p6_ucoPKlTIyPhm6C-F0YXcSaO-LNSdxNdx2Zd74ykcT7tHPgaYHkk-82Q51zdR9qsG"
                          />
                          <div>
                            <span className="font-bold text-[#181c20] block">Tanvir Hasan</span>
                            <span className="text-[#424754] text-[10px]">EMP-104</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[#424754]">Store Manager</td>
                        <td className="py-3 px-2 font-semibold text-[#006e2a]">26 / 26 days</td>
                        <td className="py-3 px-2 text-right font-bold text-[#181c20]">৳ 65,000</td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-[#1664d9] text-[11px] font-bold cursor-pointer hover:underline">
                            PDF Download
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 flex items-center gap-2">
                          <img
                            className="w-7 h-7 rounded-full object-cover"
                            alt="Nusrat Jahan"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuPp2PnI_wqPvukJU6TmveomGwmotAy9OQRu_HezxZTnF2WrLr0Y8bsIip9YgyilVvnUxn1VFqdhabCQKycGT-kqPwL1xAsqWg95LGaFeM9xpCDNHhzfnwOxQINhFEplE1-V8OKclM1xZwgiS-ejnQNpPeV_jfJac_R0Cgs7jVg2PL7wiGNgt7QiisTKKNsQ-KHb54Lts77Bjdc9ii1M8nlfYpRHa7mZOAk8kpDJtX14a2IOJ2gTLB"
                          />
                          <div>
                            <span className="font-bold text-[#181c20] block">Nusrat Jahan</span>
                            <span className="text-[#424754] text-[10px]">EMP-108</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[#424754]">Senior Accountant</td>
                        <td className="py-3 px-2 font-semibold text-[#006e2a]">25 / 26 days</td>
                        <td className="py-3 px-2 text-right font-bold text-[#181c20]">৳ 58,000</td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-[#1664d9] text-[11px] font-bold cursor-pointer hover:underline">
                            PDF Download
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#dfe3e8] text-[#181c20] flex items-center justify-center font-bold text-[10px]">
                            RJ
                          </div>
                          <div>
                            <span className="font-bold text-[#181c20] block">Rakib Joy</span>
                            <span className="text-[#424754] text-[10px]">EMP-119</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[#424754]">POS Cashier</td>
                        <td className="py-3 px-2 font-semibold text-[#006e2a]">26 / 26 days</td>
                        <td className="py-3 px-2 text-right font-bold text-[#181c20]">৳ 24,000</td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-[#1664d9] text-[11px] font-bold cursor-pointer hover:underline">
                            PDF Download
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#424754] border-t border-[#f1f4fa]">
                  <span>Bank Salary Sheet (.XLSX &amp; BEFTN ready)</span>
                  <button className="px-3 py-1 bg-[#006e2a] text-white rounded-lg text-xs font-semibold shadow-2xs">
                    Disburse Via Bank
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 9: FINANCE & ACCOUNTING ────────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Financial Transparency
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Your Business Finances, Understood at a Glance
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Never wait until month-end for accounting clarity. Real-time ledger entries keep your cash flow, accounts payable, and net profitability immediately clear.
              </p>
            </div>

            {/* Financial Oversight UI Card */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-[#dfe3e8]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754] uppercase font-semibold">Net Profit (MTD)</span>
                  <span className="text-xl font-bold text-[#006e2a] block mt-1">৳ 428,500</span>
                  <span className="text-xs text-[#424754]">Margin: 28.9%</span>
                </div>
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754] uppercase font-semibold">Operational Expenses</span>
                  <span className="text-xl font-bold text-[#181c20] block mt-1">৳ 612,000</span>
                  <span className="text-xs text-[#424754]">Payroll, Logistics, Rent</span>
                </div>
                <div className="p-4 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754] uppercase font-semibold">Outstanding Invoices</span>
                  <span className="text-xl font-bold text-[#824000] block mt-1">৳ 94,200</span>
                  <span className="text-xs text-[#424754]">3 Wholesalers Due</span>
                </div>
              </div>

              {/* Revenue vs Cost Breakdown Visual */}
              <div className="p-4 bg-[#f1f4fa] rounded-xl mb-4 border border-[#dfe3e8]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#181c20]">Revenue vs Cost Breakdown</span>
                  <span className="text-[11px] text-[#424754]">Calculated live from sales and supplier POs</span>
                </div>
                <div className="w-full h-3 bg-[#dfe3e8] rounded-full overflow-hidden flex">
                  <div className="bg-[#006e2a] h-full w-[45%]" title="Net Profit (45%)" />
                  <div className="bg-[#1664d9] h-full w-[35%]" title="Cost of Goods (35%)" />
                  <div className="bg-[#a65300] h-full w-[20%]" title="Overheads (20%)" />
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-[#424754]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006e2a]" />
                    <span>Net Margin (45%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1664d9]" />
                    <span>Cost of Goods (35%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a65300]" />
                    <span>Operating Overheads (20%)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[#424754] text-xs pt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006e2a]" />
                  <span>National Board of Revenue (NBR) Compliant Invoicing Formats Supported</span>
                </div>
                <span className="text-[#1664d9] font-bold text-xs hover:underline mt-2 sm:mt-0 cursor-pointer">
                  Download Balance Sheet (PDF)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 10: ANALYTICS & EXECUTIVE INTELLIGENCE ────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Business Intelligence
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Your Entire Enterprise, Understood in Seconds
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Real-time dashboards turn disparate operational transactions into clear visual graphs. Forecast inventory runs, optimize store staffing, and identify top customer cohorts.
              </p>
            </div>

            {/* Executive Analytics Dashboard Frame */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-[#dfe3e8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#dfe3e8]">
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Cross-Channel Executive Pulse</h3>
                  <p className="text-xs text-[#424754]">Consolidated metrics updated 4 seconds ago</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="px-3 py-1 bg-[#f1f4fa] text-[#181c20] rounded-lg text-xs border border-[#dfe3e8]">
                    Export CSV
                  </span>
                  <span className="px-3 py-1 bg-[#1664d9] text-white rounded-lg text-xs font-semibold shadow-2xs">
                    Custom Metrics
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754]">Avg. Order Value</span>
                  <span className="text-base font-bold text-[#181c20] block mt-0.5">৳ 2,940</span>
                  <span className="text-[#006e2a] text-[10px] font-semibold">+8.2% vs last month</span>
                </div>
                <div className="p-3 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754]">Store Repeat Rate</span>
                  <span className="text-base font-bold text-[#181c20] block mt-0.5">42.6%</span>
                  <span className="text-[#006e2a] text-[10px] font-semibold">+5.1% retention</span>
                </div>
                <div className="p-3 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754]">Inventory Turnover</span>
                  <span className="text-base font-bold text-[#181c20] block mt-0.5">6.8x / yr</span>
                  <span className="text-[#424754] text-[10px]">Benchmark: 5.2x</span>
                </div>
                <div className="p-3 bg-[#f1f4fa] rounded-xl border border-[#dfe3e8]">
                  <span className="text-[11px] text-[#424754]">Courier Delivery Success</span>
                  <span className="text-base font-bold text-[#181c20] block mt-0.5">96.4%</span>
                  <span className="text-[#006e2a] text-[10px] font-semibold">RTO Return Rate: 3.6%</span>
                </div>
              </div>

              {/* Line Chart Mockup */}
              <div className="w-full bg-[#f1f4fa] p-4 rounded-xl border border-[#dfe3e8]">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="text-[#181c20] font-bold">Yearly Growth Trajectory (Online vs Physical Retail)</span>
                  <span className="text-[#1664d9] font-bold">Combined GMV: ৳ 14.8M</span>
                </div>
                <svg className="w-full h-32" preserveAspectRatio="none" viewBox="0 0 600 120">
                  <path d="M0,100 Q150,80 300,50 T600,20" fill="none" stroke="#1664D9" strokeLinecap="round" strokeWidth="3" />
                  <path d="M0,90 Q150,70 300,60 T600,40" fill="none" stroke="#006E2A" strokeDasharray="4,4" strokeWidth="2" />
                </svg>
                <div className="flex justify-between text-[10px] text-[#424754] mt-2 font-mono">
                  <span>JAN</span>
                  <span>MAR</span>
                  <span>MAY</span>
                  <span>JUL</span>
                  <span>SEP</span>
                  <span>NOV</span>
                  <span>CURRENT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 11: WHY BORNOLAND (4 Cards) ────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Engineered for Reliability
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Built to Grow With Your Business
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Software designed with Google-grade visual clarity and robust local infrastructure foundations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#d9e2ff] flex items-center justify-center text-[#1664d9] mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#181c20] mb-1">One Unified OS</h3>
                  <p className="text-xs text-[#424754] leading-relaxed">
                    Eliminate software chaos. Everything is natively linked together on a shared relational database.
                  </p>
                </div>
                <div className="mt-4 pt-2 text-xs font-bold text-[#1664d9]">Zero Integration Debt</div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#8ffa9b] flex items-center justify-center text-[#002108] mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#181c20] mb-1">Built for Bangladesh</h3>
                  <p className="text-xs text-[#424754] leading-relaxed">
                    Designed around domestic business customs, BDT ৳ currency formatting, and instant MFS payment setups.
                  </p>
                </div>
                <div className="mt-4 pt-2 text-xs font-bold text-[#006e2a]">Direct bKash/Nagad APIs</div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#d9e2ff] flex items-center justify-center text-[#1664d9] mb-4">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#181c20] mb-1">Scales With You</h3>
                  <p className="text-xs text-[#424754] leading-relaxed">
                    From an ambitious solo boutique to a nationwide retail chain with 40+ stores across metropolitan hubs.
                  </p>
                </div>
                <div className="mt-4 pt-2 text-xs font-bold text-[#1664d9]">Enterprise Ready</div>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#8ffa9b] flex items-center justify-center text-[#002108] mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#181c20] mb-1">Simple by Design</h3>
                  <p className="text-xs text-[#424754] leading-relaxed">
                    Your floor staff and store operators will master the POS and inventory workflows within 15 minutes of onboarding.
                  </p>
                </div>
                <div className="mt-4 pt-2 text-xs font-bold text-[#006e2a]">Zero Training Headache</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 12: SOCIAL PROOF / TESTIMONIALS ───────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Trusted by Industry Leaders
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Built for Modern Businesses Across Bangladesh
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                See how leading domestic brands transformed their operations with BornoLand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Testimonial 1 */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#424754] mb-6 leading-relaxed">
                    &quot;We used to waste 3 hours every single evening manually matching receipts between our Gulshan showroom POS and online store inventory. BornoLand unified all 4 locations in one clean weekend.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-[#f1f4fa]">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Saadman Rafiq"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeyfiGmGabrnYgz93KadqwVpmpfS6EUx3sJrHIGTmf_xPpFFfOzUDS91k3DSCy8AVmGRiV4ItXZJtaYwOs6HsMzCpEWlBgL0r4eew26NBi9bX9NVKqWa0q93916P285Y2zpT9KhCpL30gX4RYSZYlvEJTjzg6cHi3MSe4bSvVOMWp-wLcxHgV1PoZyiO2JP71JVWBqmOk6C0VII1KylLQSpeLEqgF-04IFnrwqJQsppOj3pqacLi_Q"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181c20] block">Saadman Rafiq</span>
                    <span className="text-[11px] text-[#424754]">Founder &amp; CEO, Fabrika Lifestyle</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#424754] mb-6 leading-relaxed">
                    &quot;Running payroll for 65 warehouse and logistics employees was a nightmare on Excel. BornoLand calculates attendance, overtime, and generates digital payslips automatically. It saves us ৳ 50,000 monthly.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-[#f1f4fa]">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Farhana Islam"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOjlg-k-Xb6AdHdZDjXwawKu3PVgqVtUQJmmvkOj98ABK2fb4qEvmnKVa8YwHTWzxZAs263LiJXvW8ynxWrdhxULIjYM5chNsd473QTAUFuf2iW-hz9D7CBVz89il0PMsIRvhm1H2m7oYz1_zLkHUWWv-qn6i_O_wvokbxq9jGMm4196OjtTcSrRRhZ68030w7c8hRJfE0JLUF5vEUGxcv-R6hEdkvAcPxzNMrcTW5AT5TD6X6y28h"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181c20] block">Farhana Islam</span>
                    <span className="text-[11px] text-[#424754]">Head of Operations, Apex Gadgets</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#424754] mb-6 leading-relaxed">
                    &quot;The POS terminal offline mode saved us repeatedly during broadband hiccups. The cashier never skipped a beat, and receipts auto-synced the moment the connection returned. Utterly bulletproof.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-[#f1f4fa]">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Mahmudul Karim"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4DSY-OfiVJjaiz7kCpIjWP7dsX6rB327ZaPJnyy_u0kExuljkQbuwS9JIpjDTPmgSSGlIVk8Z8BL-gAT15EPsuH92XwJJBQj71WCnkzC5sTygXSw1a_9Fde8YvgHCnptos2m4OD-Ff7TVyLNnQTf87anZlASp8EGm2LA_GoJMAsBYuiizFi5J308H_onFWyOCcuPP53jtfre01HqhQu2-SuZ3AQRwBHLRvu72Z2Q9N2Ei79TJcwSO"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#181c20] block">Mahmudul Karim</span>
                    <span className="text-[11px] text-[#424754]">Retail Director, Green Harvest</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 13: PRICING ────────────────────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f7f9ff]" id="pricing-plans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Predictable Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Simple Plans. Scale as You Grow.
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 mb-6 leading-relaxed">
                No hidden implementation fees. Pay directly in BDT with your local credit card or corporate mobile banking.
              </p>

              {/* Monthly / Yearly Billing Switcher */}
              <div className="inline-flex items-center bg-[#ebeef4] p-1 rounded-xl border border-[#dfe3e8]">
                <button
                  onClick={() => setIsYearlyBilling(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isYearlyBilling
                      ? "bg-white text-[#181c20] shadow-2xs"
                      : "text-[#424754] hover:text-[#181c20]"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setIsYearlyBilling(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isYearlyBilling
                      ? "bg-white text-[#181c20] shadow-2xs"
                      : "text-[#424754] hover:text-[#181c20]"
                  }`}
                >
                  <span>Yearly Billing</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[10px] font-extrabold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. Starter */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Starter</h3>
                  <p className="text-xs text-[#424754] mt-1">For single store owners launching online and offline.</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-[#181c20]">
                      {isYearlyBilling ? "৳ 1,999" : "৳ 2,499"}
                    </span>
                    <span className="text-xs text-[#424754]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#181c20] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> 1 Physical Store Location
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> 1 Online Storefront
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Up to 5 Team Accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Full Inventory &amp; POS Sync
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> bKash / Nagad Direct Gateway
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 text-center bg-[#f1f4fa] text-[#181c20] rounded-xl text-xs font-bold hover:bg-[#e5e8ee] transition-colors block border border-[#dfe3e8]"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              {/* 2. Business (Most Popular) */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#1664d9] relative flex flex-col justify-between bg-gradient-to-b from-[#1664d9]/5 via-white to-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#1664d9] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Business</h3>
                  <p className="text-xs text-[#424754] mt-1">For growing multi-outlet retailers and regional brands.</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-[#1664d9]">
                      {isYearlyBilling ? "৳ 4,799" : "৳ 5,999"}
                    </span>
                    <span className="text-xs text-[#424754]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#181c20] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Up to 3 Store Locations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Custom Storefront Domain
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Up to 20 Staff Accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Full HRM &amp; Auto Payroll
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Multi-Warehouse Transfers
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Priority WhatsApp Support
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 text-center bg-[#1664d9] text-white rounded-xl text-xs font-bold hover:bg-[#004caf] transition-colors shadow-sm block"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* 3. Professional */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Professional</h3>
                  <p className="text-xs text-[#424754] mt-1">For established retail networks with high order volume.</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-[#181c20]">
                      {isYearlyBilling ? "৳ 9,599" : "৳ 11,999"}
                    </span>
                    <span className="text-xs text-[#424754]"> / month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#181c20] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Up to 10 Store Outlets
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> 50 Staff &amp; Permissions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Advanced Accounting &amp; NBR VAT
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Automated Courier Dispatch API
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Dedicated Account Manager
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 text-center bg-[#f1f4fa] text-[#181c20] rounded-xl text-xs font-bold hover:bg-[#e5e8ee] transition-colors block border border-[#dfe3e8]"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              {/* 4. Enterprise */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dfe3e8] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Enterprise</h3>
                  <p className="text-xs text-[#424754] mt-1">For major conglomerates and nationwide distribution chains.</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-[#181c20]">Custom</span>
                    <span className="text-xs text-[#424754] block mt-0.5">Tailored deployment</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#181c20] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Unlimited Outlets &amp; Hubs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> Custom API Webhooks &amp; Bridges
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> On-premise or Private Cloud
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> 99.99% Uptime SLA Agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#006e2a]" /> 24/7 Phone Incident Line
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="w-full py-2.5 text-center bg-[#f1f4fa] text-[#181c20] rounded-xl text-xs font-bold hover:bg-[#e5e8ee] transition-colors block border border-[#dfe3e8]"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 14: FAQ ────────────────────────────────────────── */}
        <section className="w-full py-16 lg:py-24 bg-[#f1f4fa]" id="faq-section">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-[#1664d9] uppercase tracking-wider">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-4xl text-[#181c20] font-bold tracking-tight mt-1.5">
                Everything You Need to Know About BornoLand
              </h2>
              <p className="text-sm sm:text-base text-[#424754] mt-2 leading-relaxed">
                Clear answers about setup, migration, features, and capabilities.
              </p>
            </div>

            <div className="space-y-2">
              {faqItems.map((item, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-xl shadow-2xs border border-[#dfe3e8] overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-[#181c20] cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#424754] transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-[#1664d9]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-[#424754] leading-relaxed border-t border-[#f1f4fa] pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 15: FINAL CTA BANNER (Dark Luxury Slate) ──────── */}
        <section className="w-full py-16 lg:py-24 bg-[#0F172A] text-white relative overflow-hidden">
          {/* Ambient Blue Flare */}
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#1664d9]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
              Ready to Run Your Entire Business from One Platform?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Start with the tools you need today. Add more as your retail presence and online operations grow across the country.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Link
                href="/register"
                className="px-7 py-3 bg-[#1664d9] text-white text-sm font-bold rounded-xl hover:bg-[#004caf] transition-all shadow-md"
              >
                Start Free Today
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                Talk to Enterprise Sales
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8ffa9b]" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#8ffa9b]" />
                <span>Ready in 3 minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-[#8ffa9b]" />
                <span>Dedicated onboarding support</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#f1f4fa] border-t border-[#dfe3e8] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
            <div className="col-span-2">
              <div className="mb-3">
                <BornoLandBrandLogo />
              </div>
              <p className="text-xs text-[#424754] max-w-sm leading-relaxed mb-3">
                {BRAND_CONFIG.tagline}
              </p>
              {/* Product Attribution */}
              <div className="text-xs">
                <ProductOwnershipBadge variant="text" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#181c20] uppercase tracking-wider mb-3">
                Platform
              </h3>
              <ul className="space-y-2 text-xs text-[#424754]">
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    Commerce
                  </a>
                </li>
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    POS
                  </a>
                </li>
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    Inventory
                  </a>
                </li>
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    HRM
                  </a>
                </li>
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    Finance
                  </a>
                </li>
                <li>
                  <a href="#unified-section" className="hover:text-[#181c20] transition-colors">
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#181c20] uppercase tracking-wider mb-3">
                Company
              </h3>
              <ul className="space-y-2 text-xs text-[#424754]">
                <li>
                  <Link href="/about" className="hover:text-[#181c20] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#181c20] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[#181c20] transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#181c20] uppercase tracking-wider mb-3">
                Resources
              </h3>
              <ul className="space-y-2 text-xs text-[#424754]">
                <li>
                  <Link href="/docs" className="hover:text-[#181c20] transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-[#181c20] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-[#181c20] transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#181c20] uppercase tracking-wider mb-3">
                Legal
              </h3>
              <ul className="space-y-2 text-xs text-[#424754]">
                <li>
                  <Link href="/privacy" className="hover:text-[#181c20] transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#181c20] transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-[#181c20] transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#dfe3e8] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#424754]">
            <p>{BRAND_CONFIG.copyright.text}</p>
            <div className="flex items-center gap-4">
              <CompanyAttributionLink />
              <span className="text-[#c2c6d6] hidden md:inline">•</span>
              <Link href="/privacy" className="hover:text-[#181c20] transition-colors hidden md:inline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#181c20] transition-colors hidden md:inline">
                Terms of Service
              </Link>
              <Link href="/support" className="hover:text-[#181c20] transition-colors hidden md:inline">
                Trust &amp; Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
