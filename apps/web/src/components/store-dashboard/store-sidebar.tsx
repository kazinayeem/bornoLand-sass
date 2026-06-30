"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingBag,
  Users,
  Star,
  Ticket,
  FileText,
  Image,
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
  Lock,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { Badge } from "@/components/ui/badge";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining } from "@/lib/store-status";
import { useGetStoreFeatureAccessQuery, NAV_FEATURE_MAP, getFeatureByKey } from "@/redux/api/feature-api";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/inventory", label: "Inventory", icon: Boxes, featureKey: "inventory" },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reviews", label: "Reviews", icon: Star, featureKey: "reviews" },
  { href: "/coupons", label: "Coupons", icon: Ticket, featureKey: "coupons" },
  { href: "/cms", label: "CMS", icon: FileText, featureKey: "cms" },
  { href: "/pages", label: "Pages", icon: FileText, featureKey: "cms" },
  { href: "/media", label: "Media", icon: Image, featureKey: "media" },
  { href: "/theme", label: "Theme", icon: Palette },
  { href: "/analytics", label: "Analytics", icon: BarChart3, featureKey: "analytics" },
  { href: "/reports", label: "Reports", icon: BarChart3, featureKey: "reports" },
  { href: "/marketing", label: "Marketing", icon: Megaphone, featureKey: "marketing" },
  { href: "/apps", label: "Apps", icon: Blocks, featureKey: "apps", comingSoon: true },
];

const appearanceLinks = [
  { href: "/appearance/branding", label: "Branding", icon: Sparkles },
  { href: "/appearance/domain", label: "Domain", icon: Globe },
  { href: "/appearance/seo", label: "SEO", icon: Search },
];

const bottomLinks = [
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/builder", label: "Builder", icon: Sparkles },
];

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
  const fullHref = `${basePath}${href}`;
  const active = exact
    ? pathname === fullHref
    : pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  return (
    <Link
      href={fullHref}
      title={locked ? `Available in ${requiredPlan ?? "a higher plan"}` : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        locked && !active && "opacity-70"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-zinc-400")} />
      <span className="flex-1 truncate">{label}</span>
      {comingSoon && !locked && <ComingSoonBadge className="scale-90" />}
      {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
    </Link>
  );
}

export function StoreSidebar({ store }: { store: Store }) {
  const basePath = `/store/${store.slug}`;
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);
  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id);
  const { data: storageData } = useGetMediaStatsQuery(store._id);
  const features = accessData?.data?.features ?? [];
  const stats = storageData?.data?.stats;
  const currentPlan = typeof store.planId === "object" && store.planId ? store.planId.name : store.plan;

  const resolveLink = (link: { label: string; featureKey?: string; comingSoon?: boolean }) => {
    const key = link.featureKey ?? NAV_FEATURE_MAP[link.label];
    if (!key) return { locked: false, comingSoon: link.comingSoon };
    const feature = getFeatureByKey(features, key);
    return {
      locked: feature?.locked ?? false,
      requiredPlan: feature?.requiredPlan?.name,
      comingSoon: link.comingSoon || feature?.comingSoon,
    };
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white">
      <div className="border-b border-zinc-100 p-4">
        <Link
          href="/dashboard/stores"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All Stores
        </Link>
        <div className="flex items-center gap-3">
          <StoreBrandMark store={store} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{store.shortName || store.name}</p>
            <p className="truncate text-xs text-zinc-500">{store.tagline || store.slug}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          <Badge variant="slate">{currentPlan}</Badge>
          {status === "trial" && trialDays !== null && (
            <Badge variant="primary">{trialDays}d trial</Badge>
          )}
        </div>
        <div className="mt-3 rounded-xl bg-zinc-50 p-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
            <span>Storage</span>
            <span>{stats?.usedMB?.toFixed?.(1) ?? "0.0"} / {stats?.unlimited ? "Unlimited" : `${stats?.limitMB ?? 0} MB`}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full rounded-full bg-zinc-900" style={{ width: `${Math.min(stats?.percentUsed ?? 0, 100)}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {mainLinks.map((link) => {
            const meta = resolveLink(link);
            return (
              <li key={link.href + link.label}>
                <NavItem {...link} basePath={basePath} locked={meta.locked} requiredPlan={meta.requiredPlan} comingSoon={meta.comingSoon} />
              </li>
            );
          })}
        </ul>

        <div>
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Appearance</p>
          <ul className="space-y-0.5">
            {appearanceLinks.map((link) => {
              const meta = resolveLink({ label: link.label });
              return (
                <li key={link.href}>
                  <NavItem {...link} basePath={basePath} locked={meta.locked} requiredPlan={meta.requiredPlan} comingSoon={meta.comingSoon} />
                </li>
              );
            })}
          </ul>
        </div>

        <ul className="space-y-0.5 border-t border-zinc-100 pt-3">
          {bottomLinks.map((link) => {
            const meta = resolveLink({ label: link.label, featureKey: link.label === "Builder" ? "builder" : undefined });
            return (
              <li key={link.href}>
                <NavItem {...link} basePath={basePath} locked={meta.locked} requiredPlan={meta.requiredPlan} comingSoon={meta.comingSoon} />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
