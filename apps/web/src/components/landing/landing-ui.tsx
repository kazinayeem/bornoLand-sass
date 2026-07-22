"use client";

import { type ReactNode, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Landing layout system
 * Breakpoints (Tailwind defaults):
 *  - Mobile: <640 (default)
 *  - Large mobile / sm: 640+
 *  - Tablet / md: 768+
 *  - Laptop / lg: 1024+
 *  - Desktop / xl: 1280+
 */
export const landingContainer =
  "mx-auto w-full max-w-7xl px-4 min-[390px]:px-5 sm:px-6 md:px-8 lg:px-8 xl:px-10";

export const landingSection =
  "relative scroll-mt-28 py-12 min-[390px]:py-14 sm:py-16 md:py-20 lg:py-24";

export const landingSectionAlt = `${landingSection} bg-apple-canvas-parchment`;

/** Card grids: 1 → 2 (sm) → 3/4 (lg+) — never ultra-narrow cards */
export const landingGridFeatures =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5";

export const landingGridStats =
  "grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4 md:gap-8";

export const landingGridManagement =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5";

export const landingGridTestimonials =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

export const landingGridPricing =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const landingGridFooter =
  "grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:gap-8 sm:text-left lg:grid-cols-6 lg:gap-8";

export const landingCard =
  "flex h-full min-w-0 flex-col rounded-lg border border-apple-hairline bg-apple-canvas p-5 sm:p-6";

export const landingCardHover =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,0.22)] motion-reduce:hover:translate-y-0";

export const landingIconWrap =
  "mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-canvas-parchment transition-colors duration-300 group-hover:bg-blue-50";

export const landingBtnPrimary =
  "btn-press inline-flex h-12 min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-pill bg-primary px-6 text-body font-semibold text-primary-foreground transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:min-w-[9rem]";

export const landingBtnSecondary =
  "btn-press inline-flex h-12 min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-pill border border-primary bg-transparent px-6 text-body font-semibold text-primary transition-colors duration-300 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:min-w-[9rem]";

export const landingBtnGhost =
  "btn-press inline-flex h-12 min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-pill border border-border bg-background px-6 text-body font-semibold text-foreground transition-colors duration-300 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto";

export const landingProse =
  "max-w-prose text-[15px] leading-relaxed text-apple-ink-muted-80 sm:text-base sm:leading-relaxed md:text-[17px] md:leading-[1.6]";

export const landingPreviewShadow =
  "shadow-[0_24px_72px_-36px_rgba(0,0,0,0.4)] sm:shadow-[0_32px_96px_-40px_rgba(0,0,0,0.45)]";

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
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
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
    "rounded-sm px-2 py-1.5 text-nav-link transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:px-2.5",
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
