"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderLink } from "./builder-link";

const linkColumns = [
  { title: "Shop", links: [
    { text: "All Products", url: "/shop" },
    { text: "New Arrivals", url: "/shop?sort=newest" },
    { text: "Best Sellers", url: "/shop?sort=popular" },
    { text: "Sale", url: "/shop?sale=true" },
  ]},
  { title: "Support", links: [
    { text: "Contact Us", url: "/contact" },
    { text: "FAQ", url: "/faq" },
    { text: "Shipping Info", url: "/shipping" },
    { text: "Returns", url: "/returns" },
  ]},
  { title: "Company", links: [
    { text: "About Us", url: "/about" },
    { text: "Careers", url: "/about" },
    { text: "Press", url: "/about" },
    { text: "Blog", url: "/about" },
  ]},
  { title: "Legal", links: [
    { text: "Privacy Policy", url: "/privacy" },
    { text: "Terms of Service", url: "/terms" },
    { text: "Cookie Policy", url: "/privacy" },
  ]},
];

export function EcommerceFooter({ section }: { section: SectionData }) {
  const p = section.props;
  const colCount = Number(p.columns) || 4;
  const cols = linkColumns.slice(0, colCount);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8" style={{ color: p.textColor || "#fafafa" }}>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {p.showNewsletter !== "false" && colCount > 3 && (
            <div className="col-span-full md:col-span-1">
              <h3 className="text-sm font-semibold mb-3" style={{ color: p.textColor || "#fafafa" }}>Newsletter</h3>
              <div className="flex">
                <input type="email" placeholder="your@email.com"
                  className="h-9 flex-1 rounded-l-lg border border-zinc-700 bg-transparent px-3 text-xs outline-none"
                  style={{ borderColor: p.textColor ? `${p.textColor}30` : "#27272a" }} />
                <button className="h-9 rounded-r-lg bg-white px-3 text-xs font-semibold text-apple-ink">→</button>
              </div>
            </div>
          )}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider opacity-60">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.text}>
                    <BuilderLink href={link.url} className="text-xs opacity-70 hover:opacity-100 transition-opacity">
                      {link.text}
                    </BuilderLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs opacity-60 sm:flex-row" style={{ borderColor: p.textColor ? `${p.textColor}20` : "#27272a" }}>
          <p>{p.copyright || "© 2026 Your Store. All rights reserved."}</p>
          <div className="flex items-center gap-4">
            {p.showSocial !== "false" && <span>𝕏 📷 💼 📘</span>}
            {p.showPaymentIcons !== "false" && <span>💳 VISA MC PP</span>}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
