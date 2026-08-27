"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, createContext, useContext, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Users,
  Star,
  Megaphone,
  Ticket,
  Target,
  BarChart3,
  FileSpreadsheet,
  Palette,
  Menu,
  FileText,
  Search,
  Globe2,
  Share2,
  Truck,
  PackageCheck,
  CreditCard,
  Percent,
  Image as ImageIcon,
  Mail,
  HelpCircle,
  Settings,
  Blocks,
  ScrollText,
  CreditCard as BillingCard,
  ChevronDown,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Activity,
  Monitor,
  Globe,
  MapPin,
  Building,
  ExternalLink,
  Link2,
  Check,
  Plus,
  Store as StoreIcon,
  ChevronsUpDown,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining, getStoreDisplayDomain } from "@/lib/store-status";
import { useGetStoreFeatureAccessQuery, NAV_FEATURE_MAP, getFeatureByKey } from "@/redux/api/feature-api";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";

import { useLanguage, type Dictionary } from "@/providers/language-provider";

/* ── Sidebar Collapse Context ─────────────────────────────────── */

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

/* ── Navigation Group Definitions ─────────────────────────────── */

export type NavItemDef = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  featureKey?: string;
  comingSoon?: boolean;
  subItems?: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[];
};

export type NavGroupDef = {
  group: string;
  items: NavItemDef[];
};

export function getSidebarNavGroups(t: Dictionary): NavGroupDef[] {
  const sn = t.storeNav;
  return [
    {
      group: sn.catalog,
      items: [
        { href: "/products", label: sn.products, icon: Package },
        { href: "/categories", label: sn.categories, icon: Tags },
        { href: "/inventory", label: sn.inventory, icon: Boxes, featureKey: "inventory" },
      ],
    },
    {
      group: sn.sales,
      items: [
        { href: "/orders", label: sn.orders, icon: ShoppingBag, exact: true },
        { href: "/orders/incomplete", label: sn.incompleteOrders, icon: ShoppingCart, featureKey: "incomplete_orders" },
        { href: "/customers", label: sn.customers, icon: Users },
        { href: "/reviews", label: sn.reviews, icon: Star, featureKey: "reviews" },
      ],
    },
    {
      group: sn.growth,
      items: [
        { href: "/marketing", label: sn.marketing, icon: Megaphone, featureKey: "marketing", comingSoon: true },
        { href: "/coupons", label: sn.coupons, icon: Ticket, featureKey: "coupons" },
        { href: "/settings/tracking", label: sn.trackingPixels, icon: Target, featureKey: "marketing" },
        {
          href: "/analytics",
          label: sn.analytics,
          icon: BarChart3,
          exact: true,
          featureKey: "analytics",
          subItems: [
            { href: "/analytics", label: sn.overview, icon: BarChart3, exact: true },
            { href: "/analytics/visitors", label: sn.visitors, icon: Eye },
            { href: "/analytics/live", label: sn.liveVisitors, icon: Activity },
            { href: "/analytics/traffic-sources", label: sn.trafficSources, icon: Globe },
            { href: "/analytics/devices", label: sn.devices, icon: Monitor },
            { href: "/analytics/browsers", label: sn.browsers, icon: Globe },
            { href: "/analytics/countries", label: sn.countries, icon: MapPin },
            { href: "/analytics/cities", label: sn.cities, icon: Building },
            { href: "/analytics/pages", label: sn.pages, icon: ExternalLink },
            { href: "/analytics/referrers", label: sn.referrers, icon: Link2 },
            { href: "/analytics/campaigns", label: sn.campaigns, icon: Target },
            { href: "/analytics/conversion", label: sn.conversion, icon: BarChart3 },
            { href: "/analytics/reports", label: sn.reports, icon: FileSpreadsheet },
          ],
        },
        { href: "/reports", label: sn.reports, icon: FileSpreadsheet, featureKey: "reports" },
      ],
    },
    {
      group: sn.store,
      items: [
        { href: "/design", label: sn.design, icon: Palette },
        { href: "/settings?section=navigation", label: sn.navigation, icon: Menu },
        { href: "/pages", label: sn.pages, icon: FileText },
        { href: "/settings?section=seo", label: sn.seo, icon: Search, featureKey: "seo" },
        { href: "/settings?section=domain", label: sn.domain, icon: Globe2, featureKey: "custom_domain" },
        { href: "/settings?section=social-links", label: sn.socialLinks, icon: Share2 },
      ],
    },
    {
      group: sn.operations,
      items: [
        { href: "/settings/shipping", label: sn.shipping, icon: Truck },
        { href: "/settings/courier", label: sn.courier, icon: PackageCheck, featureKey: "courier" },
        { href: "/settings/payments", label: sn.payments, icon: CreditCard },
        { href: "/settings/taxes", label: sn.taxes, icon: Percent },
      ],
    },
    {
      group: sn.content,
      items: [
        { href: "/media", label: sn.media, icon: ImageIcon, featureKey: "media" },
        { href: "/customer-messages", label: sn.messages, icon: Mail, featureKey: "cms" },
        { href: "/settings?section=faq", label: sn.faq, icon: HelpCircle },
      ],
    },
    {
      group: sn.system,
      items: [
        { href: "/settings?section=general", label: sn.settings, icon: Settings },
        { href: "/apps", label: sn.apps, icon: Blocks, featureKey: "apps", comingSoon: true },
        { href: "/activity", label: sn.activity, icon: ScrollText },
        { href: "/billing", label: sn.billing, icon: BillingCard },
      ],
    },
  ];
}

