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

  // Determine active template: user-selected template overrides theme default
  const template =
    (headerSettings.template as string) ||
    (headerSettings.headerTemplate as string) ||
    (headerSettings.layout as string) ||
    (themeId === "electronics" ? "tech-mega" : "grocery");

  // Behavior settings
  const position = (headerSettings.position as string) || (headerSettings.sticky === false ? "static" : "sticky");
  const autoHideOnScroll = headerSettings.autoHideOnScroll === true || headerSettings.autoHideOnScroll === "true";
  const shadow = (headerSettings.shadow as string) || "none";
  const transparent = headerSettings.transparent === true || headerSettings.transparent === "true";

  // Auto-hide on scroll state
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

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
      case "tech-mega":
      case "electronics":
      case "computer":
        return <TechMegaHeader headerSettings={headerSettings} />;
      case "marketplace":
      case "daraz":
        return <MarketplaceHeader headerSettings={headerSettings} />;
      case "minimal-fashion":
      case "minimal":
      case "fashion":
        return <MinimalFashionHeader headerSettings={headerSettings} />;
      case "modern-general":
      case "modern":
      case "general":
        return <ModernGeneralHeader headerSettings={headerSettings} />;
      case "grocery":
      case "organic":
      default:
        return <GroceryHeader headerSettings={headerSettings} />;
    }
  };

  return (
    <div
      className={cn(
        "w-full transition-transform duration-300 z-50",
        position === "sticky" && "sticky top-0",
        position === "fixed" && "fixed top-0 left-0 right-0",
        autoHideOnScroll && !isVisible && "-translate-y-full",
        shadow === "sm" && "shadow-sm",
        shadow === "md" && "shadow-md",
        shadow === "lg" && "shadow-lg",
        isScrolled && "shadow-md",
        transparent && "bg-transparent backdrop-blur-md"
      )}
    >
      {renderHeaderContent()}
    </div>
  );
}
