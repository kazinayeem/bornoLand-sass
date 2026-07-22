import type { Breakpoint } from "@/lib/builder-types";
import type { HeaderSettings } from "@/redux/api/store-page-api";

export type HeaderPosition = "static" | "sticky" | "fixed";

export type ResolvedHeaderConfig = {
  position: HeaderPosition;
  height: number;
  padding: string;
  containerWidth: string;
  menuGap: number;
  navFontSize: number;
  iconSize: number;
  logoWidth: number;
  logoHeight: number;
  storeNameFontSize: number;
  logoTextGap: number;
  background: string;
  textColor: string;
  hoverColor: string;
  borderColor: string;
  shadow: string;
  buttonRadius: string;
  transparent: boolean;
  blurBackground: boolean;
  shadowOnScroll: boolean;
  borderBottom: boolean;
  autoHideOnScroll: boolean;
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showProfile: boolean;
};

const DEFAULTS = {
  desktop: {
    height: 80,
    iconSize: 24,
    navFontSize: 16,
    menuGap: 32,
    logoWidth: 40,
    logoHeight: 40,
    storeNameFontSize: 18,
    logoTextGap: 10,
    padding: "0 32px",
    containerWidth: "1440px",
  },
  tablet: {
    height: 72,
    iconSize: 22,
    navFontSize: 15,
    menuGap: 24,
    logoWidth: 36,
    logoHeight: 36,
    storeNameFontSize: 17,
    logoTextGap: 8,
    padding: "0 24px",
    containerWidth: "100%",
  },
  mobile: {
    height: 64,
    iconSize: 20,
    navFontSize: 15,
    menuGap: 16,
    logoWidth: 32,
    logoHeight: 32,
    storeNameFontSize: 16,
    logoTextGap: 8,
    padding: "0 16px",
    containerWidth: "100%",
  },
} as const;

