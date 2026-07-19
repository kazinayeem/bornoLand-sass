"use client";

import { useMemo } from "react";
import { useIsBuilder } from "@/lib/device-context";
import type { ProductData, CategoryData } from "@/providers/tenant-provider";
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_TESTIMONIALS,
  DEMO_BLOGS,
  DEMO_COLLECTIONS,
  type DemoTestimonial,
  type DemoBlog,
  type DemoCollection,
} from "@/lib/demo-data";

/**
 * Returns products – real ones if available, demo products in builder
 * preview mode if the store has no products yet.
 */
export function useBuilderProducts(realProducts: ProductData[]): ProductData[] {
  const isBuilder = useIsBuilder();
  return useMemo(() => {
    if (realProducts.length > 0) return realProducts;
    if (isBuilder) return DEMO_PRODUCTS;
    return [];
  }, [realProducts, isBuilder]);
}

/**
 * Returns categories – real ones if available, demo categories in builder
 * preview mode if the store has no categories yet.
 */
export function useBuilderCategories(realCategories: CategoryData[]): CategoryData[] {
  const isBuilder = useIsBuilder();
  return useMemo(() => {
    if (realCategories.length > 0) return realCategories;
    if (isBuilder) return DEMO_CATEGORIES;
    return [];
  }, [realCategories, isBuilder]);
}

/**
 * Returns testimonials – real ones if available, demo testimonials in builder
 * preview mode if the store has none.
 */
export function useBuilderTestimonials(
  realTestimonials: DemoTestimonial[],
): DemoTestimonial[] {
  const isBuilder = useIsBuilder();
  return useMemo(() => {
    if (realTestimonials.length > 0) return realTestimonials;
    if (isBuilder) return DEMO_TESTIMONIALS;
    return [];
  }, [realTestimonials, isBuilder]);
}

/**
 * Returns blog posts – real ones if available, demo blogs in builder
 * preview mode if the store has none.
 */
export function useBuilderBlogs(realBlogs: DemoBlog[]): DemoBlog[] {
  const isBuilder = useIsBuilder();
  return useMemo(() => {
    if (realBlogs.length > 0) return realBlogs;
    if (isBuilder) return DEMO_BLOGS;
    return [];
  }, [realBlogs, isBuilder]);
}

/**
 * Returns collections – real ones if available, demo collections in builder
 * preview mode if the store has none.
 */
export function useBuilderCollections(
  realCollections: DemoCollection[],
): DemoCollection[] {
  const isBuilder = useIsBuilder();
  return useMemo(() => {
    if (realCollections.length > 0) return realCollections;
    if (isBuilder) return DEMO_COLLECTIONS;
    return [];
  }, [realCollections, isBuilder]);
}
