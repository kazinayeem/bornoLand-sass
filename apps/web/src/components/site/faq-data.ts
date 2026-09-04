export type FaqCategory =
  | "General"
  | "Getting Started"
  | "Stores"
  | "Products"
  | "Orders"
  | "POS"
  | "HRM"
  | "Employees"
  | "Inventory"
  | "Billing"
  | "Plans"
  | "Domains"
  | "Security"
  | "Account";

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  docLink?: { label: string; href: string };
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  "General",
  "Getting Started",
  "Stores",
  "Products",
  "Orders",
  "POS",
  "HRM",
  "Employees",
  "Inventory",
  "Billing",
  "Plans",
  "Domains",
  "Security",
  "Account",
];

export const FAQ_ITEMS: FaqItem[] = [
  // ── General ───────────────────────────────────────────────────
  {
    id: "gen-1",
    category: "General",
    question: "What is BornoLand and how does it differ from standard store builders?",
    answer:
      "BornoLand is an integrated Business Operating System (BOS). Unlike traditional shopping cart plugins or website builders that only handle an online storefront, BornoLand unifies your digital store, physical retail POS terminals, multi-warehouse stock, staff attendance, automated payroll, and double-entry accounting on a single real-time relational data core.",
    docLink: { label: "Learn more in Platform Overview", href: "/docs/getting-started" },
  },
  {
    id: "gen-2",
    category: "General",
    question: "Is BornoLand suitable for businesses in Bangladesh?",
    answer:
      "Yes. BornoLand is natively engineered for Bangladesh domestic commerce — supporting BDT ৳ currency formatting, direct bKash and Nagad payment QR codes, local courier APIs (Pathao, Steadfast, RedX), and National Board of Revenue (NBR) tax invoicing standards.",
  },

  // ── Getting Started ───────────────────────────────────────────
  {
    id: "gs-1",
    category: "Getting Started",
    question: "How do I create an account and start using BornoLand?",
    answer:
      "Visit /register to sign up with your work email and name. You will immediately receive access to a 7-day free trial with full access to all 9 modules without entering a credit card.",
    docLink: { label: "Read the 16-Step Beginner Guide", href: "/how-to-use" },
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "What is the difference between a Workspace and a Store?",
    answer:
      "A Workspace represents your overarching company or holding entity containing company-wide billing, Chart of Accounts, and employee records. Stores represent individual sales channels (e.g. 'Gulshan Outlet POS' or 'Online Flagship Store') that synchronize into the workspace.",
    docLink: { label: "Workspace Architecture Docs", href: "/docs/account-workspace" },
  },

  // ── Stores ────────────────────────────────────────────────────
  {
    id: "stores-1",
    category: "Stores",
    question: "Can I manage multiple physical store outlets from one account?",
    answer:
      "Yes. You can create and manage unlimited store locations, showrooms, and warehouse backrooms from a single master dashboard. Staff can be restricted specifically to their assigned branch.",
    docLink: { label: "Store Creation Docs", href: "/docs/stores" },
  },
  {
    id: "stores-2",
    category: "Stores",
    question: "Can I customize the visual theme of my online storefront?",
    answer:
      "Yes. The visual drag-and-drop theme customizer allows you to modify brand colors, typography, hero banners, product grids, and checkout layouts in real time without writing any code.",
    docLink: { label: "Store Builder Guide", href: "/docs/store-builder" },
  },

  // ── Products ──────────────────────────────────────────────────
  {
    id: "prod-1",
    category: "Products",
    question: "How do product variants (Size and Color) work?",
    answer:
      "BornoLand generates variant matrix combinations (e.g. Size: S/M/L x Color: Navy/Black). Each variant maintains individual SKU codes, barcode strings, retail prices, and location-specific stock counts.",
    docLink: { label: "Product Catalog Docs", href: "/docs/products" },
  },
  {
    id: "prod-2",
    category: "Products",
    question: "Can I import and export my product catalog using CSV?",
    answer:
      "Yes. You can upload thousands of products, categories, wholesale prices, and opening stock balances simultaneously using our standardized bulk CSV template.",
  },

  // ── Orders ────────────────────────────────────────────────────
  {
    id: "orders-1",
    category: "Orders",
    question: "How does 1-click courier dispatch work?",
    answer:
      "BornoLand connects directly to Pathao, Steadfast, and RedX APIs. Inside an order, click 'Create Shipment' to instantly generate tracking barcodes and print shipping labels. Cash on Delivery (COD) payouts auto-reconcile upon delivery.",
    docLink: { label: "Order Fulfillment Docs", href: "/docs/orders" },
  },
  {
    id: "orders-2",
    category: "Orders",
    question: "Can I generate and print standard VAT invoices for customers?",
    answer:
      "Yes. BornoLand generates A4 invoices, thermal receipts, and packing slips with QR codes compliant with standard domestic invoicing requirements.",
  },

  // ── POS ───────────────────────────────────────────────────────
  {
    id: "pos-1",
    category: "POS",
    question: "Does the POS terminal work when internet drops out (Offline Mode)?",
    answer:
      "Yes! BornoLand POS features an offline-first indexed database architecture. Cashiers can scan barcodes, apply discounts, and complete cash or QR sales without interruption. When connectivity returns, sales automatically synchronize to the cloud.",
    docLink: { label: "POS Hardware & Offline Docs", href: "/docs/pos" },
  },
  {
    id: "pos-2",
    category: "POS",
    question: "Which barcode scanners and thermal receipt printers are supported?",
    answer:
      "Any standard USB or Bluetooth laser barcode scanner is supported. Standard ESC/POS 58mm and 80mm thermal receipt printers work plug-and-play across Windows POS terminals, Macs, iPads, and Android tablets.",
  },

  // ── HRM ───────────────────────────────────────────────────────
  {
    id: "hrm-1",
    category: "HRM",
    question: "Can I connect biometric fingerprint machines to track attendance?",
    answer:
      "Yes. BornoLand integrates with standard ZKTeco fingerprint and face recognition timeclocks. Biometric clock-in and clock-out logs synchronize directly to calculate monthly payable days.",
    docLink: { label: "HRM & Attendance Docs", href: "/docs/hrm" },
  },
  {
    id: "hrm-2",
    category: "HRM",
    question: "How are employee leave approvals and shifts managed?",
    answer:
      "Store managers configure morning, evening, or night retail shifts. Staff can submit leave requests digitally, and approved leaves automatically adjust monthly payroll computations.",
  },

  // ── Employees ─────────────────────────────────────────────────
  {
    id: "emp-1",
    category: "Employees",
    question: "How do I maintain employee files and emergency contacts?",
    answer:
      "The employee directory stores National ID (NID) numbers, emergency contacts, job designations, primary branch assignments, joining dates, and base salary structures.",
  },
  {
    id: "emp-2",
    category: "Employees",
    question: "Can cashiers and branch staff access their own payslips?",
    answer:
      "Yes. Employees can receive digital PDF payslips via email, WhatsApp, or through the employee self-service portal.",
  },

  // ── Inventory ─────────────────────────────────────────────────
  {
    id: "inv-1",
    category: "Inventory",
    question: "How do Stock Transfer Notes (STN) work between branches?",
    answer:
      "When transferring merchandise from a central depot to a retail store, BornoLand utilizes a two-step verification flow: Dispatched from Source → In Transit → Received & Verified by Branch Manager.",
    docLink: { label: "Inventory & Transfer Docs", href: "/docs/inventory" },
  },
  {
    id: "inv-2",
    category: "Inventory",
    question: "Does the system warn me before items run out of stock?",
    answer:
      "Yes. You can configure minimum safe stock thresholds per item. When stock dips below minimums, BornoLand highlights low-stock items on your dashboard and drafts purchase orders automatically.",
  },

  // ── Billing ───────────────────────────────────────────────────
  {
    id: "bill-1",
    category: "Billing",
    question: "What payment methods are accepted for BornoLand subscriptions?",
    answer:
      "We accept corporate Visa, Mastercard, AMEX cards, and instant mobile financial service payments via bKash and Nagad merchant gateways in BDT.",
    docLink: { label: "Plans & Billing Documentation", href: "/docs/plans-billing" },
  },
  {
    id: "bill-2",
    category: "Billing",
    question: "Is there a discount for annual billing?",
    answer:
      "Yes. Prepaying annually grants a 20% discount across all subscription tiers (Starter, Business, and Professional).",
  },

  // ── Plans ─────────────────────────────────────────────────────
  {
    id: "plans-1",
    category: "Plans",
    question: "Can I upgrade or downgrade my subscription plan at any time?",
    answer:
      "Yes. You can upgrade or add additional register outlets right from your billing dashboard. Upgrades are pro-rated automatically so you only pay for the remaining billing days.",
    docLink: { label: "View Pricing Plans", href: "/pricing" },
  },
  {
    id: "plans-2",
    category: "Plans",
    question: "What happens when my 7-day free trial ends?",
    answer:
      "At the end of your 7-day trial, your store data remains completely safe. You can simply select a subscription plan to continue live sales and processing orders.",
  },

  // ── Domains ───────────────────────────────────────────────────
  {
    id: "dom-1",
    category: "Domains",
    question: "How do I connect my custom domain (e.g. mybrand.com)?",
    answer:
      "Add an A record pointing your root domain (@) or a CNAME for subdomains to BornoLand servers in your registrar (e.g. Namecheap, GoDaddy). Then click 'Verify DNS' in store settings.",
    docLink: { label: "Custom Domain & SSL Docs", href: "/docs/domains" },
  },
  {
    id: "dom-2",
    category: "Domains",
    question: "Is TLS/SSL certificate included with custom domains?",
    answer:
      "Yes. Automated 256-bit TLS/SSL encryption certificates are automatically generated and renewed at zero extra charge.",
  },

  // ── Security ──────────────────────────────────────────────────
  {
    id: "sec-1",
    category: "Security",
    question: "How is my business and customer data protected?",
    answer:
      "All traffic is encrypted via TLS 1.3 in transit. Sensitive credentials and salary sheets are encrypted using AES-256 at rest, backed by automated daily geo-redundant backups.",
    docLink: { label: "Platform Security Docs", href: "/docs/security" },
  },
  {
    id: "sec-2",
    category: "Security",
    question: "Can I prevent cashiers from viewing company profit margins?",
    answer:
      "Yes. Role-based access control (RBAC) allows you to restrict staff accounts strictly to POS cashier checkouts without visibility into product cost margins or general accounting ledgers.",
  },

  // ── Account ───────────────────────────────────────────────────
  {
    id: "acc-1",
    category: "Account",
    question: "How do I reset my password or change my email address?",
    answer:
      "You can update your personal information under Account Settings > Profile, or use the 'Forgot Password' recovery link on the login page.",
  },
  {
    id: "acc-2",
    category: "Account",
    question: "Can I transfer workspace ownership to another business partner?",
    answer:
      "Yes. The master workspace owner can transfer primary ownership to another verified administrator from Workspace Settings > Team.",
  },
];
