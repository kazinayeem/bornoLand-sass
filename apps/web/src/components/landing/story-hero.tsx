"use client";

import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  Package,
  Calculator,
  Boxes,
  Wallet,
  Landmark,
  Target,
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";
import { landingContainer } from "./landing-ui";
import { LiveIndicator } from "./live-indicator";
import { LandingButton } from "./landing-button";
import { REVENUE_DATA } from "./landing-tokens";
import { scrollToSection } from "@/lib/scroll-utils";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import { useLandingLocale } from "./landing-locale";

export function StoryHero() {
  const { locale, t } = useLandingLocale();
  const [activeTab, setActiveTab] = useState<"overview" | "pos" | "inventory" | "hrm" | "finance" | "crm">("overview");
  const [period, setPeriod] = useState<"Today" | "7D" | "30D" | "90D">("Today");
  const data = REVENUE_DATA[period];
  const maxVal = Math.max(...data.map((d) => d.revenue));

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  const periodLabels: Record<string, string> = {
    Today: locale === "bn" ? "আজ" : "Today",
    "7D": locale === "bn" ? "৭ দিন" : "7 Days",
    "30D": locale === "bn" ? "৩০ দিন" : "30 Days",
    "90D": locale === "bn" ? "৯০ দিন" : "90 Days",
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,51,153,0.08),rgba(255,255,255,0))]">
      <div className={landingContainer}>
        {/* Top Eyebrow */}
        <div className="flex justify-center mb-6">
          <LiveIndicator
            label={locale === "bn" ? "সম্পূর্ণ বিজনেস অপারেটিং সিস্টেম" : "THE COMPLETE BUSINESS OPERATING SYSTEM"}
            sublabel={locale === "bn" ? "কমার্স · অপস · এইচআরএম · ফিন্যান্স · গ্রোথ" : "Commerce · Ops · People · Finance · Growth"}
            className="bg-white/95 border-[#DFDFDF] shadow-[0_1px_3px_rgba(17,17,17,0.06)] text-[#111111]"
          />
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.12]">
            {locale === "bn" ? "আপনার পুরো ব্যবসার জন্য" : "Everything Your Business Needs."}{" "}
            <br />
            <span className="bg-gradient-to-r from-[#003399] via-[#002B80] to-indigo-700 bg-clip-text text-transparent">
              {locale === "bn" ? "একটি শক্তিশালী প্ল্যাটফর্ম।" : "One Powerful Platform."}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#484848] leading-relaxed font-normal">
            {locale === "bn"
              ? "ই-কমার্স, পিওএস, ইনভেন্টরি, ওয়্যারহাউস, এইচআরএম, প্যারোল, অ্যাকাউন্টিং এবং সিআরএম—সবকিছু এখন একটি সেন্ট্রাল ক্লাউড প্ল্যাটফর্মে সংযুক্ত।"
              : "From ecommerce and POS to multi-warehouse inventory, HRM, double-entry accounting, and CRM — BornoLand connects your entire business in one unified platform."}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <LandingButton
              variant="primary"
              size="hero"
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto text-base font-bold bg-[#003399] hover:bg-[#002B80] text-white rounded-[4px] shadow-sm"
            >
              {isAuthenticated
                ? (locale === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard")
                : (locale === "bn" ? "ফ্রি শুরু করুন (Start Free)" : "Start Free")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </LandingButton>

            <LandingButton
              variant="secondary"
              size="hero"
              href="#platform-architecture"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("platform-architecture");
              }}
              className="w-full sm:w-auto text-base font-bold border-2 border-[#003399] text-[#003399] bg-white hover:bg-zinc-50 rounded-[4px] cursor-pointer"
            >
              {locale === "bn" ? "প্ল্যাটফর্ম ঘুরে দেখুন" : "Explore Platform"}
              <ExternalLink className="h-3.5 w-3.5 text-[#003399] ml-1" />
            </LandingButton>
          </div>

          <p className="text-xs text-[#767676] font-medium pt-1">
            {locale === "bn"
              ? "কোনো কোডিং লাগবে না · ইনস্ট্যান্ট স্টোর অ্যাক্সেস · শুরু করতে ক্রেডিট কার্ড লাগে না"
              : "Zero coding required · Instant multi-store access · No credit card required"}
          </p>
        </div>

        {/* Live Interactive Product Dashboard Showcase */}
        <div className="relative mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="rounded-[12px] border border-[#DFDFDF] bg-white p-4 sm:p-6 shadow-[0_8px_24px_rgba(17,17,17,0.12)]">
            {/* Top Interactive Module Selector Tabs */}
            <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-3 mb-4 gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                {[
                  { id: "overview", label: locale === "bn" ? "ওভারভিউ" : "Overview", icon: Layers },
                  { id: "pos", label: locale === "bn" ? "পিওএস (POS)" : "POS Terminal", icon: Calculator },
                  { id: "inventory", label: locale === "bn" ? "ইনভেন্টরি" : "Inventory & True Cost", icon: Boxes },
                  { id: "hrm", label: locale === "bn" ? "এইচআরএম ও বেতন" : "HRM & Payroll", icon: Users },
                  { id: "finance", label: locale === "bn" ? "ফিন্যান্স ও P&L" : "Finance & P&L", icon: Landmark },
                  { id: "crm", label: locale === "bn" ? "সিআরএম ডিল" : "CRM & Growth", icon: Target },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-[#003399] text-white shadow-xs"
                          : "text-[#484848] hover:bg-zinc-100 hover:text-[#111111]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#FFDA1A]/20 border border-[#FFDA1A] text-[10px] font-bold text-[#111111]">
                  {locale === "bn" ? "লাইভ বিজনেস ডাটা" : "Live Business OS"}
                </span>
              </div>
            </div>

            {/* Dynamic Interactive Body */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[4px] bg-[#F5F5F5] border border-[#DFDFDF] space-y-1">
                    <div className="flex items-center justify-between text-[#767676] text-xs">
                      <span>মোট রাজস্ব (Revenue)</span>
                      <TrendingUp className="h-3.5 w-3.5 text-[#0A8A00]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#111111]">৳১,২৪,৫০০</p>
                    <p className="text-[10px] text-[#0A8A00] font-semibold">+১৮.৪% প্রবৃদ্ধি</p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#F5F5F5] border border-[#DFDFDF] space-y-1">
                    <div className="flex items-center justify-between text-[#767676] text-xs">
                      <span>বিক্রিত পণ্যের খরচ (COGS)</span>
                      <Boxes className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#111111]">৳৬৮,২০০</p>
                    <p className="text-[10px] text-[#767676]">প্রকৃত ট্রু কস্ট ভিত্তিক</p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#F5F5F5] border border-[#DFDFDF] space-y-1">
                    <div className="flex items-center justify-between text-[#767676] text-xs">
                      <span>মোট লাভ (Gross Profit)</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#003399]">৳৫৬,৩০০</p>
                    <p className="text-[10px] text-[#003399] font-semibold">৪৫.২% গ্রস মার্জিন</p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#F5F5F5] border border-[#DFDFDF] space-y-1">
                    <div className="flex items-center justify-between text-[#767676] text-xs">
                      <span>সক্রিয় কর্মী ও প্যারোল</span>
                      <Users className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#111111]">১৮ জন</p>
                    <p className="text-[10px] text-[#0A8A00] font-semibold">প্যারোল অডিটেড</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-7 rounded-[4px] border border-[#DFDFDF] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111111]">লাইভ বিজনেস গ্রোথ ট্রেন্ড</span>
                      <div className="flex gap-1">
                        {(["Today", "7D", "30D", "90D"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold transition-all ${
                              period === p ? "bg-[#003399] text-white" : "text-[#767676] hover:bg-zinc-100"
                            }`}
                          >
                            {periodLabels[p]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-32 w-full pt-1">
                      <svg className="h-full w-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="liveOverviewGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#003399" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#003399" stopOpacity="0.0" />
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
                          fill="url(#liveOverviewGrad)"
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
                          stroke="#003399"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-[4px] border border-[#DFDFDF] p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-[#DFDFDF]">
                      <span className="font-bold text-[#111111]">সেন্ট্রাল কানেক্টেড ট্রানজেকশন</span>
                      <span className="text-[10px] text-[#0A8A00] font-semibold">লাইভ সিঙ্ক</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#F5F5F5]">
                        <div>
                          <p className="font-bold text-[#111111]">POS বিক্রয় #POS-8902</p>
                          <p className="text-[10px] text-[#767676]">স্টক বিয়োগ (-২) · ড্রয়ার রিকনসাইল</p>
                        </div>
                        <span className="font-bold text-[#003399]">৳৩,৪০০</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#F5F5F5]">
                        <div>
                          <p className="font-bold text-[#111111]">সাপ্লায়ার PO রিসিভ #PO-441</p>
                          <p className="text-[10px] text-[#767676]">ওয়্যয়ারহাউস স্টক যোগ (+৫০)</p>
                        </div>
                        <span className="font-bold text-[#111111]">৳২৫,০০০</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pos" && (
              <div className="p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-[#111111]">
                  <span>ক্যাশিয়ার পিওএস টার্মিনাল & শিফট সেশন</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#0A8A00]/10 text-[#0A8A00] text-[10px]">রেজিস্টার অ্যাক্টিভ</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">ওপেনিং ফ্লট</span>
                    <span className="font-bold text-sm text-[#111111]">৳৫,০০০</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">আজকের নগদ বিক্রয়</span>
                    <span className="font-bold text-sm text-[#0A8A00]">+৳১৮,২০০</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">প্রত্যাশিত ক্যাশ</span>
                    <span className="font-bold text-sm text-[#003399]">৳২৩,২০০</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-[#111111]">
                  <span>ইনভেন্টরি লেজার ও ট্রু কস্ট ভ্যালুয়েশন</span>
                  <span className="text-[#003399] text-[10px]">ট্রু কস্ট = ক্রয়মূল্য + ল্যান্ডেড + প্যাকেজিং</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">মোট স্টক ভ্যালু</span>
                    <span className="font-bold text-[#111111]">৳৪,৫০,০০০</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">ওয়্যয়ারহাউস হাব</span>
                    <span className="font-bold text-[#111111]">৩টি সুবিধা</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">লো-স্টক সতর্কতা</span>
                    <span className="font-bold text-[#E87400]">৪টি আইটেম</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">ক্ষয়ক্ষতি / ওয়েস্ট</span>
                    <span className="font-bold text-[#CC0008]">৳১,২০০</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hrm" && (
              <div className="p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-[#111111]">
                  <span>এইচআরএম হাজিরা ও মাসিক প্যারোল ইঞ্জিন</span>
                  <span className="text-[#0A8A00] text-[10px]">অটোমেটেড পে-স্লিপ জেনারেশন</span>
                </div>
                <div className="p-2.5 bg-white rounded-[4px] border border-[#DFDFDF] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#111111]">পে-স্লিপ #PS-202609-0012</span>
                    <p className="text-[10px] text-[#767676]">মৌলিক বেতন ৳৪৫,০০০ + ওভারটাইম ৳৩,০০০ - প্রভিডেন্ট ফান্ড ৳২,০০০</p>
                  </div>
                  <span className="font-bold text-[#003399] text-sm">নেট বেতন: ৳৪৬,০০০</span>
                </div>
              </div>
            )}

            {activeTab === "finance" && (
              <div className="p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-[#111111]">
                  <span>ডাবল-এন্ট্রি ব্যালেন্সড লেজার & লাভ-ক্ষতি (P&L)</span>
                  <span className="font-mono text-[10px] text-[#0A8A00]">Σ ডেবিট = Σ ক্রেডিট</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">মোট রাজস্ব</span>
                    <span className="font-bold text-[#111111]">৳১,২৪,৫০০</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">অপারেশনাল খরচ</span>
                    <span className="font-bold text-[#CC0008]">৳১৪,২০০</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">নেট অপারেটিং প্রফিট</span>
                    <span className="font-bold text-[#0A8A00]">৳৪২,১০০</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "crm" && (
              <div className="p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-[#111111]">
                  <span>সিআরএম সেলস পাইপলাইন & কাস্টমার ৩৬০</span>
                  <span className="text-[#003399] text-[10px]">কানবান স্টেজ ট্র্যাকিং</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">প্রস্তাব পাঠানো হয়েছে</span>
                    <span className="font-bold text-[#111111]">৫টি ডিল (৳১,২০,০০০)</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">নেগোসিয়েশন চলছে</span>
                    <span className="font-bold text-[#E87400]">২টি ডিল (৳৮০,০০০)</span>
                  </div>
                  <div className="p-2 bg-white rounded-[4px] border border-[#DFDFDF]">
                    <span className="text-[#767676] block text-[10px]">ক্লোজড ওন (Won)</span>
                    <span className="font-bold text-[#0A8A00]">৮টি ডিল (৳২,৫০,০০০)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
