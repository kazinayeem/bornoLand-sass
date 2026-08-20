"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: "How does the 7-day free trial work?",
      a: "You get full access to all Starter or Pro plan features for 7 days without entering any credit card. You can create your store, upload products, and explore the visual builder risk-free.",
    },
    {
      q: "Can I connect my own custom domain?",
      a: "Yes. On Starter, Pro, and Enterprise plans, you can connect your purchased domain (e.g. www.yourbrand.com) with automatic Let's Encrypt SSL certificates and edge DNS routing.",
    },
    {
      q: "Can I accept bKash, Nagad, and Cash on Delivery?",
      a: "Absolutely. Bornoland natively supports bKash merchant accounts, manual TrxID verification, Nagad payments, and flexible Cash on Delivery rules with custom minimum order amounts.",
    },
    {
      q: "Can I manage multiple distinct stores from one account?",
      a: "Yes. Our Pro plan includes up to 3 stores, and Enterprise supports unlimited stores. Each store has its own isolated product catalog, orders, custom domain, and staff roles under a single login.",
    },
    {
      q: "How does automated invoice generation work?",
      a: "Whenever an order is confirmed, Bornoland automatically compiles a professional, print-ready A4 PDF invoice complete with your store branding, line items, SKU details, QR verification, and amount in words.",
    },
    {
      q: "Can I connect Steadfast or Pathao couriers?",
      a: "Yes. We support direct API integrations with Steadfast and Pathao for automated consignment booking, barcode generation, and live delivery tracking sync.",
    },
    {
      q: "Do you take any transaction percentage fees?",
      a: "No! Unlike other platforms that take 1% to 2% of every sale, Bornoland charges 0% transaction fees. You keep 100% of what you earn.",
    },
    {
      q: "Can I cancel or change plans anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your billing workspace without penalty.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Everything you need to know.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Have questions about Bornoland? Here are the most common answers from our merchants.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto divide-y divide-zinc-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left py-2 gap-4 text-sm sm:text-base font-bold text-zinc-950 hover:text-zinc-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-zinc-900" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="pt-2 pb-2 text-xs sm:text-sm text-zinc-600 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
