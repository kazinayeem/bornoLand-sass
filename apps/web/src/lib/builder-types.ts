// ─── Responsive Breakpoints ───────────────────────────────────────────

export type Breakpoint = "desktop" | "laptop" | "tablet" | "mobile";

export const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1440,
  laptop: 1280,
  tablet: 768,
  mobile: 375,
};

export const BREAKPOINT_ORDER: Breakpoint[] = ["desktop", "laptop", "tablet", "mobile"];

// ─── Responsive Value ─────────────────────────────────────────────────

export type ResponsiveValue<T> = {
  desktop: T;
  laptop?: T;
  tablet?: T;
  mobile?: T;
};

// ─── Media ───────────────────────────────────────────────────────────

export type ResolvedMedia = {
  mediaId: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
};

// ─── Section Style (Responsive-Aware) ───────────────────────────────

export type UnifiedStyle = {
  // Spacing
  paddingTop?: ResponsiveValue<string>;
  paddingBottom?: ResponsiveValue<string>;
  paddingLeft?: ResponsiveValue<string>;
  paddingRight?: ResponsiveValue<string>;
  marginTop?: ResponsiveValue<string>;
  marginBottom?: ResponsiveValue<string>;
  marginLeft?: ResponsiveValue<string>;
  marginRight?: ResponsiveValue<string>;

  // Background
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: ResolvedMedia;

  // Border
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: ResponsiveValue<string>;
  borderStyle?: string;

  // Shadow
  shadow?: string;

  // Sizing
  width?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  minHeight?: ResponsiveValue<string>;

  // Visibility (replaces booleans)
  hidden?: ResponsiveValue<boolean>;

  // Typography (future)
  fontSize?: ResponsiveValue<string>;
  lineHeight?: ResponsiveValue<string>;
  textAlign?: ResponsiveValue<string>;

  // Effects
  opacity?: string;
  customCss?: string;

  // Animation
  animation?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationTrigger?: string;
  parallaxSpeed?: string;
  sticky?: boolean;
};

// ─── Unified Section ─────────────────────────────────────────────────

export type SectionProps = Record<string, string | undefined>;

export type UnifiedSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  props: SectionProps;
  style?: UnifiedStyle;
  children?: UnifiedSection[];
};

// ─── Fully Data-Driven Header Config (no hardcoded elements) ─────────

export type HeaderElement =
  | "announcement"
  | "logo"
  | "navigation"
  | "search"
  | "wishlist"
  | "cart"
  | "account"
  | "cta"
  | "language"
  | "currency";

export type HeaderConfig = {
  elements: HeaderElement[];
  logo: {
    media?: ResolvedMedia;
    text?: string;
    link?: string;
    width?: number;
    height?: number;
  };
  navigation: {
    menuKey: string;
    mobileMenuKey: string;
    showIcons: boolean;
  };
  announcement: {
    text: string;
    link?: string;
    dismissible: boolean;
  };
  cta: {
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
  };
  sticky: ResponsiveValue<boolean>;
  transparent: ResponsiveValue<boolean>;
  height: ResponsiveValue<string>;
  background: string;
  textColor: string;
  borderColor: string;
  shadow: string;
  padding: ResponsiveValue<string>;
  desktopLayout: "left-logo" | "center-logo" | "logo-left-nav-right" | "nav-left-logo-center";
  mobileLayout: "hamburger" | "bottom-nav" | "collapsible";
};

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  elements: ["logo", "navigation", "search", "wishlist", "cart", "account"],
  logo: { text: "Store", link: "/" },
  navigation: { menuKey: "primary", mobileMenuKey: "mobile", showIcons: false },
  announcement: { text: "", dismissible: true },
  cta: { text: "Shop Now", link: "/", variant: "primary" },
  sticky: { desktop: false, laptop: false, tablet: false, mobile: false },
  transparent: { desktop: false, laptop: false, tablet: false, mobile: false },
  height: { desktop: "64px", laptop: "64px", tablet: "56px", mobile: "56px" },
  background: "#ffffff",
  textColor: "#000000",
  borderColor: "#e4e4e7",
  shadow: "none",
  padding: { desktop: "0 16px", laptop: "0 16px", tablet: "0 12px", mobile: "0 12px" },
  desktopLayout: "logo-left-nav-right",
  mobileLayout: "hamburger",
};

