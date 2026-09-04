"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  QrCode,
  Boxes,
  ShoppingCart,
  Users,
  FileText,
  Wallet,
  HeartHandshake,
  Truck,
  LineChart,
  ShieldCheck,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    id: "commerce",
    title: "Digital Commerce & Storefront",
    short: "Commerce",
    icon: Store,
    headline: "High-Conversion Direct-to-Consumer Digital Storefronts",
    description:
      "Design and publish lightning-fast online stores with drag-and-drop themes, custom domain support, local payment gateways (bKash, Nagad, Cards), and automated mobile checkout.",
    features: [
      "Visual drag-and-drop store customizer with responsive preview",
      "Native support for bKash, Nagad, Rocket, Cards, and Cash on Delivery",
      "Unlimited product variants (Size, Color, Material, Bundle)",
      "Zero-config automatic TLS/SSL certificates for custom domains",
      "Integrated SEO metadata, OpenGraph cards, and Google sitemaps",
      "Mobile-optimized checkout completing in under 20 seconds",
    ],
    docSlug: "store-builder",
  },
  {
    id: "pos",
    title: "Cloud Point of Sale (POS)",
    short: "POS Register",
    icon: QrCode,
    headline: "High-Speed Retail Checkout with Zero Downtime",
    description:
      "Run your physical store checkouts on any browser, iPad, Android tablet, or Windows terminal. Works offline seamlessly during broadband outages, instantly synchronizing sales when connection returns.",
    features: [
      "Offline-first architecture with instant background auto-sync",
      "High-speed barcode laser scanning with zero keystroke delay",
      "Dynamic bKash / Nagad QR code payment generation on register screen",
      "Standard ESC/POS 58mm and 80mm thermal receipt printing",
      "Cashier shift float tracking and discrepancy reconciliation",
      "Multi-register and multi-counter cash drawer control",
    ],
    docSlug: "pos",
  },
  {
    id: "inventory",
    title: "Multi-Warehouse Inventory",
    short: "Inventory",
    icon: Boxes,
    headline: "Unified Stock Levels Across Central Depots & Outlets",
    description:
      "Eliminate overselling and inventory blind spots. Real-time stock counts update automatically whether merchandise sells online or in a physical branch.",
    features: [
      "Multi-location stock tracking across central warehouses and store backrooms",
      "Stock Transfer Notes (STN) with dual-step dispatch & receiving verification",
      "Automated minimum safe threshold alerts with PO generation",
      "Batch tracking, expiry management, and serial number scanning",
      "Damage, expiration, and shrinkage waste logging with ledger sync",
      "Bulk CSV catalog updates and barcode label generation",
    ],
    docSlug: "inventory",
  },
  {
    id: "hrm-payroll",
    title: "HRM & Automated Payroll",
    short: "HRM & Payroll",
    icon: Users,
    headline: "Biometric Attendance & 1-Click Salary Disbursals",
    description:
      "Manage employee master records, connect ZKTeco fingerprint machines, track shifts, handle leave requests, and calculate monthly payroll in seconds.",
    features: [
      "Biometric fingerprint / face scanner integration and geofenced check-in",
      "1-click monthly payroll generation calculating exact payable days",
      "Custom allowance breakdown (House rent, Conveyance, Medical)",
      "Tax withholding, Provident Fund deductions, and advance salary loans",
      "Automated festival and Eid bonus computations",
      "Instant PDF payslip generation and BEFTN bank transfer export",
    ],
    docSlug: "payroll",
  },
  {
    id: "finance",
    title: "Double-Entry Accounting & Finance",
    short: "Finance",
    icon: Wallet,
    headline: "Audited Ledger Transparency Without Month-End Scrambles",
    description:
      "Automatic journal entries connect your sales, supplier purchases, operational expenses, and payroll directly to real-time Profit & Loss and Balance Sheets.",
    features: [
      "Full Double-Entry Chart of Accounts compliant with standard GAAP/IFRS",
      "Automated debit/credit journal entries from sales, COGS, and refunds",
      "Real-time Profit & Loss (P&L), Balance Sheet, and Trial Balance reports",
      "Operational expense categorization with digital receipt attachments",
      "Supplier accounts payable and customer receivables tracking",
      "NBR-compliant VAT and sales tax summary generation",
    ],
    docSlug: "finance",
  },
  {
    id: "logistics",
    title: "Operations & Courier Logistics",
    short: "Logistics",
    icon: Truck,
    headline: "1-Click Dispatch with Leading Domestic Couriers",
    description:
      "Connect Pathao, Steadfast, and RedX directly to your store. Create consignments, fetch tracking codes, print bulk shipping labels, and reconcile COD payments automatically.",
    features: [
      "Native API integrations with Pathao, Steadfast, and RedX",
      "Bulk shipping label and picking slip printing with QR tracking",
      "Automated COD payment remittance reconciliation against courier balances",
      "Real-time shipment status webhooks updating customer order portals",
      "Return-to-Origin (RTO) management and restocking workflows",
      "Custom delivery zone pricing (Inside Dhaka, Suburbs, Nationwide)",
    ],
    docSlug: "orders",
  },
  {
    id: "analytics",
    title: "Executive Analytics & BI",
    short: "Analytics",
    icon: LineChart,
    headline: "Data-Driven Business Decisions in Real Time",
    description:
      "Turn transaction volume into actionable intelligence. Monitor cross-channel sales velocity, gross margins, top product cohorts, and staff sales performance.",
    features: [
      "Live cross-channel revenue streams and AOV velocity tracking",
      "Inventory turnover velocity and aging stock detection",
      "Customer lifetime value (LTV) and repeat purchase frequency curves",
      "Cashier and sales associate commission and throughput rankings",
      "Fulfillment lead-time tracking and delivery success rates",
      "Exportable executive PDF summaries and raw CSV datasets",
    ],
    docSlug: "reports",
  },
];

