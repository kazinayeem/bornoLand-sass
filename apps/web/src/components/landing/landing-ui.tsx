"use client";

import { type ReactNode, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Consistent landing layout — 1280px max, centered, responsive gutters */
export const landingContainer = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
export const landingSection = "relative scroll-mt-28 py-16 sm:py-20 lg:py-24";
export const landingSectionAlt = `${landingSection} bg-apple-canvas-parchment`;

export const landingCard =
  "flex h-full flex-col rounded-lg border border-apple-hairline bg-apple-canvas p-5 sm:p-6";
export const landingCardHover =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,0.22)]";

export const landingIconWrap =
  "mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-canvas-parchment transition-colors duration-300 group-hover:bg-blue-50";

export const landingBtnPrimary =
  "btn-press inline-flex h-12 min-w-[9rem] items-center justify-center gap-2 rounded-pill bg-primary px-6 text-body font-semibold text-primary-foreground transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const landingBtnSecondary =
  "btn-press inline-flex h-12 min-w-[9rem] items-center justify-center gap-2 rounded-pill border border-primary bg-transparent px-6 text-body font-semibold text-primary transition-colors duration-300 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const landingBtnGhost =
  "btn-press inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-border bg-background px-6 text-body font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const landingProse =
  "max-w-prose text-base leading-relaxed text-apple-ink-muted-80 sm:text-[17px] sm:leading-[1.6]";

export const landingPreviewShadow =
  "shadow-[0_32px_96px_-40px_rgba(0,0,0,0.45)]";

export const easeApple = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeApple },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeApple },
  },
};

export function LandingReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: easeApple }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingCtaGroup({
  primary,
  secondary,
  primaryHref = "/register",
  secondaryHref = "#builder",
}: {
  primary: ReactNode;
  secondary: ReactNode;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Link href={primaryHref} className={landingBtnPrimary}>
        {primary}
      </Link>
      <Link href={secondaryHref} className={landingBtnSecondary}>
        {secondary}
      </Link>
    </div>
  );
}

/** Highlights the nav link whose section is in view */
export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.15, 0.35] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}

export function navLinkClass(isActive: boolean, onDark = false) {
  return cn(
    "rounded-sm px-1 py-0.5 text-nav-link transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    onDark
      ? isActive
        ? "text-apple-body-on-dark"
        : "text-apple-body-on-dark/70 hover:text-apple-body-on-dark"
      : isActive
        ? "font-semibold text-apple-primary"
        : "text-apple-ink-muted-80 hover:text-apple-ink",
    onDark
      ? "focus-visible:outline-white/80"
      : "focus-visible:outline-apple-primary",
  );
}
