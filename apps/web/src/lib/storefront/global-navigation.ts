/**
 * Single source of truth for storefront header navigation configuration.
 * Header templates are visual only — they all consume this normalized config.
 */

import { resolveMediaUrl } from "@/lib/resolve-media-url";

export type GlobalNavItemKind = "link" | "category" | "more";

export type GlobalNavItem = {
  id: string;
  label: string;
  href: string;
  kind: GlobalNavItemKind;
  highlight?: boolean;
  icon?: "offers" | "home" | "shop" | "track" | "pc-builder" | "sale";
};

export type NormalizedHeaderConfig = {
  enabled: boolean;
  templateId: string;
  position: "static" | "sticky" | "fixed";
  autoHideOnScroll: boolean;
  transparent: boolean;
  shadow: string;
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showProfile: boolean;
  showAnnouncement: boolean;
  announcementText: string;
  logoUrl: string;
  maxVisibleItems: number;
  showMoreMenu: boolean;
  enableCategoryHover: boolean;
  showAllCategoriesButton: boolean;
  showUtilityLinks: boolean;
  primaryLinks: GlobalNavItem[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
};

/** Canonical template IDs used by StorefrontHeaderRenderer */
export const HEADER_TEMPLATE_IDS = [
  "minimal-clean",
  "modern-ecommerce",
  "marketplace",
  "premium-luxury",
  "compact-professional",
  "fashion-boutique",
  "grocery-natural",
  "electronics-tech",
  "bold-promotional",
  "mobile-first",
] as const;

export type HeaderTemplateId = (typeof HEADER_TEMPLATE_IDS)[number];

const TEMPLATE_ALIASES: Record<string, HeaderTemplateId> = {
  "minimal-clean": "minimal-clean",
  minimal: "minimal-clean",
  "minimal-fashion": "minimal-clean",
  clean: "minimal-clean",
  "modern-ecommerce": "modern-ecommerce",
  ecommerce: "modern-ecommerce",
  marketplace: "marketplace",
  daraz: "marketplace",
  multivendor: "marketplace",
  "premium-luxury": "premium-luxury",
  premium: "premium-luxury",
  luxury: "premium-luxury",
  fashion: "fashion-boutique",
  "modern-general": "premium-luxury",
  "compact-professional": "compact-professional",
  compact: "compact-professional",
  professional: "compact-professional",
  "tech-mega": "compact-professional",
  electronics: "electronics-tech",
  computer: "electronics-tech",
  "fashion-boutique": "fashion-boutique",
  boutique: "fashion-boutique",
  "grocery-natural": "grocery-natural",
  grocery: "grocery-natural",
  organic: "grocery-natural",
  "electronics-tech": "electronics-tech",
  tech: "electronics-tech",
  "bold-promotional": "bold-promotional",
  promotional: "bold-promotional",
  deals: "bold-promotional",
  "mobile-first": "mobile-first",
  mobile: "mobile-first",
};

const FOOTER_ALIASES: Record<string, string> = {
  "classic-ecommerce": "classic-ecommerce",
  classic: "classic-ecommerce",
  grocery: "classic-ecommerce",
  organic: "classic-ecommerce",
  commerce: "classic-ecommerce",
  "modern-multi-column": "modern-multi-column",
  modern: "modern-multi-column",
  tech: "modern-multi-column",
  electronics: "modern-multi-column",
  "tech-electronics": "modern-multi-column",
  minimal: "minimal",
  "minimal-commerce": "minimal",
  simple: "minimal",
  marketplace: "marketplace",
  daraz: "marketplace",
  premium: "premium",
  "premium-luxury": "premium",
  "modern-store": "premium",
  luxury: "premium",
};

export type PrimaryNavDef = {
  id: string;
  href: string;
  translationKey: "home" | "shop" | "offers" | "contact" | "trackOrder" | "brands" | "bestSellers" | "newArrivals";
  icon?: GlobalNavItem["icon"];
  highlight?: boolean;
  /** Fallback English label when translation missing */
  fallbackLabel: string;
};

export const DEFAULT_PRIMARY_NAV_DEFS: PrimaryNavDef[] = [
  { id: "home", href: "/", translationKey: "home", icon: "home", fallbackLabel: "Home" },
  { id: "shop", href: "/shop", translationKey: "shop", icon: "shop", fallbackLabel: "Shop All" },
  { id: "offers", href: "/offers", translationKey: "offers", icon: "offers", highlight: true, fallbackLabel: "Offers" },
];

function asBool(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  return defaultValue;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function resolveHeaderTemplateId(
  settings: Record<string, unknown> | undefined | null,
  themeFallback: HeaderTemplateId = "modern-ecommerce",
): HeaderTemplateId {
  const raw =
    asString(settings?.template) ||
    asString(settings?.headerTemplate) ||
    asString(settings?.templateId) ||
    asString(settings?.layout);
  if (!raw) return themeFallback;
  return TEMPLATE_ALIASES[raw] || (HEADER_TEMPLATE_IDS.includes(raw as HeaderTemplateId) ? (raw as HeaderTemplateId) : themeFallback);
}

export function resolveFooterTemplateId(
  settings: Record<string, unknown> | undefined | null,
  themeFallback = "classic-ecommerce",
): string {
  const raw =
    asString(settings?.template) ||
    asString(settings?.footerTemplate) ||
    asString(settings?.templateId);
  if (!raw) return themeFallback;
  return FOOTER_ALIASES[raw] || raw || themeFallback;
}

export function isGlobalHeaderEnabled(settings: Record<string, unknown> | undefined | null): boolean {
  if (!settings || Object.keys(settings).length === 0) return true;
  if (settings.template === "none" || settings.template === null) return false;
  if (settings.templateId === null) return false;
  if (asBool(settings.enabled, true) === false) return false;
  if (asBool(settings.visible, true) === false) return false;
  if (asBool(settings.show, true) === false) return false;
  return true;
}

export function isGlobalFooterEnabled(settings: Record<string, unknown> | undefined | null): boolean {
  if (!settings || Object.keys(settings).length === 0) return true;
  if (settings.template === "none" || settings.template === null) return false;
  if (settings.templateId === null) return false;
  if (asBool(settings.enabled, true) === false) return false;
  if (asBool(settings.visible, true) === false) return false;
  if (asBool(settings.show, true) === false) return false;
  return true;
}

/** Resolved logo URL for header templates — headerSettings.logoUrl/logo, then store.logoUrl. */
export function resolveHeaderLogoUrl(
  headerSettings: Record<string, unknown> | undefined | null,
  store?: { logoUrl?: string | null } | null,
): string {
  const fromHeader = resolveMediaUrl(
    asString(headerSettings?.logoUrl || headerSettings?.logo),
  );
  if (fromHeader) return fromHeader;
  return resolveMediaUrl(store?.logoUrl) || "";
}

/**
 * Normalize raw headerSettings from API/Redux into a stable config.
 * Writing this shape back on template select keeps all alias fields in sync.
 */
export function normalizeHeaderSettings(
  raw: Record<string, unknown> | undefined | null,
  opts?: { themeId?: string; themeColors?: Partial<NormalizedHeaderConfig["colors"]> },
): NormalizedHeaderConfig {
  const settings = (raw ?? {}) as Record<string, unknown>;
  const themeFallback: HeaderTemplateId =
    opts?.themeId === "electronics"
      ? "electronics-tech"
      : opts?.themeId === "grocery"
        ? "grocery-natural"
        : "modern-ecommerce";
  const templateId = resolveHeaderTemplateId(settings, themeFallback);

  const maxVisibleItems = asNumber(
    settings.maxVisibleNavigationItems ?? settings.maxVisibleCategories ?? settings.maxVisibleItems,
    6,
  );

  let position: "static" | "sticky" | "fixed" = "sticky";
  if (settings.position === "static" || settings.position === "sticky" || settings.position === "fixed") {
    position = settings.position;
  } else if (settings.sticky === false || settings.sticky === "false") {
    position = "static";
  }

  return {
    enabled: isGlobalHeaderEnabled(settings),
    templateId,
    position,
    autoHideOnScroll: asBool(settings.autoHideOnScroll, false),
    transparent: asBool(settings.transparent, false),
    shadow: asString(settings.shadow, "none") || "none",
    showSearch: asBool(settings.showSearch, true),
    showWishlist: asBool(settings.showWishlist, true),
    showCart: asBool(settings.showCart, true),
    showProfile: asBool(settings.showProfile, true),
    showAnnouncement: asBool(settings.showAnnouncement, true),
    announcementText: asString(settings.announcementText),
    logoUrl: asString(settings.logoUrl || settings.logo),
    maxVisibleItems: Math.min(Math.max(maxVisibleItems, 1), 12),
    showMoreMenu: asBool(settings.showMoreMenu, true),
    enableCategoryHover: asBool(settings.enableCategoryHover, true),
    showAllCategoriesButton: asBool(settings.showAllCategoriesButton, true),
    showUtilityLinks: asBool(settings.showUtilityLinks, true),
    primaryLinks: [],
    colors: {
      primary: asString(settings.primaryColor || opts?.themeColors?.primary, "") || opts?.themeColors?.primary || "",
      secondary: asString(settings.secondaryColor || opts?.themeColors?.secondary, "") || opts?.themeColors?.secondary || "",
      accent: asString(settings.accentColor || opts?.themeColors?.accent, "") || opts?.themeColors?.accent || "",
      background: asString(settings.backgroundColor || settings.background || opts?.themeColors?.background, "") || "",
      text: asString(settings.textColor || opts?.themeColors?.text, "") || "",
    },
  };
}

/**
 * When selecting a template, merge visual template fields WITHOUT wiping navigation config.
 * Always write template + templateId + headerTemplate together for persistence parity.
 */
export function applyHeaderTemplateSelection(
  current: Record<string, unknown>,
  templateId: string,
): Record<string, unknown> {
  const resolved = resolveHeaderTemplateId({ template: templateId }, "modern-ecommerce");
  return {
    ...current,
    template: resolved,
    templateId: resolved,
    headerTemplate: resolved,
    enabled: true,
    visible: true,
    // Preserve navigation limits
    maxVisibleCategories:
      current.maxVisibleCategories ?? current.maxVisibleNavigationItems ?? current.maxVisibleItems ?? 6,
    maxVisibleNavigationItems:
      current.maxVisibleNavigationItems ?? current.maxVisibleCategories ?? current.maxVisibleItems ?? 6,
    showMoreMenu: current.showMoreMenu !== false,
    enableCategoryHover: current.enableCategoryHover !== false,
  };
}

export function applyFooterTemplateSelection(
  current: Record<string, unknown>,
  templateId: string,
): Record<string, unknown> {
  const resolved = resolveFooterTemplateId({ template: templateId }, "classic-ecommerce");
  return {
    ...current,
    template: resolved,
    templateId: resolved,
    footerTemplate: resolved,
    enabled: true,
    visible: true,
  };
}

/** Normalize parentId from flat category API rows — roots only when parentId is null. */
export function normalizeCategoryParentId(parentId: unknown): string | null {
  if (parentId == null || parentId === "null" || parentId === "root" || parentId === "") {
    return null;
  }
  return String(parentId);
}

export function partitionCategories<T extends { _id: string; parentId?: string | null }>(
  categories: T[],
  maxVisible: number,
): { roots: T[]; visible: T[]; remaining: T[]; byParent: Record<string, T[]> } {
  const roots: T[] = [];
  const byParent: Record<string, T[]> = {};

  categories.forEach((cat) => {
    const parentKey = normalizeCategoryParentId((cat as { parentId?: string | null }).parentId);
    if (parentKey === null) {
      roots.push(cat);
    } else {
      if (!byParent[parentKey]) byParent[parentKey] = [];
      byParent[parentKey].push(cat);
    }
  });

  const limit = Math.max(1, maxVisible);
  return {
    roots,
    visible: roots.slice(0, limit),
    remaining: roots.slice(limit),
    byParent,
  };
}
