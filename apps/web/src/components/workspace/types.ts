import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users, CreditCard, Truck,
  BarChart3, FileText, Palette, Blocks, Settings, Activity, TrendingUp,
  Grid3X3, Layers3, Star, RotateCcw, ShoppingCart, Gift, Percent, Megaphone,
  Mail, Banknote, Wallet, MapPin, Globe, Search, Image, Menu, FileJson,
  HelpCircle, Shield, BookOpen, MessageSquare, Ruler, FolderOpen,
  SlidersHorizontal, Download, Upload, Eye,
} from "lucide-react";

export type WorkspaceTabId =
  | "overview" | "activity" | "reports"
  | "products" | "categories" | "brands" | "collections" | "inventory"
  | "orders" | "draft-orders" | "returns" | "abandoned-carts"
  | "customers" | "customer-groups"
  | "marketing" | "coupons" | "discounts" | "promotions" | "newsletter" | "popups"
  | "payments" | "transactions" | "payouts"
  | "delivery" | "shipping-methods" | "tracking"
  | "builder" | "theme" | "pages" | "navigation" | "footer" | "seo"
  | "cms" | "faq" | "shipping-policy" | "return-policy" | "privacy-policy"
  | "terms" | "about" | "contact-page" | "size-guide"
  | "analytics" | "analytics-sales" | "analytics-revenue" | "analytics-products" | "analytics-customers" | "analytics-visitors"
  | "settings" | "store-info" | "domain" | "currency" | "taxes"
  | "languages" | "notifications" | "staff" | "security" | "api-keys";

export type NavGroupItem = {
  id: WorkspaceTabId;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavGroupItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "overview-group",
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "activity", label: "Activity", icon: Activity },
      { id: "reports", label: "Reports", icon: TrendingUp },
    ],
  },
  {
    id: "catalog-group",
    label: "Catalog",
    icon: FolderOpen,
    items: [
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: Tags },
      { id: "brands", label: "Brands", icon: Grid3X3 },
      { id: "collections", label: "Collections", icon: Layers3 },
      { id: "inventory", label: "Inventory", icon: SlidersHorizontal },
    ],
  },
  {
    id: "sales-group",
    label: "Sales",
    icon: ShoppingBag,
    items: [
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "draft-orders", label: "Draft Orders", icon: FileText },
      { id: "returns", label: "Returns", icon: RotateCcw },
      { id: "abandoned-carts", label: "Abandoned Carts", icon: ShoppingBag },
    ],
  },
  {
    id: "customers-group",
    label: "Customers",
    icon: Users,
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "customer-groups", label: "Customer Groups", icon: Users },
    ],
  },
  {
    id: "marketing-group",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { id: "coupons", label: "Coupons", icon: Gift },
      { id: "discounts", label: "Discounts", icon: Percent },
      { id: "promotions", label: "Promotions", icon: Megaphone },
      { id: "newsletter", label: "Newsletter", icon: Mail },
      { id: "popups", label: "Popups", icon: Image },
    ],
  },
  {
    id: "payments-group",
    label: "Payments",
    icon: CreditCard,
    items: [
      { id: "payments", label: "Payment Methods", icon: Wallet },
      { id: "transactions", label: "Transactions", icon: Banknote },
      { id: "payouts", label: "Payouts", icon: CreditCard },
    ],
  },
  {
    id: "shipping-group",
    label: "Shipping",
    icon: Truck,
    items: [
      { id: "delivery", label: "Delivery Zones", icon: MapPin },
      { id: "shipping-methods", label: "Shipping Methods", icon: Truck },
      { id: "tracking", label: "Tracking", icon: Search },
    ],
  },
  {
    id: "website-group",
    label: "Website",
    icon: Globe,
    items: [
      { id: "builder", label: "Builder", icon: Blocks },
      { id: "theme", label: "Theme", icon: Palette },
      { id: "pages", label: "Pages", icon: FileText },
      { id: "navigation", label: "Navigation Menu", icon: Menu },
      { id: "footer", label: "Footer", icon: Image },
      { id: "seo", label: "SEO", icon: Search },
    ],
  },
  {
    id: "cms-group",
    label: "Content",
    icon: FileJson,
    items: [
      { id: "cms", label: "All Pages", icon: FileText },
      { id: "faq", label: "FAQ", icon: HelpCircle },
      { id: "shipping-policy", label: "Shipping Policy", icon: Truck },
      { id: "return-policy", label: "Return Policy", icon: RotateCcw },
      { id: "privacy-policy", label: "Privacy Policy", icon: Shield },
      { id: "terms", label: "Terms & Conditions", icon: BookOpen },
      { id: "about", label: "About Us", icon: Users },
      { id: "contact-page", label: "Contact Page", icon: MessageSquare },
      { id: "size-guide", label: "Size Guide", icon: Ruler },
    ],
  },
  {
    id: "analytics-group",
    label: "Analytics",
    icon: BarChart3,
    items: [
      { id: "analytics", label: "Overview", icon: BarChart3 },
      { id: "analytics-sales", label: "Sales", icon: TrendingUp },
      { id: "analytics-revenue", label: "Revenue", icon: Wallet },
      { id: "analytics-products", label: "Products", icon: Package },
      { id: "analytics-customers", label: "Customers", icon: Users },
      { id: "analytics-visitors", label: "Visitors", icon: Eye },
    ],
  },
  {
    id: "settings-group",
    label: "Settings",
    icon: Settings,
    items: [
      { id: "settings", label: "General", icon: Settings },
      { id: "store-info", label: "Store Information", icon: FileText },
      { id: "domain", label: "Domain", icon: Globe },
      { id: "currency", label: "Currency", icon: Wallet },
      { id: "taxes", label: "Taxes", icon: Percent },
      { id: "languages", label: "Languages", icon: Globe },
      { id: "notifications", label: "Notifications", icon: Mail },
      { id: "staff", label: "Staff Accounts", icon: Users },
      { id: "security", label: "Security", icon: Shield },
      { id: "api-keys", label: "API Keys", icon: FileJson },
    ],
  },
];

export const workspaceTabs = navGroups.flatMap((g) => g.items);

export const tabLabelMap: Record<string, string> = Object.fromEntries(
  workspaceTabs.map((t) => [t.id, t.label])
);

export const parentGroupMap: Record<string, string> = {};
for (const group of navGroups) {
  for (const item of group.items) {
    parentGroupMap[item.id] = group.id;
  }
}
