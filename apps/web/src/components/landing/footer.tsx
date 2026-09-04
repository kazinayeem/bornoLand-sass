"use client";

import Link from "next/link";
import Image from "next/image";
import { landingContainer } from "./landing-ui";
import { scrollToSection } from "@/lib/scroll-utils";

export function Footer() {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToSection(href.slice(1));
    }
  };

  const columns = [
    {
      title: "Product",
      links: [
        { label: "Storefront Builder", href: "#platform" },
        { label: "Cloud POS Register", href: "#platform" },
        { label: "Multi-Warehouse", href: "#platform" },
        { label: "Double-Entry Accounting", href: "#platform" },
        { label: "HRM & Payroll", href: "#platform" },
        { label: "BI & Analytics", href: "#platform" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Multi-Branch Retail", href: "#solutions" },
        { label: "Fashion & Apparel", href: "#solutions" },
        { label: "Electronics & Gadgets", href: "#solutions" },
        { label: "Wholesale & Distribution", href: "#solutions" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/docs" },
        { label: "Platform Status", href: "#" },
        { label: "Release Notes", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About BornoLand", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact Us", href: "/contact" },
        { label: "Merchant Stories", href: "#trust" },
      ],
    },
    {
      title: "Legal & Trust",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security Architecture", href: "#trust" },
        { label: "Refund Policy", href: "/refund" },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/80 pt-16 pb-12 text-zinc-600">
      <div className={landingContainer}>
        {/* Top Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-zinc-200/80">
          {/* Brand Identity Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003399] text-white shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BornoLand"
                  width={20}
                  height={20}
                  className="h-4.5 w-4.5 object-contain brightness-0 invert"
                />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-950">
                BornoLand
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              The modern Business Operating System for building, managing, and scaling commerce enterprises.
            </p>

            {/* Platform Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* 5 Navigation Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-950">
                {col.title}
              </p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
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

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} BornoLand Inc. All rights reserved.</p>
          <p className="text-zinc-500 font-medium">Built for modern commerce & retail scale.</p>
        </div>
      </div>
    </footer>
  );
}