export function FeaturesClient() {
  const [activeModuleId, setActiveModuleId] = useState(MODULES[0].id);
  const activeModule = MODULES.find((m) => m.id === activeModuleId) || MODULES[0];
  const Icon = activeModule.icon;

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Platform Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Everything Built Into One Operating System
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 leading-relaxed">
            Explore the complete suite of BornoLand capabilities designed to unify digital storefronts, physical retail outlets, inventory, people, and finances.
          </p>
        </div>

        {/* Tabbed Module Selector */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {MODULES.map((mod) => {
            const isSelected = activeModuleId === mod.id;
            const ModIcon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#1664d9] text-white shadow-sm"
                    : "bg-white text-[#424754] hover:bg-[#f1f4fa] hover:text-[#181c20] border border-[#dfe3e8]"
                )}
              >
                <ModIcon className="w-4 h-4" />
                <span>{mod.short}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Showcase Card */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#dfe3e8] shadow-sm mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1664d9]/10 text-[#1664d9] rounded-lg text-xs font-bold">
                <Icon className="w-4 h-4" />
                <span>{activeModule.title}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#181c20] tracking-tight">
                {activeModule.headline}
              </h2>
              <p className="text-sm text-[#424754] leading-relaxed">
                {activeModule.description}
              </p>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-[#181c20] uppercase tracking-wider mb-3">
                  Key Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModule.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-[#181c20]">
                      <CheckCircle2 className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href={`/docs/${activeModule.docSlug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1664d9] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#004caf] transition-all"
                >
                  <span>Read Documentation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#f1f4fa] text-[#181c20] rounded-xl text-xs font-bold border border-[#dfe3e8] hover:bg-[#e5e8ee] transition-all"
                >
                  <span>Start Free Trial</span>
                </Link>
              </div>
            </div>

            {/* Visual Box */}
            <div className="lg:col-span-5 bg-[#f7f9ff] p-6 rounded-xl border border-[#dfe3e8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#dfe3e8]">
                <span className="text-xs font-bold text-[#181c20]">Enterprise Readiness</span>
                <span className="px-2 py-0.5 bg-[#8ffa9b] text-[#002108] text-[10px] font-bold rounded-full">
                  Fully Integrated
                </span>
              </div>
              <ul className="space-y-3 text-xs text-[#424754]">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#1664d9]" />
                  <span>Real-time relational database sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#006e2a]" />
                  <span>Role-based access control &amp; audit logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1664d9]" />
                  <span>Built for Bangladesh retail &amp; global trade</span>
                </li>
              </ul>
              <div className="p-3 bg-white rounded-lg border border-[#dfe3e8] text-[11px] text-[#424754] leading-relaxed">
                Connect seamlessly with other departments without third-party integration plugins.
              </div>
            </div>
          </div>
        </div>

        {/* All Modules Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#181c20]">
              Modular by Architecture. Unified by Design.
            </h2>
            <p className="text-xs sm:text-sm text-[#424754] mt-1">
              Click any module to jump to its deep documentation and setup walkthrough.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#1664d9]/10 text-[#1664d9] flex items-center justify-center mb-4">
                      <ModIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#181c20] mb-1.5">{mod.title}</h3>
                    <p className="text-xs text-[#424754] leading-relaxed line-clamp-3">
                      {mod.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#f1f4fa] flex items-center justify-between text-xs">
                    <Link
                      href={`/docs/${mod.docSlug}`}
                      className="text-[#1664d9] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => {
                        setActiveModuleId(mod.id);
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      className="text-[#424754] hover:text-[#181c20] font-medium"
                    >
                      Preview details ↑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
