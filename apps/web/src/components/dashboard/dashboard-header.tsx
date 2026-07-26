"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  Search,
  Command,
  Menu,
  Plus,
  Store,
  UserPlus,
  CreditCard,
  Upload,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleMobileSidebar } from "@/redux/slices/ui-slice";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import type { Store as StoreType } from "@/redux/api/store-api";
import { useGetProductQuery } from "@/redux/api/product-api";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { ProfileDropdown } from "@/components/user/profile-dropdown";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuickAction = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

type SearchResult = {
  label: string;
  sub: string;
  href: string;
  type: string;
};

const workspaceQuickActions: QuickAction[] = [
  { label: "New Store", href: "/dashboard/stores/create", icon: Store },
  { label: "Import Store", href: "/dashboard/stores", icon: Upload, disabled: true },
  { label: "Invite Member", href: "/dashboard/team", icon: UserPlus },
  { label: "Upgrade Plan", href: "/dashboard/billing", icon: CreditCard },
];

const workspaceRouteLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/stores": "Stores",
  "/dashboard/stores/create": "Create Store",
  "/dashboard/stores/archived": "Archived Stores",
  "/dashboard/billing": "Billing",
  "/dashboard/team": "Team",
  "/dashboard/account": "Account",
  "/dashboard/security": "Security",
  "/dashboard/activity": "Activity Log",
  "/dashboard/orders": "Orders",
  "/dashboard/products": "Products",
  "/dashboard/categories": "Categories",
  "/dashboard/cms": "CMS",
  "/dashboard/settings": "Settings",
  "/dashboard/notifications": "Notifications",
  "/dashboard/help": "Help",
  "/dashboard/subscription": "Subscription",
  "/dashboard/theme": "Theme",
  "/dashboard/analytics/visitors": "Visitors",
  "/dashboard/analytics/live": "Live Visitors",
  "/dashboard/analytics/sources": "Traffic Sources",
  "/dashboard/analytics/reports": "Reports",
};

function titleCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

type DashboardHeaderProps =
  | { mode?: "workspace" }
  | { mode: "store"; store: StoreType; onMenuClick?: () => void };

export function DashboardHeader(props: DashboardHeaderProps = {}) {
  if (props.mode === "store") {
    return <StoreDashboardHeader store={props.store} onMenuClick={props.onMenuClick} />;
  }
  return <WorkspaceDashboardHeader />;
}

function WorkspaceDashboardHeader() {
  const pathname = usePathname();
  const currentStore = useAppSelector((s) => s.currentStore);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const segments = pathname.split("/").filter(Boolean);
  const pageTitle =
    workspaceRouteLabels[pathname] ??
    (pathname.startsWith("/dashboard/stores/")
      ? "Store Details"
      : segments.length > 1
        ? titleCase(segments[segments.length - 1] ?? "Dashboard")
        : "Dashboard");

  const contextTitle =
    currentStore.initialized && currentStore.storeName ? currentStore.storeName : "Workspace";

  const breadcrumbs = segments.map((segment, index) => ({
    label: titleCase(segment),
    href: index < segments.length - 1 ? `/${segments.slice(0, index + 1).join("/")}` : undefined,
  }));

  const searchResults: SearchResult[] = [
    ...stores.map((s) => ({
      label: s.name,
      sub: s.slug,
      href: `/store/${s.slug}/dashboard`,
      type: "Store",
    })),
    { label: "All Stores", sub: "Workspace", href: "/dashboard/stores", type: "Page" },
    { label: "Create Store", sub: "Workspace", href: "/dashboard/stores/create", type: "Page" },
    { label: "Billing", sub: "Workspace", href: "/dashboard/billing", type: "Page" },
    { label: "Team", sub: "Workspace", href: "/dashboard/team", type: "Page" },
    { label: "Settings", sub: "Workspace", href: "/dashboard/account", type: "Page" },
  ];

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={workspaceQuickActions}
      searchResults={searchResults}
      searchPlaceholder="Search stores, pages..."
      useWorkspaceMobileSidebar
      breadcrumb={
        <>
          <li className="text-muted-foreground">{contextTitle}</li>
          {breadcrumbs.map((item, index) => (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
              <span aria-hidden className="text-muted-foreground">
                /
              </span>
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </>
      }
    />
  );
}

function StoreDashboardHeader({
  store,
  onMenuClick,
}: {
  store: StoreType;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const productId = typeof params.productId === "string" ? params.productId : "";
  const { data: productData } = useGetProductQuery(productId, { skip: !productId });
  const productName = productData?.data?.product?.name;

  const storeBase = `/store/${store.slug}`;
  const dashboardHref = `${storeBase}/dashboard`;

  const { pageTitle, breadcrumbs, searchResults } = useMemo(() => {
    const crumbs = [{ label: "Dashboard", href: dashboardHref }] as Array<{
      label: string;
      href?: string;
    }>;
    let title = "Dashboard";

    if (pathname.startsWith(`${storeBase}/products/new`)) {
      title = "Create Product";
      crumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: "Create Product" });
    } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/edit")) {
      title = productName || "Edit Product";
      crumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: title });
    } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/duplicate")) {
      title = productName ? `Duplicate ${productName}` : "Duplicate Product";
      crumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: title });
    } else if (pathname !== dashboardHref && !pathname.match(new RegExp(`^/store/${store.slug}/?$`))) {
      const segment = pathname.replace(`${storeBase}/`, "").split("/")[0] || "dashboard";
      const labels: Record<string, string> = {
        dashboard: "Dashboard",
        products: "Products",
        orders: "Orders",
        customers: "Customers",
        cms: "CMS",
        "customer-messages": "Customer Messages",
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
        appearance: "Appearance",
        apps: "Apps",
        activity: "Activity",
      };
      title = labels[segment] ?? titleCase(segment);
      crumbs.push({ label: title });
    }

    const results: SearchResult[] = [
      { label: "Dashboard", sub: store.name, href: dashboardHref, type: "Page" },
      { label: "Products", sub: store.name, href: `${storeBase}/products`, type: "Page" },
      { label: "Orders", sub: store.name, href: `${storeBase}/orders`, type: "Page" },
      { label: "Customers", sub: store.name, href: `${storeBase}/customers`, type: "Page" },
      { label: "Analytics", sub: store.name, href: `${storeBase}/analytics`, type: "Page" },
      { label: "Marketing", sub: store.name, href: `${storeBase}/marketing`, type: "Page" },
      { label: "Media", sub: store.name, href: `${storeBase}/media`, type: "Page" },
      { label: "Settings", sub: store.name, href: `${storeBase}/settings`, type: "Page" },
      { label: "Billing", sub: store.name, href: `${storeBase}/billing`, type: "Page" },
      { label: "Themes", sub: store.name, href: `${storeBase}/theme`, type: "Page" },
      { label: "Apps", sub: store.name, href: `${storeBase}/apps`, type: "Page" },
      { label: "Domain", sub: store.name, href: `${storeBase}/appearance/domain`, type: "Page" },
    ];

    return { pageTitle: title, breadcrumbs: crumbs, searchResults: results };
  }, [pathname, store, dashboardHref, storeBase, productName]);

  const quickActions: QuickAction[] = [
    { label: "New Product", href: `${storeBase}/products/new`, icon: Package },
    { label: "Orders", href: `${storeBase}/orders`, icon: ShoppingBag },
    { label: "All Stores", href: "/dashboard/stores", icon: Store },
    { label: "Billing", href: `${storeBase}/billing`, icon: CreditCard },
  ];

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={quickActions}
      searchResults={searchResults}
      searchPlaceholder="Search store pages..."
      onMenuClick={onMenuClick}
      compactNotifications
      showWorkspaceSwitcher
      breadcrumb={breadcrumbs.map((item, index) => (
        <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden /> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </li>
      ))}
    />
  );
}

