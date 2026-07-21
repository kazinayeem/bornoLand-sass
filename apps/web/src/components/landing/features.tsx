"use client";

import { motion } from "framer-motion";
import {
  Store,
  ShoppingBag,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  FileText,
  Palette,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";

const icons = [Store, ShoppingBag, Package, ShoppingCart, CreditCard, Users, FileText, Palette];

export function Features() {
  const { t } = useLandingLocale();
  const f = t.features;

  return (
    <section id="features" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={f.eyebrow} title={f.title} description={f.description} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {f.items.map((item, i) => {
            const Icon = icons[i] ?? Store;
            return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="group rounded-lg border border-apple-hairline bg-apple-canvas p-5 transition-colors duration-300 hover:border-blue-200/80"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-apple-canvas-parchment transition-colors group-hover:bg-blue-50">
                  <Icon className="h-4 w-4 text-apple-primary" />
                </div>
                <h3 className="text-sm font-semibold text-apple-ink">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-apple-ink-muted-48">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
