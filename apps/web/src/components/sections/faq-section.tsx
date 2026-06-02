"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

const sampleFAQs = [
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days." },
  { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee on all products. Items must be unused and in original packaging." },
  { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. International shipping takes 7-14 business days." },
  { q: "How can I track my order?", a: "Once your order ships, you'll receive a tracking number via email to monitor your delivery." },
];

export function FAQSection({ section }: { section: SectionData }) {
  const p = section.props;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const count = Number(p.faqCount) || 5;
  const items = sampleFAQs.slice(0, count).filter((faq) =>
    p.showSearch === "true" ? faq.q.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-2xl px-4">
        <SectionTitle title={p.title || "FAQ"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        {p.showSearch === "true" && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-zinc-400" />
          </div>
        )}
        <div className="space-y-2">
          {items.map((faq, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50">
                {faq.q}
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
