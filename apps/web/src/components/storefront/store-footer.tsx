"use client";

import { StorefrontFooterRenderer } from "./footer/storefront-footer-renderer";
import type { StorefrontSectionLike } from "./storefront-types";

type StoreFooterProps = {
  section?: StorefrontSectionLike;
  footerSections?: StorefrontSectionLike[];
  footerSettings?: Record<string, unknown>;
};

/**
 * Storefront footer — renders the unified StorefrontFooterRenderer.
 */
export function StoreFooter({ footerSettings }: StoreFooterProps = {}) {
  return <StorefrontFooterRenderer footerSettings={footerSettings} />;
}
