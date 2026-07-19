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

function padTo<T>(items: T[], demos: T[], min: number): T[] {
  if (items.length >= min) return items.slice(0, min);
  return [...items, ...demos].slice(0, min);
}

export function useBuilderProducts(realProducts: ProductData[]): ProductData[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realProducts;
    const active = realProducts.filter((p) => p.status === "active");
    const demos = demoData?.products ?? DEMO_PRODUCTS;
    let result: ProductData[];
    if (active.length >= BUILDER_MIN_COUNT) {
      result = active.slice(0, BUILDER_MIN_COUNT);
    } else {
      result = padTo(active, demos, BUILDER_MIN_COUNT);
    }
    if (result.length === 0) {
      result = demos.slice(0, BUILDER_MIN_COUNT);
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[useBuilderProducts]", { isBuilder, realProducts: realProducts.length, active: active.length, demos: demos.length, result: result.length });
    }
    return result;
  }, [realProducts, isBuilder, demoData?.products]);
}

export function useBuilderCategories(realCategories: CategoryData[]): CategoryData[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realCategories;
    const active = realCategories.filter((c) => c.active);
    if (active.length >= BUILDER_MIN_COUNT) return active.slice(0, BUILDER_MIN_COUNT);
    const demos = demoData?.categories ?? DEMO_CATEGORIES;
    return padTo(active, demos, BUILDER_MIN_COUNT);
  }, [realCategories, isBuilder, demoData?.categories]);
}

export function useBuilderTestimonials(
  realTestimonials: DemoTestimonial[],
): DemoTestimonial[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realTestimonials;
    if (realTestimonials.length >= BUILDER_MIN_COUNT) return realTestimonials.slice(0, BUILDER_MIN_COUNT);
    const demos = demoData?.testimonials ?? DEMO_TESTIMONIALS;
    return padTo(realTestimonials, demos, BUILDER_MIN_COUNT);
  }, [realTestimonials, isBuilder, demoData?.testimonials]);
}

export function useBuilderBlogs(realBlogs: DemoBlog[]): DemoBlog[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realBlogs;
    if (realBlogs.length >= BUILDER_MIN_COUNT) return realBlogs.slice(0, BUILDER_MIN_COUNT);
    const demos = demoData?.blogs ?? DEMO_BLOGS;
    return padTo(realBlogs, demos, BUILDER_MIN_COUNT);
  }, [realBlogs, isBuilder, demoData?.blogs]);
}

export function useBuilderCollections(
  realCollections: DemoCollection[],
): DemoCollection[] {
  const isBuilder = useIsBuilder();
  const demoData = useBuilderDemoData();
  return useMemo(() => {
    if (!isBuilder) return realCollections;
    if (realCollections.length >= BUILDER_MIN_COUNT) return realCollections.slice(0, BUILDER_MIN_COUNT);
    const demos = demoData?.collections ?? DEMO_COLLECTIONS;
    return padTo(realCollections, demos, BUILDER_MIN_COUNT);
  }, [realCollections, isBuilder, demoData?.collections]);
}
