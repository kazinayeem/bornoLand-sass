"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { Reveal, AnimatedNumber } from "./motion-primitives";
import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPublicPlansQuery } from "@/redux/api/public-plan-api";
import { useGetProfileQuery } from "@/redux/api/profile-api";

interface FallbackPlan {
  id: string;
  name: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limits: string;
}

const DEFAULT_PLANS: FallbackPlan[] = [
  {
    id: "starter",
    name: "Starter",
    desc: "Ideal for boutique shops and single-location retail stores.",
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: [
      "1 Branded Online Storefront",
      "1 Cloud POS Terminal Register",
      "Up to 500 Products & SKU Variants",
      "Stripe, bKash & COD Checkout",
      "Standard Inventory Tracking",
      "Daily Automatic Cloud Backups",
    ],
    limits: "1 Store • 2 Staff Seats",
  },
  {
    id: "growth",
    name: "Growth",
    desc: "Designed for scaling brands with active online and in-store sales.",
    monthlyPrice: 79,
    yearlyPrice: 64,
    popular: true,
    features: [
      "2 Storefronts + Custom Domains",
      "3 Cloud POS Terminal Registers",
      "Unlimited Products & SKU Barcodes",
      "Multi-Warehouse Stock Routing",
      "Automated Double-Entry Accounting",
      "HRM & Staff Shift Attendance",
      "Automated Courier API Booking",
    ],
    limits: "2 Stores • 5 Staff Seats",
  },
  {
    id: "business",
    name: "Business",
    desc: "Complete BOS solution for high-volume retailers and multi-branch chains.",
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      "5 Stores with Multi-Brand Management",
      "Unlimited Cloud POS Registers",
      "Full Chart of Accounts & P&L Statement",
      "Automated Monthly Payroll Engine",
      "Supplier PO Intake & Waste Tracking",
      "CRM Deal Pipeline & Support Desk",
      "Priority 24/7 SLA Support",
    ],
    limits: "5 Stores • 15 Staff Seats",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    desc: "Custom infrastructure, ERP migrations, and dedicated account management.",
    monthlyPrice: 299,
    yearlyPrice: 249,
    features: [
      "Unlimited Stores & Warehouses",
      "Dedicated Database Cluster & Isolation",
      "Custom ERP & Bank API Integrations",
      "Custom Role-Based Access Rules",
      "Dedicated Solution Architect",
      "99.99% Uptime Enterprise SLA",
    ],
    limits: "Unlimited Everything",
  },
];

export function StoryPricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: publicPlansData } = useGetPublicPlansQuery();
  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  const plans = useMemo(() => {
    const rawPlans = publicPlansData?.data?.plans;
    if (rawPlans && rawPlans.length > 0) {
      return rawPlans.map((p) => {
        const monthly = p.pricing?.monthly ?? p.priceBDT ?? 29;
        const yearly = p.pricing?.yearly ?? p.priceYearly ?? Math.round(monthly * 0.8);
        const warehouses = p.limits?.warehouses ?? 1;
        const staff = p.limits?.staff ?? 2;
        return {
          id: p._id || p.slug,
          name: p.name,
          desc: p.description || "Comprehensive commerce and operational platform.",
          monthlyPrice: monthly,
          yearlyPrice: yearly,
          popular: p.isPopular || p.isRecommended || p.slug === "growth",
          features: p.features && p.features.length > 0 ? p.features : [
            "Branded Online Storefront",
            "Cloud POS Terminal Register",
            "Multi-Warehouse Inventory",
            "Automated Double-Entry Accounting",
            "Staff Shift Attendance",
          ],
          limits: `${warehouses} Warehouse${warehouses > 1 ? "s" : ""} • ${staff} Staff Seat${staff > 1 ? "s" : ""}`,
        };
      });
    }
    return DEFAULT_PLANS;
  }, [publicPlansData]);

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <Reveal direction="down" delay={40}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              TRANSPARENT VALUE
            </span>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Simple, Predictable Plans. Scale as You Grow.
            </h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              Start with a 7-day free trial. Upgrade anytime to unlock advanced multi-warehouse routing and double-entry accounting.
            </p>
          </Reveal>

          {/* Monthly / Yearly Billing Toggle */}
          <Reveal direction="up" delay={180}>
            <div className="flex items-center justify-center gap-3 pt-3">
              <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    !isYearly ? "bg-[#003399] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-950"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    isYearly ? "bg-[#003399] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-950"
                  )}
                >
                  <span>Yearly</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFDA1A] text-[#111111] text-[9px] font-black">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4-Tier Plan Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, idx) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <Reveal key={plan.id} direction="up" delay={idx * 70 + 120}>
                <div
                  className={cn(
                    "relative h-full flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 shadow-2xs",
                    plan.popular
                      ? "bg-white border-[#003399] shadow-lg ring-2 ring-[#003399]/15 -translate-y-1"
                      : "bg-white border-zinc-200/90 hover:border-zinc-300 hover:shadow-md"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#003399] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#FFDA1A]" />
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-zinc-950">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1 min-h-[36px] leading-relaxed">{plan.desc}</p>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2 border-t border-zinc-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-950">
                          <AnimatedNumber value={price} prefix="$" />
                        </span>
                        <span className="text-xs text-zinc-500 font-semibold">/ month</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{plan.limits}</p>
                    </div>

                    {/* Feature Checklist */}
                    <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                      {plan.features.slice(0, 6).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-700">
                          <Check className="h-3.5 w-3.5 text-[#0A8A00] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6">
                    <Link
                      href={isAuthenticated ? "/dashboard" : "/register"}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs",
                        plan.popular
                          ? "bg-[#003399] text-white hover:bg-[#002B80] shadow-sm"
                          : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                      )}
                    >
                      <span>{isAuthenticated ? "Go to Dashboard" : "Start 7-Day Free Trial"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
