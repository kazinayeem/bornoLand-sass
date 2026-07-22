export const FOOTER_TEMPLATES = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "commerce", label: "Commerce" },
  { value: "agency", label: "Agency" },
  { value: "startup", label: "Startup" },
  { value: "magazine", label: "Magazine" },
  { value: "split", label: "Split Layout" },
  { value: "centered", label: "Centered" },
  { value: "stacked", label: "Stacked" },
] as const;

export type FooterTemplate = (typeof FOOTER_TEMPLATES)[number]["value"];

export type FooterLayoutSettings = {
  template?: FooterTemplate;
  columns?: number;
  padding?: string;
  background?: string;
  textColor?: string;
  borderColor?: string;
  showNewsletter?: boolean;
  showSocial?: boolean;
  showPaymentIcons?: boolean;
  showCopyright?: boolean;
  showMap?: boolean;
  showContact?: boolean;
  showBusinessHours?: boolean;
  socialIconStyle?: "filled" | "outline" | "minimal";
  newsletterPosition?: "top" | "inline" | "bottom";
  copyrightPosition?: "left" | "center" | "right";
  mapPosition?: "inline" | "bottom" | "hidden";
  alignment?: "left" | "center" | "right";
  divider?: boolean;
  visibleOnDesktop?: boolean;
  visibleOnTablet?: boolean;
  visibleOnMobile?: boolean;
};

export const DEFAULT_FOOTER_LAYOUT: FooterLayoutSettings = {
  template: "commerce",
  columns: 4,
  showSocial: true,
  showCopyright: true,
  showContact: true,
  showMap: false,
  showNewsletter: false,
  showPaymentIcons: false,
  socialIconStyle: "filled",
  copyrightPosition: "left",
  mapPosition: "hidden",
  divider: true,
  visibleOnDesktop: true,
  visibleOnTablet: true,
  visibleOnMobile: true,
};

/** Map legacy section types to footer templates for backward compatibility. */
export const SECTION_TYPE_TO_FOOTER_TEMPLATE: Record<string, FooterTemplate> = {
  footer: "commerce",
  "simple-footer": "minimal",
  "ecommerce-footer": "commerce",
  "mega-footer": "classic",
  "multi-column-footer": "classic",
};
