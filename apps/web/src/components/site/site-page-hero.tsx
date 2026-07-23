"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { landingContainer } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

type Cta = {
  label: string;
  href: string;
  variant?: "default" | "outline";
};

type SitePageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  children?: ReactNode;
  align?: "center" | "left";
};

export function SitePageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  children,
  align = "center",
}: SitePageHeroProps) {
  const isCenter = align === "center";

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-secondary to-background pb-14 pt-24 sm:pb-16 sm:pt-28 lg:pt-32"
      aria-labelledby="site-page-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[min(28rem,60vh)] w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent blur-3xl"
        aria-hidden
      />

      <div className={landingContainer}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "max-w-3xl",
            isCenter ? "mx-auto text-center" : "text-left",
          )}
        >
          {eyebrow ? (
            <Badge
              variant="primary"
              className="mb-5 rounded-pill border border-primary/20 px-4 py-1 text-xs font-semibold"
            >
              {eyebrow}
            </Badge>
          ) : null}

          <h1
            id="site-page-heading"
            className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]"
          >
            {title}
          </h1>

          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg",
              isCenter && "mx-auto max-w-2xl",
            )}
          >
            {description}
          </p>

          {(primaryCta || secondaryCta) && (
            <div
              className={cn(
                "mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center",
                isCenter && "sm:justify-center",
              )}
            >
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className={cn(
                    buttonVariants({
                      variant: primaryCta.variant ?? "default",
                      size: "lg",
                    }),
                    "rounded-pill px-7 font-semibold",
                    /* Override global `a { color: primary }` so button text stays readable */
                    (primaryCta.variant ?? "default") === "outline"
                      ? "!text-primary hover:!text-primary"
                      : "!text-primary-foreground hover:!text-primary-foreground",
                  )}
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className={cn(
                    buttonVariants({
                      variant: secondaryCta.variant ?? "outline",
                      size: "lg",
                    }),
                    "rounded-pill px-7 font-semibold",
                    (secondaryCta.variant ?? "outline") === "default"
                      ? "!text-primary-foreground hover:!text-primary-foreground"
                      : "!text-primary hover:!text-primary",
                  )}
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          )}

          {children ? <div className="mt-8">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  );
}
