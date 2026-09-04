"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  User,
  Store,
  CreditCard,
  Wrench,
  ShieldCheck,
  Headphones,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  articles: { title: string; href: string; summary: string }[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Account creation, initial workspace initialization, and basic platform navigation.",
    icon: Sparkles,
    articles: [
      {
        title: "How to create your merchant account & workspace",
        href: "/docs/getting-started",
        summary: "Step-by-step walkthrough of registration, email verification, and workspace naming.",
      },
      {
        title: "16-step complete beginner onboarding playbook",
        href: "/how-to-use",
        summary: "Follow the master guide from account setup to live multi-channel sales.",
      },
      {
        title: "Understanding Workspaces vs Stores",
        href: "/docs/getting-started#workspace-vs-store",
        summary: "How multi-location architecture organizes stores under one shared company ledger.",
      },
    ],
  },
  {
    id: "account-help",
    title: "Account & Team Help",
    description: "Password resets, two-factor authentication, team invites, and role permissions.",
    icon: User,
    articles: [
      {
        title: "How to invite team members and assign roles",
        href: "/docs/account-workspace#team-invites",
        summary: "Grant access to store managers, inventory controllers, and accountants.",
      },
      {
        title: "Configuring Role-Based Access Control (RBAC)",
        href: "/docs/team-permissions",
        summary: "Restrict cashiers from viewing profit margins and general ledgers.",
      },
      {
        title: "Enabling Two-Factor Authentication (2FA)",
        href: "/docs/account-workspace#profile-settings",
        summary: "Protect your admin accounts with rolling security codes.",
      },
    ],
  },
  {
    id: "store-help",
    title: "Store & POS Help",
    description: "Setting up digital storefronts, offline POS terminals, barcodes, and receipts.",
    icon: Store,
    articles: [
      {
        title: "Setting up thermal receipt printers and laser scanners",
        href: "/docs/pos#hardware-setup",
        summary: "Driverless USB/Bluetooth ESC/POS printing on desktop, iPad, and Android.",
      },
      {
        title: "How POS offline mode handles sales and auto-sync",
        href: "/docs/pos#offline-mode",
        summary: "Never lose a transaction during internet outages.",
      },
      {
        title: "Connecting custom domains (.com, .com.bd)",
        href: "/docs/domains",
        summary: "DNS record configuration and zero-config SSL certificate provisioning.",
      },
    ],
  },
  {
    id: "billing-help",
    title: "Billing & Plans Help",
    description: "Subscription plans, upgrade pro-rations, invoice downloads, and payment methods.",
    icon: CreditCard,
    articles: [
      {
        title: "How to upgrade or change your subscription plan",
        href: "/docs/plans-billing",
        summary: "Pro-rated billing when adding store outlets or upgrading tiers.",
      },
      {
        title: "Accepted payment methods in Bangladesh (BDT ৳)",
        href: "/docs/plans-billing#payment-methods",
        summary: "Pay with Visa, Mastercard, AMEX, bKash, and Nagad corporate wallets.",
      },
      {
        title: "Downloading VAT tax invoices for subscriptions",
        href: "/docs/plans-billing",
        summary: "Access historical invoices directly from your billing dashboard.",
      },
    ],
  },
  {
    id: "technical-help",
    title: "Technical & Logistics Help",
    description: "Courier integrations, webhook events, CSV data imports, and API keys.",
    icon: Wrench,
    articles: [
      {
        title: "Connecting Pathao, Steadfast, and RedX couriers",
        href: "/docs/orders#courier-dispatch",
        summary: "Automated consignment creation and bulk shipping label printing.",
      },
      {
        title: "Importing catalog and stock via CSV spreadsheets",
        href: "/docs/products#csv-sync",
        summary: "Bulk upload guidelines and column formatting standards.",
      },
      {
        title: "Troubleshooting barcode scanner & printer issues",
        href: "/docs/troubleshooting",
        summary: "Quick fixes for common hardware connectivity and scanner delays.",
      },
    ],
  },
  {
    id: "security-help",
    title: "Security & Compliance Help",
    description: "Data encryption, audit trails, tenant isolation, and acceptable use policies.",
    icon: ShieldCheck,
    articles: [
      {
        title: "Platform Security & Encryption Standards",
        href: "/docs/security",
        summary: "TLS 1.3 in-transit and AES-256 database encryption at rest.",
      },
      {
        title: "Platform Acceptable Use & User Rules",
        href: "/user-rules",
        summary: "Guidelines and prohibited activities across BornoLand.",
      },
      {
        title: "Data backups and disaster recovery protocols",
        href: "/docs/security#backups-dr",
        summary: "Daily geo-redundant automated snapshots and point-in-time recovery.",
      },
    ],
  },
];

