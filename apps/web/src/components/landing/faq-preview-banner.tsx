"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, LandingReveal } from "./landing-ui";
import { cn } from "@/lib/utils";

function FloatCard({
  children,
  className,
  rotate,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  rotate: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("pointer-events-none absolute hidden w-44 lg:block", className)}
      style={{ rotate }}
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

export function FaqPreviewBanner() {
  const { t } = useLandingLocale();
  const faq = t.faq;
  const cta = t.finalCta;
  const previewItems = faq.items.slice(0, 3);

  return (
    <section className="relative py-12 sm:py-16" aria-label={faq.eyebrow}>
      <div className={landingContainer}>
        <LandingReveal className="mx-auto mb-10 max-w-3xl sm:mb-12">
          <div className="mb-6 text-center">
            <Badge variant="primary" className="mb-3 rounded-pill">
              {faq.eyebrow}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {faq.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {faq.description}
            </p>
          </div>

          <Card className="rounded-apple-xl border border-border bg-card p-2 shadow-sm sm:p-4">
            <CardContent className="p-2 sm:p-3">
              <Accordion type="single" collapsible defaultValue="preview-0" className="w-full">
                {previewItems.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`preview-${i}`}
                    className={i === previewItems.length - 1 ? "border-b-0" : ""}
                  >
                    <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline hover:text-primary sm:text-base">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </LandingReveal>

        <LandingReveal>
          <Card className="relative overflow-hidden rounded-3xl border border-success/20 bg-gradient-to-br from-success/15 via-primary/10 to-success/20 p-8 shadow-xl sm:p-10 md:p-14">
            {/* Floating left chart card */}
            <FloatCard className="-left-2 top-8 xl:left-6" rotate={-8} delay={0.2}>
              <Card className="rounded-2xl border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-2 p-0">
                  <p className="text-[10px] font-bold text-foreground">Revenue</p>
                  <div className="flex h-14 items-end gap-1">
                    {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-primary/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FloatCard>

            {/* Floating right promo card */}
            <FloatCard className="-right-2 bottom-6 xl:right-6" rotate={8} delay={0.6}>
              <Card className="rounded-2xl border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-2 p-0">
                  <p className="text-[10px] font-bold text-foreground">Create promo</p>
                  <div className="h-6 rounded-apple-md border border-border bg-muted/50" />
                  <div className="h-6 rounded-apple-md border border-border bg-muted/50" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-muted-foreground">Active</span>
                    <Switch defaultChecked aria-hidden />
                  </div>
                </CardContent>
              </Card>
            </FloatCard>

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
              <Badge className="bg-primary text-primary-foreground ring-0">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Live demo
              </Badge>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Explore the Full Demo and Discover What&apos;s Possible
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Step inside the BornoLand experience and preview how your store will look,
                function, and grow — before you even start.
              </p>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "rounded-pill border-0 bg-card px-8 font-semibold !text-primary shadow-md hover:bg-card/95 hover:!text-primary",
                )}
              >
                {cta.secondary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Card>
        </LandingReveal>
      </div>
    </section>
  );
}
