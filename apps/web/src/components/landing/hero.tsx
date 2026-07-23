"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, staggerContainer, staggerItem } from "./landing-ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardShowcase } from "./dashboard-showcase";

export function Hero() {
  const { t } = useLandingLocale();
  const h = t.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-secondary to-background pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[min(32rem,70vh)] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent blur-3xl"
        aria-hidden
      />

      <div className={landingContainer}>
        <motion.div
          key={h.titleHighlight}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={staggerItem} className="mb-5 sm:mb-6">
            <Badge
              variant="primary"
              className="rounded-pill border border-primary/20 px-4 py-1 text-xs font-semibold tracking-wide shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {h.badge}
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={staggerItem}
            className="text-balance text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {h.titleLine1}{" "}
            <span className="text-primary">{h.titleHighlight}</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg"
          >
            {h.description}
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center"
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-pill px-8 font-semibold shadow-md",
              )}
            >
              {h.primaryCta}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <Link
              href="#builder"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-pill border-primary bg-card px-7 font-semibold",
              )}
            >
              <Play className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              {h.secondaryCta}
            </Link>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="mt-4 text-xs font-medium text-muted-foreground sm:mt-5"
          >
            {h.benefits.join(" · ")}
          </motion.p>
        </motion.div>

        {/* Section 3 showcase sits directly under hero CTAs */}
        <div className="mt-10 sm:mt-14">
          <DashboardShowcase />
        </div>
      </div>
    </section>
  );
}
