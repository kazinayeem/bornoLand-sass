"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
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

export type BuilderDemoData = {
  products: ProductData[];
  categories: CategoryData[];
  testimonials: DemoTestimonial[];
  blogs: DemoBlog[];
  collections: DemoCollection[];
};

const BuilderDemoDataContext = createContext<BuilderDemoData | null>(null);

export function BuilderDemoDataProvider({ children }: { children: ReactNode }) {
  const value = useMemo<BuilderDemoData>(
    () => ({
      products: DEMO_PRODUCTS,
      categories: DEMO_CATEGORIES,
      testimonials: DEMO_TESTIMONIALS,
      blogs: DEMO_BLOGS,
      collections: DEMO_COLLECTIONS,
    }),
    [],
  );
  return (
    <BuilderDemoDataContext.Provider value={value}>
      {children}
    </BuilderDemoDataContext.Provider>
  );
}

export function useBuilderDemoData(): BuilderDemoData | null {
  return useContext(BuilderDemoDataContext);
}
