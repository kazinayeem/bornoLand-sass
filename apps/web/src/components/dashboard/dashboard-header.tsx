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
import { LanguageSwitcher } from "@/components/user/language-switcher";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";

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

const workspaceRouteLabels: Record<string, { bn: string; en: string }> = {
  "/dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "/dashboard/stores": { bn: "সব দোকান", en: "All Stores" },
  "/dashboard/create-store": { bn: "দোকান তৈরি করুন", en: "Create Store" },
  "/dashboard/stores/create": { bn: "দোকান তৈরি করুন", en: "Create Store" },
  "/dashboard/stores/archived": { bn: "আর্কাইভকৃত দোকান", en: "Archived Stores" },
  "/dashboard/billing": { bn: "বিলিং", en: "Billing" },
  "/dashboard/team": { bn: "টিম", en: "Team" },
  "/dashboard/account": { bn: "প্রোফাইল সেটিংস", en: "Profile Settings" },
  "/dashboard/security": { bn: "নিরাপত্তা", en: "Security" },
  "/dashboard/activity": { bn: "কার্যক্রম লগ", en: "Activity Log" },
  "/dashboard/orders": { bn: "অর্ডারসমূহ", en: "Orders" },
  "/dashboard/products": { bn: "পণ্যসমূহ", en: "Products" },
  "/dashboard/categories": { bn: "ক্যাটাগরি", en: "Categories" },
  "/dashboard/cms": { bn: "CMS পেজ", en: "CMS Pages" },
  "/dashboard/settings": { bn: "সেটিংস", en: "Settings" },
  "/dashboard/notifications": { bn: "নোটিফিকেশন", en: "Notifications" },
  "/dashboard/help": { bn: "সহায়তা", en: "Help" },
  "/dashboard/subscription": { bn: "সাবস্ক্রিপশন", en: "Subscription" },
  "/dashboard/theme": { bn: "থিম ডিজাইন", en: "Theme" },
  "/dashboard/analytics": { bn: "অ্যানালিটিক্স", en: "Analytics" },
  "/dashboard/analytics/visitors": { bn: "ভিজিটর", en: "Visitors" },
  "/dashboard/analytics/live": { bn: "লাইভ ভিজিটর", en: "Live Visitors" },
  "/dashboard/analytics/sources": { bn: "ট্রাফিক সোর্স", en: "Traffic Sources" },
  "/dashboard/analytics/reports": { bn: "রিপোর্ট", en: "Reports" },
};

