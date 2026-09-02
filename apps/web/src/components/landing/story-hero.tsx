"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Users,
  Package,
  Calculator,
  Boxes,
  Landmark,
  Target,
  Sparkles,
  CheckCircle2,
  Layers,
  Clock,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal, AnimatedNumber, AnimatedChart } from "./motion-primitives";
import { scrollToSection } from "@/lib/scroll-utils";
import { useGetProfileQuery } from "@/redux/api/profile-api";

const CHART_DATA = {
  Today: [
    { label: "09:00", value: 12400 },
    { label: "11:00", value: 24800 },
    { label: "13:00", value: 41200 },
    { label: "15:00", value: 68500 },
    { label: "17:00", value: 94200 },
    { label: "19:00", value: 118000 },
    { label: "21:00", value: 124800 },
  ],
  "7D": [
    { label: "Mon", value: 84000 },
    { label: "Tue", value: 112000 },
    { label: "Wed", value: 98000 },
    { label: "Thu", value: 146000 },
    { label: "Fri", value: 182000 },
    { label: "Sat", value: 210000 },
    { label: "Sun", value: 195000 },
  ],
  "30D": [
    { label: "W1", value: 420000 },
    { label: "W2", value: 580000 },
    { label: "W3", value: 740000 },
    { label: "W4", value: 910000 },
  ],
  "90D": [
    { label: "M1", value: 1650000 },
    { label: "M2", value: 2240000 },
    { label: "M3", value: 2890000 },
  ],
};

