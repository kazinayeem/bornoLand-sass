"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { landingContainer, LandingReveal } from "./landing-ui";

const partnerLogos = [
  "Pathao",
  "SteadFast",
  "RedX",
  "Paperfly",
  "bKash",
  "Nagad",
  "Rocket",
  "SSLCommerz",
  "Stripe",
  "PayPal",
];

export function Integrations() {
  const reduceMotion = useReducedMotion();
  const loop = [...partnerLogos, ...partnerLogos];

  return (
    <section
      id="partners"
      aria-label="Payment and delivery partners"
      className="relative overflow-hidden py-10 sm:py-12"
    >
      <div className={landingContainer}>
        <LandingReveal>
          <Card className="border-0 bg-transparent p-0 shadow-none">
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
              Payments &amp; delivery partners
            </p>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-20" />

              <div className="overflow-hidden">
                <motion.div
                  className="flex min-w-max items-center gap-10 pr-10 sm:gap-14"
                  animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { repeat: Infinity, duration: 28, ease: "linear" }
                  }
                >
                  {loop.map((name, index) => (
                    <span
                      key={`${name}-${index}`}
                      className="shrink-0 text-sm font-semibold tracking-wide text-muted-foreground/70 grayscale sm:text-base"
                    >
                      {name}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </Card>
        </LandingReveal>
      </div>
    </section>
  );
}
