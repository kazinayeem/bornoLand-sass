"use client";

import type { SectionData } from "./section-renderer";

/**
 * Legacy body "header-bar" section.
 *
 * Global header is exclusively ThemeHeader → StorefrontHeaderRenderer.
 * Body header sections are filtered from the canvas; if one still reaches
 * the tree, render nothing so we never inject a second/fallback navbar.
 */
export function HeaderBar(_props: { section: SectionData }) {
  return null;
}
