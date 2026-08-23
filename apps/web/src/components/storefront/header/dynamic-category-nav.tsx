"use client";

/**
 * @deprecated Prefer GlobalStoreNav — kept as a thin adapter so existing imports keep working.
 * Both use the same global category source and maxVisible limit.
 */

export {
  GlobalStoreNav as DynamicCategoryNav,
  type GlobalStoreNavProps as DynamicCategoryNavProps,
} from "./global-store-nav";
