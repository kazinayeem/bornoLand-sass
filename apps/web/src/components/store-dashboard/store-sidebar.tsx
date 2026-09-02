"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
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
  PanelLeftClose,
  PanelLeft,
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
  HardDrive,
  Calculator,
  UserCheck,
  CalendarCheck,
  CalendarDays,
  Wallet,
  Landmark,
  BookOpen,
  Receipt,
  Headphones,
  CheckSquare,
  Building2,
  Trash2,
  ArrowLeftRight,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { resolveStoreStatus, getStoreDisplayDomain } from "@/lib/store-status";
import { useGetStoreFeatureAccessQuery, NAV_FEATURE_MAP, getFeatureByKey } from "@/redux/api/feature-api";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useLanguage, type Dictionary } from "@/providers/language-provider";
import { useIsStoreOwner, usePermissions, checkPermission } from "@/features/session/hooks";

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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  featureKey?: string;
  permission?: string;
  comingSoon?: boolean;
  subItems?: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    exact?: boolean;
    permission?: string;
  }[];
};

export type NavGroupDef = {
  group: string;
  items: NavItemDef[];
};

export function getSidebarNavGroups(t: Dictionary, isBn = false): NavGroupDef[] {
  const sn = t.storeNav;
  return [
    // ── OVERVIEW ──
    {
      group: isBn ? "ওভারভিউ" : "OVERVIEW",
      items: [
        { href: "/dashboard", label: sn.dashboard, icon: LayoutDashboard, exact: true },
      ],
    },
    // ── BUSINESS ──
    {
      group: isBn ? "ব্যবসা ও বাণিজ্য" : "BUSINESS",
      items: [
        { href: "/orders", label: sn.orders, icon: ShoppingBag, exact: true, permission: "orders:read" },
        { href: "/customers", label: sn.customers, icon: Users, permission: "customers:read" },
        { href: "/products", label: sn.products, icon: Package, permission: "products:read" },
        { href: "/categories", label: sn.categories, icon: Tags, permission: "categories:read" },
        { href: "/orders/incomplete", label: sn.incompleteOrders, icon: ShoppingCart, featureKey: "incomplete_orders", permission: "orders:read" },
        { href: "/reviews", label: sn.reviews, icon: Star, featureKey: "reviews", permission: "reviews:read" },
      ],
    },
    // ── INVENTORY ──
    {
      group: isBn ? "ইনভেন্টরি ও গুদাম" : "INVENTORY",
      items: [
        { href: "/inventory", label: sn.inventory, icon: Boxes, featureKey: "inventory", permission: "inventory:read", exact: true },
        { href: "/inventory/warehouses", label: sn.warehouses, icon: Building2, featureKey: "warehouses", permission: "warehouse:read" },
        { href: "/inventory/ledger", label: sn.stockLedger, icon: ArrowLeftRight, featureKey: "inventory", permission: "inventory:read" },
        { href: "/inventory/waste", label: sn.wasteLoss, icon: Trash2, featureKey: "inventory", permission: "inventory:read" },
      ],
    },
    // ── PURCHASING ──
    {
      group: isBn ? "ক্রয় ও সরবরাহ" : "PURCHASING",
      items: [
        { href: "/inventory/purchasing", label: sn.purchasing, icon: Receipt, featureKey: "purchase_orders", permission: "procurement:read" },
        { href: "/inventory/suppliers", label: sn.suppliers, icon: Truck, featureKey: "suppliers", permission: "procurement:read" },
      ],
    },
    // ── SALES & POS ──
    {
      group: isBn ? "বিক্রয় ও পিওএস" : "SALES",
      items: [
        { href: "/pos", label: sn.pos, icon: Calculator, featureKey: "pos", permission: "pos:read", exact: true },
        { href: "/pos/shifts", label: sn.posShifts, icon: Clock, featureKey: "pos", permission: "pos:read" },
      ],
    },
    // ── PEOPLE & HRM ──
    {
      group: isBn ? "কর্মী ও মানবসম্পদ" : "PEOPLE",
      items: [
        { href: "/hrm/employees", label: sn.employees, icon: Users, featureKey: "employees", permission: "hrm:read" },
        { href: "/hrm/organization", label: sn.organization, icon: Briefcase, featureKey: "departments", permission: "hrm:read" },
        { href: "/hrm/attendance", label: sn.attendance, icon: CalendarCheck, featureKey: "attendance", permission: "hrm:read" },
        { href: "/hrm/leaves", label: sn.leaves, icon: CalendarDays, featureKey: "leave_mgmt", permission: "hrm:read" },
        { href: "/hrm/payroll", label: sn.payroll, icon: Wallet, featureKey: "payroll", permission: "hrm:payroll:manage" },
        { href: "/hrm/self-service", label: sn.selfService, icon: UserCheck, featureKey: "self_service", permission: "hrm:self:read" },
      ],
    },
    // ── FINANCE & ACCOUNTING ──
    {
      group: isBn ? "হিসাববিজ্ঞান ও অর্থ" : "FINANCE",
      items: [
        { href: "/finance/accounting", label: sn.accounting, icon: Landmark, featureKey: "chart_of_accounts", permission: "accounting:read", exact: true },
        { href: "/finance/accounting/coa", label: sn.chartOfAccounts, icon: BookOpen, featureKey: "chart_of_accounts", permission: "accounting:read" },
        { href: "/finance/accounting/journal", label: sn.journalEntries, icon: FileSpreadsheet, featureKey: "journal_entries", permission: "accounting:read" },
        { href: "/finance/expenses", label: sn.expenses, icon: Receipt, featureKey: "expenses", permission: "expenses:read" },
        { href: "/finance/reports", label: sn.financialReports, icon: BarChart3, featureKey: "financial_reports", permission: "accounting:report:view" },
      ],
    },
    // ── GROWTH & CRM ──
    {
      group: isBn ? "গ্রোথ ও সিআরএম" : "GROWTH",
      items: [
        { href: "/crm/deals", label: sn.crmDeals, icon: Target, featureKey: "crm_deals", permission: "crm:read" },
        { href: "/support/tickets", label: sn.supportTickets, icon: Headphones, featureKey: "support_tickets", permission: "support:read" },
        { href: "/marketing", label: sn.marketing, icon: Megaphone, featureKey: "marketing", permission: "marketing:read" },
        { href: "/coupons", label: sn.coupons, icon: Ticket, featureKey: "coupons", permission: "coupons:read" },
        { href: "/settings/tracking", label: sn.trackingPixels, icon: Target, featureKey: "marketing", permission: "marketing:read" },
        {
          href: "/analytics",
          label: sn.analytics,
          icon: BarChart3,
          exact: true,
          featureKey: "analytics",
          permission: "analytics:read",
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
        { href: "/reports", label: sn.reports, icon: FileSpreadsheet, featureKey: "reports", permission: "reports:read" },
      ],
    },
    // ── OPERATIONS ──
    {
      group: isBn ? "অপারেশনস" : "OPERATIONS",
      items: [
        { href: "/operations/approvals", label: sn.approvals, icon: CheckSquare, featureKey: "approvals", permission: "operations:read" },
        { href: "/operations/tasks", label: sn.tasks, icon: Layers, featureKey: "tasks", permission: "operations:read" },
        { href: "/settings/shipping", label: sn.shipping, icon: Truck, permission: "shipping:read" },
        { href: "/settings/courier", label: sn.courier, icon: PackageCheck, featureKey: "courier", permission: "shipping:read" },
        { href: "/settings/payments", label: sn.payments, icon: CreditCard, permission: "payments:read" },
        { href: "/settings/taxes", label: sn.taxes, icon: Percent, permission: "settings:read" },
      ],
    },
    // ── WEBSITE & DESIGN ──
    {
      group: isBn ? "ওয়েবসাইট ও ডিজাইন" : "WEBSITE",
      items: [
        { href: "/design", label: sn.design, icon: Palette, permission: "pages:read" },
        { href: "/settings?section=navigation", label: sn.navigation, icon: Menu, permission: "pages:read" },
        { href: "/pages", label: sn.pages, icon: FileText, permission: "pages:read" },
        { href: "/media", label: sn.media, icon: ImageIcon, featureKey: "media", permission: "media:read" },
        { href: "/customer-messages", label: sn.messages, icon: Mail, featureKey: "cms", permission: "settings:read" },
        { href: "/settings?section=seo", label: sn.seo, icon: Search, featureKey: "seo", permission: "settings:read" },
        { href: "/settings?section=domain", label: sn.domain, icon: Globe2, featureKey: "custom_domain", permission: "settings:read" },
        { href: "/settings?section=social-links", label: sn.socialLinks, icon: Share2, permission: "settings:read" },
        { href: "/settings?section=faq", label: sn.faq, icon: HelpCircle, permission: "settings:read" },
      ],
    },
    // ── SYSTEM & ACCESS ──
    {
      group: isBn ? "সিস্টেম ও অ্যাক্সেস" : "SYSTEM",
      items: [
        { href: "/settings?section=general", label: sn.settings, icon: Settings, permission: "settings:read" },
        { href: "/members", label: isBn ? "টিম ও পারমিশন" : "Team & Permissions", icon: Users, permission: "members:read" },
        { href: "/apps", label: sn.apps, icon: Blocks, featureKey: "apps", comingSoon: true },
        { href: "/activity", label: sn.activity, icon: ScrollText, permission: "settings:read" },
        { href: "/billing", label: sn.billing, icon: BillingCard },
      ],
    },
  ];
}

export const SIDEBAR_NAV_GROUPS: NavGroupDef[] = [];

/* ── Collapsed Tooltip Helper ─────────────────────────────────── */

function NavTooltipWrapper({
  label,
  subtext,
  collapsed,
  children,
}: {
  label: string;
  subtext?: string;
  collapsed: boolean;
  children: ReactNode;
}) {
  if (!collapsed) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="flex items-center gap-1.5 py-1 px-2.5 shadow-md">
        <span>{label}</span>
        {subtext && <span className="text-[10px] text-zinc-400">({subtext})</span>}
      </TooltipContent>
    </Tooltip>
  );
}

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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
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
    : pathname === fullHref || (!exact && !hasSub && pathname.startsWith(`${fullHref}/`));

  const tooltipSubtext = locked ? (requiredPlan ? `Requires ${requiredPlan}` : "Locked") : comingSoon ? "Soon" : undefined;

  if (hasSub) {
    return (
      <div className="space-y-0.5">
        <NavTooltipWrapper label={label} subtext={tooltipSubtext} collapsed={collapsed}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-[4px] px-2.5 h-10 min-h-[40px] text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#003399]",
              isParentActive
                ? "bg-[#ebf0fa] text-[#003399] font-bold dark:bg-[#003399]/20 dark:text-[#FFDA1A]"
                : "text-[#484848] hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
              locked && !isParentActive && "opacity-60",
              collapsed && "justify-center px-0"
            )}
            aria-expanded={open}
            aria-label={label}
          >
            {/* Subtle Active Indicator Strip */}
            {isParentActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#003399] dark:bg-[#FFDA1A]" />
            )}
            <Icon
              strokeWidth={1.75}
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                isParentActive
                  ? "text-[#003399] dark:text-[#FFDA1A]"
                  : "text-[#767676] group-hover:text-[#111111] dark:text-zinc-500 dark:group-hover:text-zinc-300"
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{label}</span>
                {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
                {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
                {!locked && (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-600",
                      open && "rotate-180 text-zinc-700 dark:text-zinc-200"
                    )}
                  />
                )}
              </>
            )}
          </button>
        </NavTooltipWrapper>

        {!collapsed && open && subItems && (
          <ul className="relative mt-0.5 space-y-0.5 pl-5 ml-4 border-l border-[#DFDFDF] dark:border-zinc-800">
            {subItems.map((sub) => {
              const subFullHref = `${basePath}${sub.href}`;
              const subActive = sub.exact
                ? pathname === subFullHref
                : pathname === subFullHref || pathname.startsWith(`${subFullHref}/`);
              const SubIcon = sub.icon;
              return (
                <li key={sub.href}>
                  <Link
                    href={subFullHref}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[4px] px-2.5 h-8 min-h-[32px] text-[12.5px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#003399]",
                      subActive
                        ? "bg-[#ebf0fa] text-[#003399] font-bold dark:bg-[#003399]/20 dark:text-[#FFDA1A]"
                        : "text-[#767676] hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
                    )}
                  >
                    <SubIcon
                      strokeWidth={1.75}
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        subActive ? "text-[#003399] dark:text-[#FFDA1A]" : "text-[#767676]"
                      )}
                    />
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
    <NavTooltipWrapper label={label} subtext={tooltipSubtext} collapsed={collapsed}>
      <Link
        href={fullHref}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 rounded-[4px] px-2.5 h-10 min-h-[40px] text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#003399]",
          active
            ? "bg-[#ebf0fa] text-[#003399] font-bold dark:bg-[#003399]/20 dark:text-[#FFDA1A]"
            : "text-[#484848] hover:bg-[#F5F5F5] hover:text-[#111111] dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-zinc-100",
          locked && !active && "opacity-60",
          collapsed && "justify-center px-0"
        )}
        aria-label={label}
      >
        {/* Subtle Active Indicator Strip */}
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#003399] dark:bg-[#FFDA1A]" />
        )}
        <Icon
          strokeWidth={1.75}
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
            active
              ? "text-[#003399] dark:text-[#FFDA1A]"
              : "text-[#767676] group-hover:text-[#111111] dark:text-zinc-500 dark:group-hover:text-zinc-300"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
            {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
          </>
        )}
      </Link>
    </NavTooltipWrapper>
  );
}

