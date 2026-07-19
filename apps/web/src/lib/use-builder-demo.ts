"use client";

import { useMemo } from "react";
import { useIsBuilder } from "@/lib/device-context";
import { useBuilderDemoData } from "@/lib/builder-demo-provider";
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_TESTIMONIALS,
  DEMO_BLOGS,
  DEMO_COLLECTIONS,
} from "@/lib/demo-data";
import type { ProductData, CategoryData } from "@/providers/tenant-provider";
import type { DemoTestimonial, DemoBlog, DemoCollection } from "@/lib/demo-data";

const BUILDER_MIN_COUNT = 6;

/**
 * In Builder mode: ALWAYS return demo data (6 items).
 * In Published mode: return real data only.
 * This ensures Builder is a pixel-perfect preview using demo content.
 */
export function useBuilderProducts(realProducts: ProductData[]): ProductData[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realProducts;
    // Builder ALWAYS uses demo products for consistent preview
    return (demoData?.products ?? DEMO_PRODUCTS).slice(0, BUILDER_MIN_COUNT);
  }, [isBuilder, demoData?.products]);
}

/**
 * In Builder mode: ALWAYS return demo categories (6 items).
 * In Published mode: return real categories only.
 */
export function useBuilderCategories(realCategories: CategoryData[]): CategoryData[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realCategories;
    // Builder ALWAYS uses demo categories for consistent preview
    return (demoData?.categories ?? DEMO_CATEGORIES).slice(0, BUILDER_MIN_COUNT);
  }, [isBuilder, demoData?.categories]);
}

/**
 * In Builder mode: ALWAYS return demo testimonials (6 items).
 * In Published mode: return real testimonials only.
 */
export function useBuilderTestimonials(
  realTestimonials: DemoTestimonial[],
): DemoTestimonial[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realTestimonials;
    // Builder ALWAYS uses demo testimonials for consistent preview
    return (demoData?.testimonials ?? DEMO_TESTIMONIALS).slice(0, BUILDER_MIN_COUNT);
  }, [isBuilder, demoData?.testimonials]);
}

/**
 * In Builder mode: ALWAYS return demo blogs (6 items).
 * In Published mode: return real blogs only.
 */
export function useBuilderBlogs(realBlogs: DemoBlog[]): DemoBlog[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realBlogs;
    return (demoData?.blogs ?? DEMO_BLOGS).slice(0, BUILDER_MIN_COUNT);
  }, [isBuilder, demoData?.blogs]);
}

/**
 * In Builder mode: ALWAYS return demo collections (6 items).
 * In Published mode: return real collections only.
 */
export function useBuilderCollections(
  realCollections: DemoCollection[],
): DemoCollection[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realCollections;
    return (demoData?.collections ?? DEMO_COLLECTIONS).slice(0, BUILDER_MIN_COUNT);
  }, [isBuilder, demoData?.collections]);
}
