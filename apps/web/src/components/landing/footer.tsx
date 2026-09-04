"use client";

import Link from "next/link";
import { BRAND_CONFIG } from "@/config/branding";
import {
  BornoLandBrandLogo,
  CompanyAttributionLink,
  ProductOwnershipBadge,
} from "@/components/brand/brand-attribution";
import { landingContainer } from "./landing-ui";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Integrations", href: "/integrations" },
        { label: "POS Terminal", href: "/docs/pos" },
        { label: "HRM & Attendance", href: "/docs/hrm" },
        { label: "Double-Entry Finance", href: "/docs/finance" },
        { label: "E-commerce Storefront", href: "/docs/store-builder" },
        { label: "Multi-Warehouse Stock", href: "/docs/inventory" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Getting Started", href: "/docs/getting-started" },
        { label: "How to Use BornoLand", href: "/how-to-use" },
        { label: "Help Center", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "Beginner Playbook", href: "/how-to-use" },
        { label: "User Guide", href: "/docs" },
        { label: "Troubleshooting", href: "/docs/troubleshooting" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About BornoSoft", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Careers", href: "/careers" },
        { label: "Updates & Changelog", href: "/blog" },
      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookie-policy" },
        { label: "Acceptable Use Policy", href: "/acceptable-use" },
        { label: "User Rules / Platform Rules", href: "/user-rules" },
        { label: "Refund & Billing Policy", href: "/refund" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Create Account", href: "/register" },
        { label: "Merchant Login", href: "/login" },
        { label: "Support Desk", href: "/support" },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/90 pt-16 pb-12 text-zinc-600 font-sans antialiased">
      <div className={landingContainer}>
        {/* Top Grid: Brand info column + 5 navigation columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-zinc-200/80">
          {/* Brand Identity Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <BornoLandBrandLogo />

            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              {BRAND_CONFIG.tagline}
            </p>

            {/* Subtle product ownership attribution */}
            <div className="pt-1">
              <ProductOwnershipBadge variant="text" />
            </div>

            {/* Platform Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* 5 Navigation Columns */}
          {footerSections.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-950">
                {sec.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {sec.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-zinc-500 hover:text-[#003399] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{BRAND_CONFIG.copyright.text}</p>
          <div className="flex items-center gap-4">
            <CompanyAttributionLink />
            <span className="text-zinc-300 hidden sm:inline">•</span>
            <Link href="/privacy" className="hover:text-zinc-700 transition-colors hidden sm:inline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 transition-colors hidden sm:inline">
              Terms
            </Link>
            <Link href="/user-rules" className="hover:text-zinc-700 transition-colors hidden sm:inline">
              User Rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