// ─── Fully Data-Driven Footer Config ─────────────────────────────────

export type FooterElement =
  | "logo"
  | "description"
  | "navigation"
  | "social"
  | "newsletter"
  | "copyright"
  | "payment-icons"
  | "back-to-top";

export type FooterConfig = {
  elements: FooterElement[];
  logo: {
    media?: ResolvedMedia;
    text?: string;
    link?: string;
    width?: number;
  };
  description: string;
  navigation: {
    menuKey: string;
    columns: number;
  };
  social: {
    show: boolean;
    platforms: Array<"facebook" | "twitter" | "instagram" | "youtube" | "tiktok" | "pinterest" | "linkedin">;
  };
  newsletter: {
    show: boolean;
    placeholder: string;
    buttonText: string;
  };
  copyright: {
    text: string;
    show: boolean;
  };
  paymentIcons: {
    show: boolean;
    icons: string[];
  };
  background: string;
  textColor: string;
  padding: ResponsiveValue<string>;
  columns: ResponsiveValue<number>;
  borderColor: string;
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  elements: ["logo", "description", "navigation", "social", "copyright", "payment-icons"],
  logo: { text: "Store", link: "/" },
  description: "",
  navigation: { menuKey: "footer", columns: 4 },
  social: { show: true, platforms: ["facebook", "instagram", "twitter"] },
  newsletter: { show: false, placeholder: "Your email", buttonText: "Subscribe" },
  copyright: { text: "© All rights reserved.", show: true },
  paymentIcons: { show: true, icons: ["visa", "mastercard", "paypal"] },
  background: "#18181b",
  textColor: "#ffffff",
  padding: { desktop: "48px 16px", laptop: "48px 16px", tablet: "32px 12px", mobile: "24px 12px" },
  columns: { desktop: 4, laptop: 4, tablet: 2, mobile: 1 },
  borderColor: "#27272a",
};

// ─── Header Nav Menu Item (fully data-driven) ────────────────────────

export type NavMenuItem = {
  id: string;
  label: string;
  link: string;
  linkType: "page" | "url" | "collection" | "product";
  referenceId?: string;
  openInNewTab?: boolean;
  children?: NavMenuItem[];
  icon?: string;
  badge?: string;
};

// ─── Page Draft (complete page state) ────────────────────────────────

export type PageDraft = {
  pageId: string;
  title: string;
  slug: string;
  pageType: string;
  isSystem: boolean;
  description: string;
  status: "draft" | "published" | "scheduled" | "archived";

  // Three zones
  sections: UnifiedSection[];
  headerSections: UnifiedSection[];
  footerSections: UnifiedSection[];

  // Data-driven configs
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;

  // SEO
  seo: {
    title: string;
    description: string;
    ogImage?: ResolvedMedia;
    ogTitle?: string;
    ogDescription?: string;
    noIndex: boolean;
    canonicalUrl?: string;
  };

  // Page-level CSS/JS
  customCss?: string;
  customJs?: string;
};

// ─── Published Version (what the store renders) ──────────────────────

export type PublishedPage = {
  pageId: string;
  title: string;
  slug: string;
  pageType: string;
  publishedAt: string;
  version: number;

  sections: UnifiedSection[];
  headerSections: UnifiedSection[];
  footerSections: UnifiedSection[];
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  seo: PageDraft["seo"];
  customCss?: string;
  customJs?: string;
};

// ─── Publish Diff ────────────────────────────────────────────────────

export type PublishDiff = {
  addedSections: string[];
  removedSections: string[];
  modifiedSections: string[];
  headerChanged: boolean;
  footerChanged: boolean;
  headerConfigChanged: boolean;
  footerConfigChanged: boolean;
  themeChanged: boolean;
  seoChanged: boolean;
  settingsChanged: boolean;
  summary: string;
};
