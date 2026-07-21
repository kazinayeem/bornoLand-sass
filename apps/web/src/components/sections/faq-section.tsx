"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function FAQSection({ section }: { section: SectionData }) {
  const p = section.props;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const faqItems = (section.style?.faqItems ?? []) as { id: string; question: string; answer: string }[];
  const items = faqItems.filter((faq) =>
    p.showSearch === "true" ? faq.question.toLowerCase().includes(search.toLowerCase()) : true
  );
  if (items.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <SectionTitle title={p.title || "FAQ"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          <p className="mt-4 text-sm text-apple-ink-muted-48">No FAQ items yet. Add questions in the Content tab.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-2xl px-4">
        <SectionTitle title={p.title || "FAQ"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        {p.showSearch === "true" && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-zinc-400" />
          </div>
        )}
        <div className="space-y-2">
          {items.map((faq, i) => (
            <div key={faq.id || i} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-apple-ink hover:bg-apple-canvas-parchment">
                {faq.question || `Question ${i + 1}`}
                <ChevronDown className={`h-4 w-4 text-apple-ink-muted-48 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm text-apple-ink-muted-80">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
