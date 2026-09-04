import type { ComponentType } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Tags,
  ShoppingCart,
  Star,
  Boxes,
  Building2,
  ArrowLeftRight,
  Trash2,
  Receipt,
  Truck,
  Calculator,
  Clock,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Wallet,
  UserCheck,
  Landmark,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Target,
  Headphones,
  Megaphone,
  Ticket,
  CheckSquare,
  Layers,
  PackageCheck,
  CreditCard,
  Percent,
  Palette,
  Menu,
  FileText,
  Image as ImageIcon,
  Mail,
  Search,
  Globe2,
  Share2,
  HelpCircle,
  Settings,
  Blocks,
  ScrollText,
  CreditCard as BillingCard,
} from "lucide-react";

export type NavSubItem = {
  id: string;
  href: string;
  labelEn: string;
  labelBn: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  permission?: string;
};

export type NavItem = {
  id: string;
  href: string;
  labelEn: string;
  labelBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  featureKey?: string;
  permission?: string;
  comingSoon?: boolean;
  badge?: string;
  sectionGroup?: "people" | "time" | "payroll" | "accounting" | "operational" | "analytics";
  subItems?: NavSubItem[];
};

export type BusinessModule = {
  id: string;
  key: string;
  titleEn: string;
  titleBn: string;
  shortTitleEn: string;
  shortTitleBn: string;
  badgeIcon?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  defaultRoute: string;
  items: NavItem[];
};

/**
 * Canonical Single Source of Truth for BornoLand ERP Navigation.
 * Ordered by modern enterprise ERP business priority:
 * 1. Home / Dashboard
 * 2. Commerce
 * 3. Inventory
 * 4. Purchasing
 * 5. POS
 * 6. People / HRM
 * 7. Finance
 * 8. Growth
 * 9. Operations
 * 10. Store / Website
 * 11. System
 */
