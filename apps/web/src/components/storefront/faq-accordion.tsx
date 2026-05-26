"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StorefrontSectionLike } from "./storefront-types";

type FAQItem = { q: string; a: string };

export function FAQAccordion({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const title = (props.title as string) || "FAQ";
  const subtitle = (props.subtitle as string) || "";
  const bg = (props.backgroundColor as string) || "";
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  let items: FAQItem[] = [];
  try {
    const parsed = JSON.parse((props.items as string) || "[]");
    if (Array.isArray(parsed)) items = parsed;
  } catch {}

  if (items.length === 0) {
    items = [
      { q: "How do I place an order?", a: "Browse our catalog, add items to cart, and proceed to checkout." },
      { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, PayPal, and more." },
      { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days." },
    ];
  }

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg || undefined }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-zinc-200">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-900 transition hover:bg-zinc-50">
                {item.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="border-t border-zinc-100">
                    <p className="px-5 py-4 text-sm leading-relaxed text-zinc-600">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
