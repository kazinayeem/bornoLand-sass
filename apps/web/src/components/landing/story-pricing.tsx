"use client";

import { useState } from "react";
import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { Check, ArrowRight } from "lucide-react";

export function StoryPricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const PLANS = [
    {
      name: "Free",
      priceMonthly: "৳ 0",
      priceYearly: "৳ 0",
      desc: "For new entrepreneurs exploring online selling.",
      badge: null,
      cta: "Get Started Free",
      popular: false,
      features: [
        "1 Online Store",
        "Up to 25 Products",
        "Standard Storefront Theme",
        "Cash on Delivery Support",
        "Email Order Invoices",
        "Community Support",
      ],
    },
    {
      name: "Starter",
      priceMonthly: "৳ 999",
      priceYearly: "৳ 799",
      desc: "Essential features for growing boutique brands.",
      badge: null,
      cta: "Start 7-Day Trial",
      popular: false,
      features: [
        "1 Online Store",
        "Up to 500 Products",
        "Connect Custom Apex Domain",
        "bKash, Nagad & COD",
        "Local Delivery Zones",
        "Automated A4 PDF Invoices",
        "Standard Support",
      ],
    },
    {
      name: "Business",
      priceMonthly: "৳ 2,499",
      priceYearly: "৳ 1,999",
      desc: "Full power for scaling retail brands and agencies.",
      badge: "MOST POPULAR",
      cta: "Start 7-Day Trial",
      popular: true,
      features: [
        "Up to 3 Online Stores",
        "Unlimited Products & Variants",
        "Visual Drag & Drop Builder",
        "Steadfast & Pathao Courier Sync",
        "Real-Time Analytics & Funnels",
        "Staff Accounts & Roles",
        "Priority 24/7 Support",
      ],
    },
    {
      name: "Enterprise",
      priceMonthly: "Custom",
      priceYearly: "Custom",
      desc: "Custom architecture for large multi-brand operations.",
      badge: null,
      cta: "Contact Sales",
      popular: false,
      features: [
        "Unlimited Online Stores",
        "Dedicated Cloud Infrastructure",
        "REST API & Webhooks Access",
        "Custom ERP Integrations",
        "Dedicated Account Manager",
        "99.9% Uptime SLA",
      ],
    },
  ];

  const COMPARISON_ROWS = [
    { name: "Online Stores", free: "1", starter: "1", biz: "3", ent: "Unlimited" },
    { name: "Products Catalog", free: "25", starter: "500", biz: "Unlimited", ent: "Unlimited" },
    { name: "Custom Apex Domain", free: "—", starter: "✓", biz: "✓", ent: "✓" },
    { name: "Visual Storefront Builder", free: "Basic", starter: "Standard", biz: "Advanced", ent: "Custom" },
    { name: "bKash & Nagad Payments", free: "—", starter: "✓", biz: "✓", ent: "✓" },
    { name: "Cash on Delivery Rules", free: "✓", starter: "✓", biz: "✓", ent: "✓" },
    { name: "Automated A4 PDF Invoices", free: "Standard", starter: "✓", biz: "✓", ent: "✓" },
    { name: "Courier Integrations", free: "—", starter: "—", biz: "✓", ent: "✓" },
    { name: "Real-Time Analytics", free: "Basic", starter: "Standard", biz: "Advanced", ent: "Full BI" },
    { name: "Staff Roles & Permissions", free: "1 Admin", starter: "2 Staff", biz: "5 Staff", ent: "Unlimited" },
    { name: "Developer API Access", free: "—", starter: "—", biz: "✓", ent: "Dedicated" },
    { name: "Support SLA", free: "Community", starter: "Standard", biz: "Priority 24/7", ent: "Dedicated Mgr" },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Choose the plan that fits your business.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Start free. Upgrade when you need more. No hidden transaction percentage fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${!isYearly ? "text-zinc-950" : "text-zinc-400"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${
                isYearly ? "bg-zinc-900" : "bg-zinc-300"
              }`}
              aria-label="Toggle annual billing"
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isYearly ? "text-zinc-950" : "text-zinc-400"}`}>
              Yearly
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? "bg-white border-2 border-blue-600 shadow-xl"
                  : "bg-white border border-zinc-200/90 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 min-h-[32px]">{plan.desc}</p>
                </div>

                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-zinc-950">
                    {isYearly ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  {plan.priceMonthly !== "Custom" && (
                    <span className="text-xs text-zinc-500 font-medium ml-1">/ month</span>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-2.5 text-xs text-zinc-600">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100">
                <Link
                  href="/register"
                  className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix Toggle */}
        <div className="mt-14 max-w-5xl mx-auto text-center space-y-6">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-800 hover:text-zinc-950 transition-colors"
          >
            <span>{showComparison ? "Hide full plan comparison" : "Compare all plan features"}</span>
            <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showComparison ? "-rotate-90" : "rotate-90"}`} />
          </button>

          {showComparison && (
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl overflow-x-auto text-left text-xs animate-fadeIn">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] font-bold uppercase text-zinc-500">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-3 text-center">Free</th>
                    <th className="py-3 px-3 text-center">Starter</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-600">Business</th>
                    <th className="py-3 px-3 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {COMPARISON_ROWS.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-semibold text-zinc-800">{row.name}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.free}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.starter}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">{row.biz}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.ent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
