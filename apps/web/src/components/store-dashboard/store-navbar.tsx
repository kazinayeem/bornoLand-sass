"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight, Search, Command } from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { useGetProductQuery } from "@/redux/api/product-api";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { ProfileDropdown } from "@/components/user/profile-dropdown";

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
    <header className="sticky top-0 z-30 hidden border-b border-apple-hairline bg-apple-canvas/80 px-8 py-4 backdrop-blur-xl lg:block">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-apple-ink">{pageTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-apple-ink-muted-48">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                {item.href ? (
                  <Link href={item.href} className="transition-colors hover:text-apple-ink-muted-80">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-apple-ink-muted-80">{item.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-sm border border-apple-hairline bg-apple-canvas-parchment/80 px-3 text-sm text-apple-ink-muted-48 transition-colors hover:border-apple-hairline hover:bg-apple-canvas sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-2 inline-flex items-center gap-0.5 rounded-sm border border-apple-hairline bg-apple-canvas px-1.5 py-0.5 text-[10px] font-medium text-apple-ink-muted-48">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
          <NotificationDropdown compact />
          <div className="hidden w-48 xl:block">
            <WorkspaceSwitcher />
          </div>
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
