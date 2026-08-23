"use client";

import { useActiveTheme } from "./theme-provider";
import { GroceryFooter } from "@/themes/grocery/components/grocery-footer";
import { ElectronicsFooter } from "@/themes/electronics/components/electronics-footer";

export interface ThemeFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function ThemeFooter({ footerSettings = {} }: ThemeFooterProps) {
  const { theme } = useActiveTheme();

  if (theme.id === "electronics") {
    return <ElectronicsFooter footerSettings={footerSettings} />;
  }

  return <GroceryFooter footerSettings={footerSettings} />;
}
