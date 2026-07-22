"use client";

import { Store, Package, ShoppingCart, Star } from "lucide-react";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, LandingReveal } from "./landing-ui";

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
    <section aria-label="Platform statistics" className="relative -mt-6 sm:-mt-8">
      <div className={landingContainer}>
        <LandingReveal>
          <div className="rounded-lg border border-apple-hairline bg-apple-canvas px-5 py-8 sm:px-10 sm:py-9">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                    <m.icon className="h-5 w-5 text-apple-primary" aria-hidden />
                  </div>
                  <p className="text-2xl font-bold tabular-nums tracking-tight text-apple-ink sm:text-3xl">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-apple-ink-muted-48">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-apple-divider-soft pt-6">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-apple-ink-muted-48">
                {t.trust.logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
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
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
