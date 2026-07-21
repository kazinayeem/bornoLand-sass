"use client";

import { motion } from "framer-motion";
import { Store, Package, ShoppingCart, Star } from "lucide-react";
import { useLandingLocale } from "./landing-locale";

const partners = ["Stripe", "bKash", "Nagad", "Rocket", "SSLCommerz", "Pathao", "SteadFast", "RedX"];

export function TrustBar() {
  const { t } = useLandingLocale();

  const metrics = [
    { icon: Store, value: "500+", label: t.trust.stores },
    { icon: Package, value: "10,000+", label: t.trust.products },
    { icon: ShoppingCart, value: "50,000+", label: t.trust.orders },
    { icon: Star, value: "4.9/5", label: t.trust.rating },
  ];

  return (
    <section className="relative -mt-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-lg border border-apple-hairline bg-apple-canvas px-6 py-8 sm:px-10 sm:py-9"
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                  <m.icon className="h-5 w-5 text-apple-primary" />
                </div>
                <p className="text-xl font-bold text-apple-ink sm:text-2xl">{m.value}</p>
                <p className="text-xs font-medium text-apple-ink-muted-48">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-apple-divider-soft pt-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-apple-ink-muted-48">
              {t.trust.logosLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {partners.map((name) => (
                <span
                  key={name}
                  className="text-sm font-semibold text-apple-ink-muted-48 transition-colors hover:text-apple-ink-muted-80"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