function titleCase(value: string, isBn: boolean) {
  const bnMap: Record<string, string> = {
    dashboard: "ড্যাশবোর্ড",
    stores: "দোকানসমূহ",
    create: "তৈরি করুন",
    billing: "বিলিং",
    team: "টিম",
    account: "অ্যাকাউন্ট",
    security: "নিরাপত্তা",
    activity: "কার্যক্রম",
    orders: "অর্ডার",
    products: "পণ্য",
    categories: "ক্যাটাগরি",
    cms: "CMS",
    settings: "সেটিংস",
    notifications: "নোটিফিকেশন",
    help: "সহায়তা",
    analytics: "অ্যানালিটিক্স",
  };
  if (isBn && bnMap[value.toLowerCase()]) return bnMap[value.toLowerCase()];
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
  const { language, t } = useLanguage();
  const currentStore = useAppSelector((s) => s.currentStore);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const workspaceQuickActions: QuickAction[] = [
    { label: t.header.newStore, href: "/dashboard/stores/create", icon: Store },
    { label: t.header.importStore, href: "/dashboard/stores", icon: Upload, disabled: true },
    { label: t.header.inviteMember, href: "/dashboard/team", icon: UserPlus },
    { label: t.header.upgradePlan, href: "/dashboard/billing", icon: CreditCard },
  ];

  const isBn = language === "bn";
  const routeObj = workspaceRouteLabels[pathname];
  const pageTitle =
    (routeObj ? routeObj[language] : undefined) ??
    (pathname.startsWith("/dashboard/stores/")
      ? isBn ? "দোকানের বিবরণ" : "Store Details"
      : titleCase(pathname.split("/").filter(Boolean).slice(-1)[0] ?? "dashboard", isBn));

  const contextTitle =
    currentStore.initialized && currentStore.storeName
      ? currentStore.storeName
      : t.navigation.workspace;

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => ({
    label: titleCase(segment, isBn),
    href: index < segments.length - 1 ? `/${segments.slice(0, index + 1).join("/")}` : undefined,
  }));

  const searchResults: SearchResult[] = [
    ...stores.map((s) => ({
      label: s.name,
      sub: s.slug,
      href: `/store/${s.slug}/dashboard`,
      type: isBn ? "দোকান" : "Store",
    })),
    { label: t.navigation.allStores, sub: t.navigation.workspace, href: "/dashboard/stores", type: isBn ? "পেজ" : "Page" },
    { label: t.navigation.createStore, sub: t.navigation.workspace, href: "/dashboard/stores/create", type: isBn ? "পেজ" : "Page" },
    { label: t.navigation.billing, sub: t.navigation.workspace, href: "/dashboard/billing", type: isBn ? "পেজ" : "Page" },
    { label: t.navigation.team, sub: t.navigation.workspace, href: "/dashboard/team", type: isBn ? "পেজ" : "Page" },
    { label: t.navigation.settings, sub: t.navigation.workspace, href: "/dashboard/settings", type: isBn ? "পেজ" : "Page" },
  ];

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={workspaceQuickActions}
      searchResults={searchResults}
      searchPlaceholder={t.header.searchPlaceholder}
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
  const { language, t } = useLanguage();
  const params = useParams();
  const productId = typeof params.productId === "string" ? params.productId : "";
  const { data: productData } = useGetProductQuery(productId, { skip: !productId });
  const productName = productData?.data?.product?.name;

  const storeBase = `/store/${store.slug}`;
  const dashboardHref = `${storeBase}/dashboard`;
  const isBn = language === "bn";

  const { pageTitle, breadcrumbs, searchResults } = useMemo(() => {
    const defaultDashTitle = t.navigation.dashboard;
    const crumbs = [{ label: defaultDashTitle, href: dashboardHref }] as Array<{
      label: string;
      href?: string;
    }>;
    let title = defaultDashTitle;

    if (pathname.startsWith(`${storeBase}/products/new`)) {
      title = isBn ? "নতুন পণ্য যোগ করুন" : "Add New Product";
      crumbs.push({ label: isBn ? "পণ্যসমূহ" : "Products", href: `${storeBase}/products` }, { label: isBn ? "নতুন পণ্য" : "New Product" });
    } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/edit")) {
      title = productName || (isBn ? "পণ্য এডিট করুন" : "Edit Product");
      crumbs.push({ label: isBn ? "পণ্যসমূহ" : "Products", href: `${storeBase}/products` }, { label: title });
    } else if (pathname.startsWith(`${storeBase}/products/`) && pathname.endsWith("/duplicate")) {
      title = productName ? (isBn ? `${productName} কপি করুন` : `Duplicate ${productName}`) : (isBn ? "পণ্য কপি" : "Duplicate Product");
      crumbs.push({ label: isBn ? "পণ্যসমূহ" : "Products", href: `${storeBase}/products` }, { label: title });
    } else if (pathname !== dashboardHref && !pathname.match(new RegExp(`^/store/${store.slug}/?$`))) {
      const segment = pathname.replace(`${storeBase}/`, "").split("/")[0] || "dashboard";
      const labels: Record<string, { bn: string; en: string }> = {
        dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
        products: { bn: "পণ্যসমূহ", en: "Products" },
        orders: { bn: "অর্ডারসমূহ", en: "Orders" },
        customers: { bn: "কাস্টমার", en: "Customers" },
        cms: { bn: "CMS পেজ", en: "CMS Pages" },
        "customer-messages": { bn: "মেসেজ", en: "Messages" },
        pages: { bn: "পেজসমূহ", en: "Pages" },
        media: { bn: "মিডিয়া লাইব্রেরি", en: "Media Library" },
        theme: { bn: "থিম", en: "Theme" },
        settings: { bn: "সেটিংস", en: "Settings" },
        analytics: { bn: "অ্যানালিটিক্স", en: "Analytics" },
        categories: { bn: "ক্যাটাগরি", en: "Categories" },
        inventory: { bn: "ইনভেন্টরি", en: "Inventory" },
        reviews: { bn: "রিভিউ", en: "Reviews" },
        coupons: { bn: "কুপন", en: "Coupons" },
        reports: { bn: "রিপোর্ট", en: "Reports" },
        marketing: { bn: "মার্কেটিং", en: "Marketing" },
        billing: { bn: "বিলিং", en: "Billing" },
        builder: { bn: "বিল্ডার", en: "Builder" },
        appearance: { bn: "অ্যাপিয়ারেন্স", en: "Appearance" },
        apps: { bn: "অ্যাপস", en: "Apps" },
        activity: { bn: "কার্যক্রম লগ", en: "Activity Log" },
        hrm: { bn: "কর্মী ও মানবসম্পদ (HRM)", en: "Human Resources (HRM)" },
        employees: { bn: "কর্মকর্তা-কর্মচারী", en: "Employees" },
        attendance: { bn: "হাজিরা", en: "Attendance" },
        leaves: { bn: "ছুটি ব্যবস্থাপনা", en: "Leaves" },
        payroll: { bn: "বেতন ও পে-রোল", en: "Payroll" },
        finance: { bn: "হিসাববিজ্ঞান ও অর্থায়ন", en: "Finance & Accounting" },
        accounting: { bn: "অ্যাকাউন্টিং", en: "Accounting" },
        expenses: { bn: "ব্যয় ও খরচ", en: "Expenses" },
        crm: { bn: "সিআরএম", en: "CRM" },
        support: { bn: "সাপোর্ট টিকিট", en: "Support Tickets" },
        operations: { bn: "অপারেশনস", en: "Operations" },
        tasks: { bn: "টাস্ক", en: "Tasks" },
        approvals: { bn: "অনুমোদন কেন্দ্র", en: "Approvals" },
        pos: { bn: "পয়েন্ট অব সেল (POS)", en: "Point of Sale" },
      };
      title = labels[segment] ? labels[segment][language] : titleCase(segment, isBn);
      crumbs.push({ label: title });
    }

    const pageType = isBn ? "পেজ" : "Page";
    const results: SearchResult[] = [
      { label: t.navigation.dashboard, sub: store.name, href: dashboardHref, type: pageType },
      { label: isBn ? "পণ্যসমূহ" : "Products", sub: store.name, href: `${storeBase}/products`, type: pageType },
      { label: isBn ? "ইনভেন্টরি ও স্টক" : "Inventory & Stock", sub: store.name, href: `${storeBase}/inventory`, type: pageType },
      { label: isBn ? "ক্ষয়ক্ষতি ও অপচয় (Waste)" : "Waste & Loss Tracker", sub: store.name, href: `${storeBase}/inventory/waste`, type: pageType },
      { label: isBn ? "স্টক মুভমেন্ট লেজার" : "Stock Movement Ledger", sub: store.name, href: `${storeBase}/inventory/ledger`, type: pageType },
      { label: isBn ? "মাল্টি-ওয়্যারহাউস" : "Warehouses", sub: store.name, href: `${storeBase}/inventory/warehouses`, type: pageType },
      { label: isBn ? "ক্রয় ও পারচেজ অর্ডার" : "Purchasing & POs", sub: store.name, href: `${storeBase}/inventory/purchasing`, type: pageType },
      { label: isBn ? "সরবরাহকারী (Suppliers)" : "Suppliers Master", sub: store.name, href: `${storeBase}/inventory/suppliers`, type: pageType },
      { label: isBn ? "অর্ডারসমূহ" : "Orders", sub: store.name, href: `${storeBase}/orders`, type: pageType },
      { label: isBn ? "পয়েন্ট অব সেল (POS)" : "POS Terminal", sub: store.name, href: `${storeBase}/pos`, type: pageType },
      { label: isBn ? "POS ক্যাশ রেজিস্টার ও শিফট" : "POS Register & Shifts", sub: store.name, href: `${storeBase}/pos/shifts`, type: pageType },
      { label: isBn ? "কাস্টমার মাস্টার" : "Customer Master", sub: store.name, href: `${storeBase}/customers`, type: pageType },
      { label: isBn ? "কর্মী ও এইচআরএম (HRM)" : "Employees Directory", sub: store.name, href: `${storeBase}/hrm/employees`, type: pageType },
      { label: isBn ? "হাজিরা ও ওভারটাইম" : "Attendance & Shifts", sub: store.name, href: `${storeBase}/hrm/attendance`, type: pageType },
      { label: isBn ? "ছুটি ব্যবস্থাপনা" : "Leave Management", sub: store.name, href: `${storeBase}/hrm/leaves`, type: pageType },
      { label: isBn ? "বেতন ও পে-রোল" : "Payroll & Payslips", sub: store.name, href: `${storeBase}/hrm/payroll`, type: pageType },
      { label: isBn ? "হিসাববিজ্ঞান (Accounting)" : "Accounting Dashboard", sub: store.name, href: `${storeBase}/finance/accounting`, type: pageType },
      { label: isBn ? "হিসাবের তালিকা (COA)" : "Chart of Accounts", sub: store.name, href: `${storeBase}/finance/accounting/coa`, type: pageType },
      { label: isBn ? "ডাবল-এন্ট্রি জার্নাল" : "Journal Entries", sub: store.name, href: `${storeBase}/finance/accounting/journal`, type: pageType },
      { label: isBn ? "ব্যয় ও খরচ (Expenses)" : "Business Expenses", sub: store.name, href: `${storeBase}/finance/expenses`, type: pageType },
      { label: isBn ? "আর্থিক বিবরণী (Reports)" : "Financial Statements", sub: store.name, href: `${storeBase}/finance/reports`, type: pageType },
      { label: isBn ? "সিআরএম পাইপলাইন" : "CRM Deals & Pipeline", sub: store.name, href: `${storeBase}/crm/deals`, type: pageType },
      { label: isBn ? "সাপোর্ট টিকিট" : "Support Desk", sub: store.name, href: `${storeBase}/support/tickets`, type: pageType },
      { label: isBn ? "অনুমোদন কেন্দ্র" : "Approvals Center", sub: store.name, href: `${storeBase}/operations/approvals`, type: pageType },
      { label: isBn ? "টাস্ক ম্যানেজমেন্ট" : "Task Board", sub: store.name, href: `${storeBase}/operations/tasks`, type: pageType },
      { label: t.navigation.analytics, sub: store.name, href: `${storeBase}/analytics`, type: pageType },
      { label: isBn ? "মার্কেটিং" : "Marketing", sub: store.name, href: `${storeBase}/marketing`, type: pageType },
      { label: isBn ? "মিডিয়া" : "Media", sub: store.name, href: `${storeBase}/media`, type: pageType },
      { label: t.navigation.settings, sub: store.name, href: `${storeBase}/settings`, type: pageType },
      { label: t.navigation.billing, sub: store.name, href: `${storeBase}/billing`, type: pageType },
      { label: isBn ? "ডিজাইন" : "Design", sub: store.name, href: `${storeBase}/design`, type: pageType },
    ];

    return { pageTitle: title, breadcrumbs: crumbs, searchResults: results };
  }, [pathname, store, dashboardHref, storeBase, productName, language, t, isBn]);

  const quickActions: QuickAction[] = [
    { label: isBn ? "নতুন পণ্য" : "New Product", href: `${storeBase}/products/new`, icon: Package },
    { label: isBn ? "অর্ডার দেখুন" : "View Orders", href: `${storeBase}/orders`, icon: ShoppingBag },
    { label: isBn ? "ওয়ার্কস্পেস" : "Workspace", href: "/dashboard", icon: Store },
    { label: t.navigation.billing, href: `${storeBase}/billing`, icon: CreditCard },
  ];

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={quickActions}
      searchResults={searchResults}
      searchPlaceholder={isBn ? "দোকানের পেজ বা ফিচার খুঁজুন..." : "Search store pages..."}
      onMenuClick={onMenuClick}
      compactNotifications
      showWorkspaceSwitcher
      breadcrumb={
        <>
          <li className="inline-flex items-center gap-1">
            <Link href="/dashboard" className="transition-colors text-muted-foreground hover:text-foreground font-medium">
              {isBn ? "ওয়ার্কস্পেস" : "Workspace"}
            </Link>
          </li>
          <li className="inline-flex items-center">
            <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden />
          </li>
          {breadcrumbs.map((item, index) => (
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
  const { language, t } = useLanguage();
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
            aria-label={language === "bn" ? "মেনু খুলুন" : "Open menu"}
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-44 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card md:inline-flex lg:w-56"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left truncate">{searchPlaceholder}</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded border border-border bg-card px-1.5 text-[10px] font-semibold text-muted-foreground">
              <Command className="h-2.5 w-2.5" aria-hidden />K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground md:hidden hover:bg-muted"
            aria-label={t.header.searchPlaceholder}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          <div className="relative">
            <Button
              type="button"
              onClick={() => setQuickOpen((open) => !open)}
              aria-expanded={quickOpen}
              aria-haspopup="menu"
              className="h-9 rounded-xl px-3 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{t.header.quickCreate}</span>
            </Button>
            {quickOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickOpen(false)}
                  aria-label={language === "bn" ? "মেনু বন্ধ করুন" : "Close menu"}
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
            <div className="hidden w-40 sm:block xl:w-44">
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
                  <p className="px-3 py-8 text-center text-xs text-muted-foreground">{t.header.noResultsFound}</p>
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