function DashboardHeaderChrome({
  pageTitle,
  breadcrumb,
  quickActions,
  searchResults,
  searchPlaceholder,
  onMenuClick,
  useWorkspaceMobileSidebar = false,
  compactNotifications = false,
  showWorkspaceSwitcher = true,
}: {
  pageTitle: string;
  breadcrumb: React.ReactNode;
  quickActions: QuickAction[];
  searchResults: SearchResult[];
  searchPlaceholder: string;
  onMenuClick?: () => void;
  useWorkspaceMobileSidebar?: boolean;
  compactNotifications?: boolean;
  showWorkspaceSwitcher?: boolean;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredResults = searchResults.filter(
    (item) =>
      !query ||
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.sub.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = useCallback(
    (href: string) => {
      setSearchOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openMobileSidebar = () => {
    if (useWorkspaceMobileSidebar) {
      dispatch(toggleMobileSidebar());
      return;
    }
    onMenuClick?.();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{pageTitle}</h1>
            <nav aria-label="Breadcrumb" className="mt-0.5 hidden sm:block">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">{breadcrumb}</ol>
            </nav>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-52 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card sm:inline-flex lg:w-64"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded border border-border bg-card px-1.5 text-[10px] font-semibold text-muted-foreground">
              <Command className="h-2.5 w-2.5" aria-hidden />K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground sm:hidden hover:bg-muted"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="relative">
            <Button
              type="button"
              onClick={() => setQuickOpen((open) => !open)}
              aria-expanded={quickOpen}
              aria-haspopup="menu"
              className="h-9 rounded-full px-3.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Quick Create</span>
            </Button>
            {quickOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickOpen(false)}
                  aria-label="Close menu"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-border bg-popover py-1.5 shadow-xl text-popover-foreground"
                >
                  {quickActions.map((action) =>
                    action.disabled ? (
                      <span
                        key={action.label}
                        role="menuitem"
                        aria-disabled="true"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-muted-foreground/50"
                      >
                        <action.icon className="h-4 w-4" aria-hidden />
                        {action.label}
                      </span>
                    ) : (
                      <Link
                        key={action.label}
                        href={action.href}
                        role="menuitem"
                        onClick={() => setQuickOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <action.icon className="h-4 w-4 text-primary" aria-hidden />
                        {action.label}
                      </Link>
                    ),
                  )}
                </div>
              </>
            ) : null}
          </div>

          <NotificationDropdown compact={compactNotifications} />
          {showWorkspaceSwitcher ? (
            <div className="hidden w-44 sm:block xl:w-48">
              <WorkspaceSwitcher />
            </div>
          ) : null}
          <ProfileDropdown />
        </div>
      </header>

      <AnimatePresence>
        {searchOpen ? (
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground sm:flex">
                  ESC
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {filteredResults.length === 0 ? (
                  <p className="px-3 py-8 text-center text-xs text-muted-foreground">No results found</p>
                ) : (
                  filteredResults.map((item) => (
                    <button
                      key={`${item.href}-${item.label}`}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
