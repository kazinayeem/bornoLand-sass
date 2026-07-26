"use client";

import { Card } from "@/components/ui/card";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, LandingReveal } from "./landing-ui";

const partners = [
  "Stripe",
  "bKash",
  "Nagad",
  "Rocket",
  "SSLCommerz",
  "Pathao",
  "SteadFast",
  "RedX",
];

export function TrustBar() {
  const { t } = useLandingLocale();

  return (
    <section aria-label={t.trust.logosLabel} className="relative py-10 sm:py-12">
      <div className={landingContainer}>
        <LandingReveal>
          <Card className="border-0 bg-transparent p-0 shadow-none">
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground sm:text-base">
              {t.trust.logosLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10 md:gap-x-12">
              {partners.map((name) => (
                <span
                  key={name}
                  className="text-sm font-semibold tracking-wide text-muted-foreground/70 grayscale transition-colors hover:text-muted-foreground sm:text-base"
                >
                  {name}
                </span>
              ))}
            </div>
          </Card>
        </LandingReveal>
      </div>
    </section>
  );
}
