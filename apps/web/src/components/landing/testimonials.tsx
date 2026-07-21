"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Store Owner",
    business: "Fashion Boutique",
    avatar: "SA",
    color: "bg-blue-500",
    rating: 5,
    text: "BornoLand made it incredibly easy to launch my online store. The drag-and-drop builder is intuitive, and having all the tools — payments, delivery, analytics — in one place saved me months of development time.",
  },
  {
    name: "Rafi Hasan",
    role: "Agency Partner",
    business: "WebWorks Digital",
    avatar: "RH",
    color: "bg-violet-500",
    rating: 5,
    text: "We manage 15+ client stores on BornoLand. The multi-tenant architecture is rock solid, the API is clean, and our clients love the modern storefronts. It's become our go-to ecommerce platform.",
  },
  {
    name: "Nusrat Jahan",
    role: "Freelancer",
    business: "Handmade Crafts",
    avatar: "NJ",
    color: "bg-emerald-500",
    rating: 5,
    text: "I was selling on social media before BornoLand. Now I have a professional store with bKash payments, delivery integration, and analytics — and I set it up in one afternoon. Absolutely love it!",
  },
  {
    name: "Tanvir Islam",
    role: "Small Business Owner",
    business: "TechGadget BD",
    avatar: "TI",
    color: "bg-amber-500",
    rating: 5,
    text: "The inventory management with variant support is exactly what we needed. We sell electronics with multiple specs and colors, and BornoLand handles it perfectly. Customer support is also top-notch.",
  },
  {
    name: "Farzana Hoque",
    role: "Entrepreneur",
    business: "Organic Essentials",
    avatar: "FH",
    color: "bg-rose-500",
    rating: 5,
    text: "From zero to first order in under 2 hours. BornoLand's simplicity is its superpower. The mobile app lets me check orders and update products even when I'm away from my desk.",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = testimonials[current];

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved By Store Owners"
          description="Hear from entrepreneurs, agencies, and businesses who use BornoLand."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 mx-auto max-w-3xl"
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-[2rem] border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-lg"
              >
                <Quote className="absolute right-6 top-6 h-10 w-10 text-blue-100" />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white shadow-md`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-apple-ink">{t.name}</p>
                    <p className="text-xs text-apple-ink-muted-48">{t.role} · {t.business}</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-apple-ink-muted-80">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-6 bg-zinc-900" : "w-2 bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
