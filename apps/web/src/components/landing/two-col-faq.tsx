"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { ChevronDown } from "lucide-react";

export function TwoColFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: "How quickly can I launch my store?",
      a: "You can create an account, customize your storefront using our visual builder, upload your catalog, and go live in under 15 minutes.",
    },
    {
      q: "Can I connect my own custom apex domain?",
      a: "Yes. On Starter, Business, and Enterprise plans, you can connect your purchased custom domain (e.g. www.yourbrand.com) with automatic Let's Encrypt SSL.",
    },
    {
      q: "Can I accept bKash, Nagad, and Cash on Delivery?",
      a: "Absolutely. Bornoland natively supports bKash merchant accounts, manual TrxID verification, Nagad payments, and flexible Cash on Delivery rules.",
    },
    {
      q: "Can I connect Steadfast or Pathao couriers?",
      a: "Yes. Direct API integrations with Steadfast and Pathao enable one-click consignment booking, barcode labels, and automated delivery tracking.",
    },
    {
      q: "Can I migrate my existing store and catalog?",
      a: "Yes. You can import products, categories, variants, and customer databases seamlessly using CSV or Excel formats.",
    },
    {
      q: "Can I upgrade or cancel my plan anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your billing workspace without penalty.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
              FAQS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
              Questions, answered.
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed font-normal">
              Everything you need to know about setting up, launching, and growing your store with Bornoland.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 divide-y divide-zinc-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left py-2 gap-4 text-sm sm:text-base font-bold text-zinc-950 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
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
      </div>
    </section>
  );
}