export const BUSINESS_MODULES: BusinessModule[] = [
  // ── 1. HOME / DASHBOARD ──
  {
    id: "home",
    key: "home",
    titleEn: "Home",
    titleBn: "হোম",
    shortTitleEn: "Home",
    shortTitleBn: "হোম",
    badgeIcon: "🏠",
    icon: LayoutDashboard,
    defaultRoute: "/dashboard",
    items: [
      {
        id: "dashboard",
        href: "/dashboard",
        labelEn: "Store Dashboard",
        labelBn: "স্টোর ড্যাশবোর্ড",
        descriptionEn: "Live business metrics, revenue and KPI summary",
        descriptionBn: "লাইভ বিক্রয় ও পারফরম্যান্স ওভারভিউ",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },

  // ── 2. COMMERCE ──
  {
    id: "commerce",
    key: "commerce",
    titleEn: "Commerce",
    titleBn: "ব্যবসা ও বাণিজ্য",
    shortTitleEn: "Commerce",
    shortTitleBn: "বাণিজ্য",
    badgeIcon: "🛍️",
    icon: ShoppingBag,
    defaultRoute: "/orders",
    items: [
      {
        id: "orders",
        href: "/orders",
        labelEn: "Orders",
        labelBn: "অর্ডারসমূহ",
        descriptionEn: "Customer sales orders and delivery status",
        descriptionBn: "গ্রাহকদের বিক্রয় অর্ডার ও ডেলিভারি তথ্য",
        icon: ShoppingBag,
        exact: true,
        permission: "orders:read",
      },
      {
        id: "customers",
        href: "/customers",
        labelEn: "Customers",
        labelBn: "কাস্টমার তালিকা",
        descriptionEn: "Customer directory, profiles and purchase history",
        descriptionBn: "কাস্টমার ডিরেক্টরি ও অর্ডারের ইতিহাস",
        icon: Users,
        permission: "customers:read",
      },
      {
        id: "products",
        href: "/products",
        labelEn: "Products",
        labelBn: "পণ্য ক্যাটালগ",
        descriptionEn: "Product catalog, variants, pricing and SKUs",
        descriptionBn: "পণ্য তালিকা, ভ্যারিয়েন্ট ও মূল্য",
        icon: Package,
        permission: "products:read",
      },
      {
        id: "categories",
        href: "/categories",
        labelEn: "Categories",
        labelBn: "ক্যাটাগরি",
        descriptionEn: "Product collections and hierarchical categories",
        descriptionBn: "পণ্য শ্রেণিবিভাগ ও ক্যাটাগরি",
        icon: Tags,
        permission: "categories:read",
      },
      {
        id: "incomplete-orders",
        href: "/orders/incomplete",
        labelEn: "Incomplete Orders",
        labelBn: "অসম্পূর্ণ অর্ডার",
        descriptionEn: "Abandoned checkouts and incomplete cart sessions",
        descriptionBn: "পরিত্যক্ত চেকআউট ও অসম্পূর্ণ অর্ডার",
        icon: ShoppingCart,
        featureKey: "incomplete_orders",
        permission: "orders:read",
      },
      {
        id: "reviews",
        href: "/reviews",
        labelEn: "Reviews & Ratings",
        labelBn: "রিভিউ ও রেটিং",
        descriptionEn: "Customer feedback and product ratings",
        descriptionBn: "গ্রাহকের মতামত ও পণ্য পর্যালোচনা",
        icon: Star,
        featureKey: "reviews",
        permission: "reviews:read",
      },
    ],
  },

  // ── 3. INVENTORY ──
  {
    id: "inventory",
    key: "inventory",
    titleEn: "Inventory",
    titleBn: "ইনভেন্টরি ও গুদাম",
    shortTitleEn: "Inventory",
    shortTitleBn: "ইনভেন্টরি",
    badgeIcon: "📦",
    icon: Boxes,
    defaultRoute: "/inventory",
    items: [
      {
        id: "inventory-stock",
        href: "/inventory",
        labelEn: "Stock Overview",
        labelBn: "স্টক বিবরণী",
        descriptionEn: "Real-time SKU quantities and low-stock alerts",
        descriptionBn: "রিয়েল-টাইম স্টক পরিমাণ ও সতর্কবার্তা",
        icon: Boxes,
        featureKey: "inventory",
        permission: "inventory:read",
        exact: true,
      },
      {
        id: "warehouses",
        href: "/inventory/warehouses",
        labelEn: "Warehouses",
        labelBn: "গুদাম ও অবস্থান",
        descriptionEn: "Multi-warehouse locations and storage hubs",
        descriptionBn: "একাধিক ওয়্যারহাউস ও সংরক্ষণ কেন্দ্র",
        icon: Building2,
        featureKey: "warehouses",
        permission: "warehouse:read",
      },
      {
        id: "stock-ledger",
        href: "/inventory/ledger",
        labelEn: "Stock Movement",
        labelBn: "স্টক মুভমেন্ট লেজার",
        descriptionEn: "Audited stock log of all transfers, ins and outs",
        descriptionBn: "স্টক আসা-যাওয়ার নিরীক্ষিত হিসাব",
        icon: ArrowLeftRight,
        featureKey: "inventory",
        permission: "inventory:read",
      },
      {
        id: "waste-loss",
        href: "/inventory/waste",
        labelEn: "Waste & Loss",
        labelBn: "ক্ষয়ক্ষতি ও অপচয়",
        descriptionEn: "Expired, damaged and discarded inventory logs",
        descriptionBn: "ক্ষতিগ্রস্ত বা নষ্ট মালের হিসাব",
        icon: Trash2,
        featureKey: "inventory",
        permission: "inventory:read",
      },
    ],
  },

  // ── 4. PURCHASING ──
  {
    id: "purchasing",
    key: "purchasing",
    titleEn: "Purchasing",
    titleBn: "ক্রয় ও সরবরাহ",
    shortTitleEn: "Purchasing",
    shortTitleBn: "ক্রয়",
    badgeIcon: "🚚",
    icon: Receipt,
    defaultRoute: "/inventory/purchasing",
    items: [
      {
        id: "purchase-orders",
        href: "/inventory/purchasing",
        labelEn: "Purchase Orders",
        labelBn: "পারচেজ অর্ডার (PO)",
        descriptionEn: "Supplier orders, goods receipts and purchase tracking",
        descriptionBn: "সরবরাহকারী ক্রয়াদেশ ও পণ্য গ্রহণের রসিদ",
        icon: Receipt,
        featureKey: "purchase_orders",
        permission: "procurement:read",
      },
      {
        id: "suppliers",
        href: "/inventory/suppliers",
        labelEn: "Suppliers Master",
        labelBn: "সরবরাহকারী তালিকা",
        descriptionEn: "Vendor contacts, trade terms and supplier ledgers",
        descriptionBn: "ভেন্ডর যোগাযোগ ও সরবরাহকারী খতিয়ান",
        icon: Truck,
        featureKey: "suppliers",
        permission: "procurement:read",
      },
    ],
  },

  // ── 5. POS (POINT OF SALE) ──
  {
    id: "pos",
    key: "pos",
    titleEn: "Point of Sale (POS)",
    titleBn: "পয়েন্ট অব সেল (পিওএস)",
    shortTitleEn: "POS",
    shortTitleBn: "পিওএস",
    badgeIcon: "🧾",
    icon: Calculator,
    defaultRoute: "/pos",
    items: [
      {
        id: "pos-terminal",
        href: "/pos",
        labelEn: "POS Terminal",
        labelBn: "পিওএস টার্মিনাল",
        descriptionEn: "High-speed retail counter checkout & receipt printing",
        descriptionBn: "দ্রুতগতির বিক্রয় কাউন্টার ও রসিদ প্রিন্টিং",
        icon: Calculator,
        featureKey: "pos",
        permission: "pos:read",
        exact: true,
      },
      {
        id: "pos-shifts",
        href: "/pos/shifts",
        labelEn: "Registers & Shifts",
        labelBn: "ক্যাশ রেজিস্টার ও শিফট",
        descriptionEn: "Cash drawers, closing tallies and shift reconciliations",
        descriptionBn: "ক্যাশ ড্রয়ার ও ক্যাশিয়ার শিফট হিসেব",
        icon: Clock,
        featureKey: "pos",
        permission: "pos:read",
      },
    ],
  },

  // ── 6. PEOPLE / HRM ──
  {
    id: "hrm",
    key: "hrm",
    titleEn: "People & HRM",
    titleBn: "কর্মী ও মানবসম্পদ (HRM)",
    shortTitleEn: "HRM",
    shortTitleBn: "কর্মী",
    badgeIcon: "👥",
    icon: Users,
    defaultRoute: "/hrm/employees",
    items: [
      {
        id: "hrm-employees",
        href: "/hrm/employees",
        labelEn: "Employees Directory",
        labelBn: "কর্মচারী ডিরেক্টরি",
        descriptionEn: "Staff profiles, employee IDs and contract terms",
        descriptionBn: "কর্মী প্রোফাইল ও কর্মী কোড",
        icon: Users,
        featureKey: "employees",
        permission: "hrm:read",
        sectionGroup: "people",
      },
      {
        id: "hrm-organization",
        href: "/hrm/organization",
        labelEn: "Organization",
        labelBn: "সাংগঠনিক কাঠামো",
        descriptionEn: "Departments, designations and business hierarchy",
        descriptionBn: "বিভাগ ও পদবী নির্ধারণ",
        icon: Briefcase,
        featureKey: "departments",
        permission: "hrm:read",
        sectionGroup: "people",
      },
      {
        id: "hrm-attendance",
        href: "/hrm/attendance",
        labelEn: "Attendance & Shifts",
        labelBn: "হাজিরা ও শিফট",
        descriptionEn: "Daily clock-ins, late penalties and overtime logs",
        descriptionBn: "দৈনিক উপস্থিতি, লেট ও ওভারটাইম হিসাব",
        icon: CalendarCheck,
        featureKey: "attendance",
        permission: "hrm:read",
        sectionGroup: "time",
      },
      {
        id: "hrm-leaves",
        href: "/hrm/leaves",
        labelEn: "Leave Management",
        labelBn: "ছুটি ব্যবস্থাপনা",
        descriptionEn: "Leave requests, approval workflows and annual balances",
        descriptionBn: "ছুটির আবেদন ও ব্যালেন্স অনুমোদন",
        icon: CalendarDays,
        featureKey: "leave_mgmt",
        permission: "hrm:read",
        sectionGroup: "time",
      },
      {
        id: "hrm-payroll",
        href: "/hrm/payroll",
        labelEn: "Payroll & Payslips",
        labelBn: "পেরোল ও পে-স্লিপ",
        descriptionEn: "Monthly salary generation, deductions and official payslips",
        descriptionBn: "মাসিক বেতন তৈরি ও অফিসিয়াল পে-স্লিপ",
        icon: Wallet,
        featureKey: "payroll",
        permission: "hrm:payroll:manage",
        sectionGroup: "payroll",
      },
      {
        id: "hrm-self-service",
        href: "/hrm/self-service",
        labelEn: "Employee Self-Service",
        labelBn: "কর্মী সেলফ-সার্ভিস",
        descriptionEn: "Personal attendance clocking, leave requests & payslips",
        descriptionBn: "ব্যক্তিগত হাজিরা, ছুটি ও বেতনের পে-স্লিপ",
        icon: UserCheck,
        featureKey: "self_service",
        permission: "hrm:self:read",
        sectionGroup: "people",
      },
    ],
  },

  // ── 7. FINANCE & ACCOUNTING ──
  {
    id: "finance",
    key: "finance",
    titleEn: "Finance & Accounting",
    titleBn: "হিসাববিজ্ঞান ও অর্থ",
    shortTitleEn: "Finance",
    shortTitleBn: "অর্থ",
    badgeIcon: "💰",
    icon: Landmark,
    defaultRoute: "/finance/accounting",
    items: [
      {
        id: "finance-accounting",
        href: "/finance/accounting",
        labelEn: "Accounting Overview",
        labelBn: "অ্যাকাউন্টিং ওভারভিউ",
        descriptionEn: "General ledger summary and financial performance",
        descriptionBn: "সাধারণ খতিয়ান ও আর্থিক পারফরম্যান্স",
        icon: Landmark,
        featureKey: "chart_of_accounts",
        permission: "finance:read",
        exact: true,
        sectionGroup: "accounting",
      },
      {
        id: "finance-coa",
        href: "/finance/accounting/coa",
        labelEn: "Chart of Accounts",
        labelBn: "হিসাবের তালিকা (COA)",
        descriptionEn: "Assets, liabilities, equity, revenue and expense heads",
        descriptionBn: "সম্পদ, দায় ও ব্যয়ের চার্ট অব অ্যাকাউন্টস",
        icon: BookOpen,
        featureKey: "chart_of_accounts",
        permission: "finance:read",
        sectionGroup: "accounting",
      },
      {
        id: "finance-journal",
        href: "/finance/accounting/journal",
        labelEn: "Journal Entries",
        labelBn: "জার্নাল এন্ট্রি",
        descriptionEn: "Double-entry bookkeeping transactions and vouchers",
        descriptionBn: "দ্বৈত-দাখিলা জার্নাল ও ভাউচার",
        icon: FileSpreadsheet,
        featureKey: "journal_entries",
        permission: "finance:read",
        sectionGroup: "accounting",
      },
      {
        id: "finance-expenses",
        href: "/finance/expenses",
        labelEn: "Business Expenses",
        labelBn: "ব্যয় ও খরচ",
        descriptionEn: "Operational bills, petty cash and payment disbursements",
        descriptionBn: "দৈনিক খরচ, বিল ও পেমেন্ট রসিদ",
        icon: Receipt,
        featureKey: "expenses",
        permission: "finance:read",
        sectionGroup: "operational",
      },
      {
        id: "finance-reports",
        href: "/finance/reports",
        labelEn: "Financial Reports",
        labelBn: "আর্থিক প্রতিবেদন",
        descriptionEn: "Trial balance, Profit & Loss and Balance Sheets",
        descriptionBn: "রেওয়ামিল, লাভ-ক্ষতি ও উদ্বৃত্তপত্র",
        icon: BarChart3,
        featureKey: "financial_reports",
        permission: "finance:read",
        sectionGroup: "accounting",
      },
    ],
  },

  // ── 8. GROWTH & MARKETING ──
  {
    id: "growth",
    key: "growth",
    titleEn: "Growth & CRM",
    titleBn: "গ্রোথ ও সিআরএম",
    shortTitleEn: "Growth",
    shortTitleBn: "গ্রোথ",
    badgeIcon: "📈",
    icon: Target,
    defaultRoute: "/crm/deals",
    items: [
      {
        id: "crm-deals",
        href: "/crm/deals",
        labelEn: "CRM Pipeline",
        labelBn: "সিআরএম পাইপলাইন",
        descriptionEn: "Sales opportunities, stages and lead pipeline",
        descriptionBn: "বিক্রয় পাইপলাইন ও লিড ট্র্যাকিং",
        icon: Target,
        featureKey: "crm_deals",
        permission: "crm:read",
      },
      {
        id: "support-tickets",
        href: "/support/tickets",
        labelEn: "Support Helpdesk",
        labelBn: "সাপোর্ট হেল্পডেস্ক",
        descriptionEn: "Customer inquiries, escalations and resolution tickets",
        descriptionBn: "গ্রাহক সহায়তা টিকিট ও সেবা",
        icon: Headphones,
        featureKey: "support_tickets",
        permission: "support:read",
      },
      {
        id: "marketing",
        href: "/marketing",
        labelEn: "Marketing Campaigns",
        labelBn: "মার্কেটিং ক্যাম্পেইন",
        descriptionEn: "Promotional campaigns and customer outreach",
        descriptionBn: "প্রচারমূলক ক্যাম্পেইন ও প্রচার",
        icon: Megaphone,
        featureKey: "marketing",
        permission: "marketing:read",
      },
      {
        id: "coupons",
        href: "/coupons",
        labelEn: "Coupons & Discounts",
        labelBn: "কুপন ও ডিসকাউন্ট",
        descriptionEn: "Promotional vouchers, percentages and minimum buys",
        descriptionBn: "ডিসকাউন্ট কোড ও অফার",
        icon: Ticket,
        featureKey: "coupons",
        permission: "coupons:read",
      },
      {
        id: "tracking-pixels",
        href: "/settings/tracking",
        labelEn: "Tracking Pixels",
        labelBn: "ট্র্যাকিং পিক্সেল",
        descriptionEn: "Meta Pixel, TikTok Pixel & Google Tag tracking",
        descriptionBn: "পিক্সেল ও রূপান্তর ট্র্যাকিং",
        icon: Target,
        featureKey: "marketing",
        permission: "marketing:read",
      },
      {
        id: "analytics",
        href: "/analytics",
        labelEn: "Analytics Overview",
        labelBn: "অ্যানালিটিক্স",
        descriptionEn: "Live traffic, visitor demographics and conversion rates",
        descriptionBn: "ওয়েবসাইট ভিজিটর ও রূপান্তর বিশ্লেষণ",
        icon: BarChart3,
        exact: true,
        featureKey: "analytics",
        permission: "analytics:read",
        subItems: [
          { id: "analytics-overview", href: "/analytics", labelEn: "Overview", labelBn: "ওভারভিউ", exact: true },
          { id: "analytics-visitors", href: "/analytics/visitors", labelEn: "Visitors", labelBn: "ভিজিটর" },
          { id: "analytics-live", href: "/analytics/live", labelEn: "Live Visitors", labelBn: "লাইভ ভিজিটর" },
          { id: "analytics-sources", href: "/analytics/traffic-sources", labelEn: "Traffic Sources", labelBn: "ট্রাফিক সোর্স" },
          { id: "analytics-devices", href: "/analytics/devices", labelEn: "Devices", labelBn: "ডিভাইস" },
          { id: "analytics-pages", href: "/analytics/pages", labelEn: "Top Pages", labelBn: "জনপ্রিয় পেজ" },
        ],
      },
      {
        id: "reports",
        href: "/reports",
        labelEn: "Business Reports",
        labelBn: "ব্যবসায়িক রিপোর্ট",
        descriptionEn: "Exportable sales, customer and performance reports",
        descriptionBn: "রপ্তানিযোগ্য বিক্রয় ও লাভ-ক্ষতি রিপোর্ট",
        icon: FileSpreadsheet,
        featureKey: "reports",
        permission: "reports:read",
      },
    ],
  },

  // ── 9. OPERATIONS ──
  {
    id: "operations",
    key: "operations",
    titleEn: "Operations",
    titleBn: "অপারেশনস",
    shortTitleEn: "Operations",
    shortTitleBn: "অপারেশন",
    badgeIcon: "⚙️",
    icon: CheckSquare,
    defaultRoute: "/operations/approvals",
    items: [
      {
        id: "approvals",
        href: "/operations/approvals",
        labelEn: "Approval Center",
        labelBn: "অনুমোদন কেন্দ্র",
        descriptionEn: "Pending manager approvals for leaves, POs & discounts",
        descriptionBn: "ব্যবস্থাপক অনুমোদন ও ছাড়পত্রের তালিকা",
        icon: CheckSquare,
        featureKey: "approvals",
        permission: "operations:read",
      },
      {
        id: "tasks",
        href: "/operations/tasks",
        labelEn: "Tasks & Workflows",
        labelBn: "টাস্ক ও কার্যক্রম",
        descriptionEn: "Operational checklists, assignments and team tasks",
        descriptionBn: "কর্মতালিকা ও দায়িত্ব বণ্টন",
        icon: Layers,
        featureKey: "tasks",
        permission: "operations:read",
      },
      {
        id: "shipping",
        href: "/settings/shipping",
        labelEn: "Shipping Zones",
        labelBn: "শিপিং জোন ও চার্জ",
        descriptionEn: "Delivery charges, regional zones and delivery methods",
        descriptionBn: "ডেলিভারি চার্জ ও আঞ্চলিক জোন",
        icon: Truck,
        permission: "shipping:read",
      },
      {
        id: "courier",
        href: "/settings/courier",
        labelEn: "Courier Integrations",
        labelBn: "কুরিয়ার ইন্টিগ্রেশন",
        descriptionEn: "Steadfast, Pathao, RedX and automatic parcel booking",
        descriptionBn: "স্টেডফাস্ট, পাঠাও ও পার্সেল বুকিং",
        icon: PackageCheck,
        featureKey: "courier",
        permission: "shipping:read",
      },
      {
        id: "payments",
        href: "/settings/payments",
        labelEn: "Payment Gateways",
        labelBn: "পেমেন্ট গেটওয়ে",
        descriptionEn: "SSLCommerz, bKash, Nagad, Stripe and Cash on Delivery",
        descriptionBn: "অনলাইন পেমেন্ট ও ক্যাশ অন ডেলিভারি",
        icon: CreditCard,
        permission: "payments:read",
      },
      {
        id: "taxes",
        href: "/settings/taxes",
        labelEn: "Taxes & VAT",
        labelBn: "ট্যাক্স ও ভ্যাট",
        descriptionEn: "Regional sales taxes, VAT rules and invoice taxation",
        descriptionBn: "বিক্রয় কর ও ভ্যাট হার",
        icon: Percent,
        permission: "settings:read",
      },
    ],
  },

  // ── 10. STORE / WEBSITE ──
  {
    id: "website",
    key: "website",
    titleEn: "Store Website",
    titleBn: "অনলাইন স্টোর ও ওয়েবসাইট",
    shortTitleEn: "Website",
    shortTitleBn: "ওয়েবসাইট",
    badgeIcon: "🌐",
    icon: Palette,
    defaultRoute: "/design",
    items: [
      {
        id: "design",
        href: "/design",
        labelEn: "Theme & Design",
        labelBn: "থিম ও ডিজাইন",
        descriptionEn: "Storefront visual builder, branding and custom colors",
        descriptionBn: "স্টোরের বাহ্যিক রূপ ও ব্র্যান্ডিং",
        icon: Palette,
        permission: "pages:read",
      },
      {
        id: "navigation",
        href: "/settings?section=navigation",
        labelEn: "Store Menus",
        labelBn: "নেভিগেশন মেনু",
        descriptionEn: "Header, footer and mobile storefront navigation",
        descriptionBn: "ওয়েবসাইটের মেনু ও লিংক",
        icon: Menu,
        permission: "pages:read",
      },
      {
        id: "pages",
        href: "/pages",
        labelEn: "Custom Pages",
        labelBn: "কাস্টম পেজ",
        descriptionEn: "About us, Contact, Privacy and legal landing pages",
        descriptionBn: "তথ্যবহুল পেজ ও পলিসি পাতা",
        icon: FileText,
        permission: "pages:read",
      },
      {
        id: "media",
        href: "/media",
        labelEn: "Media Library",
        labelBn: "মিডিয়া ফাইল",
        descriptionEn: "High-resolution product banners, photos and assets",
        descriptionBn: "ছবি ও ব্যানার ফাইল সংগ্রহ",
        icon: ImageIcon,
        featureKey: "media",
        permission: "media:read",
      },
      {
        id: "customer-messages",
        href: "/customer-messages",
        labelEn: "Customer Messages",
        labelBn: "গ্রাহক বার্তা",
        descriptionEn: "Inquiries submitted via storefront contact forms",
        descriptionBn: "ওয়েবসাইট থেকে আসা বার্তা",
        icon: Mail,
        featureKey: "cms",
        permission: "settings:read",
      },
      {
        id: "seo",
        href: "/settings?section=seo",
        labelEn: "SEO & Meta Tags",
        labelBn: "এসইও ও মেটা ট্যাগ",
        descriptionEn: "Search engine title tags, sitemaps and social previews",
        descriptionBn: "সার্চ ইঞ্জিন অপ্টিমাইজেশন",
        icon: Search,
        featureKey: "seo",
        permission: "settings:read",
      },
      {
        id: "domain",
        href: "/settings?section=domain",
        labelEn: "Custom Domain",
        labelBn: "কাস্টম ডোমেন",
        descriptionEn: "Connect and verify your own web domain name",
        descriptionBn: "নিজস্ব ডোমেন সংযোগ ও এসএসএল",
        icon: Globe2,
        featureKey: "custom_domain",
        permission: "settings:read",
      },
      {
        id: "social-links",
        href: "/settings?section=social-links",
        labelEn: "Social Links",
        labelBn: "সোশ্যাল লিংক",
        descriptionEn: "Facebook, Instagram, WhatsApp and social handles",
        descriptionBn: "সামাজিক মাধ্যমের লিংক",
        icon: Share2,
        permission: "settings:read",
      },
      {
        id: "faq",
        href: "/settings?section=faq",
        labelEn: "Help & FAQ",
        labelBn: "সাধারণ প্রশ্নোত্তর",
        descriptionEn: "Frequently asked questions displayed on storefront",
        descriptionBn: "গ্রাহকদের সচরাচর জিজ্ঞাসা",
        icon: HelpCircle,
        permission: "settings:read",
      },
    ],
  },

  // ── 11. SYSTEM & SETTINGS ──
  {
    id: "system",
    key: "system",
    titleEn: "System & Settings",
    titleBn: "সিস্টেম ও সেটিংস",
    shortTitleEn: "System",
    shortTitleBn: "সিস্টেম",
    badgeIcon: "⚙️",
    icon: Settings,
    defaultRoute: "/settings?section=general",
    items: [
      {
        id: "general-settings",
        href: "/settings?section=general",
        labelEn: "Store Settings",
        labelBn: "সাধারণ সেটিংস",
        descriptionEn: "Store profile, currency, timezone and contact info",
        descriptionBn: "স্টোরের নাম, মুদ্রা ও সময় অঞ্চল",
        icon: Settings,
        permission: "settings:read",
      },
      {
        id: "members",
        href: "/members",
        labelEn: "Team & Permissions",
        labelBn: "টিম ও পারমিশন",
        descriptionEn: "Member roles, invitations and RBAC permissions",
        descriptionBn: "টিম মেম্বারদের দায়িত্ব ও অ্যাক্সেস",
        icon: Users,
        permission: "members:read",
      },
      {
        id: "apps",
        href: "/apps",
        labelEn: "Apps & Integrations",
        labelBn: "অ্যাপস ও সংযোগ",
        descriptionEn: "Third-party plugins, webhooks and integrations",
        descriptionBn: "প্লাগইন ও বহিরাগত সফটওয়্যার",
        icon: Blocks,
        featureKey: "apps",
        comingSoon: true,
      },
      {
        id: "activity",
        href: "/activity",
        labelEn: "Activity Audit Log",
        labelBn: "কার্যক্রম অডিট লগ",
        descriptionEn: "Audited record of team actions and logins",
        descriptionBn: "সিস্টেম পরিবর্তন ও অডিট রেকর্ড",
        icon: ScrollText,
        permission: "settings:read",
      },
      {
        id: "billing",
        href: "/billing",
        labelEn: "Plan & Billing",
        labelBn: "প্ল্যান ও বিলিং",
        descriptionEn: "Store subscription tier, invoices and payment renewal",
        descriptionBn: "সাবস্ক্রিপশন প্যাকেজ ও পেমেন্ট হিসেব",
        icon: BillingCard,
      },
    ],
  },
];

/**
 * Finds the matching business module for any store pathname.
 */
export function findModuleByPathname(pathname: string, storeSlug: string): BusinessModule {
  const relPath = pathname.replace(`/store/${storeSlug}`, "") || "/dashboard";

  for (const mod of BUSINESS_MODULES) {
    for (const item of mod.items) {
      if (item.exact) {
        if (relPath === item.href) return mod;
      } else {
        if (relPath.startsWith(item.href.split("?")[0])) return mod;
      }
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.exact ? relPath === sub.href : relPath.startsWith(sub.href)) {
            return mod;
          }
        }
      }
    }
  }

  return BUSINESS_MODULES[0]; // fallback to Home
}
