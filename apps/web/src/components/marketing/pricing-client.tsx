"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPublicPlansQuery } from "@/redux/api/public-plan-api";
import {
  resolvePlanFeatures,
  resolvePlanPricing,
  resolvePlanCta,
} from "@/lib/plan-display-utils";
import type { Plan } from "@/redux/api/store-api";

export function PricingClient() {
  const [isAnnual, setIsAnnual] = useState(true);

  const {
    data: plansData,
    isLoading,
    isError,
    refetch,
  } = useGetPublicPlansQuery();

  const publicPlans = useMemo(() => {
    const list = (plansData?.data?.plans ?? []) as Plan[];
    return [...list]
      .filter((p) => p.isActive !== false && p.visible !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.priceBDT - b.priceBDT);
  }, [plansData]);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing in BDT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Simple Plans. Scale as You Grow.
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 mb-6 leading-relaxed">
            No hidden setup charges. All core business modules included. Pay with local cards or corporate mobile banking.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-[#ebeef4] p-1 rounded-xl border border-[#dfe3e8]">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                !isAnnual
                  ? "bg-white text-[#181c20] shadow-2xs"
                  : "text-[#424754] hover:text-[#181c20]"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                isAnnual
                  ? "bg-white text-[#181c20] shadow-2xs"
                  : "text-[#424754] hover:text-[#181c20]"
              )}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#8ffa9b] text-[#002108] text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Plan Grid / Skeletons / Error Fallback */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-white p-6 sm:p-7 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col justify-between animate-pulse",
                  i === 2 && "border-2 border-[#1664d9]/30"
                )}
              >
                <div>
                  <div className="h-5 w-24 bg-zinc-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-zinc-100 rounded mb-5" />
                  <div className="my-5">
                    <div className="h-8 w-32 bg-zinc-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-zinc-100 rounded" />
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-zinc-200 shrink-0" />
                        <div className="h-3 w-full bg-zinc-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 w-full bg-zinc-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center max-w-lg mx-auto space-y-3 mb-16">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Plans are temporarily unavailable</h3>
            <p className="text-xs text-zinc-500">
              We are unable to load the latest subscription tiers right now. Please try again or reach out to our team.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-[#1664d9] text-white rounded-xl text-xs font-bold hover:bg-[#004caf] transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <Link
                href="/contact"
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        ) : publicPlans.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm text-center max-w-lg mx-auto space-y-3 mb-16">
            <h3 className="text-base font-bold text-zinc-900">No public plans currently available</h3>
            <p className="text-xs text-zinc-500">
              Please check back shortly or reach out to our team for custom subscription details.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex px-4 py-2 bg-[#1664d9] text-white rounded-xl text-xs font-bold hover:bg-[#004caf] transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-6 mb-16",
              publicPlans.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
            )}
          >
            {publicPlans.map((plan) => {
              const isPopular = Boolean(plan.isPopular || plan.isRecommended);
              const pricingInfo = resolvePlanPricing(plan, isAnnual);
              const featuresList = resolvePlanFeatures(plan);
              const cta = resolvePlanCta(plan);

              return (
                <div
                  key={plan._id || plan.slug}
                  className={cn(
                    "bg-white p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-all relative",
                    isPopular
                      ? "border-2 border-[#1664d9] shadow-lg bg-gradient-to-b from-[#1664d9]/5 via-white to-white"
                      : "border-[#dfe3e8] shadow-sm hover:shadow-md"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#1664d9] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-[#181c20]">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-[#424754] mt-1 min-h-[32px] leading-relaxed line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="my-5">
                      <span
                        className={cn(
                          "text-3xl font-extrabold",
                          isPopular ? "text-[#1664d9]" : "text-[#181c20]"
                        )}
                      >
                        {pricingInfo.priceDisplay}
                      </span>
                      <span className="text-xs text-[#424754]">
                        {pricingInfo.suffix}
                      </span>
                      {pricingInfo.annualTotalNote && (
                        <span className="block text-[11px] text-[#006e2a] font-semibold mt-0.5">
                          {pricingInfo.annualTotalNote}
                        </span>
                      )}
                    </div>

                    {/* Dynamic Resource Limits Pill Box if available */}
                    {plan.limits && (
                      <div className="bg-[#f7f9ff] p-3 rounded-xl border border-[#dfe3e8]/70 text-[11px] font-semibold text-[#181c20] space-y-1 mb-5">
                        <div>
                          • {plan.limits.products === 0 || plan.limits.products >= 99999
                            ? "Unlimited Products"
                            : `Up to ${plan.limits.products?.toLocaleString() || 100} Products`}
                        </div>
                        <div>
                          • {plan.limits.staff === 0 || plan.limits.staff >= 999
                            ? "Unlimited Staff"
                            : `Up to ${plan.limits.staff || 1} Staff Account${(plan.limits.staff || 1) > 1 ? "s" : ""}`}
                        </div>
                        <div>
                          • {plan.featureToggles?.pos
                            ? plan.limits.posDevices === 0 || plan.limits.posDevices >= 999
                              ? "Unlimited POS Registers"
                              : `Up to ${plan.limits.posDevices || 1} POS Register${(plan.limits.posDevices || 1) > 1 ? "s" : ""}`
                            : "Web Storefront & Dashboard"}
                        </div>
                      </div>
                    )}

                    {/* Features Checklist */}
                    <ul className="space-y-2 text-xs text-[#181c20] mb-6">
                      {featuresList.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Link
                      href={cta.href}
                      className={cn(
                        "w-full py-2.5 text-center rounded-xl text-xs font-bold block transition-all shadow-2xs",
                        isPopular
                          ? "bg-[#1664d9] text-white hover:bg-[#004caf]"
                          : "bg-[#f1f4fa] text-[#181c20] hover:bg-[#e5e8ee] border border-[#dfe3e8]"
                      )}
                    >
                      {cta.label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pricing FAQ Hook */}
        <div className="text-center bg-[#f1f4fa] p-8 rounded-2xl border border-[#dfe3e8] max-w-3xl mx-auto space-y-3">
          <h3 className="text-lg font-bold text-[#181c20]">Have questions regarding billing?</h3>
          <p className="text-xs sm:text-sm text-[#424754]">
            Learn about pro-rated upgrades, cancellation policies, VAT invoice receipts, and multi-branch volume discounts.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/faq#billing"
              className="px-4 py-2 bg-white text-[#1664d9] rounded-xl text-xs font-bold border border-[#dfe3e8] hover:bg-zinc-50"
            >
              Read Billing FAQ
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-[#1664d9] text-white rounded-xl text-xs font-bold hover:bg-[#004caf]"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
