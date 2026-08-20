"use client";

import { useState } from "react";
import { Plus, Minus, Search, HelpCircle } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "How long does shipping and delivery take?",
    answer: "Standard delivery takes 2–4 business days within the city and 3–6 business days nationwide. Express delivery options are available at checkout.",
  },
  {
    id: "faq-2",
    question: "What payment methods do you support?",
    answer: "We support Cash on Delivery (COD), Mobile Banking (bKash, Nagad, Rocket), and all major Visa and MasterCard debit/credit cards.",
  },
  {
    id: "faq-3",
    question: "Can I return or exchange my order?",
    answer: "Yes! We offer a 7-day hassle-free return and exchange policy for unworn items in original packaging with proof of purchase.",
  },
  {
    id: "faq-4",
    question: "How can I track the status of my order?",
    answer: "Once your order is dispatched, you will receive an SMS and email notification with your tracking number to monitor your shipment in real time.",
  },
];

export function FAQSection({ section }: { section: SectionData }) {
  const p = section.props;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const styleItems = (section.style?.faqItems ?? []) as { id: string; question: string; answer: string }[];
  const rawItems = styleItems.length > 0 ? styleItems : DEFAULT_FAQS;

  const items = rawItems.filter((faq) =>
    p.showSearch === "true" ? faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionTitle
          title={p.title || "Frequently Asked Questions"}
          subtitle={p.subtitle || "Have questions? Everything you need to know about our products and orders"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        {p.showSearch === "true" && (
          <div className="relative mb-8">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        )}

        <div className="space-y-3">
          {items.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={faq.id || i}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-zinc-300 bg-white shadow-md shadow-zinc-900/5 ring-1 ring-zinc-900/5"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-zinc-900">
                    {faq.question}
                  </span>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-100 px-5 pb-5 pt-3 sm:px-6 text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}

