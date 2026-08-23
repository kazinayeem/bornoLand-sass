"use client";

import { useActiveTheme } from "./theme-provider";
import { GroceryHeader } from "@/themes/grocery/components/grocery-header";
import { ElectronicsHeader } from "@/themes/electronics/components/electronics-header";

export interface ThemeHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ThemeHeader({ headerSettings = {} }: ThemeHeaderProps) {
  const { theme } = useActiveTheme();

  if (theme.id === "electronics") {
    return <ElectronicsHeader headerSettings={headerSettings} />;
  }

  return <GroceryHeader headerSettings={headerSettings} />;
}
