"use client";

import { useMemo } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { useGetProductsQuery, useGetPublicProductsQuery, type Product } from "@/redux/api/product-api";
import { useIsBuilder } from "@/lib/device-context";
import { normalizeStoreId } from "@/hooks/use-store-categories";
import { useStoreCategories } from "@/hooks/use-store-categories";
import {
  buildProductSectionQueryArgs,
  resolveProductSectionDisplay,
  resolveProductSectionSource,
} from "@/lib/storefront/product-section-data";

type UseSectionProductsOptions = {
  sectionType: string;
  props: Record<string, string | undefined>;
  /** Skip fetching (e.g. product-grid manages its own paginated query) */
  skip?: boolean;
};

/**
 * Real catalog products for builder sections (featured-products, best-sellers, etc.).
 * Builder: authenticated GET /products/:storeId
 * Published storefront: GET /public/products (tenant-scoped)
 */
export function useSectionProducts({ sectionType, props, skip = false }: UseSectionProductsOptions) {
  const isBuilder = useIsBuilder();
  const { store } = useTenant();
  const storeId = normalizeStoreId(store?._id ?? (store as { id?: string } | undefined)?.id);
  const { categories } = useStoreCategories(storeId);

  const source = resolveProductSectionSource(sectionType, props.productSource);
  const limit = Math.min(Math.max(Number(props.productCount) || 8, 1), 48);
  const productSource = props.productSource;
  const productIds = props.productIds;
  const categorySlug = props.categorySlug;

  const queryArgs = useMemo(
    () =>
      buildProductSectionQueryArgs(source, {
        productCount: String(limit),
        categorySlug,
        productIds,
      }, categories),
    [source, limit, categorySlug, productIds, categories],
  );

  const liveQuery = useGetPublicProductsQuery(queryArgs, { skip: skip || isBuilder });
  const builderQuery = useGetProductsQuery(
    { storeId, ...queryArgs },
    { skip: skip || !isBuilder || !storeId },
  );

  const data = isBuilder ? builderQuery.data : liveQuery.data;
  const isLoading = isBuilder
    ? builderQuery.isLoading || builderQuery.isFetching
    : liveQuery.isLoading || liveQuery.isFetching;
  const isError = isBuilder ? builderQuery.isError : liveQuery.isError;

  const products = useMemo(() => {
    const rows = (data?.data?.products ?? []) as Product[];
    return resolveProductSectionDisplay(rows, {
      sectionType,
      productSource,
      productIds,
      limit,
    });
  }, [data, sectionType, productSource, productIds, limit]);

  return {
    products,
    categories,
    isLoading: isLoading && products.length === 0,
    isError: isError && products.length === 0,
  };
}
