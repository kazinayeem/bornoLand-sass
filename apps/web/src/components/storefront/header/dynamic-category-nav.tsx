"use client";

/**
 * Thin adapter so legacy imports keep working.
 * All navigation goes through GlobalStoreNav (single source of truth).
 */

import {
  GlobalStoreNav,
  type GlobalStoreNavProps,
} from "./global-store-nav";

export type DynamicCategoryNavProps = GlobalStoreNavProps & {
  /** @deprecated use maxVisibleItems */
  maxVisibleCategories?: number;
  categories?: unknown;
};

export function DynamicCategoryNav({
  maxVisibleCategories,
  maxVisibleItems,
  categories: _categories,
  ...rest
}: DynamicCategoryNavProps) {
  return (
    <GlobalStoreNav
      {...rest}
      maxVisibleItems={maxVisibleItems ?? maxVisibleCategories ?? 6}
    />
  );
}