const POPULAR_ARTICLES = [
  { title: "How to use BornoLand (16-step guide)", href: "/how-to-use", tag: "Guide" },
  { title: "POS Hardware Setup (Printers & Scanners)", href: "/docs/pos", tag: "POS" },
  { title: "Courier Dispatch with Pathao & Steadfast", href: "/docs/orders", tag: "Logistics" },
  { title: "Monthly Payroll & PDF Payslips", href: "/docs/payroll", tag: "HRM" },
  { title: "Connecting a Custom Domain & SSL", href: "/docs/domains", tag: "Domain" },
  { title: "Double-Entry Accounting & P&L", href: "/docs/finance", tag: "Finance" },
];

export function HelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: { title: string; href: string; summary: string; category: string }[] = [];

    for (const cat of HELP_CATEGORIES) {
      for (const art of cat.articles) {
        if (
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
        ) {
          results.push({ ...art, category: cat.title });
        }
      }
    }
    return results;
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>BornoLand Support &amp; Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            How Can We Help You Today?
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 mb-6 leading-relaxed">
            Search our knowledge base for answers regarding storefronts, POS terminals, inventory, payroll, and billing.
          </p>

          {/* Large Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, error messages, or features..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#dfe3e8] rounded-2xl text-sm text-[#181c20] placeholder-[#727785] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1664d9]/20 focus:border-[#1664d9] transition-all"
            />
          </div>
        </div>

        {/* Search Results Display */}
        {searchQuery.trim() && (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-md mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#727785] mb-4">
              Search Results ({searchResults.length})
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-xs text-[#424754] py-4 text-center">
                No help articles matching &quot;{searchQuery}&quot;. Try terms like domain, printer, payroll, or checkout.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f4fa]">
                {searchResults.map((res, rIdx) => (
                  <Link
                    key={rIdx}
                    href={res.href}
                    className="block py-3 hover:bg-[#f1f4fa] px-3 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#181c20] group-hover:text-[#1664d9]">
                        {res.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#ebeef4] text-[#424754] rounded font-medium">
                        {res.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#727785] mt-1">{res.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popular Articles Carousel / Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#727785]">
              Popular Knowledge Base Articles
            </h2>
            <Link href="/faq" className="text-xs font-bold text-[#1664d9] hover:underline">
              View All FAQs →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ARTICLES.map((art, idx) => (
              <Link
                key={idx}
                href={art.href}
                className="p-4 bg-white rounded-xl border border-[#dfe3e8] shadow-2xs hover:border-[#1664d9] hover:bg-[#f1f4fa] transition-all flex items-center justify-between group"
              >
                <div className="space-y-1 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1664d9]">
                    {art.tag}
                  </span>
                  <div className="text-xs font-bold text-[#181c20] group-hover:text-[#1664d9]">
                    {art.title}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#727785] group-hover:text-[#1664d9] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* 6 Help Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {HELP_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1664d9]/10 text-[#1664d9] flex items-center justify-center font-bold shrink-0">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#181c20]">{cat.title}</h3>
                      <span className="text-[11px] text-[#727785]">
                        {cat.articles.length} Core Articles
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#424754] mb-4 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Articles List */}
                  <ul className="space-y-2.5 pt-2 border-t border-[#f1f4fa]">
                    {cat.articles.map((art, aIdx) => (
                      <li key={aIdx}>
                        <Link
                          href={art.href}
                          className="text-xs font-semibold text-[#181c20] hover:text-[#1664d9] flex items-start gap-2 group transition-colors"
                        >
                          <span className="text-[#1664d9] font-bold mt-0.5 group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                          <span className="leading-snug">{art.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f1f4fa]">
                  <Link
                    href="/docs"
                    className="text-xs font-bold text-[#1664d9] hover:underline flex items-center gap-1"
                  >
                    <span>Browse category guides</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Need Help? Escalation Banner */}
        <div className="bg-[#0F172A] text-white p-8 sm:p-10 rounded-2xl border border-slate-800 text-center max-w-4xl mx-auto space-y-4">
          <Headphones className="w-10 h-10 text-[#8ffa9b] mx-auto" />
          <h2 className="text-2xl font-bold">Still Need Help?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our merchant onboarding specialists and technical engineers are ready to assist you via email, live chat, or WhatsApp.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#1664d9] hover:bg-[#004caf] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              Search Frequently Asked Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
