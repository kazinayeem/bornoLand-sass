"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { LandingButton } from "./landing-button";
import { Check, ArrowRight } from "lucide-react";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import { useLandingLocale } from "./landing-locale";

export function StoryPricing() {
  const { locale } = useLandingLocale();
  const [isYearly, setIsYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  const PLANS = [
    {
      name: "Starter",
      slug: "starter",
      priceMonthly: "৳৯৯৯",
      priceYearly: "৳৭৯৯",
      desc: "নতুন অনলাইন শপ ও ফেসবুক সেলারদের জন্য আদর্শ।",
      badge: null,
      cta: "শুরু করুন",
      popular: false,
      features: [
        "১টি অনলাইন শপ",
        "সর্বোচ্চ ৫০০টি পণ্য",
        "কাস্টম ডোমেইন কানেক্ট",
        "বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি",
        "অটোমেটিক A4 PDF ইনভয়েস",
        "স্ট্যান্ডার্ড সাপোর্ট",
      ],
    },
    {
      name: "Growth",
      slug: "growth",
      priceMonthly: "৳১,৯৯০",
      priceYearly: "৳১,৫৯০",
      desc: "ক্রমবর্ধমান ব্যবসা ও ফ্যাশন ব্র্যান্ডের জন্য সবচেয়ে উপযোগী।",
      badge: "সবচেয়ে জনপ্রিয়",
      cta: "প্ল্যান বেছে নিন",
      popular: true,
      features: [
        "৩টি অনলাইন শপ",
        "আনলিমিটেড পণ্য ও ক্যাটাগরি",
        "ভিজুয়াল ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার",
        "পাঠাও ও স্টেডফাস্ট কুরিয়ার সিঙ্ক",
        "রিয়েল-টাইম সেলস অ্যানালিটিক্স",
        "২৪/৭ প্রিমিয়াম সাপোর্ট",
      ],
    },
    {
      name: "Business",
      slug: "business",
      priceMonthly: "৳২,৪৯০",
      priceYearly: "৳১,৯৯০",
      desc: "বড় শপ, এজেন্সি ও একাধিক দোকান পরিচালনাকারীদের জন্য।",
      badge: null,
      cta: "প্ল্যান বেছে নিন",
      popular: false,
      features: [
        "আনলিমিটেড অনলাইন শপ",
        "টিম অ্যাক্সেস ও স্টাফ রোল",
        "অটোমেটিক ইনভেন্টরি অ্যালার্ট",
        "অ্যাডভান্সড কুরিয়ার ও পেমেন্ট ইন্টিগ্রেশন",
        "ডেডিকেটেড একাউন্ট ম্যানেজার",
        "priority সাপোর্ট",
      ],
    },
    {
      name: "Custom",
      slug: "custom",
      priceMonthly: "যোগাযোগ করুন",
      priceYearly: "যোগাযোগ করুন",
      desc: "বড় প্রতিষ্ঠান ও কাস্টম প্রয়োজনের জন্য ডেডিকেটেড সমাধান।",
      badge: null,
      cta: "যোগাযোগ করুন",
      popular: false,
      features: [
        "কাস্টম ক্লাউড ইনফ্রাস্ট্রাকচার",
        "REST API ও Webhooks অ্যাক্সেস",
        "ERP ও সফটওয়্যার ইন্টিগ্রেশন",
        "ডেডিকেটেড সার্ভার ও SLA",
        "২৪/৭ ফোন ও ইমেইল সাপোর্ট",
      ],
    },
  ];

  const COMPARISON_ROWS = [
    { name: "অনলাইন দোকান", starter: "১টি", growth: "৩টি", biz: "আনলিমিটেড", custom: "কাস্টম" },
    { name: "পণ্য সংখ্যা", starter: "৫০০টি", growth: "আনলিমিটেড", biz: "আনলিমিটেড", custom: "আনলিমিটেড" },
    { name: "কাস্টম ডোমেইন", starter: "✓", growth: "✓", biz: "✓", custom: "✓" },
    { name: "ভিজুয়াল স্টোর বিল্ডার", starter: "স্ট্যান্ডার্ড", growth: "অ্যাডভান্সড", biz: "প্রিমিয়াম", custom: "কাস্টম" },
    { name: "বিকাশ ও নগদ পেমেন্ট", starter: "✓", growth: "✓", biz: "✓", custom: "✓" },
    { name: "ক্যাশ অন ডেলিভারি (COD)", starter: "✓", growth: "✓", biz: "✓", custom: "✓" },
    { name: "অটো PDF ইনভয়েস", starter: "✓", growth: "✓", biz: "✓", custom: "✓" },
    { name: "কুরিয়ার ইন্টিগ্রেশন", starter: "—", growth: "✓", biz: "✓", custom: "✓" },
    { name: "সেলস অ্যানালিটিক্স", starter: "বেসিক", growth: "অ্যাডভান্সড", biz: "প্রিমিয়াম", custom: "কাস্টম BI" },
    { name: "টিম অ্যাক্সেস (স্টাফ)", starter: "১ জন", growth: "৩ জন", biz: "১০ জন", custom: "আনলিমিটেড" },
    { name: "API ও Webhooks", starter: "—", growth: "—", biz: "✓", custom: "ডেডিকেটেড" },
    { name: "সাপোর্ট", starter: "ইমেইল", growth: "২৪/৭ চ্যাট", biz: "priority ২৪/৭", custom: "ডেডিকেটেড ম্যানেজার" },
  ];

  const getPlanHref = (slug: string) => {
    if (slug === "custom") return "/contact";
    if (isAuthenticated) return `/dashboard/billing`;
    return `/register?plan=${slug}`;
  };

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            মূল্য তালিকা
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            আপনার ব্যবসার জন্য সঠিক প্ল্যানটি বেছে নিন।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            আজকের দরকার অনুযায়ী প্ল্যান নিন। ব্যবসা বাড়লে সহজেই আপগ্রেড করুন। কোনো লুকানো চার্জ নেই।
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${!isYearly ? "text-zinc-950" : "text-zinc-400"}`}>
              মাসিক
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${
                isYearly ? "bg-blue-600" : "bg-zinc-300"
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
              বার্ষিক
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
              ২০% ছাড়
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
                  {plan.priceMonthly !== "যোগাযোগ করুন" && (
                    <span className="text-xs text-zinc-500 font-medium ml-1">/ মাস</span>
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
                <LandingButton
                  variant={plan.popular ? "primary" : "secondary"}
                  size="default"
                  href={getPlanHref(plan.slug)}
                  className="w-full"
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </LandingButton>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix Toggle */}
        <div className="mt-14 max-w-5xl mx-auto text-center space-y-6">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-800 hover:text-blue-600 transition-colors"
          >
            <span>{showComparison ? "প্ল্যান তুলনা গোপন করুন" : "সকল প্ল্যানের বিস্তারিত তুলনা দেখুন"}</span>
            <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showComparison ? "-rotate-90" : "rotate-90"}`} />
          </button>

          {showComparison && (
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl overflow-x-auto text-left text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] font-bold uppercase text-zinc-500">
                    <th className="py-3 px-4">ফিচারসমূহ</th>
                    <th className="py-3 px-3 text-center">Starter</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-600">Growth</th>
                    <th className="py-3 px-3 text-center">Business</th>
                    <th className="py-3 px-3 text-center">Custom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {COMPARISON_ROWS.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-semibold text-zinc-800">{row.name}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.starter}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">{row.growth}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.biz}</td>
                      <td className="py-3 px-3 text-center text-zinc-600">{row.custom}</td>
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
