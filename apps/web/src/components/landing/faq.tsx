"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { SectionHeading } from "./section-heading";

const faqs = [
  { q: "How do I create a store?", a: "Sign up for free, choose your store name and subdomain, then use our drag-and-drop builder to customize your storefront. Add products, connect payments, and publish — all in under 30 minutes." },
  { q: "Can I use my own domain?", a: "Yes! You can connect any custom domain to your BornoLand store. We provide free SSL certificates for all custom domains and subdomains." },
  { q: "Do you support bKash?", a: "Yes, bKash is fully integrated. Your customers can pay via bKash, and we also support Nagad, Rocket, Stripe, SSLCommerz, PayPal, and more." },
  { q: "Do you support Cash on Delivery?", a: "Absolutely. COD is built into the checkout flow. You can enable or disable it per store and set delivery charge rules." },
  { q: "Can I sell digital products?", a: "Yes, BornoLand supports both physical and digital products. You can upload files, set download limits, and manage digital inventory." },
  { q: "Can I manage multiple stores?", a: "Yes, our Business and Agency plans support multiple stores under one account with centralized management." },
  { q: "Is SSL included?", a: "Yes, every store gets a free SSL certificate — both on your custom domain and your BornoLand subdomain. All data is encrypted." },
  { q: "What payment methods are supported?", a: "We support bKash, Nagad, Rocket, Stripe, SSLCommerz, and PayPal. More payment gateways are being added regularly." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about BornoLand."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 space-y-2"
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 ${
                open === i ? "border-blue-200 bg-blue-50/30 shadow-sm" : "border-zinc-200/60 bg-white"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-zinc-900 pr-4">{faq.q}</span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  open === i ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-400"
                }`}>
                  {open === i ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-600">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
