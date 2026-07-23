"use client";

import { motion } from "framer-motion";
import { UserPlus, Store, ShoppingBag } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { landingContainer, landingSection } from "./landing-ui";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create an Account",
    description:
      "Welcome to BornoLand! Sign up to launch your online store and access powerful tools to grow your business.",
  },
  {
    step: "02",
    icon: Store,
    title: "Set Up Your Store",
    description:
      "Add your store name, choose custom domain settings, and select category preferences to launch in minutes.",
  },
  {
    step: "03",
    icon: ShoppingBag,
    title: "Start Your Sales",
    description:
      "Start selling by adding your first product. Enter price, photos, and variants to showcase your items to customers.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={landingSection}>
      <div className={landingContainer}>
        <SectionHeading
          eyebrow="Simple Steps"
          title="Simple Steps to Make Your Website Live"
          description="No need to learn design or development. We have simplified everything so you can build your store confidently."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative mt-12 sm:mt-14"
        >
          {/* Dashed curved connector — desktop */}
          <svg
            className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-16 w-[68%] text-primary md:block"
            viewBox="0 0 600 64"
            fill="none"
            aria-hidden
          >
            <path
              d="M0 40 C100 0, 200 0, 300 40 S500 80, 600 40"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeOpacity="0.45"
            />
          </svg>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((stepItem) => (
              <Card
                key={stepItem.step}
                className="relative border-0 bg-transparent p-0 text-center shadow-none"
              >
                <CardContent className="flex flex-col items-center p-0">
                  <div className="relative mb-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
                      <stepItem.icon className="h-8 w-8" aria-hidden />
                    </div>
                    <Badge
                      variant="primary"
                      className="absolute -right-1 -top-1 h-7 min-w-7 justify-center rounded-full bg-primary px-0 text-[11px] font-bold text-primary-foreground ring-0"
                    >
                      {stepItem.step}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">{stepItem.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {stepItem.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
