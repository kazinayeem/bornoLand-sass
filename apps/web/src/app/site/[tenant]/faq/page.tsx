"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

const faqs = [
  { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. Fill in your shipping details and confirm your order." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Cash on Delivery (COD)." },
  { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery." },
  { q: "Can I cancel my order?", a: "Yes, you can cancel within 24 hours of placing the order. Contact our support team for assistance." },
  { q: "Do you ship internationally?", a: "Yes, we ship to most countries worldwide. International delivery takes 7-14 business days." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account." },
  { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. Items must be unused and in original packaging." },
  { q: "How do I contact support?", a: "You can reach us via the contact form on our website, email us at hello@example.com, or call +1 (555) 123-4567." },
];

export default function FaqPage() {
  const { theme } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>FAQ</h1>
        <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Frequently asked questions</p>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border overflow-hidden"
            style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50"
              style={{ backgroundColor: isDark ? (openIdx === i ? "#18181b" : "transparent") : (openIdx === i ? "#fafafa" : "transparent") }}>
              <span className="text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{faq.q}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                style={{ color: isDark ? "#a1a1aa" : "#52525b" }} />
            </button>
            {openIdx === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                className="border-t px-4 py-3"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{faq.a}</p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
