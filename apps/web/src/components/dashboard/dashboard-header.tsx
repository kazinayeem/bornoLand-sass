"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  ChevronRight,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Calculator,
  Receipt,
  Settings,
  Bell,
  ShieldCheck,
  ScrollText,
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
import { LanguageSwitcher } from "@/components/user/language-switcher";
import { Button } from "@/components/ui/button";
import {
  useIsStoreOwner,
  usePermissions,
  checkPermission,
} from "@/features/session/hooks";
import {
  useGetStoreFeatureAccessQuery,
  getFeatureByKey,
} from "@/redux/api/feature-api";
import { useStoreContext } from "@/providers/store-context";

type QuickAction = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  disabled?: boolean;
};

type SearchResult = {
  label: string;
  sub: string;
  href: string;
  type: string;
  category?: string;
};

const workspaceRouteLabels: Record<string, string> = {
  "/dashboard": "Platform Dashboard",
  "/workshops": "Merchant Workspace",
  "/workshops/stores/create": "Create Store",
  "/workshops/stores/archived": "Archived Stores",
  "/workshops/plans": "Plans & Features",
  "/workshops/billing": "Billing & Invoices",
  "/workshops/team": "Workspace Team",
  "/workshops/account": "Account Settings",
  "/workshops/settings": "Account Settings",
  "/workshops/security": "Security & Sessions",
  "/workshops/activity": "Activity Log",
  "/workshops/notifications": "Notifications",
  "/workshops/help": "Help & Support",
  "/workshops/analytics/visitors": "Visitor Analytics",
  "/workshops/analytics/live": "Live Visitors",
  "/workshops/analytics/sources": "Traffic Sources",
  "/workshops/analytics/reports": "Performance Reports",
  // Legacy /dashboard mappings
  "/dashboard/stores": "All Stores",
  "/dashboard/create-store": "Create Store",
  "/dashboard/stores/create": "Create Store",
  "/dashboard/stores/archived": "Archived Stores",
  "/dashboard/plans": "Plans & Features",
  "/dashboard/billing": "Billing & Invoices",
  "/dashboard/team": "Workspace Team",
  "/dashboard/account": "Account Settings",
  "/dashboard/security": "Security & Sessions",
  "/dashboard/activity": "Activity Log",
  "/dashboard/orders": "Orders",
  "/dashboard/products": "Products",
  "/dashboard/categories": "Categories",
  "/dashboard/cms": "CMS Pages",
  "/dashboard/settings": "Settings",
  "/dashboard/notifications": "Notifications",
  "/dashboard/help": "Help & Support",
  "/dashboard/subscription": "Subscription",
  "/dashboard/theme": "Theme Design",
  "/dashboard/analytics": "Analytics",
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

  const workspaceQuickActions: QuickAction[] = [
    { label: "New Store", href: "/workshops/stores/create", icon: Store },
    { label: "Invite Member", href: "/workshops/team", icon: UserPlus },
    { label: "Upgrade Plan", href: "/workshops/billing", icon: CreditCard },
  ];

  const pageTitle =
    workspaceRouteLabels[pathname] ??
    (pathname.startsWith("/workshops/stores/") || pathname.startsWith("/dashboard/stores/")
      ? "Store Details"
      : titleCase(pathname.split("/").filter(Boolean).slice(-1)[0] ?? "workspace"));

  const contextTitle =
    currentStore.initialized && currentStore.storeName
      ? currentStore.storeName
      : "Merchant Workspace";

  const segments = pathname.split("/").filter(Boolean);
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
      category: "Stores",
    })),
    { label: "All Stores", sub: "Workspace", href: "/workshops", type: "Page", category: "Navigation" },
    { label: "Create Store", sub: "Workspace", href: "/workshops/stores/create", type: "Page", category: "Navigation" },
    { label: "Billing & Invoices", sub: "Workspace", href: "/workshops/billing", type: "Page", category: "Navigation" },
    { label: "Plans & Features", sub: "Workspace", href: "/workshops/plans", type: "Page", category: "Navigation" },
    { label: "Workspace Team", sub: "Workspace", href: "/workshops/team", type: "Page", category: "Navigation" },
    { label: "Notifications", sub: "Workspace", href: "/workshops/notifications", type: "Page", category: "Navigation" },
    { label: "Account Settings", sub: "Workspace", href: "/workshops/account", type: "Page", category: "Navigation" },
    { label: "Security & Sessions", sub: "Workspace", href: "/workshops/security", type: "Page", category: "Navigation" },
  ];

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={workspaceQuickActions}
      searchResults={searchResults}
      searchPlaceholder="Search workspace... ⌘K"
      useWorkspaceMobileSidebar
      breadcrumb={
        <>
          <li className="text-zinc-500 font-medium">{contextTitle}</li>
          {breadcrumbs.map((item, index) => (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-zinc-400" aria-hidden />
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{item.label}</span>
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

  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();
  const storeContext = useStoreContext();
  const contextFeatures = (storeContext.features as { features?: any[] } | null)?.features;

  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id, {
    skip: !store._id || Boolean(contextFeatures && contextFeatures.length > 0),
  });
  const features = contextFeatures ?? accessData?.data?.features ?? [];

  const checkAccess = useCallback(
    (permission?: string, featureKey?: string) => {
      const hasPerm = isOwner || !permission || checkPermission(permissionSet, permission);
      if (!hasPerm) return false;
      if (featureKey) {
        const feat = getFeatureByKey(features, featureKey);
        if (feat?.locked) return false;
      }
      return true;
    },
    [isOwner, permissionSet, features]
  );

  const storeBase = `/store/${store.slug}`;
  const dashboardHref = `${storeBase}/dashboard`;

  const { pageTitle, breadcrumbs, searchResults } = useMemo(() => {
    const defaultDashTitle = "Dashboard";
    const crumbs = [{ label: defaultDashTitle, href: dashboardHref }] as Array<{
      label: string;
      href?: string;
    }>;
    let title = defaultDashTitle;

    if (pathname.startsWith(`${storeBase}/products/new`)) {
      title = "Add New Product";
      crumbs.push({ label: "Products", href: `${storeBase}/products` }, { label: "New Product" });
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
        cms: "CMS Pages",
        "customer-messages": "Customer Messages",
        pages: "Pages",
        media: "Media Library",
        theme: "Theme & Design",
        design: "Theme & Design",
        settings: "Settings",
        analytics: "Analytics",
        categories: "Categories",
        inventory: "Inventory & Stock",
        reviews: "Reviews & Ratings",
        coupons: "Coupons & Discounts",
        reports: "Business Reports",
        marketing: "Marketing Campaigns",
        billing: "Plan & Billing",
        builder: "Storefront Builder",
        appearance: "Appearance",
        apps: "Apps & Integrations",
        activity: "Activity Audit Log",
        hrm: "People & HRM",
        employees: "Employees Directory",
        attendance: "Attendance & Shifts",
        leaves: "Leave Management",
        payroll: "Payroll & Payslips",
        finance: "Finance & Accounting",
        accounting: "General Ledger",
        expenses: "Business Expenses",
        crm: "CRM & Sales",
        support: "Support Tickets",
        operations: "Operations",
        tasks: "Task Board",
        approvals: "Approval Center",
        pos: "Point of Sale (POS)",
        notifications: "Notifications",
      };
      title = labels[segment] || titleCase(segment);
      crumbs.push({ label: title });
    }

    const pageType = "Page";
    const potentialResults: Array<{
      label: string;
      sub: string;
      href: string;
      type: string;
      category?: string;
      permission?: string;
      featureKey?: string;
    }> = [
      { label: "Dashboard", sub: store.name, href: dashboardHref, type: pageType, category: "Core" },
      { label: "Products", sub: store.name, href: `${storeBase}/products`, type: pageType, category: "Commerce", permission: "products:read" },
      { label: "Categories", sub: store.name, href: `${storeBase}/categories`, type: pageType, category: "Commerce", permission: "categories:read" },
      { label: "Orders", sub: store.name, href: `${storeBase}/orders`, type: pageType, category: "Commerce", permission: "orders:read" },
      { label: "Customers", sub: store.name, href: `${storeBase}/customers`, type: pageType, category: "Commerce", permission: "customers:read" },
      { label: "Inventory & Stock", sub: store.name, href: `${storeBase}/inventory`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: "Waste & Loss", sub: store.name, href: `${storeBase}/inventory/waste`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: "Stock Ledger", sub: store.name, href: `${storeBase}/inventory/ledger`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: "Warehouses", sub: store.name, href: `${storeBase}/inventory/warehouses`, type: pageType, category: "Inventory", permission: "warehouse:read", featureKey: "warehouses" },
      { label: "Purchase Orders", sub: store.name, href: `${storeBase}/inventory/purchasing`, type: pageType, category: "Purchasing", permission: "procurement:read", featureKey: "purchase_orders" },
      { label: "Suppliers Master", sub: store.name, href: `${storeBase}/inventory/suppliers`, type: pageType, category: "Purchasing", permission: "procurement:read", featureKey: "suppliers" },
      { label: "POS Terminal", sub: store.name, href: `${storeBase}/pos`, type: pageType, category: "POS", permission: "pos:read", featureKey: "pos" },
      { label: "POS Shifts & Registers", sub: store.name, href: `${storeBase}/pos/shifts`, type: pageType, category: "POS", permission: "pos:read", featureKey: "pos" },
      { label: "Employees Directory", sub: store.name, href: `${storeBase}/hrm/employees`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "employees" },
      { label: "Attendance & Shifts", sub: store.name, href: `${storeBase}/hrm/attendance`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "attendance" },
      { label: "Leave Management", sub: store.name, href: `${storeBase}/hrm/leaves`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "leave_mgmt" },
      { label: "Payroll & Payslips", sub: store.name, href: `${storeBase}/hrm/payroll`, type: pageType, category: "HRM", permission: "hrm:payroll:manage", featureKey: "payroll" },
      { label: "Accounting Overview", sub: store.name, href: `${storeBase}/finance/accounting`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "chart_of_accounts" },
      { label: "Chart of Accounts", sub: store.name, href: `${storeBase}/finance/accounting/coa`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "chart_of_accounts" },
      { label: "Journal Entries", sub: store.name, href: `${storeBase}/finance/accounting/journal`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "journal_entries" },
      { label: "Business Expenses", sub: store.name, href: `${storeBase}/finance/expenses`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "expenses" },
      { label: "Financial Reports", sub: store.name, href: `${storeBase}/finance/reports`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "financial_reports" },
      { label: "CRM Pipeline", sub: store.name, href: `${storeBase}/crm/deals`, type: pageType, category: "Growth", permission: "crm:read", featureKey: "crm_deals" },
      { label: "Support Tickets", sub: store.name, href: `${storeBase}/support/tickets`, type: pageType, category: "Growth", permission: "support:read", featureKey: "support_tickets" },
      { label: "Approval Center", sub: store.name, href: `${storeBase}/operations/approvals`, type: pageType, category: "Operations", permission: "operations:read", featureKey: "approvals" },
      { label: "Tasks & Workflows", sub: store.name, href: `${storeBase}/operations/tasks`, type: pageType, category: "Operations", permission: "operations:read", featureKey: "tasks" },
      { label: "Analytics Overview", sub: store.name, href: `${storeBase}/analytics`, type: pageType, category: "Analytics", permission: "analytics:read", featureKey: "analytics" },
      { label: "Store Settings", sub: store.name, href: `${storeBase}/settings`, type: pageType, category: "Settings", permission: "settings:read" },
      { label: "Plan & Billing", sub: store.name, href: `${storeBase}/billing`, type: pageType, category: "Billing" },
      { label: "Theme & Design", sub: store.name, href: `${storeBase}/design`, type: pageType, category: "Storefront", permission: "pages:read" },
      { label: "Notifications", sub: store.name, href: `${storeBase}/notifications`, type: pageType, category: "Core" },
    ];

    const results: SearchResult[] = potentialResults
      .filter((item) => checkAccess(item.permission, item.featureKey))
      .map(({ permission, featureKey, ...rest }) => rest);

    return { pageTitle: title, breadcrumbs: crumbs, searchResults: results };
  }, [pathname, store, dashboardHref, storeBase, productName, checkAccess]);

  // Permission-aware Quick Create Actions
  const quickActions: QuickAction[] = useMemo(() => {
    const list: QuickAction[] = [];

    if (checkAccess("products:read", "products")) {
      list.push({ label: "New Product", href: `${storeBase}/products/new`, icon: Package });
    }
    if (checkAccess("orders:read")) {
      list.push({ label: "View Orders", href: `${storeBase}/orders`, icon: ShoppingBag });
    }
    if (checkAccess("pos:read", "pos")) {
      list.push({ label: "POS Terminal", href: `${storeBase}/pos`, icon: Calculator });
    }
    if (checkAccess("procurement:read", "purchase_orders")) {
      list.push({ label: "New PO", href: `${storeBase}/inventory/purchasing`, icon: Boxes });
    }
    if (checkAccess("finance:read", "expenses")) {
      list.push({ label: "Record Expense", href: `${storeBase}/finance/expenses`, icon: Receipt });
    }
    if (checkAccess("hrm:read", "employees")) {
      list.push({ label: "Add Employee", href: `${storeBase}/hrm/employees`, icon: Users });
    }
    if (checkAccess("settings:read")) {
      list.push({ label: "Store Settings", href: `${storeBase}/settings`, icon: Settings });
    }

    return list;
  }, [checkAccess, storeBase]);

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={quickActions}
      searchResults={searchResults}
      searchPlaceholder="Search store pages... ⌘K"
      onMenuClick={onMenuClick}
      compactNotifications
      showWorkspaceSwitcher={false}
      breadcrumb={
        <>
          <li className="inline-flex items-center gap-1">
            <Link href="/workshops" className="transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Workspace
            </Link>
          </li>
          <li className="inline-flex items-center">
            <ChevronRight className="h-3 w-3 text-zinc-400" aria-hidden />
          </li>
          {breadcrumbs.map((item, index) => (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="h-3 w-3 text-zinc-400" aria-hidden /> : null}
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-zinc-900 dark:hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{item.label}</span>
              )}
            </li>
          ))}
        </>
      }
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
  showWorkspaceSwitcher = false,
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
  const quickRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const filteredResults = useMemo(() => {
    if (!query) return searchResults.slice(0, 12);
    const q = query.toLowerCase();
    return searchResults.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sub.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [searchResults, query]);

  const handleSelect = useCallback(
    (href: string) => {
      setSearchOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setQuickOpen(false);
      }
    }
    if (quickOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quickOpen]);

  const openMobileSidebar = () => {
    if (useWorkspaceMobileSidebar) {
      dispatch(toggleMobileSidebar());
      return;
    }
    onMenuClick?.();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 lg:hidden hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {breadcrumb}
              </ol>
            </nav>
          </div>
        </div>

        {/* Right: Search, Quick Create, Language, Notifications, Account */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* Desktop Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-8.5 w-48 items-center gap-2 rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-2.5 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 md:inline-flex lg:w-56 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
            <span className="flex-1 text-left truncate">{searchPlaceholder}</span>
            <kbd className="flex h-4.5 items-center gap-0.5 rounded border border-zinc-200 bg-white px-1 text-[10px] font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              <Command className="h-2.5 w-2.5" aria-hidden />K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-zinc-600 md:hidden hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            aria-label={searchPlaceholder}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Language Selector */}
          <LanguageSwitcher compact />

          {/* Quick Create Button + Popover */}
          {quickActions.length > 0 && (
            <div ref={quickRef} className="relative">
              <Button
                type="button"
                onClick={() => setQuickOpen((open) => !open)}
                aria-expanded={quickOpen}
                aria-haspopup="menu"
                className="h-8.5 rounded-lg px-2.5 text-xs font-semibold shadow-2xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                <span className="hidden sm:inline">Create</span>
              </Button>

              {quickOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 animate-in fade-in-50 zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Quick Actions
                  </div>
                  <div className="space-y-0.5">
                    {quickActions.map((action) =>
                      action.disabled ? (
                        <span
                          key={action.label}
                          role="menuitem"
                          aria-disabled="true"
                          className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed"
                        >
                          <action.icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                          {action.label}
                        </span>
                      ) : (
                        <Link
                          key={action.label}
                          href={action.href}
                          role="menuitem"
                          onClick={() => setQuickOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                        >
                          <action.icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} aria-hidden />
                          <span>{action.label}</span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <NotificationDropdown compact={compactNotifications} />

          {/* Workspace Switcher if enabled */}
          {showWorkspaceSwitcher && (
            <div className="hidden w-40 sm:block xl:w-44">
              <WorkspaceSwitcher />
            </div>
          )}

          {/* Account Profile Dropdown */}
          <ProfileDropdown compact />
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-16 sm:pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <div className="flex items-center gap-3 border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 font-medium"
                  autoFocus
                />
                <kbd className="hidden h-5 items-center rounded border border-zinc-200 bg-zinc-100 px-1.5 text-[10px] font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:flex">
                  ESC
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
                {filteredResults.length === 0 ? (
                  <p className="px-3 py-8 text-center text-xs text-zinc-400">
                    No results found
                  </p>
                ) : (
                  filteredResults.map((item) => (
                    <button
                      key={`${item.href}-${item.label}`}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.sub}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0 font-mono">
                        {item.category || item.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