export function StoryHero() {
  const { locale, t } = useLandingLocale();
  const [activeTab, setActiveTab] = useState<"overview" | "pos" | "inventory" | "hrm" | "finance" | "crm">("overview");
  const [period, setPeriod] = useState<"Today" | "7D" | "30D" | "90D">("Today");

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  const periodLabels: Record<string, string> = {
    Today: t.hero.chart.today,
    "7D": t.hero.chart.days7,
    "30D": t.hero.chart.days30,
    "90D": t.hero.chart.days90,
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,51,153,0.07),rgba(255,255,255,0))]"
    >
      <div className={landingContainer}>
        {/* Top Eyebrow Announcement Badge */}
        <Reveal direction="down" delay={50}>
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/95 px-3.5 py-1.5 shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#0A8A00] animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-wider text-[#003399] uppercase">
                {t.hero.badge}
              </span>
              <span className="hidden sm:inline text-zinc-300">•</span>
              <span className="hidden sm:inline text-[11px] font-semibold text-zinc-600">
                {t.hero.badgeSub}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Hero Headline & Subtitle */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Reveal direction="up" delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.12]">
              {t.hero.titleLine1}{" "}
              <br />
              <span className="bg-gradient-to-r from-[#003399] via-[#002B80] to-indigo-700 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={180}>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#484848] leading-relaxed font-normal">
              {t.hero.description}
            </p>
          </Reveal>

          {/* Action CTAs */}
          <Reveal direction="up" delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#003399] text-white text-base font-bold shadow-md hover:bg-[#002B80] hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>{isAuthenticated ? t.nav.dashboard : t.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#platform-architecture"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("platform-architecture");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-base font-bold shadow-2xs hover:bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer"
              >
                <span>{t.hero.secondaryCta}</span>
                <ExternalLink className="h-4 w-4 text-zinc-500" />
              </a>
            </div>

            <p className="text-xs text-zinc-500 font-medium pt-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0A8A00]" />
              <span>{t.hero.trustBullets}</span>
            </p>
          </Reveal>
        </div>

        {/* Living Interactive Product Dashboard Visual */}
        <Reveal direction="scale" delay={300}>
          <div className="relative mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-6 shadow-[0_16px_40px_rgba(0,51,153,0.08)] ring-1 ring-zinc-900/5">
              {/* Top Interactive Module Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-5 gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[
                    { id: "overview", label: t.hero.tabs.overview, icon: Layers },
                    { id: "pos", label: t.hero.tabs.pos, icon: Calculator },
                    { id: "inventory", label: t.hero.tabs.inventory, icon: Boxes },
                    { id: "hrm", label: t.hero.tabs.hrm, icon: Users },
                    { id: "finance", label: t.hero.tabs.finance, icon: Landmark },
                    { id: "crm", label: t.hero.tabs.crm, icon: Target },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                          isActive
                            ? "bg-[#003399] text-white shadow-xs"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFDA1A]/20 border border-[#FFDA1A]/50 text-[10px] font-extrabold text-zinc-900">
                  <Zap className="h-3 w-3 text-amber-600 fill-amber-500" />
                  <span>{t.hero.liveBadge}</span>
                </div>
              </div>

              {/* Dynamic Tab 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                      <div className="flex items-center justify-between text-zinc-500 text-xs">
                        <span>{t.hero.kpis.revenue}</span>
                        <TrendingUp className="h-3.5 w-3.5 text-[#0A8A00]" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-zinc-950">
                        <AnimatedNumber value={124800} prefix="৳" />
                      </p>
                      <p className="text-[10px] text-[#0A8A00] font-bold">{t.hero.kpis.revenueSub}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                      <div className="flex items-center justify-between text-zinc-500 text-xs">
                        <span>{t.hero.kpis.cogs}</span>
                        <Boxes className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-zinc-950">
                        <AnimatedNumber value={68200} prefix="৳" />
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold">{t.hero.kpis.cogsSub}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                      <div className="flex items-center justify-between text-zinc-500 text-xs">
                        <span>{t.hero.kpis.grossProfit}</span>
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-[#003399]">
                        <AnimatedNumber value={56600} prefix="৳" />
                      </p>
                      <p className="text-[10px] text-[#003399] font-bold">{t.hero.kpis.grossProfitSub}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                      <div className="flex items-center justify-between text-zinc-500 text-xs">
                        <span>{t.hero.kpis.staff}</span>
                        <Users className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-zinc-950">
                        <AnimatedNumber value={18} suffix={locale === "bn" ? " জন" : " seats"} />
                      </p>
                      <p className="text-[10px] text-[#0A8A00] font-bold">{t.hero.kpis.staffSub}</p>
                    </div>
                  </div>

                  {/* Main Chart + Connected Activity Stream */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Left: Dynamic SVG Graph */}
                    <div className="lg:col-span-7 rounded-xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-zinc-950">{t.hero.chart.title}</span>
                        <div className="flex gap-1">
                          {(["Today", "7D", "30D", "90D"] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPeriod(p)}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",
                                period === p
                                  ? "bg-[#003399] text-white shadow-2xs"
                                  : "text-zinc-500 hover:bg-zinc-100"
                              )}
                            >
                              {periodLabels[p]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AnimatedChart
                        data={CHART_DATA[period]}
                        height={130}
                        color="#003399"
                        fillOpacity={0.15}
                      />
                    </div>

                    {/* Right: Connected Transaction Stream */}
                    <div className="lg:col-span-5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200">
                        <span className="font-extrabold text-zinc-950">{t.hero.activity.title}</span>
                        <span className="text-[10px] text-[#0A8A00] font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00]" />
                          {t.hero.activity.liveSync}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-zinc-900">{t.hero.activity.item1.title}</p>
                            <p className="text-[10px] text-zinc-500">{t.hero.activity.item1.subtitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-[#0A8A00]">{t.hero.activity.item1.amount}</p>
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {t.hero.activity.item1.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-zinc-900">{t.hero.activity.item2.title}</p>
                            <p className="text-[10px] text-zinc-500">{t.hero.activity.item2.subtitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-zinc-900">{t.hero.activity.item2.amount}</p>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {t.hero.activity.item2.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-zinc-900">{t.hero.activity.item3.title}</p>
                            <p className="text-[10px] text-zinc-500">{t.hero.activity.item3.subtitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-purple-700">{t.hero.activity.item3.amount}</p>
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                              {t.hero.activity.item3.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Tab 2: POS */}
              {activeTab === "pos" && (
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                    <span className="font-bold text-zinc-900">{t.pos.terminalTitle}</span>
                    <span className="text-zinc-500">{t.pos.cashier}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.pos.subtotal}</span>
                      <p className="text-lg font-bold text-zinc-950">৳৩,৪৫০</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.pos.discount}</span>
                      <p className="text-lg font-bold text-emerald-600">-৳৩৫০</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#003399] text-white space-y-1">
                      <span className="text-blue-100">{t.pos.total}</span>
                      <p className="text-lg font-black">৳৩,১০০</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Tab 3: INVENTORY */}
              {activeTab === "inventory" && (
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                    <span className="font-bold text-zinc-900">{t.inventory.warehouseTitle}</span>
                    <span className="text-emerald-700 font-bold">{t.inventory.inStock}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.inventory.stockLevel}</span>
                      <p className="text-lg font-bold text-zinc-950">১,২৪০ units</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                      <span className="text-amber-700">{t.inventory.lowStock}</span>
                      <p className="text-lg font-bold text-amber-900">4 SKUs</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.inventory.reorderLevel}</span>
                      <p className="text-lg font-bold text-[#003399]">Auto PO #482</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Tab 4: HRM */}
              {activeTab === "hrm" && (
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                    <span className="font-bold text-zinc-900">{t.hrm.portalTitle}</span>
                    <span className="text-emerald-700 font-bold">{t.hrm.payslipGenerated}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.hrm.activeEmployees}</span>
                      <p className="text-lg font-bold text-zinc-950">১৮ জন স্টাফ</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.hrm.onTimeAttendance}</span>
                      <p className="text-lg font-bold text-emerald-600">৯৬.৪% সময়মত</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">{t.hrm.payrollStatus}</span>
                      <p className="text-lg font-bold text-purple-700">অডিটেড ও প্রস্তুত</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Tab 5: FINANCE */}
              {activeTab === "finance" && (
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                    <span className="font-bold text-zinc-900">{t.accounting.statementTitle}</span>
                    <span className="text-blue-700 font-bold">{t.accounting.journalEntry}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                      <span className="text-zinc-500 text-[10px]">{t.accounting.grossSales}</span>
                      <p className="font-bold text-zinc-950">৳১,২৪,৫০০</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                      <span className="text-zinc-500 text-[10px]">{t.accounting.costOfGoods}</span>
                      <p className="font-bold text-zinc-950">৳৬৮,২০০</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                      <span className="text-zinc-500 text-[10px]">{t.accounting.operatingExpenses}</span>
                      <p className="font-bold text-zinc-950">৳১৪,৩০০</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 text-[10px]">{t.accounting.netProfit}</span>
                      <p className="font-black text-emerald-800">৳৪২,০০০</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Tab 6: CRM */}
              {activeTab === "crm" && (
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                    <span className="font-bold text-zinc-900">CRM Deal Pipeline & Accounts</span>
                    <span className="text-[#0A8A00] font-bold">12 Active Leads</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">Qualified Lead</span>
                      <p className="font-bold text-zinc-900">Apex Wholesale (৳১,২০,০০০)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1">
                      <span className="text-zinc-500">Proposal Sent</span>
                      <p className="font-bold text-zinc-900">Dhaka Fashion Mart (৳৮৫,০০০)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-emerald-700">Closed Won</span>
                      <p className="font-bold text-emerald-900">Trendz Studio (৳২,১০,০০০)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
