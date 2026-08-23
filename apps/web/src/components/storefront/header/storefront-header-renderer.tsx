"use client";

import { useEffect, useState, useRef } from "react";
import { useActiveTheme } from "@/components/store/theme-provider";
import { GroceryHeader } from "@/themes/grocery/components/grocery-header";
import { TechMegaHeader } from "./templates/tech-mega-header";
import { MarketplaceHeader } from "./templates/marketplace-header";
import { MinimalFashionHeader } from "./templates/minimal-fashion-header";
import { ModernGeneralHeader } from "./templates/modern-general-header";
import { cn } from "@/lib/utils";

export interface StorefrontHeaderRendererProps {
  headerSettings?: Record<string, unknown>;
}

export function StorefrontHeaderRenderer({ headerSettings = {} }: StorefrontHeaderRendererProps) {
  const { theme } = useActiveTheme();
  const themeId = theme.id || "grocery";
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // If header is disabled, hidden, or template is null/none, render NOTHING - absolutely NO fallback header!
  if (
    headerSettings.enabled === false ||
    headerSettings.visible === false ||
    headerSettings.show === false ||
    headerSettings.enabled === "false" ||
    headerSettings.visible === "false" ||
    headerSettings.template === "none" ||
    headerSettings.template === null ||
    headerSettings.templateId === null
  ) {
    return null;
  }

  // Determine active template: user-selected template overrides theme default
  const template =
    (headerSettings.template as string) ||
    (headerSettings.headerTemplate as string) ||
    (headerSettings.templateId as string) ||
    (headerSettings.layout as string) ||
    (themeId === "electronics" ? "compact-professional" : "modern-ecommerce");

  // Behavior settings: static, sticky, fixed
  const position = (headerSettings.position as string) || (headerSettings.sticky === false ? "static" : "sticky");
  const autoHideOnScroll = headerSettings.autoHideOnScroll === true || headerSettings.autoHideOnScroll === "true";
  const shadow = (headerSettings.shadow as string) || "none";
  const transparent = headerSettings.transparent === true || headerSettings.transparent === "true";

  // Auto-hide on scroll state
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Measure header height for fixed header spacer
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [template, headerSettings]);

  useEffect(() => {
    if (!autoHideOnScroll && position !== "sticky") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (autoHideOnScroll) {
        if (currentScrollY > lastScrollY && currentScrollY > 120) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true); // Scrolling up
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [autoHideOnScroll, lastScrollY, position]);

  const renderHeaderContent = () => {
    switch (template) {
      // HEADER 1: Minimal / Clean Store
      case "minimal-clean":
      case "minimal":
      case "minimal-fashion":
      case "clean":
        return <MinimalFashionHeader key="header-minimal-clean" headerSettings={headerSettings} />;

      // HEADER 2: Modern Ecommerce
      case "modern-ecommerce":
      case "grocery":
      case "organic":
      case "ecommerce":
        return <GroceryHeader key="header-modern-ecommerce" headerSettings={headerSettings} />;

      // HEADER 3: Marketplace Header
      case "marketplace":
      case "daraz":
      case "multivendor":
        return <MarketplaceHeader key="header-marketplace" headerSettings={headerSettings} />;

      // HEADER 4: Premium / Luxury
      case "premium-luxury":
      case "premium":
      case "luxury":
      case "fashion":
      case "modern-general":
        return <ModernGeneralHeader key="header-premium-luxury" headerSettings={headerSettings} />;

      // HEADER 5: Compact / Professional
      case "compact-professional":
      case "compact":
      case "professional":
      case "tech-mega":
      case "electronics":
      case "computer":
      default:
        return <TechMegaHeader key="header-compact-professional" headerSettings={headerSettings} />;
    }
  };

  return (
    <header
      key={`global-header-${template}-${position}`}
      data-global-header={template}
      className="relative z-50 w-full"
    >
      <div
        ref={headerRef}
        className={cn(
          "w-full transition-transform duration-300 z-50",
          position === "sticky" && "sticky top-0",
          position === "fixed" && "fixed top-0 left-0 right-0",
          autoHideOnScroll && !isVisible && "-translate-y-full",
          shadow === "sm" && "shadow-xs",
          shadow === "md" && "shadow-md",
          shadow === "lg" && "shadow-lg",
          isScrolled && "shadow-md",
          transparent && "bg-transparent backdrop-blur-md"
        )}
      >
        {renderHeaderContent()}
      </div>

      {/* Spacer for non-transparent fixed header to prevent page content overlap */}
      {position === "fixed" && !transparent && headerHeight > 0 && (
        <div style={{ height: headerHeight }} aria-hidden="true" className="w-full shrink-0 pointer-events-none" />
      )}
    </header>
  );
}
