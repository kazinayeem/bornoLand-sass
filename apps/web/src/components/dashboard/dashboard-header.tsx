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
  Upload,
  ChevronRight,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Calculator,
  Receipt,
  FileSpreadsheet,
  Settings,
  HelpCircle,
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

const workspaceRouteLabels: Record<string, { bn: string; en: string }> = {
  "/dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "/workshops": { bn: "মার্চেন্ট ওয়ার্কস্পেস", en: "Merchant Workspace" },
  "/dashboard/stores": { bn: "সব দোকান", en: "All Stores" },
  "/dashboard/create-store": { bn: "দোকান তৈরি করুন", en: "Create Store" },
  "/dashboard/stores/create": { bn: "দোকান তৈরি করুন", en: "Create Store" },
  "/dashboard/stores/archived": { bn: "আর্কাইভকৃত দোকান", en: "Archived Stores" },
  "/dashboard/plans": { bn: "প্ল্যান ও ফিচার", en: "Plans & Features" },
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
    workshops: "ওয়ার্কস্পেস",
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
    { label: t.header.inviteMember, href: "/dashboard/team", icon: UserPlus },
    { label: t.header.upgradePlan, href: "/dashboard/billing", icon: CreditCard },
  ];

  const isBn = false;
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
      category: isBn ? "দোকানসমূহ" : "Stores",
    })),
    { label: t.navigation.allStores, sub: t.navigation.workspace, href: "/workshops", type: isBn ? "পেজ" : "Page", category: isBn ? "নেভিগেশন" : "Navigation" },
    { label: t.navigation.createStore, sub: t.navigation.workspace, href: "/dashboard/stores/create", type: isBn ? "পেজ" : "Page", category: isBn ? "নেভিগেশন" : "Navigation" },
    { label: t.navigation.billing, sub: t.navigation.workspace, href: "/dashboard/billing", type: isBn ? "পেজ" : "Page", category: isBn ? "নেভিগেশন" : "Navigation" },
    { label: t.navigation.team, sub: t.navigation.workspace, href: "/dashboard/team", type: isBn ? "পেজ" : "Page", category: isBn ? "নেভিগেশন" : "Navigation" },
    { label: t.navigation.settings, sub: t.navigation.workspace, href: "/dashboard/settings", type: isBn ? "পেজ" : "Page", category: isBn ? "নেভিগেশন" : "Navigation" },
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
  const { language, t } = useLanguage();
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

  // Helper to check user permission & plan entitlement
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
  const isBn = false;

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
    const potentialResults: Array<{
      label: string;
      sub: string;
      href: string;
      type: string;
      category?: string;
      permission?: string;
      featureKey?: string;
    }> = [
      { label: t.navigation.dashboard, sub: store.name, href: dashboardHref, type: pageType, category: "Core" },
      { label: isBn ? "পণ্যসমূহ" : "Products", sub: store.name, href: `${storeBase}/products`, type: pageType, category: "Commerce", permission: "products:read" },
      { label: isBn ? "ক্যাটাগরি" : "Categories", sub: store.name, href: `${storeBase}/categories`, type: pageType, category: "Commerce", permission: "categories:read" },
      { label: isBn ? "অর্ডারসমূহ" : "Orders", sub: store.name, href: `${storeBase}/orders`, type: pageType, category: "Commerce", permission: "orders:read" },
      { label: isBn ? "কাস্টমার মাস্টার" : "Customer Master", sub: store.name, href: `${storeBase}/customers`, type: pageType, category: "Commerce", permission: "customers:read" },
      { label: isBn ? "ইনভেন্টরি ও স্টক" : "Inventory & Stock", sub: store.name, href: `${storeBase}/inventory`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: isBn ? "ক্ষয়ক্ষতি ও অপচয়" : "Waste & Loss Tracker", sub: store.name, href: `${storeBase}/inventory/waste`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: isBn ? "স্টক মুভমেন্ট লেজার" : "Stock Movement Ledger", sub: store.name, href: `${storeBase}/inventory/ledger`, type: pageType, category: "Inventory", permission: "inventory:read", featureKey: "inventory" },
      { label: isBn ? "মাল্টি-ওয়্যারহাউস" : "Warehouses", sub: store.name, href: `${storeBase}/inventory/warehouses`, type: pageType, category: "Inventory", permission: "warehouse:read", featureKey: "warehouses" },
      { label: isBn ? "ক্রয় ও পারচেজ অর্ডার" : "Purchasing & POs", sub: store.name, href: `${storeBase}/inventory/purchasing`, type: pageType, category: "Purchasing", permission: "procurement:read", featureKey: "purchase_orders" },
      { label: isBn ? "সরবরাহকারী (Suppliers)" : "Suppliers Master", sub: store.name, href: `${storeBase}/inventory/suppliers`, type: pageType, category: "Purchasing", permission: "procurement:read", featureKey: "suppliers" },
      { label: isBn ? "পয়েন্ট অব সেল (POS)" : "POS Terminal", sub: store.name, href: `${storeBase}/pos`, type: pageType, category: "POS", permission: "pos:read", featureKey: "pos" },
      { label: isBn ? "POS ক্যাশ রেজিস্টার ও শিফট" : "POS Register & Shifts", sub: store.name, href: `${storeBase}/pos/shifts`, type: pageType, category: "POS", permission: "pos:read", featureKey: "pos" },
      { label: isBn ? "কর্মী ও এইচআরএম (HRM)" : "Employees Directory", sub: store.name, href: `${storeBase}/hrm/employees`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "employees" },
      { label: isBn ? "হাজিরা ও ওভারটাইম" : "Attendance & Shifts", sub: store.name, href: `${storeBase}/hrm/attendance`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "attendance" },
      { label: isBn ? "ছুটি ব্যবস্থাপনা" : "Leave Management", sub: store.name, href: `${storeBase}/hrm/leaves`, type: pageType, category: "HRM", permission: "hrm:read", featureKey: "leave_mgmt" },
      { label: isBn ? "বেতন ও পে-রোল" : "Payroll & Payslips", sub: store.name, href: `${storeBase}/hrm/payroll`, type: pageType, category: "HRM", permission: "hrm:payroll:manage", featureKey: "payroll" },
      { label: isBn ? "হিসাববিজ্ঞান (Accounting)" : "Accounting Dashboard", sub: store.name, href: `${storeBase}/finance/accounting`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "chart_of_accounts" },
      { label: isBn ? "হিসাবের তালিকা (COA)" : "Chart of Accounts", sub: store.name, href: `${storeBase}/finance/accounting/coa`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "chart_of_accounts" },
      { label: isBn ? "ডাবল-এন্ট্রি জার্নাল" : "Journal Entries", sub: store.name, href: `${storeBase}/finance/accounting/journal`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "journal_entries" },
      { label: isBn ? "ব্যয় ও খরচ (Expenses)" : "Business Expenses", sub: store.name, href: `${storeBase}/finance/expenses`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "expenses" },
      { label: isBn ? "আর্থিক বিবরণী (Reports)" : "Financial Statements", sub: store.name, href: `${storeBase}/finance/reports`, type: pageType, category: "Finance", permission: "finance:read", featureKey: "financial_reports" },
      { label: isBn ? "সিআরএম পাইপলাইন" : "CRM Deals & Pipeline", sub: store.name, href: `${storeBase}/crm/deals`, type: pageType, category: "Growth", permission: "crm:read", featureKey: "crm_deals" },
      { label: isBn ? "সাপোর্ট টিকিট" : "Support Desk", sub: store.name, href: `${storeBase}/support/tickets`, type: pageType, category: "Growth", permission: "support:read", featureKey: "support_tickets" },
      { label: isBn ? "অনুমোদন কেন্দ্র" : "Approvals Center", sub: store.name, href: `${storeBase}/operations/approvals`, type: pageType, category: "Operations", permission: "operations:read", featureKey: "approvals" },
      { label: isBn ? "টাস্ক ম্যানেজমেন্ট" : "Task Board", sub: store.name, href: `${storeBase}/operations/tasks`, type: pageType, category: "Operations", permission: "operations:read", featureKey: "tasks" },
      { label: t.navigation.analytics, sub: store.name, href: `${storeBase}/analytics`, type: pageType, category: "Analytics", permission: "analytics:read", featureKey: "analytics" },
      { label: t.navigation.settings, sub: store.name, href: `${storeBase}/settings`, type: pageType, category: "Settings", permission: "settings:read" },
      { label: t.navigation.billing, sub: store.name, href: `${storeBase}/billing`, type: pageType, category: "Billing" },
      { label: isBn ? "ডিজাইন ও থিম" : "Theme & Design", sub: store.name, href: `${storeBase}/design`, type: pageType, category: "Storefront", permission: "pages:read" },
    ];

    // Filter search results by permissions and feature entitlement
    const results: SearchResult[] = potentialResults
      .filter((item) => checkAccess(item.permission, item.featureKey))
      .map(({ permission, featureKey, ...rest }) => rest);

    return { pageTitle: title, breadcrumbs: crumbs, searchResults: results };
  }, [pathname, store, dashboardHref, storeBase, productName, language, t, isBn, checkAccess]);

  // Permission-aware Quick Create Actions
  const quickActions: QuickAction[] = useMemo(() => {
    const list: QuickAction[] = [];

    if (checkAccess("products:read", "products")) {
      list.push({ label: isBn ? "নতুন পণ্য" : "New Product", href: `${storeBase}/products/new`, icon: Package });
    }
    if (checkAccess("orders:read")) {
      list.push({ label: isBn ? "অর্ডার তালিকা" : "New / View Orders", href: `${storeBase}/orders`, icon: ShoppingBag });
    }
    if (checkAccess("pos:read", "pos")) {
      list.push({ label: isBn ? "পিওএস টার্মিনাল" : "Open POS Terminal", href: `${storeBase}/pos`, icon: Calculator });
    }
    if (checkAccess("procurement:read", "purchase_orders")) {
      list.push({ label: isBn ? "নতুন পারচেজ অর্ডার" : "New Purchase Order", href: `${storeBase}/inventory/purchasing`, icon: Boxes });
    }
    if (checkAccess("finance:read", "expenses")) {
      list.push({ label: isBn ? "নতুন খরচ রেকর্ড" : "Record Expense", href: `${storeBase}/finance/expenses`, icon: Receipt });
    }
    if (checkAccess("hrm:read", "employees")) {
      list.push({ label: isBn ? "নতুন কর্মী যুক্ত করুন" : "Add Employee", href: `${storeBase}/hrm/employees`, icon: Users });
    }
    if (checkAccess("settings:read")) {
      list.push({ label: isBn ? "স্টোর সেটিংস" : "Store Settings", href: `${storeBase}/settings`, icon: Settings });
    }

    return list;
  }, [checkAccess, isBn, storeBase]);

  return (
    <DashboardHeaderChrome
      pageTitle={pageTitle}
      quickActions={quickActions}
      searchResults={searchResults}
      searchPlaceholder={isBn ? "সার্চ করুন... ⌘K" : "Search store pages... ⌘K"}
      onMenuClick={onMenuClick}
      compactNotifications
      showWorkspaceSwitcher={false}
      breadcrumb={
        <>
          <li className="inline-flex items-center gap-1">
            <Link href="/workshops" className="transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              {isBn ? "ওয়ার্কস্পেস" : "Workspace"}
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
  const { language, t } = useLanguage();
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
            aria-label={false ? "মেনু খুলুন" : "Open menu"}
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
            aria-label={t.header.searchPlaceholder}
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
                <span className="hidden sm:inline">{false ? "তৈরি করুন" : "Create"}</span>
              </Button>

              {quickOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 animate-in fade-in-50 zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {false ? "কুইক অ্যাকশন" : "Quick Actions"}
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
                    {t.header.noResultsFound}
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
