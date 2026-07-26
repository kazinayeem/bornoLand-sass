"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { landingContainer } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

type SiteCtaBannerProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function SiteCtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: SiteCtaBannerProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className={landingContainer}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Card className="overflow-hidden rounded-apple-xl border-0 bg-primary text-primary-foreground shadow-xl">
            <CardContent className="relative px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
                aria-hidden
              />
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {title}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                  {description}
                </p>
                <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={primaryHref}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "lg" }),
                      "rounded-pill border-0 bg-card font-semibold !text-foreground hover:bg-card/90 hover:!text-foreground",
                    )}
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  {secondaryLabel && secondaryHref ? (
                    <Link
                      href={secondaryHref}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "rounded-pill border-primary-foreground/35 bg-transparent font-semibold !text-primary-foreground hover:bg-primary-foreground/10 hover:!text-primary-foreground",
                      )}
                    >
                      {secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
