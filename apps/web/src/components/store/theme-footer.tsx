"use client";

import { StorefrontFooterRenderer } from "@/components/storefront/footer/storefront-footer-renderer";

export interface ThemeFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function ThemeFooter({ footerSettings = {} }: ThemeFooterProps) {
  return <StorefrontFooterRenderer footerSettings={footerSettings} />;
}
