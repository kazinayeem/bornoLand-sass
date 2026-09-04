"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Zap,
  Truck,
  CreditCard,
  MessageSquare,
  Building2,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INTEGRATION_CATEGORIES = ["All", "Payments & MFS", "Couriers & Logistics", "SMS & Communications", "Hardware & POS", "Accounting & ERP"] as const;

const INTEGRATIONS = [
  {
    name: "bKash Merchant Gateway",
    category: "Payments & MFS",
    description: "Accept direct instant payments via dynamic checkout QR codes and checkout tokenized webhooks.",
    status: "Live & Native",
    docSlug: "pos",
  },
  {
    name: "Nagad Business Gateway",
    category: "Payments & MFS",
    description: "Direct instant mobile payments and dynamic register QR code generation with zero latency.",
    status: "Live & Native",
    docSlug: "pos",
  },
  {
    name: "Pathao Courier API",
    category: "Couriers & Logistics",
    description: "1-click consignment creation, automated pickup requests, and real-time tracking webhooks.",
    status: "Live & Native",
    docSlug: "orders",
  },
  {
    name: "Steadfast Courier API",
    category: "Couriers & Logistics",
    description: "Nationwide parcel dispatch with bulk shipping label printing and automated COD remittance reconciliation.",
    status: "Live & Native",
    docSlug: "orders",
  },
  {
    name: "RedX Logistics",
    category: "Couriers & Logistics",
    description: "Automated door-to-door delivery booking, tracking barcode generation, and RTO restock sync.",
    status: "Live & Native",
    docSlug: "orders",
  },
  {
    name: "SSL Wireless SMS Gateway",
    category: "SMS & Communications",
    description: "Send branded masking and non-masking SMS order confirmations, OTPs, and delivery alerts.",
    status: "Live & Native",
    docSlug: "notifications",
  },
  {
    name: "Greenweb SMS Provider",
    category: "SMS & Communications",
    description: "Fast domestic SMS gateway integration for promotional campaigns and customer alerts.",
    status: "Live & Native",
    docSlug: "notifications",
  },
  {
    name: "ZKTeco Biometric Timeclocks",
    category: "Hardware & POS",
    description: "Synchronize staff fingerprint and facial recognition clock-ins directly to automated payroll.",
    status: "Live & Native",
    docSlug: "hrm",
  },
  {
    name: "ESC/POS Thermal Printers",
    category: "Hardware & POS",
    description: "Driverless 58mm & 80mm thermal receipt printing across USB, Bluetooth, and LAN connections.",
    status: "Live & Native",
    docSlug: "pos",
  },
  {
    name: "Standard BEFTN & Bank Disbursals",
    category: "Accounting & ERP",
    description: "Export encrypted bank salary transfer sheets formatted for City Bank, Brac Bank, and EBL.",
    status: "Live & Native",
    docSlug: "payroll",
  },
];

export function IntegrationsClient() {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = INTEGRATIONS.filter((item) => {
    if (selectedCat !== "All" && item.category !== selectedCat) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Built Ecosystem Bridges</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Integrated with Bangladesh&apos;s Commerce Backbone
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 mb-6 leading-relaxed">
            Connect payment gateways, domestic couriers, SMS providers, POS hardware, and biometric timeclocks with zero custom code.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search integrations (e.g. bKash, Steadfast, ZKTeco)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#dfe3e8] rounded-2xl text-xs sm:text-sm text-[#181c20] placeholder-[#727785] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1664d9]/20 focus:border-[#1664d9] transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {INTEGRATION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                selectedCat === cat
                  ? "bg-[#1664d9] text-white shadow-xs"
                  : "bg-white text-[#424754] hover:bg-[#f1f4fa] border border-[#dfe3e8]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1664d9] bg-[#1664d9]/10 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 bg-[#8ffa9b] text-[#002108] text-[10px] font-bold rounded-full">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#181c20] mb-1.5">{item.name}</h3>
                <p className="text-xs text-[#424754] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f1f4fa] flex items-center justify-between text-xs">
                <Link
                  href={`/docs/${item.docSlug}`}
                  className="text-[#1664d9] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Integration Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-[#006e2a] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ready to connect</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
