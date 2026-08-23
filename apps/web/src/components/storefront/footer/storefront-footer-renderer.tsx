"use client";

import { useActiveTheme } from "@/components/store/theme-provider";
import { GroceryFooter } from "@/themes/grocery/components/grocery-footer";
import { MinimalCommerceFooter } from "./templates/minimal-commerce-footer";
import { TechElectronicsFooter } from "./templates/tech-electronics-footer";
import { MarketplaceFooter } from "./templates/marketplace-footer";
import { ModernStoreFooter } from "./templates/modern-store-footer";

export interface StorefrontFooterRendererProps {
  footerSettings?: Record<string, unknown>;
}

export function StorefrontFooterRenderer({ footerSettings = {} }: StorefrontFooterRendererProps) {
  const { theme } = useActiveTheme();
  const themeId = theme.id || "grocery";

  // If footer is disabled, hidden, or template is null/none, render NOTHING - absolutely NO fallback footer!
  if (
    footerSettings.enabled === false ||
    footerSettings.visible === false ||
    footerSettings.show === false ||
    footerSettings.enabled === "false" ||
    footerSettings.visible === "false" ||
    footerSettings.template === "none" ||
    footerSettings.template === null ||
    footerSettings.templateId === null
  ) {
    return null;
  }

  // Determine active template: user-selected template overrides theme default
  const template =
    (footerSettings.template as string) ||
    (footerSettings.footerTemplate as string) ||
    (footerSettings.templateId as string) ||
    (themeId === "electronics" ? "modern-multi-column" : "classic-ecommerce");

  const renderFooterContent = () => {
    switch (template) {
      // FOOTER 1: Classic Ecommerce
      case "classic-ecommerce":
      case "classic":
      case "grocery":
      case "organic":
      case "commerce":
        return <GroceryFooter key="footer-classic-ecommerce" footerSettings={footerSettings} />;

      // FOOTER 2: Modern Multi Column
      case "modern-multi-column":
      case "modern":
      case "tech":
      case "electronics":
      case "tech-electronics":
        return <TechElectronicsFooter key="footer-modern-multi-column" footerSettings={footerSettings} />;

      // FOOTER 3: Minimal
      case "minimal":
      case "minimal-commerce":
      case "simple":
        return <MinimalCommerceFooter key="footer-minimal" footerSettings={footerSettings} />;

      // FOOTER 4: Marketplace
      case "marketplace":
      case "daraz":
        return <MarketplaceFooter key="footer-marketplace" footerSettings={footerSettings} />;

      // FOOTER 5: Premium
      case "premium":
      case "premium-luxury":
      case "modern-store":
      case "luxury":
      default:
        return <ModernStoreFooter key="footer-premium" footerSettings={footerSettings} />;
    }
  };

  return (
    <footer
      key={`global-footer-${template}-${footerSettings.columns ?? 4}`}
      data-global-footer={template}
      className="relative z-40 w-full"
    >
      {renderFooterContent()}
    </footer>
  );
}
