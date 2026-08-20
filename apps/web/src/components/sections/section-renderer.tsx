"use client";

import { getSectionComponent } from "./section-component-registry";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { motion } from "framer-motion";
import type { SectionStyle } from "@/components/storefront/storefront-types";
import { useDevice } from "@/lib/device-context";
import { computeSectionStyle, applyResponsiveVisibility } from "@/lib/responsive-styles";
import { sectionColumnGridClass } from "@/lib/storefront/responsive-grid";
import { normalizeCssLength } from "@/lib/section-style";
import {
  isValidBackgroundImage,
  resolveBackgroundColor,
  resolveBackgroundGradient,
  resolveBackgroundImage,
  resolveOpacity,
  resolveSectionCssVars,
  resolveTextAlignment,
  resolveTextColor,
} from "@/lib/resolve-section-visuals";
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
  /** Allow sticky/fixed headers without clipping (default: false). */
  allowSticky?: boolean;
  /** Skip section padding/margin/maxWidth so child controls layout (e.g. header-bar). */
  bare?: boolean;
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

export function SectionWrapper({ section, children, className = "", allowSticky = false, bare = false }: WrapperProps) {
  const device = useDevice();
  const p = section.props;
  const s = section.style;

  const responsiveStyle = computeSectionStyle(s, device);
  const computedVisibility = applyResponsiveVisibility({}, s, device);
  const isHidden = computedVisibility.display === "none";

  const propVisibility = p.visibility || "all";
  const hiddenClass = isHidden
    ? "hidden"
    : propVisibility === "desktop-only"
      ? "hidden lg:block"
      : propVisibility === "tablet-only"
        ? "hidden md:block lg:hidden"
        : propVisibility === "mobile-only"
          ? "block md:hidden"
          : "";

  const bgColor = resolveBackgroundColor(section);
  const bgGradient = resolveBackgroundGradient(section);
  const bgImage = resolveBackgroundImage(section, device);
  const bgSize = s?.backgroundSize || p.backgroundSize || "cover";
  const bgPos = s?.backgroundPosition || p.backgroundPosition || "center";
  const bgRepeat = s?.backgroundRepeat || p.backgroundRepeat || "no-repeat";
  const bgAttachment = s?.backgroundAttachment || p.backgroundAttachment || "scroll";
  const overlayColor = s?.overlayColor || p.bgOverlayColor || "";
  const overlayOpacity = s?.overlayOpacity || p.bgOverlayOpacity || "";
  const blurAmt = s?.blur || p.blur || "";
  const backdropBlur = s?.backdropBlur || "";

  const paddingTop = bare ? "0" : normalizeCssLength(responsiveStyle.paddingTop ?? s?.paddingTop ?? p.paddingTop ?? "0");
  const paddingBottom = bare ? "0" : normalizeCssLength(responsiveStyle.paddingBottom ?? s?.paddingBottom ?? p.paddingBottom ?? "0");
  const paddingLeft = bare ? "0" : normalizeCssLength(responsiveStyle.paddingLeft ?? s?.paddingLeft ?? p.paddingLeft ?? "0");
  const paddingRight = bare ? "0" : normalizeCssLength(responsiveStyle.paddingRight ?? s?.paddingRight ?? p.paddingRight ?? "0");
  const marginTop = bare ? "0" : normalizeCssLength(responsiveStyle.marginTop ?? s?.marginTop ?? p.marginTop ?? "0");
  const marginBottom = bare ? "0" : normalizeCssLength(responsiveStyle.marginBottom ?? s?.marginBottom ?? p.marginBottom ?? "0");
  const marginLeft = bare ? "0" : normalizeCssLength(responsiveStyle.marginLeft ?? s?.marginLeft ?? "auto");
  const marginRight = bare ? "0" : normalizeCssLength(responsiveStyle.marginRight ?? s?.marginRight ?? "auto");
  const maxWidth = bare ? "100%" : (responsiveStyle.maxWidth || normalizeCssLength(s?.maxWidth || p.maxWidth || "1200px"));
  const borderRadius = bare ? "0" : normalizeCssLength(responsiveStyle.borderRadius ?? s?.borderRadius ?? p.borderRadius ?? "0");
  const shadow = bare ? "none" : (s?.shadow || p.shadow || "none");
  const borderWidth = normalizeCssLength(s?.borderWidth ?? p.borderWidth ?? "0");
  const borderColor = responsiveStyle.borderColor || s?.borderColor || p.borderColor || "";
  const borderStyle = s?.borderStyle || (borderWidth && borderWidth !== "0" ? "solid" : undefined);
  const opacity = responsiveStyle.opacity !== undefined ? responsiveStyle.opacity : resolveOpacity(section);
  const width = responsiveStyle.width || normalizeCssLength(s?.width || p.width || "");
  const height = responsiveStyle.height || normalizeCssLength(s?.height || p.height || "");
  const minHeight = responsiveStyle.minHeight || normalizeCssLength(s?.minHeight || p.minHeight || "");
  const animation = s?.animation || p.animation || "none";
  const animDuration = s?.animationDuration || "600";
  const animDelay = s?.animationDelay || "0";
  const animTrigger = s?.animationTrigger || "on-scroll";
  const parallaxSpeed = s?.parallaxSpeed || "0";

  const hasBgImage = isValidBackgroundImage(bgImage);
  const isGradient = bgGradient && bgGradient.trim().length > 0 && bgGradient !== "none";

  const shadowClass = shadow === "sm" ? "shadow-sm" : shadow === "md" ? "shadow-md" : shadow === "lg" ? "shadow-lg" : "";
  const customBoxShadow = shadow && !["none", "sm", "md", "lg"].includes(shadow) ? shadow : responsiveStyle.boxShadow;

  const animProps = animationStyle(animation, animDuration, animDelay, animTrigger);

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

  const wrapperStyle: React.CSSProperties = {
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    maxWidth: maxWidth === "100%" ? "100%" : maxWidth,
    backgroundColor: bare ? undefined : (!hasBgImage && !isGradient ? (bgColor || undefined) : undefined),
    background: bare ? undefined : (isGradient ? bgGradient : undefined),
    borderRadius,
    borderWidth: borderWidth && borderWidth !== "0" ? borderWidth : undefined,
    borderStyle,
    borderColor: borderColor || undefined,
    opacity,
    width: width || undefined,
    height: height || undefined,
    minHeight: minHeight || undefined,
    boxShadow: customBoxShadow,
    position: (responsiveStyle.position || s?.position || "relative") as React.CSSProperties["position"],
    zIndex: responsiveStyle.zIndex ?? (s?.zIndex ? Number(s.zIndex) : undefined),
    transform: responsiveStyle.transform ?? s?.transform,
    transformOrigin: responsiveStyle.transformOrigin ?? s?.transformOrigin,
    display: responsiveStyle.display,
    flexDirection: responsiveStyle.flexDirection,
    alignItems: responsiveStyle.alignItems,
    justifyContent: responsiveStyle.justifyContent,
    flexWrap: responsiveStyle.flexWrap,
    gap: responsiveStyle.gap,
    color: responsiveStyle.color,
    fontFamily: responsiveStyle.fontFamily,
    fontSize: responsiveStyle.fontSize,
    fontWeight: responsiveStyle.fontWeight,
    letterSpacing: responsiveStyle.letterSpacing,
    textTransform: responsiveStyle.textTransform,
    textDecoration: responsiveStyle.textDecoration,
    textAlign: responsiveStyle.textAlign,
    lineHeight: responsiveStyle.lineHeight,
    backdropFilter: responsiveStyle.backdropFilter,
    overflow: allowSticky ? "visible" : "hidden",
  };

  const cssVars = resolveSectionCssVars(section);
  const contentTypography: React.CSSProperties = {
    ...cssVars,
    color: responsiveStyle.color ?? cssVars.color,
    fontFamily: responsiveStyle.fontFamily ?? cssVars.fontFamily,
    fontSize: responsiveStyle.fontSize ?? cssVars.fontSize,
    fontWeight: responsiveStyle.fontWeight ?? cssVars.fontWeight,
    letterSpacing: responsiveStyle.letterSpacing ?? cssVars.letterSpacing,
    textTransform: responsiveStyle.textTransform ?? cssVars.textTransform,
    textDecoration: responsiveStyle.textDecoration,
    textAlign: (responsiveStyle.textAlign ?? cssVars.textAlign) as React.CSSProperties["textAlign"],
    lineHeight: responsiveStyle.lineHeight,
  };

  const customCss = s?.customCss?.trim();

  return (
    <motion.section
      data-section-id={section.id}
      className={`relative ${hiddenClass} ${shadowClass} ${className}`}
      style={wrapperStyle}
      {...animProps}
    >
      {customCss ? (
        <style>{`[data-section-id="${section.id}"] { ${customCss} }`}</style>
      ) : null}
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
      <div
        className="relative"
        style={bare ? { zIndex: 2 } : { zIndex: 2, ...contentTypography }}
      >
        {children}
      </div>
    </motion.section>
  );
}

