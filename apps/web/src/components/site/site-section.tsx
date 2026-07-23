"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { landingContainer, landingSection } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

type SiteSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  align?: "center" | "left";
  alt?: boolean;
};

export function SiteSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
  align = "center",
  alt = false,
}: SiteSectionProps) {
  return (
    <section
      id={id}
      className={cn(landingSection, alt && "bg-muted/40", className)}
    >
      <div className={cn(landingContainer, containerClassName)}>
        {(eyebrow || title || description) && (
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className={cn(
              "mb-10 max-w-3xl sm:mb-12",
              align === "center" ? "mx-auto text-center" : "text-left",
            )}
          >
            {eyebrow ? (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg",
                  align === "center" && "mx-auto max-w-2xl",
                )}
              >
                {description}
              </p>
            ) : null}
          </motion.header>
        )}
        {children}
      </div>
    </section>
  );
}
