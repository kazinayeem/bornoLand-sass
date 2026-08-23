"use client";

import { StorefrontHeaderRenderer } from "@/components/storefront/header/storefront-header-renderer";

export interface ThemeHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ThemeHeader({ headerSettings = {} }: ThemeHeaderProps) {
  return <StorefrontHeaderRenderer headerSettings={headerSettings} />;
}
