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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { Badge } from "@/components/ui/badge";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining } from "@/lib/store-status";

const mainLinks = [
  { href: "", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reviews", label: "Reviews", icon: Star, soon: true },
  { href: "/coupons", label: "Coupons", icon: Ticket, soon: true },
  { href: "/cms", label: "CMS", icon: FileText },
  { href: "/media", label: "Media", icon: Image, soon: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/marketing", label: "Marketing", icon: Megaphone, soon: true },
  { href: "/apps", label: "Apps", icon: Blocks, soon: true },
];

const appearanceLinks = [
  { href: "/appearance/theme", label: "Theme", icon: Palette },
  { href: "/appearance/domain", label: "Domain", icon: Globe, soon: true },
  { href: "/appearance/seo", label: "SEO", icon: Search, soon: true },
];

const bottomLinks = [
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
  soon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  basePath: string;
  exact?: boolean;
  soon?: boolean;
}) {
  const pathname = usePathname();
  const fullHref = `${basePath}${href}`;
  const active = exact ? pathname === basePath : pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  if (soon) {
    return (
      <span className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400">
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1">{label}</span>
        <Lock className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <Link
      href={fullHref}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-zinc-400")} />
      {label}
    </Link>
  );
}

export function StoreSidebar({ store }: { store: Store }) {
  const basePath = `/store/${store.slug}`;
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
            {store.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{store.name}</p>
            <p className="truncate text-xs text-zinc-500">{store.slug}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {status === "trial" && trialDays !== null && (
            <Badge variant="primary">{trialDays}d trial</Badge>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {mainLinks.map((link) => (
            <li key={link.href + link.label}>
              <NavItem {...link} basePath={basePath} />
            </li>
          ))}
        </ul>

        <div>
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Appearance</p>
          <ul className="space-y-0.5">
            {appearanceLinks.map((link) => (
              <li key={link.href}>
                <NavItem {...link} basePath={basePath} />
              </li>
            ))}
          </ul>
        </div>

        <ul className="space-y-0.5 border-t border-zinc-100 pt-3">
          {bottomLinks.map((link) => (
            <li key={link.href}>
              <NavItem {...link} basePath={basePath} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