export const SIDEBAR_NAV_GROUPS: NavGroupDef[] = [];

/* ── Nav Item Component ───────────────────────────────────────── */

function NavItem({
  href,
  label,
  icon: Icon,
  basePath,
  exact,
  locked,
  requiredPlan,
  comingSoon,
  subItems,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  basePath: string;
  exact?: boolean;
  locked?: boolean;
  requiredPlan?: string;
  comingSoon?: boolean;
  subItems?: NavItemDef["subItems"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const fullHref = `${basePath}${href}`;

  const hasSub = Boolean(subItems && subItems.length > 0);
  const isParentActive = hasSub && pathname.startsWith(`${basePath}/analytics`);
  const [open, setOpen] = useState(isParentActive);

  // Keep open state in sync when route changes to a child
  useEffect(() => {
    if (isParentActive) setOpen(true);
  }, [isParentActive]);

  const active = exact
    ? pathname === fullHref
    : (pathname === fullHref || (!exact && !hasSub && pathname.startsWith(`${fullHref}/`)));

  if (hasSub) {
    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          title={collapsed ? label : locked ? `Available in ${requiredPlan ?? "a higher plan"}` : undefined}
          className={cn(
            "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
            isParentActive
              ? "bg-apple-primary/10 text-apple-primary font-semibold"
              : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
            locked && !isParentActive && "opacity-60",
            collapsed && "justify-center px-0"
          )}
        >
          {isParentActive && (
            <div className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-apple-primary" />
          )}
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-150",
              isParentActive
                ? "text-apple-primary"
                : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80"
            )}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{label}</span>
              {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
              {locked && <Lock className="h-3 w-3 shrink-0 text-apple-ink-muted-48" />}
              {!locked && (
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-apple-ink-muted-48 transition-transform duration-200",
                    open && "rotate-180 text-apple-ink"
                  )}
                />
              )}
            </>
          )}
        </button>

        {!collapsed && open && subItems && (
          <ul className="relative mt-0.5 space-y-0.5 pl-5 before:absolute before:left-3 before:top-1.5 before:bottom-1.5 before:w-px before:bg-apple-hairline">
            {subItems.map((sub) => {
              const subFullHref = `${basePath}${sub.href}`;
              const subActive = sub.exact ? pathname === subFullHref : pathname === subFullHref || pathname.startsWith(`${subFullHref}/`);
              const SubIcon = sub.icon;
              return (
                <li key={sub.href}>
                  <Link
                    href={subFullHref}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                      subActive
                        ? "bg-apple-primary/10 text-apple-primary font-semibold"
                        : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                    )}
                  >
                    <SubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{sub.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Link
      href={fullHref}
      onClick={onNavigate}
      title={collapsed ? label : locked ? `Available in ${requiredPlan ?? "a higher plan"}` : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-apple-primary/10 text-apple-primary font-semibold"
          : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
        locked && !active && "opacity-60",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-apple-primary" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-150",
          active
            ? "text-apple-primary"
            : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
          {locked && <Lock className="h-3 w-3 shrink-0 text-apple-ink-muted-48" />}
        </>
      )}
    </Link>
  );
}

/* ── Section Label ────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  if (collapsed) return <div className="mx-2 my-2 h-px bg-apple-hairline" />;
  return (
    <p className="mb-1 px-2.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
      {children}
    </p>
  );
}

/* ── Store Switcher Dropdown (Inside Sidebar) ─────────────────── */

function SidebarStoreSwitcher({ store, collapsed }: { store: Store; collapsed: boolean }) {
  const { t, language } = useLanguage();
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const status = resolveStoreStatus(store);
  const statusLabel =
    status === "active" ? t.common.active :
    status === "trial" ? t.common.trial : t.common.expired;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-apple-hairline bg-apple-canvas-parchment/60 p-2 text-left transition-all hover:border-zinc-300 hover:bg-white",
          collapsed ? "justify-center p-1.5" : ""
        )}
        title={collapsed ? store.name : t.navigation.selectStore}
      >
        <StoreBrandMark store={store} size={collapsed ? 32 : 34} roundedClassName="rounded-lg" />
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold text-apple-ink">{store.shortName || store.name}</p>
                <span className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                  status === "active" ? "bg-emerald-50 text-emerald-700" :
                  status === "trial" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                )}>
                  {statusLabel}
                </span>
              </div>
              <p className="truncate text-[11px] text-apple-ink-muted-48">
                {getStoreDisplayDomain(store.subdomain || store.slug)}
              </p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-apple-ink-muted-48" />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 overflow-hidden rounded-xl border border-apple-hairline bg-white shadow-xl animate-scale-in",
            collapsed ? "left-12 top-0 w-60" : "left-0 right-0 top-full"
          )}
        >
          <div className="border-b border-apple-divider-soft px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">{t.storeNav.yourStores}</p>
            <p className="truncate text-xs font-medium text-apple-ink">{t.storeNav.currentlyManaging(store.name)}</p>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5">
            {stores.map((s) => {
              const isCurrent = s._id === store._id;
              const sStatus = resolveStoreStatus(s);
              const sStatusLabel = sStatus === "active" ? t.common.active : sStatus === "trial" ? t.common.trial : t.common.expired;
              const sPlan = typeof s.planId === "object" && s.planId ? s.planId.name : s.plan;
              return (
                <Link
                  key={s._id}
                  href={`/store/${s.slug}/dashboard`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                    isCurrent ? "bg-apple-primary/10 text-apple-primary font-semibold" : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                  )}
                >
                  <StoreBrandMark store={s} size={26} roundedClassName="rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.shortName || s.name}</p>
                    <p className="truncate text-[10px] text-apple-ink-muted-48">
                      {sPlan} • {sStatusLabel}
                    </p>
                  </div>
                  {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-apple-primary" />}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-apple-divider-soft p-1.5 space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-apple-primary transition-colors hover:bg-apple-primary/10"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{language === "bn" ? "ওয়ার্কস্পেস ড্যাশবোর্ড" : "Back to Workspace"}</span>
            </Link>
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.navigation.createStore}</span>
            </Link>
            <Link
              href="/dashboard/stores"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <StoreIcon className="h-3.5 w-3.5" />
              <span>{t.navigation.allStores}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Sidebar Component ───────────────────────────────────── */

export function StoreSidebar({
  store,
  onNavigate,
}: {
  store: Store;
  onNavigate?: () => void;
}) {
  const { t, language } = useLanguage();
  const basePath = `/store/${store.slug}`;
  const pathname = usePathname();

  // Persist collapsed sidebar preference in localStorage
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bornoland_sidebar_collapsed");
      if (saved !== null) {
        setCollapsedState(saved === "true");
      }
    } catch {
      // Ignore local storage errors
    }
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem("bornoland_sidebar_collapsed", String(v));
    } catch {
      // Ignore local storage errors
    }
  }, []);

  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id);
  const { data: storageData } = useGetMediaStatsQuery(store._id);
  const features = accessData?.data?.features ?? [];
  const stats = storageData?.data?.stats;

  const resolveLink = useCallback((link: { label: string; featureKey?: string; comingSoon?: boolean }) => {
    const key = link.featureKey ?? NAV_FEATURE_MAP[link.label];
    if (!key) return { locked: false, comingSoon: link.comingSoon };
    const feature = getFeatureByKey(features, key);
    return {
      locked: feature?.locked ?? false,
      requiredPlan: feature?.requiredPlan?.name,
      comingSoon: link.comingSoon || feature?.comingSoon,
    };
  }, [features]);

  const storagePercent = Math.min(stats?.percentUsed ?? 0, 100);
  const storageLabel = stats?.unlimited
    ? "Unlimited"
    : stats?.limitMB != null && stats.limitMB >= 1024
      ? `${(stats.limitMB / 1024).toFixed(0)} GB`
      : `${stats?.limitMB ?? 0} MB`;
  const usedLabel = stats?.usedMB != null
    ? stats.usedMB >= 1024
      ? `${(stats.usedMB / 1024).toFixed(2)} GB`
      : `${stats.usedMB.toFixed(1)} MB`
    : "0 B";

  const isStorageHigh = storagePercent >= 80;

  const navGroups = useMemo(() => getSidebarNavGroups(t), [t]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-apple-hairline bg-apple-canvas transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
        role="navigation"
        aria-label="Store navigation"
      >
        {/* ── Top: Store & Workspace Switcher ────────────────── */}
        <div className={cn("shrink-0 border-b border-apple-hairline", collapsed ? "p-2" : "p-3")}>
          <SidebarStoreSwitcher store={store} collapsed={collapsed} />
        </div>

        {/* ── Scrollable Navigation Groups ───────────────────── */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-2 space-y-1" aria-label="Main navigation">
          {/* Back to Workspace Action */}
          <div className="mb-2">
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-apple-ink-muted-80 hover:bg-apple-primary/10 hover:text-apple-primary transition-all duration-150 border border-apple-hairline/60 bg-apple-canvas-parchment/60",
                collapsed ? "justify-center px-0" : ""
              )}
              title={language === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-apple-primary transition-transform group-hover:-translate-x-0.5" />
              {!collapsed && (
                <span className="truncate">
                  {language === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}
                </span>
              )}
            </Link>
          </div>

          {/* Dashboard Direct Top Link */}
          <div>
            <NavItem
              href="/dashboard"
              label={t.storeNav.dashboard}
              icon={LayoutDashboard}
              exact={true}
              basePath={basePath}
              onNavigate={onNavigate}
            />
          </div>

          {/* Grouped Information Architecture */}
          {navGroups.map((groupDef) => (
            <div key={groupDef.group} className="space-y-0.5">
              <SectionLabel>{groupDef.group}</SectionLabel>
              <ul className="space-y-0.5">
                {groupDef.items.map((link) => {
                  const meta = resolveLink(link);
                  return (
                    <li key={link.href + link.label}>
                      <NavItem
                        {...link}
                        basePath={basePath}
                        locked={meta.locked}
                        requiredPlan={meta.requiredPlan}
                        comingSoon={meta.comingSoon}
                        onNavigate={onNavigate}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Compact Storage & Footer Bar ──────────────────── */}
        <div className={cn("shrink-0 border-t border-apple-hairline bg-apple-canvas", collapsed ? "p-2" : "p-3")}>
          {!collapsed && (
            <div className="mb-2 rounded-lg bg-apple-canvas-parchment/70 px-2.5 py-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-apple-ink-muted-48">
                <span>{t.storeNav.storage}</span>
                <span className="tabular-nums font-semibold text-apple-ink">
                  {usedLabel} / {storageLabel}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-apple-hairline">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isStorageHigh ? "bg-amber-500" : "bg-apple-primary"
                  )}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              {isStorageHigh && (
                <div className="mt-1 flex items-center justify-between text-[10px] text-amber-700">
                  <span>{t.storeNav.storageAlmostFull}</span>
                  <Link href={`${basePath}/billing`} className="font-semibold underline hover:text-amber-900">
                    {t.storeNav.upgrade}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Collapse/Expand Action Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-apple-ink-muted-48 transition-all duration-150 hover:bg-apple-canvas-parchment hover:text-apple-ink",
              collapsed ? "justify-center px-0" : ""
            )}
            title={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
            aria-label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                <span>{t.navigation.collapseSidebar}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
