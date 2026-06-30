"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Bell, ChevronRight, Search } from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { useGetProductQuery } from "@/redux/api/product-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";

function titleCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StoreNavbar({ store }: { store: Store }) {
  const pathname = usePathname();
  const params = useParams();
  const productId = typeof params.productId === "string" ? params.productId : "";
  const { data: productData } = useGetProductQuery(productId, { skip: !productId });
  const productName = productData?.data?.product?.name;
  const storeBase = `/store/${store.slug}`;
  const dashboardHref = `${storeBase}/dashboard`;
  const breadcrumbs = [{ label: "Dashboard", href: dashboardHref }] as Array<{ label: string; href?: string }>;
  let pageTitle = "Dashboard";

  if (pathname.startsWith(`${storeBase}/products/new`)) {
    pageTitle = "Create Product";
    breadcrumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: "Create Product" });
  } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/edit")) {
    pageTitle = productName || "Edit Product";
    breadcrumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: pageTitle });
  } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/duplicate")) {
    pageTitle = productName ? `Duplicate ${productName}` : "Duplicate Product";
    breadcrumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: pageTitle });
  } else if (pathname !== dashboardHref && !pathname.match(new RegExp(`^/store/${store.slug}/?$`))) {
    const segment = pathname.replace(`${storeBase}/`, "").split("/")[0] || "dashboard";
    const labels: Record<string, string> = {
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      customers: "Customers",
      cms: "CMS",
      pages: "Pages",
      media: "Media Library",
      theme: "Theme",
      settings: "Settings",
      analytics: "Analytics",
      categories: "Categories",
      inventory: "Inventory",
      reviews: "Reviews",
      coupons: "Coupons",
      reports: "Reports",
      marketing: "Marketing",
      billing: "Billing",
      builder: "Builder",
      appearance: "Theme",
    };
    pageTitle = labels[segment] ?? titleCase(segment);
    breadcrumbs.push({ label: pageTitle });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StoreBrandMark store={store} size={28} roundedClassName="rounded-lg" />
            <p className="truncate text-xs font-medium uppercase tracking-wider text-zinc-400">{store.shortName || store.name}</p>
          </div>
          <h1 className="truncate text-lg font-semibold text-zinc-900">{pageTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-zinc-500">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-zinc-700">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            Search store...
          </button>
          <Link
            href="/dashboard/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <div className="hidden w-48 xl:block">
            <WorkspaceSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
