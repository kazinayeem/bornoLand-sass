"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";

const linkColumns = [
  { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Sale"] },
  { title: "Support", links: ["Contact Us", "FAQ", "Shipping Info", "Returns"] },
  { title: "Company", links: ["About Us", "Careers", "Press", "Blog"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
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
                <button className="h-9 rounded-r-lg bg-white px-3 text-xs font-semibold text-zinc-900">→</button>
              </div>
            </div>
          )}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider opacity-60">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs opacity-70 hover:opacity-100 transition-opacity">{link}</a>
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