/* ── Section Label ────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  if (collapsed) return <div className="mx-3 my-2.5 h-px bg-[#DFDFDF] dark:bg-zinc-800" />;
  return (
    <p className="px-2.5 pt-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#767676] dark:text-zinc-500">
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
    status === "active" ? t.common.active : status === "trial" ? t.common.trial : t.common.expired;

  return (
    <div ref={dropdownRef} className="relative">
      <NavTooltipWrapper label={store.name} subtext={statusLabel} collapsed={collapsed}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-2 text-left transition-colors duration-150 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
            collapsed ? "justify-center p-1.5" : ""
          )}
          aria-expanded={open}
          aria-label={t.navigation.selectStore}
        >
          <StoreBrandMark store={store} size={collapsed ? 32 : 34} roundedClassName="rounded-lg shadow-2xs" />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {store.shortName || store.name}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : status === "trial"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {getStoreDisplayDomain(store.subdomain || store.slug)}
                </p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            </>
          )}
        </button>
      </NavTooltipWrapper>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950",
            collapsed ? "left-12 top-0 w-64" : "left-0 right-0 top-full"
          )}
        >
          <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {t.storeNav.yourStores}
            </p>
            <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {t.storeNav.currentlyManaging(store.name)}
            </p>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {stores.map((s) => {
              const isCurrent = s._id === store._id;
              const sStatus = resolveStoreStatus(s);
              const sStatusLabel =
                sStatus === "active" ? t.common.active : sStatus === "trial" ? t.common.trial : t.common.expired;
              const sPlan = typeof s.planId === "object" && s.planId ? s.planId.name : s.plan;
              return (
                <Link
                  key={s._id}
                  href={`/store/${s.slug}/dashboard`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                    isCurrent
                      ? "bg-zinc-100 text-zinc-950 font-medium dark:bg-white/[0.08] dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  )}
                >
                  <StoreBrandMark store={s} size={26} roundedClassName="rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.shortName || s.name}</p>
                    <p className="truncate text-[10px] text-zinc-400">
                      {sPlan} • {sStatusLabel}
                    </p>
                  </div>
                  {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-white" />}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-zinc-100 p-1.5 space-y-0.5 dark:border-zinc-800">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{language === "bn" ? "ওয়ার্কস্পেস ড্যাশবোর্ড" : "Back to Workspace"}</span>
            </Link>
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.navigation.createStore}</span>
            </Link>
            <Link
              href="/dashboard/stores"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
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

  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id, { skip: !store._id });
  const { data: storageData } = useGetMediaStatsQuery(store._id, { skip: !store._id });
  const features = accessData?.data?.features ?? [];
  const stats = storageData?.data?.stats;

  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();

  const resolveLink = useCallback(
    (link: { label: string; featureKey?: string; permission?: string; comingSoon?: boolean }) => {
      const key = link.featureKey ?? NAV_FEATURE_MAP[link.label];
      const feature = key ? getFeatureByKey(features, key) : undefined;
      const hasPerm = isOwner || !link.permission || checkPermission(permissionSet, link.permission);

      return {
        locked: feature?.locked ?? false,
        noPermission: !hasPerm,
        requiredPlan: feature?.requiredPlan?.name,
        comingSoon: link.comingSoon || feature?.comingSoon,
      };
    },
    [features, isOwner, permissionSet]
  );

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
  const navGroups = useMemo(() => getSidebarNavGroups(t, language === "bn"), [t, language]);

  return (
    <TooltipProvider delayDuration={120}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <aside
          className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-zinc-200/80 bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950",
            collapsed ? "w-[68px]" : "w-[260px]"
          )}
          role="navigation"
          aria-label="Store navigation"
        >
          {/* ── Top: Store & Workspace Switcher ────────────────── */}
          <div className={cn("shrink-0 border-b border-zinc-200/80 dark:border-zinc-800", collapsed ? "p-2" : "p-3")}>
            <SidebarStoreSwitcher store={store} collapsed={collapsed} />
          </div>

          {/* ── Scrollable Navigation Groups ───────────────────── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5"
            aria-label="Main navigation"
          >
            {/* Back to Workspace Action */}
            <div className="mb-2">
              <NavTooltipWrapper
                label={language === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}
                collapsed={collapsed}
              >
                <Link
                  href="/dashboard"
                  onClick={onNavigate}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg px-2.5 h-9 min-h-[36px] text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-colors duration-150 border border-zinc-200/60 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
                    collapsed ? "justify-center px-0" : ""
                  )}
                  aria-label={language === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:-translate-x-0.5 dark:text-zinc-400" />
                  {!collapsed && (
                    <span className="truncate">
                      {language === "bn" ? "ওয়ার্কস্পেসে ফিরে যান" : "Back to Workspace"}
                    </span>
                  )}
                </Link>
              </NavTooltipWrapper>
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
            {navGroups.map((groupDef) => {
              const visibleItems = groupDef.items.filter((item) => {
                const meta = resolveLink(item);
                return !meta.noPermission;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={groupDef.group} className="space-y-0.5">
                  <SectionLabel>{groupDef.group}</SectionLabel>
                  <ul className="space-y-0.5">
                    {visibleItems.map((link) => {
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
              );
            })}
          </nav>

          {/* ── Compact Storage & Footer Bar ──────────────────── */}
          <div className={cn("shrink-0 border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-2" : "p-3")}>
            {!collapsed ? (
              <div className="mb-2.5 rounded-lg border border-zinc-200/60 bg-zinc-50/70 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="h-3 w-3 text-zinc-400" />
                    <span>{t.storeNav.storage}</span>
                  </span>
                  <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                    {usedLabel} / {storageLabel}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isStorageHigh ? "bg-amber-500" : "bg-zinc-900 dark:bg-white"
                    )}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                {isStorageHigh && (
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400">
                    <span>{t.storeNav.storageAlmostFull}</span>
                    <Link href={`${basePath}/billing`} className="font-semibold underline hover:text-amber-900">
                      {t.storeNav.upgrade}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-2 flex justify-center">
                <NavTooltipWrapper
                  label={`${t.storeNav.storage}: ${usedLabel} / ${storageLabel}`}
                  subtext={isStorageHigh ? "Almost full" : `${storagePercent}%`}
                  collapsed={true}
                >
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900"
                    aria-label="Storage status"
                  >
                    <HardDrive className={cn("h-4 w-4", isStorageHigh && "text-amber-500")} />
                  </button>
                </NavTooltipWrapper>
              </div>
            )}

            {/* Collapse/Expand Action Button */}
            <NavTooltipWrapper
              label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
              collapsed={collapsed}
            >
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 h-9 text-xs font-medium text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
                  collapsed ? "justify-center px-0" : ""
                )}
                aria-label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <>
                    <PanelLeftClose className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span>{t.navigation.collapseSidebar}</span>
                  </>
                )}
              </button>
            </NavTooltipWrapper>
          </div>
        </aside>
      </SidebarContext.Provider>
    </TooltipProvider>
  );
}

