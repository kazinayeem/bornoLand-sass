"use client";

import type { ProductData, CategoryData } from "@/providers/tenant-provider";
import type { DemoTestimonial, DemoBlog, DemoCollection } from "@/lib/demo-data";

/**
 * Builder and published storefronts share the same real data path. Empty
 * collections stay empty so the editor never misrepresents a live store.
 */
export function useBuilderProducts(realProducts: ProductData[]): ProductData[] {
  return realProducts;
}

/**
 * Preserve real category data, including an intentionally empty catalog.
 */
export function useBuilderCategories(realCategories: CategoryData[]): CategoryData[] {
  return realCategories;
}

/**
 * Testimonials are section-managed and never replaced with sample reviews.
 */
export function useBuilderTestimonials(
  realTestimonials: DemoTestimonial[],
): DemoTestimonial[] {
  return realTestimonials;
}

/**
 * Preserve the real CMS data supplied by the storefront.
 */
export function useBuilderBlogs(realBlogs: DemoBlog[]): DemoBlog[] {
  return realBlogs;
}

/**
 * Preserve the real collection data supplied by the storefront.
 */
export function useBuilderCollections(
  realCollections: DemoCollection[],
): DemoCollection[] {
  return realCollections;
}
