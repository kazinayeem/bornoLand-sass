"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Layers, ShoppingBag } from "lucide-react";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";

type CategoryItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  parentId?: string | null;
};

type CategoryPageClientProps = {
  slugs: string[];
};

export function CategoryPageClient({ slugs }: CategoryPageClientProps) {
  const { categories, store } = useTenant();
  const catList = (categories ?? []) as CategoryItem[];

  // Resolve hierarchy from slug segments
  const hierarchy = useMemo(() => {
    const chain: CategoryItem[] = [];
    for (const s of slugs) {
      const match = catList.find((c) => c.slug.toLowerCase() === s.toLowerCase());
      if (match) chain.push(match);
    }
    return chain;
  }, [slugs, catList]);

  const currentCategory = hierarchy[hierarchy.length - 1] ?? catList.find((c) => c.slug.toLowerCase() === slugs[slugs.length - 1]?.toLowerCase());

  // Find subcategories of current category
  const subcategories = useMemo(() => {
    if (!currentCategory) return [];
    return catList.filter((c) => String(c.parentId) === String(currentCategory._id));
  }, [catList, currentCategory]);

  const categoryName = currentCategory?.name ?? slugs[slugs.length - 1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Category";
  const categoryDescription = currentCategory?.description ?? "Browse our curated collection in this category";

  return (
    <StorefrontPage>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <Link href="/categories" className="hover:text-zinc-900 transition-colors">
            Categories
          </Link>
          {hierarchy.map((cat, idx) => {
            const isLast = idx === hierarchy.length - 1;
            const path = "/category/" + hierarchy.slice(0, idx + 1).map((c) => c.slug).join("/");
            return (
              <span key={cat._id} className="inline-flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                {isLast ? (
                  <span className="font-semibold text-zinc-900">{cat.name}</span>
                ) : (
                  <Link href={path} className="hover:text-zinc-900 transition-colors">
                    {cat.name}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {/* Category Hero / Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 sm:p-12 text-white shadow-lg mb-8">
          {currentCategory?.bannerUrl || currentCategory?.imageUrl ? (
            <div className="absolute inset-0 z-0 opacity-30">
              <SmartImage
                src={currentCategory.bannerUrl || currentCategory.imageUrl || ""}
                alt={categoryName}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3 text-white/90">
              <Layers className="h-3.5 w-3.5" />
              <span>Category</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {categoryName}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
              {categoryDescription}
            </p>
          </div>
        </div>

        {/* Subcategories Filter Chips */}
        {subcategories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3.5">
              Explore Subcategories
            </h3>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {subcategories.map((sub) => {
                const subPath = `/category/${slugs.join("/")}/${sub.slug}`;
                return (
                  <Link
                    key={sub._id}
                    href={subPath}
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-800 shadow-sm transition-all hover:border-zinc-900 hover:shadow active:scale-95 shrink-0"
                  >
                    {sub.imageUrl && (
                      <span className="relative h-5 w-5 overflow-hidden rounded-full">
                        <SmartImage src={sub.imageUrl} alt={sub.name} fill className="object-cover" />
                      </span>
                    )}
                    <span>{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <StorefrontProductGrid
          title="Products"
          subtitle={`Showing all products in ${categoryName}`}
          productCount={12}
          gridColumns="4"
          tabletColumns="2"
          mobileColumns="2"
          showSort
          showPagination
          allowRowsPerPage
        />
      </div>
    </StorefrontPage>
  );
}
