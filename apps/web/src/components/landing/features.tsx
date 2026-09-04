"use client";

import { landingContainer } from "./landing-ui";
import { Reveal } from "./motion-primitives";
import {
  Calculator,
  Boxes,
  Landmark,
  Users,
  LineChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

export function Features() {
  const differentiators = [
    {
      id: "pos",
      icon: Calculator,
      title: "Cloud POS & Retail Registers",
      eyebrow: "RETAIL CHECKOUT",
      description: "Sub-second barcode scanning, split tender (Cash, Card, QR), and shift cash drawer balancing that syncs directly with online stock.",
      metric: "0s Inventory Lag",
      subMetric: "Online & In-store sync",
    },
    {
      id: "inventory",
      icon: Boxes,
      title: "Multi-Warehouse Inventory & FIFO Costing",
      eyebrow: "STOCK CONTROL",
      description: "Track stock across physical stores and central warehouses. FIFO landed cost valuation ensures 100% accurate gross profit reporting.",
      metric: "FIFO Landed Cost",
      subMetric: "Automated low-stock alerts",
    },
    {
      id: "finance",
      icon: Landmark,
      title: "Double-Entry Financial Clarity",
      eyebrow: "AUDIT-READY ACCOUNTING",
      description: "Automated debit & credit postings for every order, return, and expense. Real-time Income Statement (P&L) and Balance Sheet generation.",
      metric: "100% Automated",
      subMetric: "Chart of accounts integrated",
    },
    {
      id: "hrm",
      icon: Users,
      title: "HRM, Shifts & Audited Payroll",
      eyebrow: "TEAM MANAGEMENT",
      description: "Manage employee shifts, attendance records, late penalty rules, and dispatch PDF payslips (#PS-YYYYMM) with 1-click execution.",
      metric: "1-Click Payroll",
      subMetric: "Role-based RBAC permissions",
    },
    {
      id: "analytics",
      icon: LineChart,
      title: "Executive Business Intelligence",
      eyebrow: "REAL-TIME METRICS",
      description: "Comprehensive visibility into sales velocity, customer lifetime value, and inventory turns without manual data extraction.",
      metric: "Real-Time BI",
      subMetric: "Instant export to PDF & CSV",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={40}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              CORE VALUE DIFFERENTIATORS
            </span>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Engineered for Speed, Precision & Scale
            </h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              Five core operational engines designed to eliminate friction and give you complete control over your business.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid: 2 top large cards + 3 bottom standard cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {/* Item 1: POS (col-span-3) */}
          <div className="lg:col-span-3">
            <Reveal direction="up" delay={100}>
              <div className="h-full p-6 sm:p-7 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/70 px-2.5 py-1 rounded-full">
                      RETAIL POS
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-zinc-950">
                    High-Speed POS & Retail Registers
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Sub-second barcode scanning, split tender (Cash, Card, QR), and shift cash drawer balancing that syncs directly with online inventory.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-base font-black text-zinc-950">0s Inventory Lag</p>
                    <p className="text-[10px] text-[#0A8A00] font-bold">Online & In-store synchronous</p>
                  </div>
                  <a href="#platform" className="text-xs font-bold text-[#003399] flex items-center gap-1 hover:underline">
                    <span>Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Item 2: Multi-Warehouse (col-span-3) */}
          <div className="lg:col-span-3">
            <Reveal direction="up" delay={150}>
              <div className="h-full p-6 sm:p-7 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/70 px-2.5 py-1 rounded-full">
                      STOCK ROUTING
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-zinc-950">
                    Multi-Warehouse Stock & True FIFO Costing
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    Track stock across retail outlets and warehouses. True landed cost FIFO accounting guarantees accurate gross profit on every SKU.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-base font-black text-zinc-950">FIFO Landed Cost</p>
                    <p className="text-[10px] text-[#0A8A00] font-bold">Automated low-stock triggers</p>
                  </div>
                  <a href="#platform" className="text-xs font-bold text-[#003399] flex items-center gap-1 hover:underline">
                    <span>Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Item 3: Accounting (col-span-2) */}
          <div className="lg:col-span-2">
            <Reveal direction="up" delay={200}>
              <div className="h-full p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <Landmark className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/70 px-2 py-0.5 rounded-full">
                      FINANCE
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-950">Double-Entry Financial Clarity</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Automated journal entries for every checkout, refund, and PO. Instant P&L and Balance Sheet.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-xs font-black text-zinc-950">100% Balanced Ledger</p>
                  <p className="text-[10px] text-zinc-500">No manual entry needed</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Item 4: HRM & Payroll (col-span-2) */}
          <div className="lg:col-span-2">
            <Reveal direction="up" delay={250}>
              <div className="h-full p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/70 px-2 py-0.5 rounded-full">
                      HRM & PAYROLL
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-950">Staff Attendance & 1-Click Payroll</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Biometric shift schedules, overtime, penalty rules, and 1-click audited PDF payslips.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-xs font-black text-zinc-950">1-Click Dispatch</p>
                  <p className="text-[10px] text-zinc-500">Audited salary calculation</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Item 5: Analytics (col-span-2) */}
          <div className="lg:col-span-2">
            <Reveal direction="up" delay={300}>
              <div className="h-full p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <LineChart className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/70 px-2 py-0.5 rounded-full">
                      ANALYTICS
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-950">Real-Time BI & Margin Velocity</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Live revenue trends, product velocity, category breakdown, and cohort retention.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-xs font-black text-zinc-950">Real-Time BI</p>
                  <p className="text-[10px] text-zinc-500">Continuous calculation</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
