"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  Shirt,
  Smartphone,
  Truck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

const SOLUTIONS = [
  {
    id: "multi-branch",
    title: "Multi-Branch Retail & Chains",
    icon: Store,
    headline: "Unify 5 to 50+ Physical Store Outlets with Central Depots",
    description:
      "Manage physical branch sales, local cashier floats, and stock transfers between city showrooms with zero latency. Every branch stays connected to corporate accounting.",
    points: [
      "Inter-branch Stock Transfer Notes (STN) with dispatch/receive validation",
      "Offline-ready POS terminals on iPad and Windows touchscreen stations",
      "Consolidated multi-branch P&L and individual outlet sales ranking",
    ],
  },
  {
    id: "fashion-apparel",
    title: "Fashion & Lifestyle Apparel",
    icon: Shirt,
    headline: "Master Complex Color & Size Variant Matrixes",
    description:
      "Sell lifestyle clothing, traditional wear, and footwear with instant variant grids, high-res visual lookbooks, and barcode label printing.",
    points: [
      "Multi-dimensional variants (Size x Color x Fabric/Material)",
      "High-speed barcode laser scanning at physical fitting room counters",
      "Automated seasonal discount campaigns and customer loyalty points",
    ],
  },
  {
    id: "electronics",
    title: "Electronics & Gadget Retailers",
    icon: Smartphone,
    headline: "Serialized Inventory & Warranty Tracking",
    description:
      "Track individual IMEI numbers and serial codes from supplier receiving through cashier checkout, enabling painless warranty validations.",
    points: [
      "Serial/IMEI tracking on every invoice receipt",
      "Instant bKash, Nagad, and EMI card payment options at checkout",
      "Supplier RMA return tracking for defective inventory",
    ],
  },
  {
    id: "wholesale",
    title: "Wholesale & Distribution",
    icon: Truck,
    headline: "B2B Bulk Pricing & Supplier Accounts Payable",
    description:
      "Manage large B2B wholesale orders, tiered volume pricing tiers, customer credit limits, and formal Purchase Orders (PO).",
    points: [
      "Tiered wholesale price lists per customer classification",
      "Formal Purchase Orders (PO) and Goods Received Notes (GRN)",
      "Credit terms, overdue invoice alerts, and ledger tracking",
    ],
  },
];

export function SolutionsClient() {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored Industry Blueprints</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Solutions Tailored to Your Industry
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 leading-relaxed">
            Whether you run a fast-growing fashion boutique, a multi-outlet retail chain, or a nationwide distributor, BornoLand adapts to your specific workflows.
          </p>
        </div>

        {/* 4 Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {SOLUTIONS.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.id}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#1664d9]/10 text-[#1664d9] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-[#181c20]">{sol.title}</h2>
                  <p className="text-xs font-bold text-[#1664d9] mt-0.5 mb-3">{sol.headline}</p>
                  <p className="text-sm text-[#424754] leading-relaxed mb-6">
                    {sol.description}
                  </p>

                  <div className="bg-[#f7f9ff] p-4 rounded-xl border border-[#dfe3e8]/70 space-y-2 mb-6">
                    {sol.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-[#181c20]">
                        <CheckCircle2 className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1f4fa] flex items-center justify-between text-xs">
                  <Link
                    href="/register"
                    className="text-[#1664d9] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Launch Solution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/docs"
                    className="text-[#424754] hover:text-[#181c20] font-medium"
                  >
                    View Docs →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="p-8 bg-[#0F172A] text-white rounded-2xl text-center space-y-4 max-w-4xl mx-auto">
          <Zap className="w-8 h-8 text-[#8ffa9b] mx-auto" />
          <h3 className="text-xl sm:text-2xl font-bold">
            Need a Custom Architecture or Migration Consultation?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our enterprise solutions architects can assist with migrating data from Shopify, WooCommerce, Excel, or custom ERPs.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1664d9] hover:bg-[#004caf] text-white rounded-xl text-sm font-bold shadow-md transition-all"
            >
              <span>Talk to Solutions Engineer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
