"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import {
  landingCard,
  landingContainer,
  landingGridTestimonials,
  landingSection,
  staggerContainer,
  staggerItem,
} from "./landing-ui";

export function Testimonials() {
  const { t } = useLandingLocale();
  const section = t.testimonials;
  const items = section.items.slice(0, 3);

  return (
    <section id="testimonials" className={landingSection}>
      <div className={landingContainer}>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className={`mt-10 sm:mt-12 ${landingGridTestimonials}`}
        >
          {items.map((item) => (
            <motion.article
              key={item.name}
              variants={staggerItem}
              className={`${landingCard} relative transition-shadow duration-300 hover:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.18)]`}
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-blue-100" aria-hidden />
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.color} text-sm font-bold text-white`}
                  aria-hidden
                >
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-apple-ink">{item.name}</p>
                  <p className="truncate text-xs text-apple-ink-muted-48">
                    {item.role} · {item.business}
                  </p>
                </div>
              </div>
              <div className="mb-3 flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-apple-ink-muted-80">
                &ldquo;{item.text}&rdquo;
              </blockquote>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
