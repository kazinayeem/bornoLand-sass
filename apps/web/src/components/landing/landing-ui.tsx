"use client";

import { type ReactNode, useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const landingContainer =
  "mx-auto w-full max-w-7xl px-4 min-[390px]:px-5 sm:px-6 md:px-8 lg:px-8 xl:px-10";

export const landingSection =
  "relative scroll-mt-28 py-12 min-[390px]:py-14 sm:py-16 md:py-20 lg:py-24";

export const landingSectionAlt = `${landingSection} bg-muted/40`;

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
  "flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md";

export const landingCardHover =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:hover:translate-y-0";

export const landingIconWrap =
  "mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground";

export const landingBtnPrimary =
  "inline-flex h-11 min-h-[44px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.18)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_6px_16px_rgba(37,99,235,0.24)] hover:-translate-y-0.5 active:bg-blue-800 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:w-auto sm:min-w-[9rem]";

export const landingBtnSecondary =
  "inline-flex h-11 min-h-[44px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 shadow-2xs transition-all duration-200 hover:bg-slate-50 hover:border-zinc-400 hover:-translate-y-0.5 active:bg-zinc-100 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:w-auto sm:min-w-[9rem]";

export const landingBtnGhost =
  "inline-flex h-11 min-h-[44px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-transparent px-5 text-sm font-semibold text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:w-auto";


export const landingProse =
  "max-w-prose text-[15px] leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed md:text-[17px] md:leading-[1.6]";

export const landingPreviewShadow =
  "shadow-2xl rounded-2xl border border-border";

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
    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    onDark
      ? isActive
        ? "bg-white/10 text-white font-semibold"
        : "text-white/80 hover:text-white hover:bg-white/5"
      : isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  );
}
