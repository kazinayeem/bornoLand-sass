export interface DocTopic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryOrder: number;
  readTime: string;
  lastUpdated: string;
  breadcrumbs: { label: string; href: string }[];
  toc: { id: string; label: string; level: number }[];
  sections: {
    id: string;
    title: string;
    content: string[];
    bulletPoints?: string[];
    codeBlock?: {
      language: string;
      filename?: string;
      code: string;
    };
    callout?: {
      type: "info" | "warning" | "success" | "tip";
      title: string;
      text: string;
    };
  }[];
  relatedSlugs: string[];
}

export const DOC_CATEGORIES = [
  "Getting Started",
  "Core Commerce",
  "Retail & Outlets",
  "Operations & Inventory",
  "People & Organization",
  "Financial Management",
  "Platform & Infrastructure",
  "Security & Support",
] as const;

export type DocCategory = typeof DOC_CATEGORIES[number];

export const DOCS_REGISTRY: DocTopic[] = [
  {
    id: "getting-started",
    slug: "getting-started",
    title: "Getting Started with BornoLand",
    summary:
      "A complete guide to signing up, creating your organization workspace, launching your first digital store, and configuring foundational business settings.",
    category: "Getting Started",
    categoryOrder: 1,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Getting Started", href: "/docs/getting-started" },
    ],
    toc: [
      { id: "overview", label: "Platform Overview", level: 2 },
      { id: "quick-start", label: "Quick Start in 4 Steps", level: 2 },
      { id: "workspace-vs-store", label: "Workspace vs Store Concept", level: 2 },
      { id: "next-steps", label: "Recommended Next Steps", level: 2 },
    ],
    sections: [
      {
        id: "overview",
        title: "Platform Overview",
        content: [
          "BornoLand is an integrated Business Operating System (BOS) engineered for modern commerce enterprises, multi-branch retailers, and direct-to-consumer (D2C) brands.",
          "Unlike legacy stacks that require gluing separate software for online orders, retail cash registers, warehouse stock, and payroll, BornoLand unifies all business workflows on a single relational data core.",
        ],
        callout: {
          type: "tip",
          title: "Zero Setup Fee & 7-Day Free Trial",
          text: "Every new account receives an unrestricted 7-day trial with full access to POS registers, multi-warehouse inventory, and automated payroll.",
        },
      },
      {
        id: "quick-start",
        title: "Quick Start in 4 Steps",
        content: [
          "Follow this sequence to launch your business operations immediately:",
        ],
        bulletPoints: [
          "Step 1: Create your BornoLand master merchant account with your name, work email, and secure password.",
          "Step 2: Initialize your Workspace (e.g. 'Artisan Group BD') and select your base operating currency (BDT ৳).",
          "Step 3: Create your primary Storefront or Outlet branch (e.g. 'Gulshan Showroom' or 'Online Flagship').",
          "Step 4: Add your initial product catalog, configure tax rules, and test your first checkout.",
        ],
      },
      {
        id: "workspace-vs-store",
        title: "Workspace vs Store Concept",
        content: [
          "Understanding the architectural boundary ensures clean multi-location management:",
          "A Workspace represents your overarching corporate entity, holding company-wide billing subscriptions, employee master files, chart of accounts, and team access credentials.",
          "A Store represents a distinct customer-facing sales channel or physical branch. Each store can have its own POS registers, delivery rules, and catalog subsets while synchronizing back to the shared workspace ledger.",
        ],
        codeBlock: {
          language: "text",
          filename: "Architecture Topology",
          code: `[Workspace: Nexus Retail Holdings]
  ├── Company-Wide Accounting & Chart of Accounts
  ├── Employee Master & Consolidated Payroll
  ├── Central Depot Warehouse (Tejgaon)
  ├── Store 1: Banani Showroom (POS Register #1 & #2)
  ├── Store 2: Dhanmondi Branch (POS Register #1)
  └── Store 3: Online Storefront (https://shop.nexusretail.com)`,
        },
      },
      {
        id: "next-steps",
        title: "Recommended Next Steps",
        content: [
          "Once your workspace is created, continue to configuring your product inventory and linking local payment gateways.",
        ],
      },
    ],
    relatedSlugs: ["account-workspace", "stores", "products", "pos"],
  },
  {
    id: "account-workspace",
    slug: "account-workspace",
    title: "Account & Workspace Management",
    summary:
      "Configure your merchant profile, manage multi-workspace switching, invite team members with role-based permissions, and enable two-factor authentication.",
    category: "Getting Started",
    categoryOrder: 1,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Account & Workspace", href: "/docs/account-workspace" },
    ],
    toc: [
      { id: "profile-settings", label: "Profile & Security", level: 2 },
      { id: "workspace-switcher", label: "Multi-Workspace Switching", level: 2 },
      { id: "team-invites", label: "Inviting Team Members", level: 2 },
      { id: "audit-logs", label: "Activity Audit Logs", level: 2 },
    ],
    sections: [
      {
        id: "profile-settings",
        title: "Profile & Security",
        content: [
          "Your merchant profile houses your login email, phone number for critical SMS alerts, and security credentials.",
          "We recommend enabling Two-Factor Authentication (2FA) for all Administrator and Finance Manager roles to prevent unauthorized access.",
        ],
        callout: {
          type: "info",
          title: "Session Expiry",
          text: "Sessions automatically renew with rolling authentication tokens. Inactive cashier terminals lock after 30 minutes of idle time.",
        },
      },
      {
        id: "workspace-switcher",
        title: "Multi-Workspace Switching",
        content: [
          "If you manage multiple distinct business entities or agency clients, you can switch between workspaces seamlessly from the top navigation dropdown without logging out.",
        ],
      },
      {
        id: "team-invites",
        title: "Inviting Team Members",
        content: [
          "Invite team members by email and assign predefined system roles (Store Owner, Branch Manager, Cashier, Inventory Lead, Accountant, HR Manager) or custom permission sets.",
        ],
      },
      {
        id: "audit-logs",
        title: "Activity Audit Logs",
        content: [
          "All sensitive actions—such as refund approvals, inventory adjustments, price modifications, and payroll disbursements—are recorded in an immutable chronological activity log.",
        ],
      },
    ],
    relatedSlugs: ["getting-started", "team-permissions", "security"],
  },
  {
    id: "stores",
    slug: "stores",
    title: "Store Creation & Configuration",
    summary:
      "Set up physical store outlets and digital storefronts, configure operational hours, delivery zones, tax policies, and custom branding.",
    category: "Core Commerce",
    categoryOrder: 2,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Stores", href: "/docs/stores" },
    ],
    toc: [
      { id: "store-types", label: "Store Types & Channels", level: 2 },
      { id: "general-settings", label: "General Store Settings", level: 2 },
      { id: "tax-shipping", label: "Taxes & Delivery Zones", level: 2 },
    ],
    sections: [
      {
        id: "store-types",
        title: "Store Types & Channels",
        content: [
          "BornoLand supports both digital storefronts (accessible over the web with full shopping cart and checkout) and retail POS locations (physical outlets with receipt printers and cash registers).",
        ],
      },
      {
        id: "general-settings",
        title: "General Store Settings",
        content: [
          "Configure your store's public name, contact email, WhatsApp support number, store currency (default: BDT ৳), and official invoice header information.",
        ],
      },
      {
        id: "tax-shipping",
        title: "Taxes & Delivery Zones",
        content: [
          "Define location-based delivery charges (Inside Dhaka, Dhaka Suburbs, Outside Dhaka) and configure VAT / sales tax rates compliant with domestic regulations.",
        ],
      },
    ],
    relatedSlugs: ["store-builder", "domains", "pos", "orders"],
  },
  {
    id: "products",
    slug: "products",
    title: "Product Catalog & Variant Matrix",
    summary:
      "Manage single and variable products, set SKU identifiers and barcodes, organize categories and brands, and configure bulk import/export via CSV.",
    category: "Core Commerce",
    categoryOrder: 2,
    readTime: "6 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Products", href: "/docs/products" },
    ],
    toc: [
      { id: "product-types", label: "Product Types", level: 2 },
      { id: "variants", label: "Multi-Option Variants (Size/Color)", level: 2 },
      { id: "barcodes-skus", label: "SKUs & Barcode Generation", level: 2 },
      { id: "csv-sync", label: "CSV Bulk Import & Export", level: 2 },
    ],
    sections: [
      {
        id: "product-types",
        title: "Product Types",
        content: [
          "BornoLand supports standard physical merchandise, variant bundles, serialized electronics, and service items.",
          "Each product includes title, rich description, SEO metadata, base retail price, wholesale price, cost of goods (COGS), and tax class.",
        ],
      },
      {
        id: "variants",
        title: "Multi-Option Variants (Size/Color)",
        content: [
          "Generate comprehensive variant matrix combinations (e.g. Size: S, M, L, XL x Color: Navy, Black, White). Each variant maintains individual SKU codes, barcode strings, retail prices, and location-specific stock balances.",
        ],
      },
      {
        id: "barcodes-skus",
        title: "SKUs & Barcode Generation",
        content: [
          "Assign EAN-13, UPC, or custom alphanumeric SKUs. BornoLand generates standard printable barcode labels formatted for commercial thermal barcode printers.",
        ],
      },
      {
        id: "csv-sync",
        title: "CSV Bulk Import & Export",
        content: [
          "Upload thousands of items in seconds using our standardized CSV template. Update prices, descriptions, and category taxonomy in bulk.",
        ],
      },
    ],
    relatedSlugs: ["inventory", "orders", "pos", "store-builder"],
  },
  {
    id: "orders",
    slug: "orders",
    title: "Order Fulfillment & Courier Logistics",
    summary:
      "Process incoming sales across web and POS, generate printable VAT invoices, dispatch shipments with one-click courier API integrations, and manage returns.",
    category: "Core Commerce",
    categoryOrder: 2,
    readTime: "6 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Orders", href: "/docs/orders" },
    ],
    toc: [
      { id: "order-lifecycle", label: "Order Lifecycle & Statuses", level: 2 },
      { id: "courier-dispatch", label: "Courier Integration (Pathao, Steadfast, RedX)", level: 2 },
      { id: "invoicing", label: "Invoicing & Packing Slips", level: 2 },
      { id: "returns-exchanges", label: "Returns, Refunds & Exchanges", level: 2 },
    ],
    sections: [
      {
        id: "order-lifecycle",
        title: "Order Lifecycle & Statuses",
        content: [
          "Orders transition through standard status milestones: Pending → Confirmed → Processing → Shipped → Delivered → Completed (or Cancelled / Returned).",
          "Stock is automatically allocated upon order confirmation to prevent accidental overselling.",
        ],
      },
      {
        id: "courier-dispatch",
        title: "Courier Integration (Pathao, Steadfast, RedX)",
        content: [
          "BornoLand natively connects to leading domestic logistics providers. Create courier consignments directly from the order view, receive tracking IDs instantly, and print shipping labels in bulk.",
        ],
        callout: {
          type: "success",
          title: "Automated COD Reconciliation",
          text: "When a courier marks an order as delivered, Cash on Delivery (COD) payouts automatically reconcile against your courier balance sheet.",
        },
      },
      {
        id: "invoicing",
        title: "Invoicing & Packing Slips",
        content: [
          "Generate professional thermal receipts, A4 tax invoices, and warehouse picking slips with QR codes for fast dispatch scanning.",
        ],
      },
      {
        id: "returns-exchanges",
        title: "Returns, Refunds & Exchanges",
        content: [
          "Process full or partial item returns, adjust inventory restock counts, and issue cash refunds, store credits, or replacement orders.",
        ],
      },
    ],
    relatedSlugs: ["pos", "products", "inventory", "finance"],
  },
  {
    id: "customers",
    slug: "customers",
    title: "Customer Relationship Management (CRM) & Loyalty",
    summary:
      "Track unified customer purchase histories across online and offline retail touchpoints, manage loyalty reward tiers, and trigger SMS notifications.",
    category: "Core Commerce",
    categoryOrder: 2,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Customers", href: "/docs/customers" },
    ],
    toc: [
      { id: "unified-profiles", label: "Unified Customer Profiles", level: 2 },
      { id: "loyalty-points", label: "Loyalty Points & Tiers", level: 2 },
      { id: "sms-campaigns", label: "Targeted SMS & Promotions", level: 2 },
    ],
    sections: [
      {
        id: "unified-profiles",
        title: "Unified Customer Profiles",
        content: [
          "Customers are identified by phone number or email, providing a single consolidated view of their lifetime order value (LTV), store visits, favorite product categories, and active address book.",
        ],
      },
      {
        id: "loyalty-points",
        title: "Loyalty Points & Tiers",
        content: [
          "Reward frequent buyers with points earned per ৳ spent. Customers can redeem points as checkout discounts on web storefronts or at POS cash registers.",
        ],
      },
      {
        id: "sms-campaigns",
        title: "Targeted SMS & Promotions",
        content: [
          "Filter customer segments by total spend or inactive duration to trigger promotional discount codes via domestic SMS gateways.",
        ],
      },
    ],
    relatedSlugs: ["orders", "pos", "store-builder"],
  },
  {
    id: "inventory",
    slug: "inventory",
    title: "Multi-Warehouse Inventory & Stock Control",
    summary:
      "Monitor stock across central depots and outlet backrooms, generate Stock Transfer Notes (STN), set automated reorder thresholds, and record waste/shrinkage.",
    category: "Operations & Inventory",
    categoryOrder: 3,
    readTime: "6 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Inventory", href: "/docs/inventory" },
    ],
    toc: [
      { id: "multi-location", label: "Multi-Warehouse Setup", level: 2 },
      { id: "stock-transfers", label: "Stock Transfers (STN)", level: 2 },
      { id: "adjustments-waste", label: "Adjustments & Waste Logging", level: 2 },
      { id: "reorder-points", label: "Low-Stock Alerts & Auto Reordering", level: 2 },
    ],
    sections: [
      {
        id: "multi-location",
        title: "Multi-Warehouse Setup",
        content: [
          "Create unlimited physical warehouses, retail storage rooms, and regional distribution centers. View real-time available, committed, and in-transit stock counts per location.",
        ],
      },
      {
        id: "stock-transfers",
        title: "Stock Transfers (STN)",
        content: [
          "Transfer merchandise between central warehouses and retail stores with dual-step confirmation (Dispatched → In Transit → Received & Verified).",
        ],
      },
      {
        id: "adjustments-waste",
        title: "Adjustments & Waste Logging",
        content: [
          "Conduct routine stock audits. Log damaged, expired, or lost merchandise with clear reason tags; adjustments post automatically to inventory loss expense accounts.",
        ],
      },
      {
        id: "reorder-points",
        title: "Low-Stock Alerts & Auto Reordering",
        content: [
          "Set minimum safe stock thresholds per item. When stock dips below minimums, BornoLand highlights items on your dashboard and drafts purchase orders automatically.",
        ],
      },
    ],
    relatedSlugs: ["purchasing", "products", "pos", "finance"],
  },
  {
    id: "purchasing",
    slug: "purchasing",
    title: "Purchasing & Supplier Management",
    summary:
      "Manage vendor contacts, issue formal Purchase Orders (PO), record Goods Received Notes (GRN), and track supplier accounts payable.",
    category: "Operations & Inventory",
    categoryOrder: 3,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Purchasing", href: "/docs/purchasing" },
    ],
    toc: [
      { id: "vendor-directory", label: "Supplier Directory", level: 2 },
      { id: "purchase-orders", label: "Purchase Order (PO) Workflow", level: 2 },
      { id: "grn-receiving", label: "Goods Received Notes (GRN)", level: 2 },
    ],
    sections: [
      {
        id: "vendor-directory",
        title: "Supplier Directory",
        content: [
          "Maintain complete records for all manufacturers, distributors, and raw material suppliers, including trade license numbers, payment terms, and bank routing details.",
        ],
      },
      {
        id: "purchase-orders",
        title: "Purchase Order (PO) Workflow",
        content: [
          "Draft and approve formal purchase orders with unit costs, tax rates, expected delivery dates, and shipping destinations. Export clean PDF POs to email to vendors.",
        ],
      },
      {
        id: "grn-receiving",
        title: "Goods Received Notes (GRN)",
        content: [
          "When deliveries arrive at your warehouse, perform physical inspections and log GRNs. Received counts immediately increment warehouse inventory, and invoice balances post to Accounts Payable.",
        ],
      },
    ],
    relatedSlugs: ["inventory", "finance", "products"],
  },
  {
    id: "pos",
    slug: "pos",
    title: "Point of Sale (POS) & Cashier Operations",
    summary:
      "Operate high-speed retail checkout registers, utilize offline-mode resilience, scan barcodes, print thermal receipts, and accept bKash QR payments.",
    category: "Retail & Outlets",
    categoryOrder: 4,
    readTime: "6 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Point of Sale", href: "/docs/pos" },
    ],
    toc: [
      { id: "hardware-setup", label: "Supported Hardware & Devices", level: 2 },
      { id: "cashier-workflow", label: "Cashier Shift & Checkout Flow", level: 2 },
      { id: "offline-mode", label: "Offline-First Resilience", level: 2 },
      { id: "mfs-qr", label: "bKash / Nagad QR & Split Payments", level: 2 },
    ],
    sections: [
      {
        id: "hardware-setup",
        title: "Supported Hardware & Devices",
        content: [
          "BornoLand POS runs on any modern web browser across Windows POS terminals, iPads, Android tablets, and Macs.",
          "Compatible with standard USB/Bluetooth barcode laser scanners, ESC/POS 58mm and 80mm thermal receipt printers, and electronic cash drawers.",
        ],
      },
      {
        id: "cashier-workflow",
        title: "Cashier Shift & Checkout Flow",
        content: [
          "Cashiers open daily shifts with initial float amounts. Quick-tap categories, keyboard shortcuts, and instant SKU search allow fast checkout under 5 seconds per customer.",
        ],
      },
      {
        id: "offline-mode",
        title: "Offline-First Resilience",
        content: [
          "If retail internet connection drops, the POS terminal switches to local indexed database mode. Cashiers continue transacting seamlessly, and completed sales synchronize back to the cloud the moment connectivity resumes.",
        ],
        callout: {
          type: "tip",
          title: "Zero Lost Sales During Outages",
          text: "Offline orders are encrypted locally and automatically reconciled with warehouse stock without cashier intervention.",
        },
      },
      {
        id: "mfs-qr",
        title: "bKash / Nagad QR & Split Payments",
        content: [
          "Accept split payments across Cash, Credit/Debit Cards, and dynamic bKash / Nagad QR codes on a single invoice.",
        ],
      },
    ],
    relatedSlugs: ["orders", "inventory", "customers", "stores"],
  },
  {
    id: "hrm",
    slug: "hrm",
    title: "Human Resource Management (HRM) & Attendance",
    summary:
      "Manage employee directories, track biometric fingerprint machine attendance, schedule store shifts, and process employee leave approvals.",
    category: "People & Organization",
    categoryOrder: 5,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "HRM & Attendance", href: "/docs/hrm" },
    ],
    toc: [
      { id: "employee-profiles", label: "Employee Profiles & Records", level: 2 },
      { id: "biometric-sync", label: "Biometric & Geofenced Attendance", level: 2 },
      { id: "shifts-leave", label: "Shifts & Leave Policies", level: 2 },
    ],
    sections: [
      {
        id: "employee-profiles",
        title: "Employee Profiles & Records",
        content: [
          "Maintain complete employee files: National ID (NID), emergency contacts, job designations, assigned store branch, joining dates, and base salary structures.",
        ],
      },
      {
        id: "biometric-sync",
        title: "Biometric & Geofenced Attendance",
        content: [
          "Synchronize check-in/check-out logs from standard ZKTeco biometric fingerprint/face scanners or enable mobile geofenced check-in for field delivery agents.",
        ],
      },
      {
        id: "shifts-leave",
        title: "Shifts & Leave Policies",
        content: [
          "Configure morning, evening, and night retail shifts. Staff submit annual, medical, and casual leave requests for manager approval.",
        ],
      },
    ],
    relatedSlugs: ["payroll", "team-permissions", "finance"],
  },
  {
    id: "payroll",
    slug: "payroll",
    title: "Automated Payroll & Salary Processing",
    summary:
      "Calculate monthly wages, overtime, tax withholdings, festival bonuses, generate digital PDF payslips, and export bank BEFTN transfer files.",
    category: "People & Organization",
    categoryOrder: 5,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Payroll", href: "/docs/payroll" },
    ],
    toc: [
      { id: "payroll-engine", label: "Automated Monthly Calculations", level: 2 },
      { id: "deductions-bonuses", label: "Allowances, Taxes & Festival Bonuses", level: 2 },
      { id: "payslips-bank", label: "Digital Payslips & Bank Disbursal", level: 2 },
    ],
    sections: [
      {
        id: "payroll-engine",
        title: "Automated Monthly Calculations",
        content: [
          "Generate monthly payroll in 1 click. BornoLand cross-references biometric attendance records, approved leaves, and overtime hours to calculate exact gross and net earnings.",
        ],
      },
      {
        id: "deductions-bonuses",
        title: "Allowances, Taxes & Festival Bonuses",
        content: [
          "Configure house rent allowances, medical allowances, conveyance, provident fund withholdings, income tax deductions, advance salary repayments, and Eid / festival bonuses.",
        ],
      },
      {
        id: "payslips-bank",
        title: "Digital Payslips & Bank Disbursal",
        content: [
          "Employees receive individual encrypted PDF payslips via email or WhatsApp. Finance teams download standardized Excel/CSV bank transfer sheets formatted for City Bank, Brac Bank, EBL, and BEFTN processing.",
        ],
      },
    ],
    relatedSlugs: ["hrm", "finance", "team-permissions"],
  },
  {
    id: "finance",
    slug: "finance",
    title: "Double-Entry Accounting & Financial Reports",
    summary:
      "Maintain a compliant Chart of Accounts, record journal entries, track operational expenses, monitor Cash Flow, and generate Balance Sheets and P&L statements.",
    category: "Financial Management",
    categoryOrder: 6,
    readTime: "6 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Finance & Accounting", href: "/docs/finance" },
    ],
    toc: [
      { id: "chart-of-accounts", label: "Chart of Accounts (COA)", level: 2 },
      { id: "journal-entries", label: "Automated & Manual Journal Entries", level: 2 },
      { id: "expense-tracking", label: "Expense Management", level: 2 },
      { id: "financial-statements", label: "P&L, Balance Sheet & Trial Balance", level: 2 },
    ],
    sections: [
      {
        id: "chart-of-accounts",
        title: "Chart of Accounts (COA)",
        content: [
          "Pre-populated with standard Assets, Liabilities, Equity, Revenue, and Expense account headers tailored for commerce and retail.",
        ],
      },
      {
        id: "journal-entries",
        title: "Automated & Manual Journal Entries",
        content: [
          "Sales, COGS, payroll disbursements, and courier remittances post automated double-entry debit/credit ledger records in real time.",
        ],
      },
      {
        id: "expense-tracking",
        title: "Expense Management",
        content: [
          "Categorize operational expenses (store rent, electricity, packaging materials, marketing ad spend) with receipt attachments for tax audits.",
        ],
      },
      {
        id: "financial-statements",
        title: "P&L, Balance Sheet & Trial Balance",
        content: [
          "Generate instant Profit & Loss (P&L) statements, Balance Sheets, and Cash Flow summaries filtered by fiscal year, quarter, or individual store branch.",
        ],
      },
    ],
    relatedSlugs: ["reports", "payroll", "orders", "purchasing"],
  },
  {
    id: "reports",
    slug: "reports",
    title: "Business Intelligence & Executive Analytics",
    summary:
      "Access real-time visual dashboards, sales velocity metrics, gross margin breakdowns, inventory turnover ratios, and staff sales rankings.",
    category: "Financial Management",
    categoryOrder: 6,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Reports & Analytics", href: "/docs/reports" },
    ],
    toc: [
      { id: "sales-analytics", label: "Sales & GMV Velocity", level: 2 },
      { id: "inventory-insights", label: "Inventory Turnover & Aging", level: 2 },
      { id: "exporting-data", label: "Exporting Reports (PDF/CSV)", level: 2 },
    ],
    sections: [
      {
        id: "sales-analytics",
        title: "Sales & GMV Velocity",
        content: [
          "Track Gross Merchandise Value (GMV), Average Order Value (AOV), and customer conversion rates across web storefronts and retail POS branches.",
        ],
      },
      {
        id: "inventory-insights",
        title: "Inventory Turnover & Aging",
        content: [
          "Identify fast-moving top revenue drivers and detect dead-stock merchandise before holding costs accumulate.",
        ],
      },
      {
        id: "exporting-data",
        title: "Exporting Reports (PDF/CSV)",
        content: [
          "Export clean spreadsheets or executive presentation PDFs for stakeholder reviews, tax filings, and investor updates.",
        ],
      },
    ],
    relatedSlugs: ["finance", "orders", "inventory"],
  },
  {
    id: "store-builder",
    slug: "store-builder",
    title: "Visual Storefront Builder & CMS",
    summary:
      "Design high-conversion responsive storefronts with drag-and-drop sections, custom hero banners, promotional carousels, and content pages.",
    category: "Platform & Infrastructure",
    categoryOrder: 7,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Store Builder", href: "/docs/store-builder" },
    ],
    toc: [
      { id: "theme-customizer", label: "Visual Theme Customizer", level: 2 },
      { id: "sections-blocks", label: "Modular Sections & Blocks", level: 2 },
      { id: "cms-pages", label: "CMS Pages & Blog Posts", level: 2 },
    ],
    sections: [
      {
        id: "theme-customizer",
        title: "Visual Theme Customizer",
        content: [
          "Customize primary brand colors, typography fonts, button radiuses, navigation styles, and mobile layouts in real time with live side-by-side preview.",
        ],
      },
      {
        id: "sections-blocks",
        title: "Modular Sections & Blocks",
        content: [
          "Add Hero Banners, Featured Product Carousels, Category Grids, Customer Reviews, Video Walkthroughs, and FAQ accordions with zero coding required.",
        ],
      },
      {
        id: "cms-pages",
        title: "CMS Pages & Blog Posts",
        content: [
          "Publish unlimited content pages: About Us, Store Locations, Terms of Service, Return Policies, and SEO-optimized blog articles.",
        ],
      },
    ],
    relatedSlugs: ["stores", "domains", "products"],
  },
  {
    id: "domains",
    slug: "domains",
    title: "Custom Domains & Zero-Config SSL",
    summary:
      "Connect your branded custom domain (.com, .com.bd, etc.), configure DNS records, and enable automated zero-touch SSL certificate renewals.",
    category: "Platform & Infrastructure",
    categoryOrder: 7,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Custom Domains", href: "/docs/domains" },
    ],
    toc: [
      { id: "dns-records", label: "Configuring DNS Records", level: 2 },
      { id: "ssl-provisioning", label: "Automated SSL Certificates", level: 2 },
      { id: "domain-troubleshooting", label: "DNS Propagation & Verification", level: 2 },
    ],
    sections: [
      {
        id: "dns-records",
        title: "Configuring DNS Records",
        content: [
          "To connect your custom domain, add an A record pointing your root domain (@) or a CNAME record for your subdomain (e.g. www or shop):",
        ],
        codeBlock: {
          language: "text",
          filename: "DNS Configuration Table",
          code: `Type   Name   Target / Value
----------------------------------------
A      @      76.76.21.21
CNAME  www    cname.bornoland.com`,
        },
      },
      {
        id: "ssl-provisioning",
        title: "Automated SSL Certificates",
        content: [
          "BornoLand automatically provisions and renews 256-bit TLS/SSL encryption certificates at no additional cost for all custom domains and platform subdomains.",
        ],
      },
      {
        id: "domain-troubleshooting",
        title: "DNS Propagation & Verification",
        content: [
          "DNS changes typically take 15–60 minutes to propagate worldwide. Use the in-app 'Verify DNS' button on the domain settings tab to test connectivity.",
        ],
      },
    ],
    relatedSlugs: ["stores", "store-builder", "security"],
  },
  {
    id: "team-permissions",
    slug: "team-permissions",
    title: "Team Roles & Permission Matrix",
    summary:
      "Configure granular role-based access control (RBAC), restrict sensitive financial data, and assign cashiers strictly to their designated outlet registers.",
    category: "Platform & Infrastructure",
    categoryOrder: 7,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Team & Permissions", href: "/docs/team-permissions" },
    ],
    toc: [
      { id: "default-roles", label: "Built-In System Roles", level: 2 },
      { id: "custom-permissions", label: "Custom Permission Sets", level: 2 },
      { id: "register-locking", label: "Cashier & Register Scoping", level: 2 },
    ],
    sections: [
      {
        id: "default-roles",
        title: "Built-In System Roles",
        content: [
          "BornoLand provides 6 standard role profiles out of the box:",
        ],
        bulletPoints: [
          "Workspace Owner: Full unrestricted platform, billing, and organizational authority.",
          "Administrator: Manages products, stores, logistics, and staff; restricted from billing owner transfers.",
          "Branch Manager: Manages local store inventory, cashier shifts, local staff attendance, and store sales.",
          "POS Cashier: Dedicated fast checkout terminal access; restricted from general ledger and product cost margins.",
          "Inventory Controller: Manages purchase orders, warehouse transfers, and stock adjustments.",
          "Accountant: Access to General Ledger, Accounts Payable/Receivable, Tax Reports, and Expense tracking.",
        ],
      },
      {
        id: "custom-permissions",
        title: "Custom Permission Sets",
        content: [
          "Create custom role profiles tailored to your corporate structure by toggling individual module read/write/delete capabilities.",
        ],
      },
      {
        id: "register-locking",
        title: "Cashier & Register Scoping",
        content: [
          "Restrict cashier logins to specific physical store registers, preventing cross-branch discrepancies.",
        ],
      },
    ],
    relatedSlugs: ["account-workspace", "security", "hrm"],
  },
  {
    id: "plans-billing",
    slug: "plans-billing",
    title: "Subscription Plans, Invoices & Billing",
    summary:
      "Understand platform subscription tiers, trial periods, add-on store outlets, automated tax invoices, and local payment methods.",
    category: "Financial Management",
    categoryOrder: 6,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Plans & Billing", href: "/docs/plans-billing" },
    ],
    toc: [
      { id: "plan-tiers", label: "Subscription Tiers (Starter to Enterprise)", level: 2 },
      { id: "billing-cycles", label: "Monthly vs Annual Billing (20% Savings)", level: 2 },
      { id: "payment-methods", label: "Accepted Payment Gateways", level: 2 },
    ],
    sections: [
      {
        id: "plan-tiers",
        title: "Subscription Tiers (Starter to Enterprise)",
        content: [
          "BornoLand offers transparent pricing scaled to your outlet footprint and order volume:",
          "Starter (৳ 2,499/mo): Ideal for single store or boutique merchants.",
          "Business (৳ 5,999/mo): Up to 3 store locations, full HRM, and automated payroll.",
          "Professional (৳ 11,999/mo): Up to 10 store locations, advanced accounting, and dedicated account manager.",
          "Enterprise (Custom): Unlimited locations, private cloud deployment, and 99.99% uptime SLA.",
        ],
      },
      {
        id: "billing-cycles",
        title: "Monthly vs Annual Billing (20% Savings)",
        content: [
          "Choose annual prepayment to receive a 20% discount across all platform plans.",
        ],
      },
      {
        id: "payment-methods",
        title: "Accepted Payment Gateways",
        content: [
          "Pay directly in BDT using corporate Visa, Mastercard, AMEX cards, or instant bKash / Nagad merchant wallets.",
        ],
      },
    ],
    relatedSlugs: ["getting-started", "account-workspace", "finance"],
  },
  {
    id: "notifications",
    slug: "notifications",
    title: "Notifications, SMS Gateways & Webhooks",
    summary:
      "Configure automated customer email confirmations, transactional SMS gateways, low-stock manager alerts, and developer webhooks.",
    category: "Platform & Infrastructure",
    categoryOrder: 7,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Notifications & Webhooks", href: "/docs/notifications" },
    ],
    toc: [
      { id: "email-templates", label: "Transactional Email Templates", level: 2 },
      { id: "sms-gateway", label: "Connecting Domestic SMS Providers", level: 2 },
      { id: "developer-webhooks", label: "Real-Time Webhooks", level: 2 },
    ],
    sections: [
      {
        id: "email-templates",
        title: "Transactional Email Templates",
        content: [
          "Customize order confirmation, invoice receipt, shipment dispatched, and password reset email templates with your store logo and branding.",
        ],
      },
      {
        id: "sms-gateway",
        title: "Connecting Domestic SMS Providers",
        content: [
          "Integrate Masking or Non-masking SMS gateways (SSL Wireless, Greenweb, ElitBuzz) for immediate OTP verification and order status SMS delivery.",
        ],
      },
      {
        id: "developer-webhooks",
        title: "Real-Time Webhooks",
        content: [
          "Stream event payloads (`order.created`, `inventory.threshold_reached`, `payment.completed`) to your external data warehouse or accounting bridges.",
        ],
      },
    ],
    relatedSlugs: ["orders", "security", "store-builder"],
  },
  {
    id: "security",
    slug: "security",
    title: "Platform Security, Encryption & Compliance",
    summary:
      "Learn about BornoLand's cloud security architecture, data encryption at rest and in transit, automatic daily backups, and role isolation.",
    category: "Security & Support",
    categoryOrder: 8,
    readTime: "4 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Security & Access", href: "/docs/security" },
    ],
    toc: [
      { id: "encryption", label: "Encryption Standards (TLS & AES-256)", level: 2 },
      { id: "tenant-isolation", label: "Multi-Tenant Data Isolation", level: 2 },
      { id: "backups-dr", label: "Automated Daily Backups & Disaster Recovery", level: 2 },
    ],
    sections: [
      {
        id: "encryption",
        title: "Encryption Standards (TLS & AES-256)",
        content: [
          "All network traffic is encrypted using TLS 1.3 in transit. Database volumes, sensitive auth credentials, and employee salary sheets are encrypted at rest using AES-256.",
        ],
      },
      {
        id: "tenant-isolation",
        title: "Multi-Tenant Data Isolation",
        content: [
          "Workspaces and store databases are partitioned with strict tenant boundaries enforced at database query and application middleware levels.",
        ],
      },
      {
        id: "backups-dr",
        title: "Automated Daily Backups & Disaster Recovery",
        content: [
          "Continuous automated transaction snapshots and geo-redundant daily database backups ensure zero data loss with point-in-time recovery capabilities.",
        ],
      },
    ],
    relatedSlugs: ["account-workspace", "team-permissions", "troubleshooting"],
  },
  {
    id: "troubleshooting",
    slug: "troubleshooting",
    title: "Troubleshooting & Diagnostics Guide",
    summary:
      "Quick diagnostic solutions for thermal receipt printer connections, barcode scanner delays, offline POS sync conflicts, and DNS verification.",
    category: "Security & Support",
    categoryOrder: 8,
    readTime: "5 min read",
    lastUpdated: "September 2026",
    breadcrumbs: [
      { label: "Documentation", href: "/docs" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
    toc: [
      { id: "pos-printing", label: "Thermal Receipt Printer Issues", level: 2 },
      { id: "scanner-issues", label: "Barcode Scanner Configuration", level: 2 },
      { id: "offline-conflicts", label: "Resolving Offline POS Sync", level: 2 },
      { id: "support-escalation", label: "When to Contact 24/7 Support", level: 2 },
    ],
    sections: [
      {
        id: "pos-printing",
        title: "Thermal Receipt Printer Issues",
        content: [
          "If receipts fail to print: ensure raw ESC/POS driver mode is selected in browser settings, verify printer USB/Bluetooth pairing, and test with the 'Print Test Slip' button in the POS terminal.",
        ],
      },
      {
        id: "scanner-issues",
        title: "Barcode Scanner Configuration",
        content: [
          "Ensure your handheld scanner is configured in 'Carriage Return (Enter) Suffix' mode so scanned SKUs immediately populate line items without manual keyboard presses.",
        ],
      },
      {
        id: "offline-conflicts",
        title: "Resolving Offline POS Sync",
        content: [
          "If offline sales take longer than 30 seconds to upload upon reconnection, click 'Force Sync Register' in POS Settings to push pending cached transactions.",
        ],
      },
      {
        id: "support-escalation",
        title: "When to Contact 24/7 Support",
        content: [
          "If an issue persists or involves critical payment gateway webhook timeouts, reach our support engineers via in-app live chat or WhatsApp emergency line.",
        ],
      },
    ],
    relatedSlugs: ["pos", "domains", "security", "getting-started"],
  },
];
