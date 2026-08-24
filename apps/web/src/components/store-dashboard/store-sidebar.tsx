"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Users,
  Star,
  Ticket,
  FileText,
  Image,
  Mail,
  BarChart3,
  Megaphone,
  Blocks,
  Palette,
  Globe,
  Search,
  Settings,
  CreditCard,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Lock,
  ScrollText,
  Eye,
  Activity,
  Monitor,
  MapPin,
  Building,
  ExternalLink,
  Link2,
  Target,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining, getStoreDisplayDomain } from "@/lib/store-status";
import { getStoreUrl } from "@/lib/urls";
import { useGetStoreFeatureAccessQuery, NAV_FEATURE_MAP, getFeatureByKey } from "@/redux/api/feature-api";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";

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

/* ── Navigation Data ──────────────────────────────────────────── */

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/inventory", label: "Inventory", icon: Boxes, featureKey: "inventory" },
  { href: "/orders", label: "Orders", icon: ShoppingBag, exact: true },
  { href: "/orders/incomplete", label: "Incomplete Orders", icon: ShoppingCart, featureKey: "incomplete_orders" },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reviews", label: "Reviews", icon: Star, featureKey: "reviews" },

  { href: "/coupons", label: "Coupons", icon: Ticket, featureKey: "coupons" },
  { href: "/customer-messages", label: "Messages", icon: Mail, featureKey: "cms" },
  { href: "/media", label: "Media", icon: Image, featureKey: "media" },
  { href: "/design", label: "Design", icon: Palette },
  { href: "/marketing", label: "Marketing", icon: Megaphone, featureKey: "marketing", comingSoon: true },

  { href: "/apps", label: "Apps", icon: Blocks, featureKey: "apps", comingSoon: true },
];

const analyticsSubLinks = [
  { href: "/analytics", label: "Overview", icon: BarChart3, exact: true },
  { href: "/analytics/visitors", label: "Visitors", icon: Eye },
  { href: "/analytics/live", label: "Live Visitors", icon: Activity },
  { href: "/analytics/traffic-sources", label: "Traffic Sources", icon: Globe },
  { href: "/analytics/devices", label: "Devices", icon: Monitor },
  { href: "/analytics/browsers", label: "Browsers", icon: Globe },
  { href: "/analytics/countries", label: "Countries", icon: MapPin },
  { href: "/analytics/cities", label: "Cities", icon: Building },
  { href: "/analytics/pages", label: "Pages", icon: ExternalLink },
  { href: "/analytics/referrers", label: "Referrers", icon: Link2 },
  { href: "/analytics/campaigns", label: "Campaigns", icon: Target },
  { href: "/analytics/conversion", label: "Conversion", icon: BarChart3 },
  { href: "/analytics/reports", label: "Reports", icon: FileSpreadsheet },
];

const reportsLinks = [
  { href: "/reports", label: "Reports", icon: BarChart3, featureKey: "reports" },
];

const bottomLinks = [
  { href: "/settings?section=general", label: "Settings", icon: Settings },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

/* ── Nav Item ─────────────────────────────────────────────────── */

function NavItem({
  href,
  label,
  icon: Icon,
  basePath,
  exact,
  locked,
  requiredPlan,
  comingSoon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  basePath: string;
  exact?: boolean;
  locked?: boolean;
  requiredPlan?: string;
  comingSoon?: boolean;
}) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const fullHref = `${basePath}${href}`;
  const active = exact
    ? pathname === fullHref
    : pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  return (
    <Link
      href={fullHref}
      title={collapsed ? label : locked ? `Available in ${requiredPlan ?? "a higher plan"}` : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-apple-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-apple-canvas-parchment text-apple-primary"
          : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
        locked && !active && "opacity-60",
        collapsed && "justify-center px-0"
      )}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-apple-primary" />
      )}
      <Icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
        active ? "text-apple-primary" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80"
      )} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
          {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-apple-ink-muted-48" />}
        </>
      )}
    </Link>
  );
}

/* ── Section Label ────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  if (collapsed) return <div className="mx-3 my-2 h-px bg-apple-divider-soft" />;
  return (
    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
      {children}
    </p>
  );
}

/* ── Main Sidebar Component ───────────────────────────────────── */