// ─── Section title helper ───────────────────────────────────────

export function SectionTitle({
  title,
  subtitle,
  textColor,
  textAlignment,
  section,
}: {
  title?: string;
  subtitle?: string;
  textColor?: string;
  textAlignment?: string;
  section?: SectionData;
}) {
  if (!title) return null;
  const resolvedColor = section ? resolveTextColor(section, textColor) : textColor;
  const resolvedAlign = section ? resolveTextAlignment(section) ?? textAlignment : textAlignment;
  const alignClass = resolvedAlign === "left" ? "text-left" : resolvedAlign === "right" ? "text-right" : "text-center";

  return (
    <div className={`mb-8 sm:mb-12 ${alignClass}`}>
      <h2
        className="font-extrabold tracking-tight leading-tight"
        style={{
          color: resolvedColor || "var(--section-text-color, #0f172a)",
          fontFamily: "var(--section-font-family, inherit)",
          fontSize: "var(--section-font-size, clamp(1.75rem, 3.5vw, 2.5rem))",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2.5 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl ${textAlignment === "center" ? "mx-auto" : textAlignment === "right" ? "ml-auto" : ""}`}
          style={{ color: resolvedColor ? `${resolvedColor}cc` : "var(--section-text-color, #64748b)" }}
        >
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
  const { grid, gap: gapClass } = sectionColumnGridClass(columns, gap);
  return (
    <div className={`grid ${grid} ${gapClass} ${className}`}>
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
  const def = getSectionDef(section.type);
  if (!def) return null;

  const Component = getSectionComponent(section.type) ?? getSectionComponent(normalizedType);
  const renderSection = normalizedType === section.type ? section : { ...section, type: normalizedType };
  if (Component) return <Component section={renderSection} />;

  return <PlaceholderSection section={section} />;
}
