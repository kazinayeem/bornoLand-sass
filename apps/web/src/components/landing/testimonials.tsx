"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";

export function Testimonials() {
  const { t } = useLandingLocale();
  const section = t.testimonials;
  const items = section.items.slice(0, 3);

  return (
    <section id="testimonials" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {items.map((item) => (
            <article
              key={item.name}
              className="relative rounded-lg border border-apple-hairline bg-apple-canvas p-6"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-blue-100" />
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${item.color} text-sm font-bold text-white`}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-apple-ink">{item.name}</p>
                  <p className="text-xs text-apple-ink-muted-48">
                    {item.role} · {item.business}
                  </p>
                </div>
              </div>
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-apple-ink-muted-80">&ldquo;{item.text}&rdquo;</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