export function StoreSidebar({ store }: { store: Store }) {
  const basePath = `/store/${store.slug}`;
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(
    pathname.startsWith(`${basePath}/analytics`)
  );

  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);
  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id);
  const { data: storageData } = useGetMediaStatsQuery(store._id);
  const features = accessData?.data?.features ?? [];
  const stats = storageData?.data?.stats;
  const currentPlan = typeof store.planId === "object" && store.planId ? store.planId.name : store.plan;

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

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-apple-hairline bg-apple-canvas transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
        role="navigation"
        aria-label="Store navigation"
      >
        {/* ── Store Card ──────────────────────────────────────── */}
        <div className={cn("shrink-0 border-b border-apple-hairline", collapsed ? "px-2 py-3" : "px-4 py-4")}>
          <Link
            href="/dashboard/stores"
            className={cn(
              "mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-apple-ink-muted-48 transition-colors hover:text-apple-ink-muted-80",
              collapsed && "mx-auto justify-center"
            )}
            title="All Stores"
          >
            <ChevronLeft className="h-3 w-3" />
            {!collapsed && "All Stores"}
          </Link>

          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <StoreBrandMark store={store} size={collapsed ? 36 : 40} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-apple-ink">
                  {store.shortName || store.name}
                </p>
                <p className="truncate text-[11px] text-apple-ink-muted-48">
                  {getStoreDisplayDomain(store.subdomain || store.slug)}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  status === "active" ? "bg-emerald-50 text-emerald-700" :
                  status === "trial" ? "bg-blue-50 text-blue-700" :
                  "bg-amber-50 text-amber-700"
                )}>
                  {statusConfig.label}
                </span>
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                  {currentPlan}
                </span>
                {status === "trial" && trialDays !== null && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {trialDays}d
                  </span>
                )}
              </div>

              {/* Storage */}
              <div className="mt-3 rounded-lg bg-apple-canvas-parchment p-2.5">
                <div className="flex items-center justify-between text-[10px] font-medium text-apple-ink-muted-48">
                  <span>Storage</span>
                  <span className="tabular-nums">{usedLabel} / {storageLabel}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-apple-hairline">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      storagePercent >= 80 ? "bg-amber-500" : "bg-apple-primary"
                    )}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Scrollable Navigation ───────────────────────────── */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
          <ul className="space-y-0.5">
            {mainLinks.map((link) => {
              const meta = resolveLink(link);
              return (
                <li key={link.href + link.label}>
                  <NavItem
                    {...link}
                    basePath={basePath}
                    locked={meta.locked}
                    requiredPlan={meta.requiredPlan}
                    comingSoon={meta.comingSoon}
                  />
                </li>
              );
            })}
          </ul>

          {/* Analytics */}
          <div className="mt-2">
            <button
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                pathname.startsWith(`${basePath}/analytics`)
                  ? "bg-apple-canvas-parchment text-apple-primary"
                  : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Analytics" : undefined}
            >
              {pathname.startsWith(`${basePath}/analytics`) && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-apple-primary" />
              )}
              <BarChart3 className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                pathname.startsWith(`${basePath}/analytics`) ? "text-apple-primary" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Analytics</span>
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    analyticsOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && analyticsOpen && (
              <ul className="mt-0.5 space-y-0.5 pl-3">
                {analyticsSubLinks.map((link) => {
                  const meta = resolveLink({ label: link.label, featureKey: "analytics" });
                  return (
                    <li key={link.href}>
                      <NavItem
                        {...link}
                        basePath={basePath}
                        locked={meta.locked}
                        requiredPlan={meta.requiredPlan}
                        comingSoon={meta.comingSoon}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Reports */}
          <div className="mt-2">
            <ul className="space-y-0.5">
              {reportsLinks.map((link) => {
                const meta = resolveLink(link);
                return (
                  <li key={link.href}>
                    <NavItem
                      {...link}
                      basePath={basePath}
                      locked={meta.locked}
                      requiredPlan={meta.requiredPlan}
                      comingSoon={meta.comingSoon}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom Links */}
          <div className="mt-4 border-t border-apple-divider-soft pt-3">
            <ul className="space-y-0.5">
              {bottomLinks.map((link) => {
                const meta = resolveLink(link);
                return (
                  <li key={link.href}>
                    <NavItem
                      {...link}
                      basePath={basePath}
                      locked={meta.locked}
                      requiredPlan={meta.requiredPlan}
                      comingSoon={meta.comingSoon}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* ── Bottom: Collapse + Profile ──────────────────────── */}
        <div className="shrink-0 border-t border-apple-hairline p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-apple-ink-muted-48 transition-all duration-200 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-[18px] w-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
