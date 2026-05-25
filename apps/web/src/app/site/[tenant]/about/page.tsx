"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Truck, Shield, HeadphonesIcon, RefreshCw, Star } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

const features = [
  { icon: ShoppingBag, title: "Curated Products", desc: "Handpicked items from top brands and artisans worldwide." },
  { icon: Truck, title: "Fast Shipping", desc: "Free shipping on orders over $100. Delivery in 3-5 business days." },
  { icon: Shield, title: "Secure Shopping", desc: "SSL-encrypted checkout with 100% purchase protection." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock customer service, ready to help anytime." },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy. No questions asked." },
  { icon: Star, title: "Premium Quality", desc: "Every product meets our strict quality standards." },
];

export default function AboutPage() {
  const { store, theme } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  return (
    <div style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      {/* Hero */}
      <section className="py-20 sm:py-28 text-center px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}02 100%)` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>About Us</span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            We&apos;re on a mission to make quality products accessible to everyone.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="space-y-6 text-center">
          <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Who We Are</h2>
          <p className="leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            Founded with a passion for quality and customer satisfaction, {store.name} has grown from a small
            startup to a trusted destination for online shopping. We believe in providing our customers with
            the best products at the best prices, backed by exceptional service.
          </p>
          <p className="leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            Our team works tirelessly to curate a selection of products that combine quality, style, and value.
            From fashion and electronics to home goods and accessories, every item in our collection is chosen
            with care.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16" style={{ backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Our Mission</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              To provide a seamless shopping experience with premium products, fast delivery,
              and exceptional customer service — making quality accessible to everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
          Why Choose Us
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-6 text-center transition-all hover:shadow-md"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#ffffff" }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${primaryColor}12` }}>
                <f.icon className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="mt-4 font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{f.title}</h3>
              <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="py-16" style={{ backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Our Team</h2>
          <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Meet the people behind {store.name}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Alex Johnson", "Sarah Chen", "Mike Rivera", "Emily Kim"].map((name, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
                  {name[0]}
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{name}</h3>
                <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Team Member</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
