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

function animationStyle(animation: string, duration = "600", delay = "0", _trigger = "on-scroll") {
  const dur = Number(duration) / 1000;
  const del = Number(delay) / 1000;
  const base = { transition: { duration: dur, delay: del } };
  const vpOnce = { viewport: { once: true } };
  switch (animation) {
    case "fade-in": case "fadeIn": return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, ...base, ...vpOnce };
    case "fade-up": return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, ...base, ...vpOnce };
    case "fade-down": return { initial: { opacity: 0, y: -30 }, whileInView: { opacity: 1, y: 0 }, ...base, ...vpOnce };
    case "slide-up": case "slideUp": return { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 }, ...base, ...vpOnce };
    case "slide-down": return { initial: { opacity: 0, y: -50 }, whileInView: { opacity: 1, y: 0 }, ...base, ...vpOnce };
    case "slide-left": case "slideInLeft": return { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, ...base, ...vpOnce };
    case "slide-right": case "slideInRight": return { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 }, ...base, ...vpOnce };
    case "zoom-in": case "zoomIn": return { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, ...base, ...vpOnce };
    case "zoom-out": return { initial: { opacity: 0, scale: 1.1 }, whileInView: { opacity: 1, scale: 1 }, ...base, ...vpOnce };
    case "flip": return { initial: { opacity: 0, rotateX: -90 }, whileInView: { opacity: 1, rotateX: 0 }, ...base, ...vpOnce };
    case "bounce": return { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, ...vpOnce, transition: { duration: dur, delay: del, type: "spring" as const, stiffness: 200, damping: 12 } };
    default: return {};
  }
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];

function isImageUrl(url: string) {
  return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext)) || url.includes("media") || url.includes("cloudinary") || url.includes("amazonaws");
}

export function SectionWrapper({ section, children, className = "" }: WrapperProps) {
  const device = useDevice();
  const p = section.props;
  const s = section.style;

  const responsiveStyle = computeSectionStyle(s, device);
  const computedVisibility = applyResponsiveVisibility({}, s, device);
  const isHidden = computedVisibility.display === "none";

  const visibility = s?.hideOnDesktop ? "desktop-only"
    : s?.hideOnTablet ? "tablet-only"
    : s?.hideOnMobile ? "mobile-only"
    : p.visibility || "all";

  const bgColor = s?.backgroundColor || p.bgColor || "";
  const bgGradient = s?.backgroundGradient || p.bgGradient || "";
  const bgImage = s?.backgroundImage || p.bgImage || "";
  const bgSize = s?.backgroundSize || p.backgroundSize || "cover";
  const bgPos = s?.backgroundPosition || p.backgroundPosition || "center";
  const bgRepeat = s?.backgroundRepeat || p.backgroundRepeat || "no-repeat";
  const bgAttachment = s?.backgroundAttachment || p.backgroundAttachment || "scroll";
  const overlayColor = s?.overlayColor || p.bgOverlayColor || "";
  const overlayOpacity = s?.overlayOpacity || p.bgOverlayOpacity || "";
  const blurAmt = s?.blur || p.blur || "";
  const backdropBlur = s?.backdropBlur || "";

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
  const height = responsiveStyle.height || s?.height || p.height || "";
  const minHeight = responsiveStyle.minHeight || s?.minHeight || p.minHeight || "";
  const animation = s?.animation || p.animation || "none";
  const animDuration = s?.animationDuration || "600";
  const animDelay = s?.animationDelay || "0";
  const animTrigger = s?.animationTrigger || "on-scroll";
  const parallaxSpeed = s?.parallaxSpeed || "0";

  const hasBgImage = bgImage && isImageUrl(bgImage);
  const isGradient = bgGradient && bgGradient.trim().length > 0 && bgGradient !== "none";

  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "";
  const hiddenClass = isHidden ? "hidden" : visibility === "desktop-only" ? "hidden lg:block" : visibility === "tablet-only" ? "hidden md:block lg:hidden" : visibility === "mobile-only" ? "block md:hidden" : "";

  const animProps = animationStyle(animation, animDuration, animDelay, animTrigger);

  const finalBg = isGradient
    ? bgGradient
    : bgColor || "transparent";

  const bgStyle: React.CSSProperties = {};
  if (hasBgImage) {
    bgStyle.backgroundImage = `url(${bgImage})`;
    bgStyle.backgroundSize = bgSize;
    bgStyle.backgroundPosition = bgPos;
    bgStyle.backgroundRepeat = bgRepeat;
    bgStyle.backgroundAttachment = bgAttachment;
  }

  const parallaxStyle: React.CSSProperties = {};
  if (Number(parallaxSpeed) !== 0 && hasBgImage) {
    parallaxStyle.backgroundAttachment = "fixed";
    parallaxStyle.backgroundPosition = bgPos;
  }

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
        background: hasBgImage || isGradient ? finalBg : finalBg,
        borderRadius,
        borderWidth: borderWidth ? `${Number(borderWidth) > 0 ? borderWidth + "px" : "0"}` : undefined,
        borderStyle,
        borderColor: borderColor || undefined,
        opacity: opacity ? String(Number(opacity) / 100) : undefined,
        width: width || undefined,
        height: height || undefined,
        minHeight: minHeight || undefined,
        overflow: "hidden",
        position: (s?.position || "relative") as React.CSSProperties["position"],
        zIndex: s?.zIndex ? Number(s.zIndex) : undefined,
        transform: s?.transform,
        transformOrigin: s?.transformOrigin,
        ...responsiveStyle,
      }}
      {...animProps}
    >
      {/* Background image layer */}
      {(hasBgImage) && (
        <div
          className="absolute inset-0"
          style={{
            ...bgStyle,
            ...parallaxStyle,
            zIndex: 0,
            filter: blurAmt ? `blur(${blurAmt}px)` : undefined,
          }}
        />
      )}

      {/* Overlay */}
      {overlayColor && (
        <div
          className="absolute inset-0"
          style={{
            background: overlayColor,
            opacity: Number(overlayOpacity || 40) / 100,
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
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
        <span className="text-2xl text-apple-ink-muted-48">⊞</span>
      </div>
      <h3 className="text-lg font-semibold text-apple-ink-muted-80">{def?.label || section.type}</h3>
      <p className="mt-1 text-sm text-apple-ink-muted-48">{def?.description || "Section placeholder"}</p>
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
