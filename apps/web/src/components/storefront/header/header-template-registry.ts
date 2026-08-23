"use client";

import type { ComponentType } from "react";
import type { HeaderTemplateId } from "@/lib/storefront/global-navigation";
import { MinimalCleanHeader } from "./templates/minimal-clean-header";
import { ModernEcommerceHeader } from "./templates/modern-ecommerce-header";
import { MarketplaceHeader } from "./templates/marketplace-header";
import { PremiumLuxuryHeader } from "./templates/premium-luxury-header";
import { CompactProfessionalHeader } from "./templates/compact-professional-header";
import { FashionBoutiqueHeader } from "./templates/fashion-boutique-header";
import { GroceryNaturalHeader } from "./templates/grocery-natural-header";
import { ElectronicsTechHeader } from "./templates/electronics-tech-header";
import { BoldPromotionalHeader } from "./templates/bold-promotional-header";
import { MobileFirstHeader } from "./templates/mobile-first-header";

export type HeaderTemplateDefinition = {
  id: HeaderTemplateId;
  name: string;
  description: string;
  tag: string;
  Component: ComponentType<{ headerSettings?: Record<string, unknown> }>;
};

export const HEADER_TEMPLATE_REGISTRY: Record<HeaderTemplateId, HeaderTemplateDefinition> = {
  "minimal-clean": {
    id: "minimal-clean",
    name: "Minimal / Clean Store",
    description: "Logo left, navigation center, search and cart on the right.",
    tag: "Minimal & Boutique",
    Component: MinimalCleanHeader,
  },
  "modern-ecommerce": {
    id: "modern-ecommerce",
    name: "Modern Ecommerce",
    description: "Announcement bar, large search, and category navigation row.",
    tag: "General Ecommerce",
    Component: ModernEcommerceHeader,
  },
  marketplace: {
    id: "marketplace",
    name: "Marketplace Header",
    description: "Mega-menu, large search, and marketplace-style top bar.",
    tag: "Marketplace & Multi-vendor",
    Component: MarketplaceHeader,
  },
  "premium-luxury": {
    id: "premium-luxury",
    name: "Premium / Luxury",
    description: "Spacious layout with centered navigation and elegant spacing.",
    tag: "Fashion & Luxury",
    Component: PremiumLuxuryHeader,
  },
  "compact-professional": {
    id: "compact-professional",
    name: "Compact / Professional",
    description: "Dense utility bar and compact category navigation.",
    tag: "Tech & Professional",
    Component: CompactProfessionalHeader,
  },
  "fashion-boutique": {
    id: "fashion-boutique",
    name: "Fashion Boutique",
    description: "Centered logo with navigation underneath and fashion spacing.",
    tag: "Fashion & Apparel",
    Component: FashionBoutiqueHeader,
  },
  "grocery-natural": {
    id: "grocery-natural",
    name: "Grocery / Natural",
    description: "Announcement, categories button, and grocery-focused layout.",
    tag: "Grocery & Natural",
    Component: GroceryNaturalHeader,
  },
  "electronics-tech": {
    id: "electronics-tech",
    name: "Electronics / Tech",
    description: "Search-first layout with flash-sale link and category row.",
    tag: "Electronics & Tech",
    Component: ElectronicsTechHeader,
  },
  "bold-promotional": {
    id: "bold-promotional",
    name: "Bold / Promotional",
    description: "Strong promotional bar with deals and flash-sale navigation.",
    tag: "Promotions & Sales",
    Component: BoldPromotionalHeader,
  },
  "mobile-first": {
    id: "mobile-first",
    name: "Mobile First / Modern",
    description: "Optimized for mobile with clean desktop collapse behavior.",
    tag: "Mobile Optimized",
    Component: MobileFirstHeader,
  },
};

export function resolveHeaderTemplateComponent(templateId: HeaderTemplateId) {
  return HEADER_TEMPLATE_REGISTRY[templateId]?.Component ?? HEADER_TEMPLATE_REGISTRY["modern-ecommerce"].Component;
}

export const HEADER_TEMPLATE_LIST = Object.values(HEADER_TEMPLATE_REGISTRY);

/** Shared global header — same renderer for builder preview and storefront. */
export { StorefrontHeaderRenderer as GlobalHeader } from "./storefront-header-renderer";
