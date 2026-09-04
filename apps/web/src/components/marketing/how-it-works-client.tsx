"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Database,
  Store,
  QrCode,
  Boxes,
  Users,
  Wallet,
  LineChart,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";

const PHASES = [
  {
    phase: "Phase 1",
    title: "Connect Your Organization & Master Data",
    icon: Database,
    description:
      "Initialize your workspace, declare your core Chart of Accounts, upload staff rosters, and set base operating currencies (BDT ৳).",
    highlights: [
      "Zero manual database setup or hosting servers to manage",
      "Upload existing product catalogs and inventory levels via CSV",
      "Assign granular role-based permissions (RBAC) to key managers",
    ],
    docLink: "/docs/getting-started",
  },
  {
    phase: "Phase 2",
    title: "Launch Sales Channels: Web & Retail POS",
    icon: Store,
    description:
      "Customize high-converting digital storefronts with your branding and deploy offline-resilient POS terminals to cashier counters in physical branches.",
    highlights: [
      "Custom domain linking with automated zero-config TLS/SSL certificates",
      "bKash, Nagad, Card gateways, and Cash on Delivery ready out of the box",
      "Instant barcode laser scanning and thermal receipt printing on store floors",
    ],
    docLink: "/docs/pos",
  },
  {
    phase: "Phase 3",
    title: "Unified Multi-Channel Inventory & Order Stream",
    icon: Boxes,
    description:
      "When a sale occurs online or at a physical register, stock automatically reconciles across warehouses in real time with zero overselling risk.",
    highlights: [
      "Multi-location stock visibility between central depots and retail backrooms",
      "Stock Transfer Notes (STN) for inter-branch inventory movements",
      "Automated safe threshold alerts with purchase requisition drafting",
    ],
    docLink: "/docs/inventory",
  },
  {
    phase: "Phase 4",
    title: "Automate Back-Office: Logistics, HRM & Payroll",
    icon: Users,
    description:
      "Dispatch orders with 1-click courier integrations (Pathao, Steadfast, RedX), track biometric staff attendance, and calculate monthly payroll in seconds.",
    highlights: [
      "Bulk shipping label printing and automated COD courier reconciliation",
      "Biometric fingerprint machine synchronization and shift scheduling",
      "Automated tax deductions, bonuses, digital PDF payslips, and BEFTN bank sheets",
    ],
    docLink: "/docs/payroll",
  },
  {
    phase: "Phase 5",
    title: "Executive Intelligence & Continuous Scale",
    icon: LineChart,
    description:
      "All transactions post automated double-entry ledger entries, giving leadership real-time Profit & Loss visibility, customer lifetime value analytics, and growth forecasting.",
    highlights: [
      "Real-time audited financial statements (P&L, Balance Sheet, Cash Flow)",
      "Customer retention curves and automated SMS marketing triggers",
      "Scale from a single boutique to 50+ retail branches nationwide without changing software",
    ],
    docLink: "/docs/reports",
  },
];

export function HowItWorksClient() {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture &amp; Workflow Overview</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            How BornoLand Powers Your Enterprise
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 leading-relaxed">
            See how BornoLand connects customer touchpoints, warehouse logistics, floor staff, and executive accounting into a single real-time data engine.
          </p>
        </div>

        {/* 5-Phase Vertical Flow */}
        <div className="max-w-4xl mx-auto space-y-8 relative">
          {/* Subtle connecting line behind cards on desktop */}
          <div className="hidden md:block absolute left-8 top-12 bottom-12 w-0.5 bg-[#dfe3e8] -z-10" />

          {PHASES.map((p, idx) => {
            const PhaseIcon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col md:flex-row gap-6 relative"
              >
                {/* Phase Icon Node */}
                <div className="w-14 h-14 rounded-2xl bg-[#1664d9] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  <PhaseIcon className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1664d9]">
                      {p.phase}
                    </span>
                    <span className="text-[11px] text-[#727785] font-medium">
                      Native Relational Core
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#181c20]">
                    {p.title}
                  </h2>

                  <p className="text-sm text-[#424754] leading-relaxed">
                    {p.description}
                  </p>

                  <div className="bg-[#f7f9ff] p-4 rounded-xl border border-[#dfe3e8]/70 space-y-2">
                    {p.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-xs text-[#181c20]">
                        <CheckCircle2 className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <Link
                      href={p.docLink}
                      className="text-[#1664d9] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Explore Technical Docs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 max-w-4xl mx-auto p-8 bg-[#0F172A] text-white rounded-2xl text-center space-y-4">
          <Zap className="w-8 h-8 text-[#8ffa9b] mx-auto" />
          <h3 className="text-xl sm:text-2xl font-bold">
            Experience the Connected Operating System
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Test all 9 modules with your real team during a free 7-day trial. Zero credit card required.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1664d9] hover:bg-[#004caf] text-white rounded-xl text-sm font-bold shadow-md transition-all"
            >
              <span>Start Free 7-Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
