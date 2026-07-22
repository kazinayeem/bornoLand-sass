"use client";

import type { StorefrontSectionLike } from "./storefront-types";
import { NavbarRenderer, type NavbarRendererProps } from "./navbar-renderer";

export type StoreNavbarProps = NavbarRendererProps & {
  /** @deprecated Header sections are rendered via SectionRenderer in builder mode. */
  headerSections?: StorefrontSectionLike[];
};

/** Live storefront navbar — thin wrapper around NavbarRenderer. */
export function StoreNavbar({ headerSections: _headerSections, ...props }: StoreNavbarProps = {}) {
  return <NavbarRenderer {...props} />;
}
