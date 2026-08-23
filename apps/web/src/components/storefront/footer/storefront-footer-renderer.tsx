"use client";

import { useMemo } from "react";
import { useActiveTheme } from "@/components/store/theme-provider";
import { GroceryFooter } from "@/themes/grocery/components/grocery-footer";
import { MinimalCommerceFooter } from "./templates/minimal-commerce-footer";
import { TechElectronicsFooter } from "./templates/tech-electronics-footer";
import { MarketplaceFooter } from "./templates/marketplace-footer";
import { ModernStoreFooter } from "./templates/modern-store-footer";
import {
  isGlobalFooterEnabled,
  resolveFooterTemplateId,
} from "@/lib/storefront/global-navigation";

export interface StorefrontFooterRendererProps {
  footerSettings?: Record<string, unknown>;
}

export function StorefrontFooterRenderer({ footerSettings = {} }: StorefrontFooterRendererProps) {
  const { theme } = useActiveTheme();
  const themeId = theme.id || "grocery";

  // Disabled = render NOTHING. No default/fallback footer.
  if (!isGlobalFooterEnabled(footerSettings)) {
    return null;
  }

  const template = useMemo(
    () =>
      resolveFooterTemplateId(
        footerSettings,
        themeId === "electronics" ? "modern-multi-column" : "classic-ecommerce",
      ),
    [footerSettings, themeId],
  );

  // Keep content keys intact; only normalize identity fields for templates
  const normalizedSettings = useMemo(
    () => ({
      ...footerSettings,
      template,
      templateId: template,
      footerTemplate: template,
    }),
    [footerSettings, template],
  );

  const renderFooterContent = () => {
    switch (template) {
      case "classic-ecommerce":
        return <GroceryFooter key="footer-classic-ecommerce" footerSettings={normalizedSettings} />;
      case "modern-multi-column":
        return <TechElectronicsFooter key="footer-modern-multi-column" footerSettings={normalizedSettings} />;
      case "minimal":
        return <MinimalCommerceFooter key="footer-minimal" footerSettings={normalizedSettings} />;
      case "marketplace":
        return <MarketplaceFooter key="footer-marketplace" footerSettings={normalizedSettings} />;
      case "premium":
        return <ModernStoreFooter key="footer-premium" footerSettings={normalizedSettings} />;
      default:
        return <GroceryFooter key="footer-default-classic" footerSettings={normalizedSettings} />;
    }
  };

  return (
    <footer
      key={`global-footer-${template}-${String(footerSettings.columns ?? 4)}`}
      data-global-footer={template}
      className="relative z-40 w-full max-w-full min-w-0"
    >
      {renderFooterContent()}
    </footer>
  );
}
