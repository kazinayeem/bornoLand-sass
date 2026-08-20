"use client";

import Link from "next/link";
import Image from "next/image";
import { landingContainer } from "./landing-ui";

export function Footer() {
  const FOOTER_COLS = [
    {
      title: "PRODUCT",
      links: [
        { label: "Storefront", href: "#product" },
        { label: "Visual Builder", href: "#builder" },
        { label: "Inventory Catalog", href: "#product" },
        { label: "Order Pipeline", href: "#features" },
        { label: "PDF Invoicing", href: "#commerce" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "SOLUTIONS",
      links: [
        { label: "Small Businesses", href: "/register" },
        { label: "Boutique Brands", href: "/register" },
        { label: "Creators & Influencers", href: "/register" },
        { label: "Retail Agencies", href: "/register" },
        { label: "Multi-Store Operations", href: "/register" },
      ],
    },
    {
      title: "DEVELOPERS",
      links: [
        { label: "REST API", href: "#developers" },
        { label: "Webhooks", href: "#developers" },
        { label: "Documentation", href: "#developers" },
        { label: "API Reference", href: "#developers" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "About BornoLand", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Merchant Stories", href: "#pricing" },
        { label: "Support Center", href: "/contact" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Refund Policy", href: "/refund-policy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/70 pt-16 pb-12 text-zinc-600">
      <div className={landingContainer}>
        {/* Top 5-Column Grid + Brand Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-zinc-200/80">
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BornoLand"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-950">
                BornoLand
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              The modern multi-store e-commerce SaaS platform for Bangladesh and global retail brands. Build, sell, and grow without limits.
            </p>
          </div>

          {/* Nav Columns */}
          {FOOTER_COLS.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-950">
                {col.title}
              </p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} BornoLand Technologies Inc. All rights reserved.</p>
          <p className="font-medium text-zinc-600">Made for modern commerce.</p>
        </div>
      </div>
    </footer>
  );
}
