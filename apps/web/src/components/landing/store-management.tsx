"use client";

import { motion } from "framer-motion";
import { ShoppingBag, ShoppingCart, Package, FileText, BarChart3 } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import {
  landingCard,
  landingCardHover,
  landingContainer,
  landingGridManagement,
  landingIconWrap,
  landingSection,
  staggerContainer,
  staggerItem,
} from "./landing-ui";

const icons = [ShoppingBag, ShoppingCart, Package, FileText, BarChart3];

export function StoreManagement() {
  const { t } = useLandingLocale();
  const m = t.management;

  return (
    <section id="management" className={landingSection}>
      <div className={landingContainer}>
        <SectionHeading eyebrow={m.eyebrow} title={m.title} description={m.description} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className={`mt-10 sm:mt-12 ${landingGridManagement}`}
        >
          {m.items.map((item: { title: string; description: string }, i: number) => {
            const Icon = icons[i] ?? ShoppingBag;
            return (
              <motion.article
                key={item.title}
                variants={staggerItem}
                className={`group ${landingCard} ${landingCardHover}`}
              >
                <div className={landingIconWrap}>
                  <Icon className="h-5 w-5 text-apple-primary" aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-apple-ink">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-apple-ink-muted-48">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
