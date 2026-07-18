"use client";

import { getSectionComponent } from "./section-component-registry";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { motion } from "framer-motion";
import type { SectionStyle } from "@/components/storefront/storefront-types";
import { useDevice } from "@/lib/device-context";
import { computeSectionStyle, applyResponsiveVisibility } from "@/lib/responsive-styles";
import type { Breakpoint } from "@/lib/builder-types";

export type SectionData = {
  id: string;
  type: string;
  label?: string;
  visible?: boolean;
  props: Record<string, string>;
  style?: SectionStyle;
};

// ─── Section wrapper (common styles) ────────────────────────────

type WrapperProps = {
  section: SectionData;
  children: React.ReactNode;
  className?: string;
};

function animationStyle(animation: string) {
  switch (animation) {
    case "fadeIn": return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideUp": return { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideInLeft": return { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "slideInRight": return { initial: { opacity: 0, x: 40 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
    case "zoomIn": return { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
    default: return {};
  }
}

export function SectionWrapper({ section, children, className = "" }: WrapperProps) {
  const device = useDevice();
  const p = section.props;
  const s = section.style;

  // Compute responsive-aware style for the current device
  const responsiveStyle = computeSectionStyle(s, device);
  const computedVisibility = applyResponsiveVisibility({}, s, device);
  const isHidden = computedVisibility.display === "none";

  // Derived values: prefer section.style over section.props for backward compat
  const visibility = s?.hideOnDesktop ? "desktop-only"
    : s?.hideOnTablet ? "tablet-only"
    : s?.hideOnMobile ? "mobile-only"
    : p.visibility || "all";
  const bgColor = responsiveStyle.backgroundColor || s?.backgroundColor || p.bgColor || "";
  const bgGradient = s?.backgroundGradient || p.bgGradient || "";
  const bgImage = p.bgImage || "";
  const paddingTop = responsiveStyle.paddingTop ?? s?.paddingTop ?? p.paddingTop ?? "0";
  const paddingBottom = responsiveStyle.paddingBottom ?? s?.paddingBottom ?? p.paddingBottom ?? "0";
  const paddingLeft = responsiveStyle.paddingLeft ?? s?.paddingLeft ?? p.paddingLeft ?? "0";
  const paddingRight = responsiveStyle.paddingRight ?? s?.paddingRight ?? p.paddingRight ?? "0";
  const marginTop = responsiveStyle.marginTop ?? s?.marginTop ?? p.marginTop ?? "0";
  const marginBottom = responsiveStyle.marginBottom ?? s?.marginBottom ?? p.marginBottom ?? "0";
  const marginLeft = responsiveStyle.marginLeft ?? s?.marginLeft ?? "auto";
  const marginRight = responsiveStyle.marginRight ?? s?.marginRight ?? "auto";
  const maxWidth = responsiveStyle.maxWidth || s?.maxWidth || p.maxWidth || "1200px";
  const borderRadius = responsiveStyle.borderRadius ?? s?.borderRadius ?? p.borderRadius ?? "0";
  const shadow = s?.shadow || p.shadow || "none";
  const borderWidth = s?.borderWidth ?? p.borderWidth ?? "0";
  const borderColor = s?.borderColor || p.borderColor || "";
  const borderStyle = s?.borderStyle || (borderWidth !== "0" ? "solid" : undefined);
  const opacity = responsiveStyle.opacity !== undefined ? String(responsiveStyle.opacity) : s?.opacity || "";
  const width = responsiveStyle.width || s?.width || p.width || "";
  const minHeight = responsiveStyle.minHeight || s?.minHeight || p.minHeight || "";
  const animation = s?.animation || p.animation || "none";
  const customCss = s?.customCss || p.customCss || "";

  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "";
  const hiddenClass = isHidden ? "hidden" : visibility === "desktop-only" ? "hidden lg:block" : visibility === "tablet-only" ? "hidden md:block lg:hidden" : visibility === "mobile-only" ? "block md:hidden" : "";

  const bg = bgGradient
    ? `linear-gradient(135deg, ${bgGradient.split(",").map((s: string) => s.trim()).join(", ")})`
    : bgImage
    ? `url(${bgImage})`
    : bgColor || "transparent";
  const isImageBg = bgImage && !bgGradient && !bgColor;

  const animProps = animationStyle(animation);

  return (
    <motion.section
      className={`relative ${hiddenClass} ${shadowClass} ${className}`}
      style={{
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        maxWidth: maxWidth === "100%" ? "100%" : maxWidth,
        background: isImageBg ? undefined : bg,
        borderRadius,
        borderWidth,
        borderStyle,
        borderColor: borderColor || undefined,
        opacity: opacity || undefined,
        width: width || undefined,
        minHeight: minHeight || undefined,
        fontSize: responsiveStyle.fontSize,
        lineHeight: responsiveStyle.lineHeight,
        textAlign: responsiveStyle.textAlign,
        overflow: "hidden",
      }}
      {...animProps}
    >
      {isImageBg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: bg, zIndex: 0 }}
        />
      )}
      {p.bgOverlayColor && (
        <div
          className="absolute inset-0"
          style={{
            background: p.bgOverlayColor,
            opacity: Number(p.bgOverlayOpacity || 40) / 100,
            zIndex: 1,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </motion.section>
  );
}

// ─── Section title helper ───────────────────────────────────────

export function SectionTitle({ title, subtitle, textColor, textAlignment }: {
  title?: string;
  subtitle?: string;
  textColor?: string;
  textAlignment?: string;
}) {
  if (!title) return null;
  return (
    <div className={`mb-8 sm:mb-10 ${textAlignment === "left" ? "text-left" : textAlignment === "right" ? "text-right" : "text-center"}`}>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: textColor || "#18181b" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base" style={{ color: textColor ? `${textColor}cc` : "#52525b" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Column grid helper ──────────────────────────────────────────

export function ColumnGrid({ children, columns = "4", gap = "4", className = "" }: {
  children: React.ReactNode;
  columns?: string;
  gap?: string;
  className?: string;
}) {
  const colMap: Record<string, string> = {
    "2": "grid-cols-2", "3": "grid-cols-3", "4": "grid-cols-4",
    "5": "grid-cols-5", "6": "grid-cols-6",
  };
  const gapMap: Record<string, string> = {
    "4": "gap-1", "8": "gap-2", "16": "gap-4", "24": "gap-6", "32": "gap-8",
  };
  return (
    <div className={`grid ${colMap[columns] || "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"} ${gapMap[gap] || "gap-4"} ${className}`}>
      {children}
    </div>
  );
}

// ─── Lazy-loaded section components are now registered in section-component-registry.ts ──

// ─── Placeholder for unimplemented sections ──────────────────────

function PlaceholderSection({ section }: { section: SectionData }) {
  const def = getSectionDef(section.type);
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
        <span className="text-2xl text-zinc-400">⊞</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-700">{def?.label || section.type}</h3>
      <p className="mt-1 text-sm text-zinc-400">{def?.description || "Section placeholder"}</p>
    </div>
  );
}

// ─── Main renderer ──────────────────────────────────────────────

export function SectionRenderer({ section }: { section: SectionData }) {
  const normalizedType = normalizeSectionType(section.type);
  const normalizedSection = normalizedType === section.type ? section : { ...section, type: normalizedType };
  const def = getSectionDef(normalizedSection.type);
  if (!def) return null;

  const Component = getSectionComponent(normalizedSection.type);
  if (Component) return <Component section={normalizedSection} />;

  return <PlaceholderSection section={normalizedSection} />;
}
