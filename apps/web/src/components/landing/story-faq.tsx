"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { Reveal } from "./motion-primitives";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "What makes BornoLand different from standard ecommerce website builders?",
      a: "Unlike standalone builders that only manage an online shopping cart, BornoLand is a complete Business Operating System (BOS). It unifies your digital storefront, physical retail POS registers, multi-warehouse stock, staff payroll, and double-entry accounting in a single real-time database.",
    },
    {
      q: "Can I connect my physical retail shop registers with my online store?",
      a: "Yes. When an item is sold in your physical shop via our Cloud POS terminal, online stock updates instantaneously to prevent overselling. Daily revenue and cash drawer reconciliations sync directly into your financial ledger.",
    },
    {
      q: "How does automated double-entry accounting and real-time P&L work?",
      a: "Every transaction—from a web checkout or POS sale to a supplier purchase or courier expense—automatically generates balanced debit and credit journal entries. You receive real-time Income Statements (P&L) and Balance Sheets without manual bookkeeping.",
    },
    {
      q: "Which payment gateways and courier logistics integrations are supported?",
      a: "BornoLand supports global gateways including Stripe and PayPal, local methods like bKash, Nagad, Rocket, and Cash on Delivery (COD), plus 1-click logistics dispatch with Pathao, Steadfast, and RedX.",
    },
    {
      q: "Can I assign restricted access permissions to cashiers and staff members?",
      a: "Yes. Our granular Role-Based Access Control (RBAC) allows you to restrict cashiers to POS registers, warehouse managers to stock movements, and accountants to financial ledgers with full audit trails.",
    },
    {
      q: "Can I connect my own custom domain with SSL included?",
      a: "Yes. You can connect any custom domain (.com, .store, .net, etc.) with automated free SSL certificates provisioned and renewed seamlessly.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={40}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              COMMON QUESTIONS
            </span>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              Clear answers about platform capabilities, setup, security, and billing.
            </p>
          </Reveal>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} direction="up" delay={idx * 50 + 100}>
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isOpen
                      ? "border-[#003399]/40 bg-zinc-50/70 shadow-xs"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-zinc-950 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-transform duration-200",
                        isOpen && "rotate-180 bg-[#003399] text-white"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-200/50 pt-3 animate-in fade-in duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
