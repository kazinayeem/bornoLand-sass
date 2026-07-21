"use client";

import { motion } from "framer-motion";
import { ShoppingBag, ShoppingCart, Package, FileText, BarChart3 } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";

const icons = [ShoppingBag, ShoppingCart, Package, FileText, BarChart3];

export function StoreManagement() {
  const { t } = useLandingLocale();
  const m = t.management;

  return (
    <section id="management" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={m.eyebrow} title={m.title} description={m.description} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {m.items.map((item, i) => {
            const Icon = icons[i] ?? ShoppingBag;
            return (
              <div
                key={item.title}
                className="rounded-lg border border-apple-hairline bg-apple-canvas p-5 transition-colors hover:border-blue-200/80"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                  <Icon className="h-5 w-5 text-apple-primary" />
                </div>
                <h3 className="text-sm font-semibold text-apple-ink">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-apple-ink-muted-48">{item.description}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
