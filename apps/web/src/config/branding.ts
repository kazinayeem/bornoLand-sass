/**
 * Centralized brand and company attribution configuration for BornoLand.
 * Modify here to update company ownership, attribution links, and branding labels across public pages.
 */
export const BRAND_CONFIG = {
  name: "BornoLand",
  productName: "BornoLand",
  tagline: "Everything Your Business Needs. One Powerful Platform.",
  description:
    "The all-in-one Business Operating System (BOS) unifying storefront commerce, cloud POS, multi-warehouse inventory, audited payroll, double-entry accounting, and real-time business analytics.",

  // Parent Company Ownership Details
  parentCompany: {
    name: "BornoSoft",
    displayName: "BornoSoft.bd",
    url: "https://bornosoft.site",
    fallbackUrl: "https://bornosoft.site",
    attributionLabel: "A product of BornoSoft",
    fullAttribution: "BornoLand — A product of BornoSoft",
    shortAttribution: "by BornoSoft",
    madeByText: "Made by",
  },

  copyright: {
    year: 2026,
    text: "© 2026 BornoLand. All rights reserved.",
  },
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
