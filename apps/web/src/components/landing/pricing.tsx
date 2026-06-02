"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "./section-heading";

const plans = [
  {
    name: "Starter",
    price: "৳1,000",
    period: "/month",
    description: "Perfect for new businesses starting their online journey.",
    popular: false,
    features: [
      "1 store", "Up to 100 products", "5 GB storage",
      "Free subdomain", "Basic analytics", "Email support",
      "SSL certificate", "Mobile responsive",
    ],
  },
  {
    name: "Growth",
    price: "৳2,000",
    period: "/month",
    description: "For growing stores that need more power and flexibility.",
    popular: true,
    features: [
      "1 store", "Unlimited products", "20 GB storage",
      "Custom domain", "Advanced analytics", "Priority support",
      "SSL certificate", "Mobile responsive",
      "Variant management", "Bulk editing",
    ],
  },
  {
    name: "Business",
    price: "৳5,000",
    period: "/month",
    description: "For established businesses with advanced requirements.",
    popular: false,
    features: [
      "3 stores", "Unlimited products", "100 GB storage",
      "Custom domains", "Full analytics suite", "24/7 priority support",
      "SSL certificates", "Mobile responsive",
      "Variant management", "Bulk editing",
      "API access", "Team accounts",
    ],
  },
  {
    name: "Agency",
    price: "৳12,000",
    period: "/month",
    description: "For agencies managing multiple client stores.",
    popular: false,
    features: [
      "15 stores", "Unlimited products", "500 GB storage",
      "Custom domains", "White-label analytics", "Dedicated support",
      "SSL certificates", "Mobile responsive",
      "API access", "Team accounts",
      "White-label option", "Bulk operations",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations with custom requirements.",
    popular: false,
    features: [
      "Unlimited stores", "Unlimited products", "Unlimited storage",
      "Custom domains", "Enterprise analytics", "Dedicated account manager",
      "Custom SLA", "Custom integrations", "On-premise option",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, Transparent Pricing"
          description="Choose the plan that fits your business. No hidden fees, no surprises."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? "border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-blue-500/10"
                  : "border-zinc-200/60 bg-white hover:border-zinc-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <h3 className="text-sm font-bold text-zinc-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-zinc-900">{plan.price}</span>
                {plan.period && <span className="text-[11px] font-medium text-zinc-400">{plan.period}</span>}
              </div>
              <p className="mt-1 text-xs text-zinc-500">{plan.description}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-zinc-600">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`mt-5 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:brightness-110"
                    : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