function parsePx(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number(String(value).replace(/px$/i, "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function pickResponsive(
  device: Breakpoint,
  desktop: string | number | undefined,
  tablet: string | number | undefined,
  mobile: string | number | undefined,
  fallback: number,
): number {
  if (device === "mobile" && mobile != null && mobile !== "") return parsePx(mobile, fallback);
  if (device === "tablet" && tablet != null && tablet !== "") return parsePx(tablet, fallback);
  if (desktop != null && desktop !== "") return parsePx(desktop, fallback);
  if (device === "tablet" && tablet != null && tablet !== "") return parsePx(tablet, fallback);
  if (device === "mobile" && mobile != null && mobile !== "") return parsePx(mobile, fallback);
  return fallback;
}

function pickString(
  device: Breakpoint,
  desktop?: string,
  tablet?: string,
  mobile?: string,
  fallback = "",
): string {
  if (device === "mobile" && mobile) return mobile;
  if (device === "tablet" && tablet) return tablet;
  return desktop || tablet || mobile || fallback;
}

function resolvePosition(
  settings: HeaderSettings | Record<string, unknown> | undefined,
  sectionProps?: Record<string, string>,
  navbarStyle?: string,
): HeaderPosition {
  const position = (settings as HeaderSettings | undefined)?.position
    ?? (sectionProps?.position as HeaderPosition | undefined);

  if (position === "static" || position === "sticky" || position === "fixed") {
    return position;
  }

  const legacySticky = (settings as HeaderSettings | undefined)?.sticky
    ?? sectionProps?.sticky === "true";

  if (legacySticky === false) return "static";
  if (navbarStyle === "static") return "static";
  return "sticky";
}

/** Merge global headerSettings, section props, and theme defaults into one config. */
export function resolveHeaderConfig(
  settings: HeaderSettings | Record<string, unknown> | undefined,
  device: Breakpoint,
  options?: {
    sectionProps?: Record<string, string>;
    navbarStyle?: string;
  },
): ResolvedHeaderConfig {
  const hs = (settings ?? {}) as HeaderSettings & Record<string, unknown>;
  const p = options?.sectionProps ?? {};
  const bucket = device === "mobile" ? DEFAULTS.mobile : device === "tablet" ? DEFAULTS.tablet : DEFAULTS.desktop;

  const height = pickResponsive(
    device,
    hs.height ?? p.headerHeight ?? p.height,
    hs.tabletHeight ?? p.tabletHeaderHeight,
    hs.mobileHeight ?? p.mobileHeaderHeight,
    bucket.height,
  );

  return {
    position: resolvePosition(hs, p, options?.navbarStyle),
    height,
    padding: pickString(
      device,
      hs.padding ?? p.padding,
      hs.tabletPadding ?? p.tabletPadding,
      hs.mobilePadding ?? p.mobilePadding,
      bucket.padding,
    ),
    containerWidth: pickString(
      device,
      hs.containerWidth ?? p.containerWidth,
      hs.tabletContainerWidth ?? p.tabletContainerWidth,
      hs.mobileContainerWidth ?? p.mobileContainerWidth,
      bucket.containerWidth,
    ),
    menuGap: pickResponsive(
      device,
      hs.menuGap ?? p.menuGap,
      hs.tabletMenuGap ?? p.tabletMenuGap,
      hs.mobileMenuGap ?? p.mobileMenuGap,
      bucket.menuGap,
    ),
    navFontSize: pickResponsive(
      device,
      hs.navFontSize ?? p.navFontSize,
      hs.tabletNavFontSize ?? p.tabletNavFontSize,
      hs.mobileNavFontSize ?? p.mobileNavFontSize,
      bucket.navFontSize,
    ),
    iconSize: pickResponsive(
      device,
      hs.iconSize ?? p.iconSize,
      hs.tabletIconSize ?? p.tabletIconSize,
      hs.mobileIconSize ?? p.mobileIconSize,
      bucket.iconSize,
    ),
    logoWidth: pickResponsive(
      device,
      hs.logoWidth ?? p.logoWidth,
      hs.tabletLogoWidth ?? p.tabletLogoWidth,
      hs.mobileLogoWidth ?? p.mobileLogoWidth,
      bucket.logoWidth,
    ),
    logoHeight: pickResponsive(
      device,
      hs.logoHeight ?? p.logoHeight,
      hs.tabletLogoHeight ?? p.tabletLogoHeight,
      hs.mobileLogoHeight ?? p.mobileLogoHeight,
      bucket.logoHeight,
    ),
    storeNameFontSize: pickResponsive(
      device,
      hs.storeNameFontSize ?? p.storeNameFontSize,
      hs.tabletStoreNameFontSize ?? p.tabletStoreNameFontSize,
      hs.mobileStoreNameFontSize ?? p.mobileStoreNameFontSize,
      bucket.storeNameFontSize,
    ),
    logoTextGap: pickResponsive(
      device,
      hs.logoTextGap ?? p.logoTextGap,
      hs.tabletLogoTextGap ?? p.tabletLogoTextGap,
      hs.mobileLogoTextGap ?? p.mobileLogoTextGap,
      bucket.logoTextGap,
    ),
    background: String(hs.background ?? p.headerBg ?? ""),
    textColor: String(hs.textColor ?? p.textColor ?? ""),
    hoverColor: String(hs.hoverColor ?? p.hoverColor ?? ""),
    borderColor: String(hs.borderColor ?? p.borderColor ?? ""),
    shadow: String(hs.shadow ?? p.shadow ?? "none"),
    buttonRadius: String(hs.buttonRadius ?? p.buttonRadius ?? "999px"),
    transparent: Boolean(hs.transparent ?? p.transparent === "true"),
    blurBackground: Boolean(hs.blurBackground ?? p.blurBackground === "true"),
    shadowOnScroll: hs.shadowOnScroll !== false && p.shadowOnScroll !== "false",
    borderBottom: Boolean(hs.borderBottom ?? p.borderBottom === "true"),
    autoHideOnScroll: Boolean(hs.autoHideOnScroll ?? p.autoHideOnScroll === "true"),
    showSearch: hs.showSearch !== false && p.showSearch !== "false",
    showWishlist: hs.showWishlist !== false && p.showWishlist !== "false",
    showCart: hs.showCart !== false && p.showCart !== "false",
    showProfile: hs.showProfile !== false && p.showAccount !== "false" && p.showProfile !== "false",
  };
}

export function headerShadowClass(shadow: string, scrolled: boolean, shadowOnScroll: boolean): string {
  if (!scrolled && shadowOnScroll) return "";
  if (shadow === "sm") return "shadow-sm";
  if (shadow === "md") return "shadow-md";
  if (shadow === "lg") return "shadow-lg";
  return scrolled && shadowOnScroll ? "shadow-md" : "";
}
