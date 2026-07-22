"use client";

import { Store, Package, ShoppingCart, Star } from "lucide-react";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingGridStats, LandingReveal } from "./landing-ui";

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
    <section aria-label="Platform statistics" className="relative -mt-4 sm:-mt-6 md:-mt-8">
      <div className={landingContainer}>
        <LandingReveal>
          <div className="rounded-lg border border-apple-hairline bg-apple-canvas px-4 py-7 min-[390px]:px-5 sm:px-8 sm:py-9 md:px-10">
            <div className={landingGridStats}>
              {metrics.map((m) => (
                <div key={m.label} className="flex min-w-0 flex-col items-center text-center">
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment sm:mb-3 sm:h-11 sm:w-11">
                    <m.icon className="h-5 w-5 text-apple-primary" aria-hidden />
                  </div>
                  <p className="text-xl font-bold tabular-nums tracking-tight text-apple-ink sm:text-2xl md:text-3xl">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-apple-ink-muted-48 sm:text-xs">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-apple-divider-soft pt-5 sm:mt-8 sm:pt-6">
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-apple-ink-muted-48 sm:text-xs">
                {t.trust.logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 sm:gap-x-8 sm:gap-y-3">
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
