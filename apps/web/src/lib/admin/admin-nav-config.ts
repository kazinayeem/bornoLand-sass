import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileBarChart,
  FileText,
  Globe,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  LifeBuoy,
  Lock,
  Megaphone,
  Package,
  Puzzle,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Store,
  Target,
  UserCog,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  description?: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
  defaultOpen?: boolean;
};

/** SaaS platform navigation — no store operations (orders, products, inventory, etc.) */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    defaultOpen: true,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/dashboard/analytics", label: "Platform Analytics", icon: BarChart3 },
      { href: "/admin/dashboard/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    defaultOpen: true,
    items: [
      { href: "/admin/dashboard/workspaces", label: "Workspace Management", icon: Building2 },
      { href: "/admin/dashboard/stores", label: "Store Management", icon: Store },
      { href: "/admin/dashboard/tracking", label: "Tracking Overview", icon: Target, description: "Pixel & tracking adoption" },
      { href: "/admin/dashboard/users", label: "Users", icon: Users },
      { href: "/admin/dashboard/roles", label: "Roles & Permissions", icon: UserCog },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    defaultOpen: true,
    items: [
      { href: "/admin/dashboard/subscriptions", label: "Subscriptions", icon: Layers },
      { href: "/admin/dashboard/plans", label: "Plans", icon: Sparkles },
      { href: "/admin/dashboard/invoices", label: "Invoices", icon: FileText },
      { href: "/admin/dashboard/payments", label: "Payments", icon: Wallet },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      { href: "/admin/dashboard/templates", label: "Themes Marketplace", icon: LayoutTemplate },
      { href: "/admin/dashboard/apps", label: "Apps Marketplace", icon: Puzzle },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin/dashboard/support", label: "Support Tickets", icon: LifeBuoy },
      { href: "/admin/dashboard/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/dashboard/domains", label: "Domains", icon: Globe },
      { href: "/admin/dashboard/storage", label: "Storage Usage", icon: HardDrive },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/dashboard/settings", label: "System Settings", icon: Settings },
      { href: "/admin/dashboard/security", label: "Security", icon: Shield },
      { href: "/admin/dashboard/api-keys", label: "API Keys", icon: KeyRound },
      { href: "/admin/dashboard/developers", label: "Developers", icon: Webhook },
      { href: "/admin/dashboard/audit-center", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/dashboard/activity", label: "Activity Logs", icon: Activity },
    ],
  },
];

export const ADMIN_ACCOUNT_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard/profile", label: "Profile", icon: Users },
];

export const ADMIN_PROFILE_MENU = [
  { label: "Profile", href: "/admin/dashboard/profile", icon: Users },
  { label: "Account", href: "/admin/dashboard/profile?tab=account", icon: Users },
  { label: "Organization", href: "/admin/dashboard/workspaces", icon: Building2 },
  { label: "Platform Settings", href: "/admin/dashboard/settings", icon: Settings },
  { label: "API Keys", href: "/admin/dashboard/api-keys", icon: KeyRound },
  { label: "Notifications", href: "/admin/dashboard/profile?tab=notifications", icon: Bell },
  { label: "Security", href: "/admin/dashboard/security", icon: Lock },
  { label: "Billing", href: "/admin/dashboard/invoices", icon: CreditCard },
  { label: "Audit Logs", href: "/admin/dashboard/audit-center", icon: ScrollText },
  { label: "Help Center", href: "/admin/dashboard/support", icon: LifeBuoy },
] as const;

export const ADMIN_QUICK_ACTIONS = [
  { label: "Create Workspace", href: "/admin/dashboard/workspaces", icon: Building2 },
  { label: "Create Plan", href: "/admin/dashboard/plans", icon: Sparkles },
  { label: "Approve Store", href: "/admin/dashboard/stores", icon: Store },
  { label: "Suspend Store", href: "/admin/dashboard/stores", icon: Shield },
  { label: "Broadcast Announcement", href: "/admin/dashboard/announcements", icon: Megaphone },
  { label: "View Reports", href: "/admin/dashboard/reports", icon: FileBarChart },
  { label: "Manage Themes", href: "/admin/dashboard/templates", icon: LayoutTemplate },
  { label: "Manage Apps", href: "/admin/dashboard/apps", icon: Package },
] as const;

const ADMIN_ROUTE_LABELS: Record<string, string> = {};

for (const group of ADMIN_NAV_GROUPS) {
  for (const item of group.items) {
    ADMIN_ROUTE_LABELS[item.href] = item.label;
  }
}
for (const item of ADMIN_ACCOUNT_NAV) {
  ADMIN_ROUTE_LABELS[item.href] = item.label;
}

ADMIN_ROUTE_LABELS["/dashboard"] = "Dashboard";
ADMIN_ROUTE_LABELS["/admin/dashboard"] = "Dashboard";
ADMIN_ROUTE_LABELS["/admin/dashboard/plans"] = "Plans";
ADMIN_ROUTE_LABELS["/admin/dashboard/platform"] = "Finance Overview";

export function getAdminPageTitle(pathname: string): string {
  if (ADMIN_ROUTE_LABELS[pathname]) return ADMIN_ROUTE_LABELS[pathname];
  if (pathname.startsWith("/admin/dashboard/plans/")) return "Plan Builder";
  if (pathname.startsWith("/admin/dashboard/stores/")) return "Store Details";
  return "Platform";
}

export function isAdminNavActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/admin/dashboard";
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
