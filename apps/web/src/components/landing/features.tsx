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
import {
  landingCard,
  landingCardHover,
  landingContainer,
  landingGridFeatures,
  landingIconWrap,
  landingSection,
  staggerContainer,
  staggerItem,
} from "./landing-ui";

const icons = [Store, ShoppingBag, Package, ShoppingCart, CreditCard, Users, FileText, Palette];

export function Features() {
  const { t } = useLandingLocale();
  const f = t.features;

  return (
    <section id="features" className={landingSection}>
      <div className={landingContainer}>
        <SectionHeading eyebrow={f.eyebrow} title={f.title} description={f.description} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className={`mt-10 sm:mt-12 ${landingGridFeatures}`}
        >
          {f.items.map((item, i) => {
            const Icon = icons[i] ?? Store;
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
