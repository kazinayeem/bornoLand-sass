import type { ReactNode } from "react";
import type { BuilderSection } from "@/redux/slices/builder-slice";

export type ThemeCategory = "grocery" | "electronics" | "fashion" | "general" | "restaurant" | "beauty";

export type ProductCardVariant = "default" | "grocery" | "electronics" | "minimal" | "bordered" | "elevated";
export type CategoryCardVariant = "default" | "grocery-pill" | "electronics-tile" | "card" | "circle";

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentHover?: string;
    badgeBg?: string;
    badgeText?: string;
    headerBg?: string;
    headerText?: string;
    footerBg?: string;
    footerText?: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
    bodyFont?: string;
    headingWeight?: string;
    baseFontSize?: string;
  };
  layout: {
    containerWidth: string;
    borderRadius: number;
    shadowSize: "none" | "sm" | "md" | "lg";
    spacing: number;
    gridGap?: string;
  };
  cards: {
    productCardStyle: ProductCardVariant;
    categoryCardStyle: CategoryCardVariant;
    showBadges: boolean;
    showRatings: boolean;
    showAddToCart: boolean;
    showWishlist: boolean;
    showQuickView: boolean;
  };
}

export interface HeaderConfig {
  layout: "standard" | "mega" | "grocery" | "electronics" | "minimal" | "centered";
  showAnnouncement: boolean;
  announcementText?: string;
  announcementBg?: string;
  announcementTextColor?: string;
  showSearch: boolean;
  searchPlaceholder?: string;
  showWishlist: boolean;
  showCart: boolean;
  showAccount: boolean;
  showMegaMenu?: boolean;
  showCategoryBar?: boolean;
  sticky: boolean;
  logoHeight?: number;
  mobileMenuType?: "drawer" | "bottom-bar" | "modal";
  quickLinks?: Array<{ label: string; href: string; icon?: string }>;
}

export interface FooterConfig {
  layout: "standard" | "multi-column" | "grocery" | "electronics" | "minimal";
  columns: number;
  aboutText?: string;
  hotline?: string;
  email?: string;
  address?: string;
  showSocial: boolean;
  showNewsletter: boolean;
  showPaymentIcons: boolean;
  showAppLinks: boolean;
  showCopyright: boolean;
  copyrightText?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ThemeCategory;
  previewImage: string;
  mobilePreviewImage?: string;
  version: string;
  author: string;
  tags: string[];

  // Design Tokens
  tokens: ThemeTokens;

  // Header & Footer default settings
  header: HeaderConfig;
  footer: FooterConfig;

  // Default section composition for new store / theme reset
  defaultSections: BuilderSection[];
  supportedSections: string[];

  // Component Variants
  productCardVariant: ProductCardVariant;
  categoryCardVariant: CategoryCardVariant;
}
