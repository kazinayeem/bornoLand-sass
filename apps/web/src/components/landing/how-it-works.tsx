"use client";

import { motion } from "framer-motion";
import {
  UserPlus, Store, Package, CreditCard, Globe, DollarSign,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  { icon: UserPlus, title: "Create Account", description: "Sign up free in under 30 seconds. No credit card required." },
  { icon: Store, title: "Create Store", description: "Set up your store with a custom subdomain and branding." },
  { icon: Package, title: "Add Products", description: "Import or add products with images, pricing, and variants." },
  { icon: CreditCard, title: "Connect Payments", description: "Link bKash, Nagad, Stripe, or SSLCommerz to start accepting payments." },
  { icon: Globe, title: "Publish Website", description: "Go live with a click. Your store is ready for customers." },
  { icon: DollarSign, title: "Start Selling", description: "Receive orders, process payments, and grow your business." },
];

export function HowItWorks() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How It Works"
          title="From Zero To Selling In Minutes"
          description="Get your online store up and running in six simple steps."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-apple-hairline" />
              <div className="space-y-12">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative flex items-center ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className={`w-[calc(50%-2rem)] ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                      <div className={`inline-block rounded-lg border border-apple-hairline bg-apple-canvas p-5 ${
                        i % 2 === 0 ? "text-right" : "text-left"
                      }`}>
                        <div className={`flex items-center gap-3 mb-1 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-canvas-parchment">
                            <step.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Step {i + 1}</span>
                        </div>
                        <h3 className="text-sm font-bold text-apple-ink">{step.title}</h3>
                        <p className="mt-1 text-xs text-apple-ink-muted-48">{step.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-apple-canvas bg-apple-primary text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="w-[calc(50%-2rem)]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:hidden">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-apple-primary text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-apple-hairline" />}
                </div>
                <div className="mb-4 flex-1 rounded-xl border border-apple-divider-soft bg-apple-canvas p-3.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <step.icon className="h-3.5 w-3.5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-apple-ink">{step.title}</h3>
                  </div>
                  <p className="text-xs text-apple-ink-muted-48">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
