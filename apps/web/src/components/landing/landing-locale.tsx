"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLanguage } from "@/providers/language-provider";

export type LandingLocale = "en" | "bn";

export type LandingCopy = {
  nav: {
    features: string;
    platform: string;
    solutions: string;
    pos: string;
    inventory: string;
    hrm: string;
    accounting: string;
    analytics: string;
    builder: string;
    pricing: string;
    faq: string;
    login: string;
    dashboard: string;
    startFree: string;
    getStarted: string;
    language: string;
  };
  hero: {
    badge: string;
    badgeSub: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustBullets: string;
    liveBadge: string;
    tabs: {
      overview: string;
      pos: string;
      inventory: string;
      hrm: string;
      finance: string;
      crm: string;
    };
    kpis: {
      revenue: string;
      revenueSub: string;
      cogs: string;
      cogsSub: string;
      grossProfit: string;
      grossProfitSub: string;
      staff: string;
      staffSub: string;
    };
    chart: {
      title: string;
      today: string;
      days7: string;
      days30: string;
      days90: string;
    };
    activity: {
      title: string;
      liveSync: string;
      item1: { title: string; subtitle: string; amount: string; status: string };
      item2: { title: string; subtitle: string; amount: string; status: string };
      item3: { title: string; subtitle: string; amount: string; status: string };
    };
  };
  problem: {
    eyebrow: string;
    title: string;
    description: string;
    beforeTitle: string;
    beforeBadge: string;
    afterTitle: string;
    afterBadge: string;
    afterHeading: string;
    afterDescription: string;
    savedHours: string;
    problems: Array<{ title: string; description: string; tag: string }>;
  };
  transformation: {
    eyebrow: string;
    title: string;
    description: string;
    domains: {
      commerce: { title: string; sub: string; items: Array<{ label: string; desc: string }> };
      operations: { title: string; sub: string; items: Array<{ label: string; desc: string }> };
      people: { title: string; sub: string; items: Array<{ label: string; desc: string }> };
      finance: { title: string; sub: string; items: Array<{ label: string; desc: string }> };
      growth: { title: string; sub: string; items: Array<{ label: string; desc: string }> };
    };
  };
  builder: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    desktop: string;
    tablet: string;
    mobile: string;
    livePreview: string;
    shopNow: string;
  };
  pos: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    terminalTitle: string;
    cashier: string;
    cartSummary: string;
    subtotal: string;
    discount: string;
    total: string;
    payCash: string;
    payBkash: string;
    receiptPrinted: string;
  };
  inventory: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    warehouseTitle: string;
    stockLevel: string;
    inStock: string;
    lowStock: string;
    reorderLevel: string;
    stockLedger: string;
  };
  accounting: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    statementTitle: string;
    grossSales: string;
    costOfGoods: string;
    grossMargin: string;
    operatingExpenses: string;
    netProfit: string;
    journalEntry: string;
  };
  hrm: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    portalTitle: string;
    activeEmployees: string;
    onTimeAttendance: string;
    payrollStatus: string;
    payslipGenerated: string;
  };
  analytics: {
    eyebrow: string;
    title: string;
    description: string;
    periods: Record<string, string>;
    kpis: {
      grossSales: string;
      orders: string;
      conversion: string;
      topCategory: string;
    };
    topProductsTitle: string;
  };
  security: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string; badge: string }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    stats: {
      merchants: string;
      merchantsLabel: string;
      orders: string;
      ordersLabel: string;
      gmv: string;
      gmvLabel: string;
      rating: string;
      ratingLabel: string;
    };
    items: Array<{
      name: string;
      role: string;
      business: string;
      avatar: string;
      text: string;
      verified: string;
    }>;
  };
  pricing: {
    eyebrow: string;
    title: string;
    description: string;
    monthly: string;
    yearly: string;
    yearlyDiscount: string;
    perMonth: string;
    popular: string;
    startTrial: string;
    contactSales: string;
    plans: Array<{
      id: string;
      name: string;
      desc: string;
      monthlyPrice: number;
      yearlyPrice: number;
      popular?: boolean;
      features: string[];
      limits: string;
    }>;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ q: string; a: string }>;
  };
  finalCta: {
    badge: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
    bullets: string[];
  };
  footer: {
    tagline: string;
    status: string;
    columns: {
      product: { title: string; links: Array<{ label: string; href: string }> };
      solutions: { title: string; links: Array<{ label: string; href: string }> };
      resources: { title: string; links: Array<{ label: string; href: string }> };
      company: { title: string; links: Array<{ label: string; href: string }> };
      legal: { title: string; links: Array<{ label: string; href: string }> };
    };
    rights: string;
  };
};

const en: LandingCopy = {
  nav: {
    features: "Features",
    platform: "Platform",
    solutions: "Solutions",
    pos: "POS",
    inventory: "Inventory",
    hrm: "HRM & Payroll",
    accounting: "Accounting",
    analytics: "Analytics",
    builder: "Storefront",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
    dashboard: "Dashboard",
    startFree: "Start Free",
    getStarted: "Get Started",
    language: "Language",
  },
  hero: {
    badge: "BUSINESS OPERATING SYSTEM",
    badgeSub: "Commerce • POS • Inventory • HRM • Accounting • CRM • Analytics",
    titleLine1: "Everything Your Business Needs.",
    titleHighlight: "One Powerful Platform.",
    description:
      "BornoLand unifies storefront commerce, cloud POS, multi-warehouse inventory, employee payroll, double-entry accounting, and real-time business intelligence in one high-performance system.",
    primaryCta: "Start Free",
    secondaryCta: "Explore Platform",
    trustBullets: "Zero coding setup • Instant multi-store provisioning • Built for scale",
    liveBadge: "LIVE SYSTEM PREVIEW",
    tabs: {
      overview: "Overview",
      pos: "POS Terminal",
      inventory: "Inventory & Cost",
      hrm: "HRM & Payroll",
      finance: "Accounting & P&L",
      crm: "CRM & Pipeline",
    },
    kpis: {
      revenue: "Total Revenue",
      revenueSub: "+18.4% vs last period",
      cogs: "True COGS",
      cogsSub: "Landed cost basis",
      grossProfit: "Gross Profit",
      grossProfitSub: "45.2% gross margin",
      staff: "Active Staff & Payroll",
      staffSub: "Audited & reconciled",
    },
    chart: {
      title: "Real-Time Revenue & Flow",
      today: "Today",
      days7: "7 Days",
      days30: "30 Days",
      days90: "90 Days",
    },
    activity: {
      title: "Central Connected Transactions",
      liveSync: "LIVE SYNC",
      item1: {
        title: "Storefront Checkout (#BL-9284)",
        subtitle: "bKash Online • Auto Stock Deducted",
        amount: "৳৪,৮৫০",
        status: "Completed",
      },
      item2: {
        title: "POS Register (#POS-1042)",
        subtitle: "Dhanmondi Branch • Cash & Receipt",
        amount: "৳২,৩০০",
        status: "Reconciled",
      },
      item3: {
        title: "Supplier PO (#PO-482)",
        subtitle: "Central Warehouse • Stock Inbound",
        amount: "৳৪৫,০০০",
        status: "Received",
      },
    },
  },
  problem: {
    eyebrow: "THE PROBLEM & THE CURE",
    title: "Why run your business across 7 disconnected tools?",
    description:
      "When your storefront, POS, stock sheets, payroll files, and ledger live in separate silos, data breaks and decisions slow down.",
    beforeTitle: "Fragmented Chaos (Before BornoLand)",
    beforeBadge: "5+ DISCONNECTED APPS",
    afterTitle: "BornoLand Operating System",
    afterBadge: "100% UNIFIED DATA FLOW",
    afterHeading: "Orders, inventory, payroll, and accounting update synchronously.",
    afterDescription:
      "Every sale at checkout or POS instantly updates inventory, writes the double-entry accounting journal, adjusts supplier reorder alerts, and computes real-time gross profit.",
    savedHours: "Save 12+ hours of manual reconciliation every week",
    problems: [
      {
        title: "Lost orders & delayed fulfillment",
        description: "Scattered WhatsApp, Facebook DMs, and Excel sheets result in missed customer orders and delayed shipments.",
        tag: "NO PIPELINE",
      },
      {
        title: "Overselling & inaccurate stock counts",
        description: "Physical retail and online storefronts have no synchronized ledger, causing stockouts and disappointed customers.",
        tag: "STOCK MISMATCH",
      },
      {
        title: "Manual bookkeeping & unknown profit margins",
        description: "Trying to reconcile courier remittances, expenses, and invoices by hand takes days and hides your true net margin.",
        tag: "BLIND DECISIONS",
      },
    ],
  },
  transformation: {
    eyebrow: "CONNECTED BOS ARCHITECTURE",
    title: "One unified source of truth for every department",
    description:
      "Engineered so that commerce, operations, employees, and financial ledgers share a single transactional foundation.",
    domains: {
      commerce: {
        title: "Commerce & Storefront",
        sub: "Visual drag & drop builder, dynamic catalog, custom domains, and native bKash/Nagad checkout.",
        items: [
          { label: "Drag & Drop Builder", desc: "Design pages visually with live responsive previews." },
          { label: "Variant Catalog & SKU", desc: "Organize sizes, colors, pricing, and barcodes cleanly." },
          { label: "Smart Checkout", desc: "bKash, Nagad, Card, and instant Courier API integration." },
        ],
      },
      operations: {
        title: "Operations & POS",
        sub: "Cloud POS terminal, multi-warehouse routing, supplier purchase orders, and waste tracking.",
        items: [
          { label: "Retail POS Terminal", desc: "Fast barcode scan, split tender, and shift cash drawer balance." },
          { label: "Multi-Warehouse Ledger", desc: "Real-time stock transfers with location-based bin tracking." },
          { label: "Purchase Orders (PO)", desc: "Procurement workflow from quotation to stock intake." },
        ],
      },
      people: {
        title: "People & HRM",
        sub: "Employee directory, biometric/manual attendance, leave approvals, and automated audited payroll.",
        items: [
          { label: "Attendance & Shift Rules", desc: "Automated tracking for overtime, late arrivals, and deductions." },
          { label: "1-Click Payroll Engine", desc: "Generate payslips (#PS-YYYYMM-XXXX) and payment vouchers." },
          { label: "Employee Self-Service", desc: "Staff portal for leave requests and payslip downloads." },
        ],
      },
      finance: {
        title: "Finance & Accounting",
        sub: "Automated double-entry journals, chart of accounts, real-time P&L, balance sheets, and expense tracker.",
        items: [
          { label: "Double-Entry Journals", desc: "Every transaction automatically posts debit and credit lines." },
          { label: "Real-Time P&L & BS", desc: "Instant financial statements based on actual landed costs." },
          { label: "Expense Management", desc: "Categorize operational expenses with receipt attachments." },
        ],
      },
      growth: {
        title: "CRM & Analytics",
        sub: "Deal pipelines, customer lifetime value, support tickets, and live BI command center.",
        items: [
          { label: "CRM Deal Stages", desc: "Track wholesale inquiries and high-value customer orders." },
          { label: "Support Ticketing", desc: "Integrated customer service desk tied to purchase history." },
          { label: "Real-Time BI Dashboard", desc: "Actionable revenue, retention, and inventory velocity metrics." },
        ],
      },
    },
  },
  builder: {
    eyebrow: "STOREFRONT BUILDER",
    title: "Design high-converting storefronts visually",
    description:
      "Drag sections, tweak typography, configure hero banners, and preview desktop, tablet, and mobile instantly without code.",
    bullets: [
      "Zero-latency visual editing with instant canvas preview",
      "Mobile-optimized performance with 98+ Google Lighthouse scores",
      "Native custom domain connection with automated SSL",
      "Dynamic product grids with filter and search integration",
    ],
    cta: "Launch Your Storefront",
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
    livePreview: "Live Canvas",
    shopNow: "Shop Collection →",
  },
  pos: {
    eyebrow: "RETAIL POINT OF SALE",
    title: "Lightning-fast in-store POS synchronized in real time",
    description:
      "Equip your store cashiers with a modern POS interface that accepts split payments, prints thermal receipts, and syncs inventory instantly.",
    bullets: [
      "Barcode reader integration with quick product lookups",
      "Split tender: Cash, bKash QR, and Credit Card on a single bill",
      "Shift opening/closing cash reconciliation with variance tracking",
      "Works offline with auto-synchronization on network reconnect",
    ],
    cta: "Explore POS System",
    terminalTitle: "POS Terminal — Terminal 01 (Dhanmondi)",
    cashier: "Cashier: Tanvir Ahmed",
    cartSummary: "Cart (3 items)",
    subtotal: "Subtotal",
    discount: "Promo Discount",
    total: "Total Payable",
    payCash: "Cash Pay",
    payBkash: "bKash Pay",
    receiptPrinted: "Receipt #BL-POS-4912 Printed",
  },
  inventory: {
    eyebrow: "INVENTORY & MULTI-WAREHOUSE",
    title: "Granular stock tracking across branches and warehouses",
    description:
      "Know your exact inventory value at every moment. Prevent stockouts with automated reorder thresholds and tracked stock movements.",
    bullets: [
      "Multi-location stock distribution and transfer logs",
      "FIFO/LIFO true cost valuation for accurate gross profit",
      "Waste, damage, and loss write-off tracker",
      "Low-stock email & SMS triggers before products run out",
    ],
    cta: "Manage Inventory",
    warehouseTitle: "Central Warehouse — Hub A",
    stockLevel: "Stock Level",
    inStock: "In Stock (1,240 units)",
    lowStock: "Low Stock Alert (4 items)",
    reorderLevel: "Auto Reorder Trigger",
    stockLedger: "Stock Ledger Movement",
  },
  accounting: {
    eyebrow: "FINANCE & DOUBLE-ENTRY ACCOUNTING",
    title: "Audit-ready financial statements generated automatically",
    description:
      "Stop spending weekends reconciling bank accounts. Sales and expenses post directly to your Chart of Accounts with double-entry precision.",
    bullets: [
      "Automated journal entries for every sale, refund, and PO",
      "Real-time Profit & Loss (P&L), Balance Sheet, and Trial Balance",
      "Expense tracking with category tagging and receipt uploads",
      "Courier remittance reconciliation (Pathao, Steadfast, RedX)",
    ],
    cta: "View Accounting Engine",
    statementTitle: "Income Statement (P&L Summary)",
    grossSales: "Gross Revenue",
    costOfGoods: "Cost of Goods Sold (COGS)",
    grossMargin: "Gross Profit Margin",
    operatingExpenses: "Operating Expenses",
    netProfit: "Net Business Profit",
    journalEntry: "Double-Entry Ledger Active",
  },
  hrm: {
    eyebrow: "HRM & AUTOMATED PAYROLL",
    title: "Manage staff, shifts, attendance, and payroll seamlessly",
    description:
      "From biometric attendance and leave management to 1-click payslip generation, BornoLand handles your team operations with zero hassle.",
    bullets: [
      "Employee directory with role-based permissions and designations",
      "Smart shift scheduling, overtime, and penalty deduction rules",
      "Automated monthly payroll calculation with PDF payslips",
      "Self-service portal for leave requests and payment history",
    ],
    cta: "Manage Your Team",
    portalTitle: "HRM Command & Payroll Summary",
    activeEmployees: "Active Employees",
    onTimeAttendance: "On-Time Attendance Rate",
    payrollStatus: "Monthly Payroll Status",
    payslipGenerated: "Payslips Dispatched (#PS-2026-09)",
  },
  analytics: {
    eyebrow: "BUSINESS COMMAND CENTER",
    title: "Your entire enterprise understood at a glance",
    description:
      "Monitor sales velocity, customer acquisition, true profit margins, and warehouse inventory turn rates with live interactive visualizations.",
    periods: {
      "7D": "7 Days",
      "30D": "30 Days",
      "90D": "90 Days",
      "1Y": "1 Year",
    },
    kpis: {
      grossSales: "Gross Sales",
      orders: "Processed Orders",
      conversion: "Storefront Conversion",
      topCategory: "Leading Category",
    },
    topProductsTitle: "Top Revenue Drivers (Selected Period)",
  },
  security: {
    eyebrow: "ENTERPRISE TRUST & RELIABILITY",
    title: "Built with bank-grade security and multi-tenant isolation",
    description:
      "Your company data is protected with strict tenant isolation, encrypted databases, and role-based access controls.",
    items: [
      {
        title: "Multi-Tenant Isolation",
        description: "Strict database partitioning guarantees zero cross-tenant data leakage.",
        badge: "100% ISOLATED",
      },
      {
        title: "Role-Based Access (RBAC)",
        description: "Granular permissions for cashiers, accountants, warehouse managers, and admins.",
        badge: "GRANULAR ROLES",
      },
      {
        title: "Audit Trail & Activity Logs",
        description: "Every price change, stock transfer, and invoice alteration is timestamped.",
        badge: "AUDIT READY",
      },
      {
        title: "Automated Daily Backups",
        description: "Redundant cloud snapshots ensure instant point-in-time disaster recovery.",
        badge: "99.99% UPTIME",
      },
    ],
  },
  testimonials: {
    eyebrow: "TRUSTED BY GROWING BUSINESSES",
    title: "Powering modern retail & commerce across Bangladesh",
    description: "See how leading merchants scale their operations using BornoLand.",
    stats: {
      merchants: "500+",
      merchantsLabel: "Active Businesses",
      orders: "150,000+",
      ordersLabel: "Orders Processed",
      gmv: "৳250M+",
      gmvLabel: "Gross Merchandise Value",
      rating: "4.9 / 5.0",
      ratingLabel: "Merchant Satisfaction",
    },
    items: [
      {
        name: "Sarah Ahmed",
        role: "Founder & Managing Director",
        business: "Aura Lifestyle & Boutique",
        avatar: "SA",
        text: "Before BornoLand, we juggled five different apps for online orders, POS cashiers, and stock counts. Now everything is unified — our sales went up 40% with zero overselling.",
        verified: "Verified Merchant",
      },
      {
        name: "Rafiul Hasan",
        role: "Head of Operations",
        business: "Apex Tech Retail Ltd.",
        avatar: "RH",
        text: "The multi-warehouse inventory and automated accounting are phenomenal. Our monthly financial reconciliation went from 4 days to literally 10 minutes.",
        verified: "Verified Enterprise",
      },
      {
        name: "Nusrat Jahan",
        role: "Co-Founder",
        business: "Artisan Craft Studio",
        avatar: "NJ",
        text: "The storefront builder is fast and elegant. Connecting bKash and courier fulfillment was completely seamless. Highly recommended for any serious brand.",
        verified: "Verified Brand",
      },
    ],
  },
  pricing: {
    eyebrow: "TRANSPARENT VALUE",
    title: "Simple, predictable plans. Scale as you grow.",
    description: "Start free today. Upgrade when you need advanced multi-warehouse and accounting features.",
    monthly: "Monthly",
    yearly: "Yearly",
    yearlyDiscount: "Save 20%",
    perMonth: "/ month",
    popular: "Most Popular",
    startTrial: "Start 14-Day Free Trial",
    contactSales: "Talk to Enterprise Sales",
    plans: [
      {
        id: "starter",
        name: "Starter",
        desc: "Ideal for boutique shops and single-branch retail stores.",
        monthlyPrice: 999,
        yearlyPrice: 799,
        features: [
          "1 Branded Online Storefront",
          "1 Cloud POS Terminal",
          "Up to 500 Products & Variants",
          "bKash, Nagad & COD Checkout",
          "Courier API Integrations",
          "Standard Inventory Tracking",
        ],
        limits: "1 Store • 2 Staff Seats",
      },
      {
        id: "growth",
        name: "Growth",
        desc: "Designed for scaling brands with active online and in-store sales.",
        monthlyPrice: 1999,
        yearlyPrice: 1599,
        popular: true,
        features: [
          "2 Storefronts + Custom Domains",
          "3 Cloud POS Terminals",
          "Unlimited Products & SKU Barcodes",
          "Multi-Warehouse Stock Routing",
          "Automated Double-Entry Accounting",
          "HRM & Biometric Shift Attendance",
          "SMS & Courier Auto-Booking",
        ],
        limits: "2 Stores • 5 Staff Seats",
      },
      {
        id: "business",
        name: "Business",
        desc: "Complete BOS solution for high-volume retailers and multi-branch chains.",
        monthlyPrice: 3999,
        yearlyPrice: 3199,
        features: [
          "5 Stores with Multi-Brand Management",
          "Unlimited POS Registers",
          "Full Chart of Accounts & P&L Statement",
          "Automated Monthly Payroll Engine",
          "Wholesale & Purchase Order (PO) Intake",
          "CRM Pipeline & Support Desk",
          "Priority 24/7 Phone & SLA Support",
        ],
        limits: "5 Stores • 15 Staff Seats",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        desc: "Custom infrastructure, ERP migrations, and dedicated account management.",
        monthlyPrice: 9999,
        yearlyPrice: 7999,
        features: [
          "Unlimited Stores & Warehouses",
          "Dedicated Database Cluster & Isolation",
          "Custom ERP & Bank API Integrations",
          "Custom Role-Based Access Rules",
          "Dedicated Solution Architect",
          "99.99% Uptime Enterprise SLA",
        ],
        limits: "Unlimited Everything",
      },
    ],
  },
  faq: {
    eyebrow: "COMMON QUESTIONS",
    title: "Everything you need to know about BornoLand",
    description: "Clear answers about platform capabilities, setup, security, and billing.",
    items: [
      {
        q: "What makes BornoLand different from standard ecommerce tools?",
        a: "Unlike typical website builders that only handle a frontend cart, BornoLand is a complete Business Operating System (BOS). It unifies your online store, physical POS registers, multi-warehouse stock, staff payroll, and double-entry accounting in one real-time database.",
      },
      {
        q: "Can I connect my physical retail shop with my online website?",
        a: "Yes! When an item is sold in your physical shop via our POS terminal, online stock updates instantaneously to prevent overselling. Daily revenue and cash drawer reconciliations sync directly to your financial ledger.",
      },
      {
        q: "Does BornoLand support local Bangladeshi payment gateways and couriers?",
        a: "Yes. Native support for bKash Merchant API, Nagad, Rocket, SSLCommerz, and Cash on Delivery is pre-configured. We also offer 1-click delivery dispatch with Steadfast, Pathao, and RedX.",
      },
      {
        q: "How does the automated accounting and P&L work?",
        a: "Every transaction—from a storefront sale to a supplier purchase or courier expense—automatically creates balanced debit and credit journal entries. You get real-time Income Statements (P&L) and Balance Sheets without manual bookkeeping.",
      },
      {
        q: "Can my staff have restricted access permissions?",
        a: "Yes. Our granular Role-Based Access Control (RBAC) lets you grant cashiers access only to the POS, warehouse managers only to stock transfers, and accountants only to financial ledgers.",
      },
      {
        q: "Can I use my own custom domain (.com, .com.bd)?",
        a: "Yes. You can easily connect any custom domain. Free SSL certificates are automatically provisioned and renewed for you.",
      },
    ],
  },
  finalCta: {
    badge: "GET STARTED IN MINUTES",
    title: "Ready to run your entire business from one platform?",
    description:
      "Join hundreds of forward-thinking merchants who replaced chaos with BornoLand's unified operating system.",
    primary: "Start Free Today",
    secondary: "Schedule a Product Demo",
    bullets: ["No credit card required", "Instant setup", "14-day free trial on all plans"],
  },
  footer: {
    tagline: "The modern Business Operating System for building, managing, and scaling enterprises.",
    status: "All Systems Operational",
    columns: {
      product: {
        title: "Product",
        links: [
          { label: "Storefront Builder", href: "#builder" },
          { label: "Point of Sale (POS)", href: "#pos" },
          { label: "Multi-Warehouse", href: "#inventory" },
          { label: "HRM & Payroll", href: "#hrm" },
          { label: "Double-Entry Accounting", href: "#accounting" },
          { label: "Analytics & BI", href: "#analytics" },
        ],
      },
      solutions: {
        title: "Solutions",
        links: [
          { label: "Fashion & Lifestyle", href: "#transformation" },
          { label: "Electronics & Gadgets", href: "#transformation" },
          { label: "Wholesale & Distribution", href: "#transformation" },
          { label: "Multi-Branch Retail", href: "#transformation" },
        ],
      },
      resources: {
        title: "Resources",
        links: [
          { label: "Documentation", href: "/docs" },
          { label: "API Reference", href: "/docs" },
          { label: "Platform Status", href: "#" },
          { label: "Release Notes", href: "#" },
        ],
      },
      company: {
        title: "Company",
        links: [
          { label: "About BornoLand", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact Us", href: "/contact" },
          { label: "Merchant Stories", href: "#testimonials" },
        ],
      },
      legal: {
        title: "Legal & Trust",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Security Overview", href: "#security" },
          { label: "Refund Policy", href: "/refund" },
        ],
      },
    },
    rights: "All rights reserved. Made for Bangladesh and beyond.",
  },
};

const bn: LandingCopy = {
  nav: {
    features: "ফিচারসমূহ",
    platform: "প্ল্যাটফর্ম",
    solutions: "সমাধান",
    pos: "পিওএস (POS)",
    inventory: "ইনভেন্টরি",
    hrm: "এইচআরএম ও বেতন",
    accounting: "অ্যাকাউন্টিং",
    analytics: "অ্যানালিটিক্স",
    builder: "স্টোর বিল্ডার",
    pricing: "মূল্য তালিকা",
    faq: "সাধারণ প্রশ্ন",
    login: "লগইন",
    dashboard: "ড্যাশবোর্ড",
    startFree: "ফ্রি শুরু করুন",
    getStarted: "শুরু করুন",
    language: "ভাষা",
  },
  hero: {
    badge: "সম্পূর্ণ বিজনেস অপারেটিং সিস্টেম",
    badgeSub: "কমার্স • পিওএস • ইনভেন্টরি • এইচআরএম • অ্যাকাউন্টিং • সিআরএম • অ্যানালিটিক্স",
    titleLine1: "আপনার পুরো ব্যবসার জন্য",
    titleHighlight: "একটি শক্তিশালী প্ল্যাটফর্ম।",
    description:
      "অনলাইন স্টোর, ক্লাউড পিওএস, মাল্টি-ওয়্যারহাউস স্টক, কর্মী হাজিরা ও বেতন, ডাবল-এন্ট্রি লেজার এবং রিয়েল-টাইম বিজনেস ইন্টেলিজেন্স—সবকিছু এখন একটি সেন্ট্রাল ক্লাউড প্ল্যাটফর্মে সংযুক্ত।",
    primaryCta: "ফ্রি শুরু করুন",
    secondaryCta: "প্ল্যাটফর্ম ঘুরে দেখুন",
    trustBullets: "কোনো কোডিং লাগবে না • ইনস্ট্যান্ট মাল্টি-স্টোর সুবিধা • সহজে পরিচালনা",
    liveBadge: "লাইভ সিস্টেম প্রিভিউ",
    tabs: {
      overview: "ওভারভিউ",
      pos: "পিওএস টার্মিনাল",
      inventory: "ইনভেন্টরি ও খরচ",
      hrm: "এইচআরএম ও প্যারোল",
      finance: "অ্যাকাউন্টিং ও লাভ-ক্ষতি",
      crm: "সিআরএম ও সেলস",
    },
    kpis: {
      revenue: "মোট বিক্রয় (Revenue)",
      revenueSub: "+১৮.৪% পূর্ববর্তী সময়ের চেয়ে",
      cogs: "প্রকৃত পণ্য খরচ (COGS)",
      cogsSub: "ল্যান্ডেড ট্রু কস্ট ভিত্তিক",
      grossProfit: "মোট লাভ (Gross Profit)",
      grossProfitSub: "৪৫.২% গ্রস মার্জিন",
      staff: "সক্রিয় কর্মী ও প্যারোল",
      staffSub: "অডিটেড ও প্রস্তুত",
    },
    chart: {
      title: "রিয়েল-টাইম রাজস্ব ও প্রবৃদ্ধি",
      today: "আজ",
      days7: "৭ দিন",
      days30: "৩০ দিন",
      days90: "৯০ দিন",
    },
    activity: {
      title: "সেন্ট্রাল কানেক্টেড ট্রানজেকশন",
      liveSync: "লাইভ সিঙ্ক",
      item1: {
        title: "ওয়েবসাইট অর্ডার (#BL-9284)",
        subtitle: "বিকাশ পেমেন্ট • স্টক অটো সমন্বয়",
        amount: "৳৪,৮৫০",
        status: "সম্পন্ন",
      },
      item2: {
        title: "পিওএস টার্মিনাল (#POS-1042)",
        subtitle: "ধানমন্ডি শাখা • ক্যাশ ও রসিদ",
        amount: "৳২,৩০০",
        status: "মিলানো হয়েছে",
      },
      item3: {
        title: "সাপ্লায়ার ক্রয় আদেশ (#PO-482)",
        subtitle: "সেন্ট্রাল ওয়্যারহাউস • স্টক আগমন",
        amount: "৳৪৫,০০০",
        status: "গৃহীত",
      },
    },
  },
  problem: {
    eyebrow: "সমস্যা ও সমাধান",
    title: "ব্যবসা চালাতে ৭টি আলাদা সফটওয়্যারের ঝামেলা কেন?",
    description:
      "যখন আপনার ওয়েবসাইট, দোকানের পিওএস, খাতা, হিসাব এবং প্যারোল আলাদা আলাদা জায়গায় থাকে, তখন ভুল হিসাব ও ভুল সিদ্ধান্ত তৈরি হয়।",
    beforeTitle: "আলাদা আলাদা পেপার ও সফটওয়্যারের ঝামেলা",
    beforeBadge: "৫+ বিচ্ছিন্ন টুল",
    afterTitle: "BornoLand অপারেটিং সিস্টেম",
    afterBadge: "১০০% স্বয়ংক্রিয় ডাটা ফ্লো",
    afterHeading: "অর্ডার, স্টক, বেতন ও লাভ-ক্ষতির হিসাব এক সাথে আপডেট হয়।",
    afterDescription:
      "দোকানে বিক্রি হোক বা অনলাইনে চেকআউট—স্টক সাথে সাথে কমে, ডাবল-এন্ট্রি লেজারে পোস্টিং হয়, সাপ্লায়ারকে রিস্টকের অ্যালার্ট যায় এবং সঠিক গ্রস প্রফিট হিসাব হয়ে যায়।",
    savedHours: "প্রতি সপ্তাহে ১২+ ঘণ্টা অহেতুক সময় বাঁচান",
    problems: [
      {
        title: "অর্ডার মিস ও দেরিতে ডেলিভারি",
        description: "ফেসবুক, হোয়াটসঅ্যাপ আর খাতায় ছড়িয়ে থাকা অর্ডারের কারণে ডেলিভারিতে বিলম্ব ও গ্রাহক অসন্তোষ তৈরি হয়।",
        tag: "অর্ডার ট্র্যাকিং নাই",
      },
      {
        title: "স্টক শেষ হওয়া সত্ত্বেও অর্ডার গ্রহণ",
        description: "দোকানের বিক্রি আর অনলাইনের স্টকের কোনো মিল না থাকায় অতিরিক্ত বিক্রি বা পণ্য ঘাটতির সৃষ্টি হয়।",
        tag: "ইনভেন্টরি অমিল",
      },
      {
        title: "ম্যানুয়াল হিসাব ও লাভ-ক্ষতি না জানা",
        description: "কুরিয়ার পেমেন্ট, খরচ ও ইনভয়েস মেলাতে দিন পার হয়ে যায়, ফলে ব্যবসার আসল লাভ কত তা জানা থাকে না।",
        tag: "অস্পষ্ট মুনাফা",
      },
    ],
  },
  transformation: {
    eyebrow: "সংযুক্ত BOS আর্কিটেকচার",
    title: "পুরো ব্যবসার প্রতিটি বিভাগের জন্য একক কেন্দ্রীয় তথ্যভাণ্ডার",
    description:
      "কমার্স, অপারেশনস, কর্মী ব্যবস্থাপনা ও ফিন্যান্সিয়াল লেজারকে একটি শক্তিশালী ডাটাবেসে একীভূত করা হয়েছে।",
    domains: {
      commerce: {
        title: "কমার্স ও স্টোরফ্রন্ট",
        sub: "ভিজ্যুয়াল ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার, ক্যাটালগ, নিজস্ব ডোমেইন ও বিকাশ/নগদ চেকআউট।",
        items: [
          { label: "ভিজ্যুয়াল বিল্ডার", desc: "কোডিং ছাড়া নিজস্ব শপ ও সেকশন ডিজাইন করার সুবিধা।" },
          { label: "ভ্যারিয়েন্ট ক্যাটালগ ও SKU", desc: "সাইজ, রঙ, দাম ও বারকোড দিয়ে পণ্যের নির্ভুল তালিকা।" },
          { label: "স্মার্ট চেকআউট", desc: "বিকাশ, নগদ, কার্ড ও ইনস্ট্যান্ট কুরিয়ার বুকিং সুবিধা।" },
        ],
      },
      operations: {
        title: "অপারেশনস ও পিওএস (POS)",
        sub: "ক্লাউড পিওএস টার্মিনাল, মাল্টি-ওয়্যারহাউস রাউটিং, সাপ্লায়ার ক্রয় আদেশ ও অপচয় ট্র্যাকার।",
        items: [
          { label: "রিটেল পিওএস টার্মিনাল", desc: "দ্রুত বারকোড স্ক্যান, স্প্লিট পেমেন্ট ও শিফট ক্যাশ রিকনসিলিয়েশন।" },
          { label: "মাল্টি-ওয়্যারহাউস স্টক", desc: "লোকেশন ভিত্তিক রিয়েল-টাইম স্টক ট্রান্সফার ও বিন ট্র্যাকিং।" },
          { label: "সাপ্লায়ার ক্রয় আদেশ (PO)", desc: "কোটেশন থেকে শুরু করে পণ্য রিসিভ পর্যন্ত নিখুঁত ক্রয় প্রক্রিয়া।" },
        ],
      },
      people: {
        title: "মানবসম্পদ (HRM) ও প্যারোল",
        sub: "কর্মী প্রোফাইল, বায়োমেট্রিক/ম্যানুয়াল হাজিরা, ছুটি অনুমোদন ও ১-ক্লিকে অডিটেড বেতন প্রস্তুত।",
        items: [
          { label: "হাজিরা ও শিফট নিয়ম", desc: "ওভারটাইম, দেরিতে আসা ও কর্তন স্বয়ংক্রিয় হিসাব।" },
          { label: "১-ক্লিকে প্যারোল ইঞ্জিন", desc: "অটো পে-স্লিপ (#PS-YYYYMM-XXXX) ও ভাউচার জেনারেশন।" },
          { label: "কর্মী সেলফ-সার্ভিস", desc: "কর্মীদের ছুটির আবেদন ও পে-স্লিপ ডাউনলোডের জন্য ডেডিকেটেড পোর্টাল।" },
        ],
      },
      finance: {
        title: "হিসাববিজ্ঞান ও ফিন্যান্স",
        sub: "স্বয়ংক্রিয় ডাবল-এন্ট্রি জার্নাল, হিসাবের তালিকা (COA), রিয়েল-টাইম লাভ-ক্ষতি (P&L) ও ব্যালেন্স শীট।",
        items: [
          { label: "ডাবল-এন্ট্রি জার্নাল", desc: "প্রতিটি লেনদেনে স্বয়ংক্রিয় ডেবিট ও ক্রেডিট পোস্টিং।" },
          { label: "রিয়েল-টাইম P&L ও BS", desc: "প্রকৃত ল্যান্ডেড খরচের ভিত্তিতে তাৎক্ষণিক আর্থিক বিবরণী।" },
          { label: "ব্যয় ও খরচ ব্যবস্থাপনা", desc: "ক্যাটাগরি অনুযায়ী ব্যবসার যাবতীয় খরচের রসিদ সংরক্ষণ।" },
        ],
      },
      growth: {
        title: "সিআরএম ও অ্যানালিটিক্স",
        sub: "সেলস ডিল পাইপলাইন, কাস্টমার হিস্ট্রি, সাপোর্ট টিকিট ও লাইভ বিআই ড্যাশবোর্ড।",
        items: [
          { label: "সিআরএম ডিল স্টেজ", desc: "পাইকারি ও করপোরেট ক্লায়েন্টদের ডিল অগ্রগতি ট্র্যাকিং।" },
          { label: "সাপোর্ট টিকিট ডেস্ক", desc: "অর্ডারের সাথে সংযুক্ত গ্রাহক সেবা সমাধান ব্যবস্থা।" },
          { label: "লাইভ বিআই ড্যাশবোর্ড", desc: "বিক্রয় গতি, গ্রাহক রিটেনশন ও স্টক টার্নওভার বিশ্লেষণ।" },
        ],
      },
    },
  },
  builder: {
    eyebrow: "স্টোরফ্রন্ট বিল্ডার",
    title: "কোডিং ছাড়াই তৈরি করুন প্রিমিয়াম অনলাইন স্টোর",
    description:
      "সেকশন সাজান, টাইপোগ্রাফি বদলান, ব্যানার বসান এবং মোবাইল, ট্যাবলেট ও ল্যাপটপে লাইভ প্রিভিউ দেখে এক ক্লিকে পাবলিশ করুন।",
    bullets: [
      "লাইভ ক্যানভাস প্রিভিউ সহ দ্রুত ভিজ্যুয়াল এডিটিং",
      "মোবাইলে দ্রুতগতির লোডিং ও ৯৮+ লাইটহাউস স্কোর",
      "কাস্টম ডোমেইন কানেকশন ও স্বয়ংক্রিয় ফ্রি SSL",
      "স্মার্ট ফিল্টার ও সার্চ সহ ডায়নামিক প্রোডাক্ট গ্রিড",
    ],
    cta: "আপনার স্টোর শুরু করুন",
    desktop: "ডেস্কটপ",
    tablet: "ট্যাবলেট",
    mobile: "মোবাইল",
    livePreview: "লাইভ ক্যানভাস",
    shopNow: "কিনুন →",
  },
  pos: {
    eyebrow: "রিটেল পয়েন্ট অব সেল (POS)",
    title: "দোকানের জন্য আধুনিক, দ্রুতগতির ক্লাউড পিওএস",
    description:
      "ক্যাশিয়ারের জন্য সহজ ইন্টারফেস, বারকোড স্ক্যানিং, একাধিক মাধ্যমে পেমেন্ট ও তাৎক্ষণিক থার্মাল রসিদ প্রিন্টিং সুবিধা।",
    bullets: [
      "বারকোড রিডার দিয়ে এক নিমেষে কার্টে পণ্য যোগ",
      "ক্যাশ, বিকাশ কিউআর ও কার্ড—একই বিলের স্প্লিট পেমেন্ট সুবিধা",
      "ক্যাশিয়ারের শিফট ভিত্তিক ক্যাশ ড্রয়ার হিসাব ও গরমিল চিহ্নিতকরণ",
      "ইন্টারনেট সাময়িক বিচ্ছিন্ন হলেও অফলাইনে কাজ করার সক্ষমতা",
    ],
    cta: "পিওএস সিস্টেম দেখুন",
    terminalTitle: "পিওএস টার্মিনাল — টার্মিনাল ০১ (ধানমন্ডি শাখা)",
    cashier: "ক্যাশিয়ার: তানভীর আহমেদ",
    cartSummary: "কার্ট (৩টি পণ্য)",
    subtotal: "উপমোট",
    discount: "প্রোমো ছাড়",
    total: "পরিশোধযোগ্য মোট",
    payCash: "নগদ পরিশোধ",
    payBkash: "বিকাশ পেমেন্ট",
    receiptPrinted: "রসিদ #BL-POS-4912 প্রিন্ট হয়েছে",
  },
  inventory: {
    eyebrow: "ইনভেন্টরি ও মাল্টি-ওয়্যারহাউস",
    title: "সকল শাখা ও ওয়্যারহাউসের পণ্য মজুত এক নজরে",
    description:
      "কোন গুদামে কত টাকার পণ্য আছে জানুন মুহূর্তে। স্বয়ংক্রিয় রি-অর্ডার নোটিফিকেশন দিয়ে পণ্য ঘাটতি রোধ করুন।",
    bullets: [
      "মাল্টি-লোকেশন স্টক ডিস্ট্রিবিউশন ও ট্রান্সফার লগ",
      "FIFO/LIFO ভিত্তিক ট্রু কস্ট হিসাব ও প্রকৃত লাভ নির্ণয়",
      "পণ্য নষ্ট, ক্ষতি ও অপচয় (Waste) ট্র্যাকার",
      "স্টক কমে গেলে ইমেইল ও এসএমএস এ স্বয়ংক্রিয় সতর্কবার্তা",
    ],
    cta: "ইনভেন্টরি পরিচালনা করুন",
    warehouseTitle: "সেন্ট্রাল ওয়্যারহাউস — হাব এ",
    stockLevel: "মজুত স্তর",
    inStock: "মজুত আছে (১,২৪০টি)",
    lowStock: "লো-স্টক অ্যালার্ট (৪টি পণ্য)",
    reorderLevel: "অটো রি-অর্ডার ট্রিগার",
    stockLedger: "স্টক মুভমেন্ট লেজার",
  },
  accounting: {
    eyebrow: "হিসাববিজ্ঞান ও ডাবল-এন্ট্রি লেজার",
    title: "অটোমেটেড ও অডিট-রেডি আর্থিক বিবরণী",
    description:
      "ব্যাংক আর ক্যাশের হিসাব মেলাতে আর ঘণ্টার পর ঘণ্টা অপচয় নয়। প্রতিটি বিক্রয় ও খরচ সরাসরি হিসাবের খাতায় পোস্ট হয়।",
    bullets: [
      "প্রতিটি বিক্রয়, রিফান্ড ও ক্রয়ের জন্য অটো ডাবল-এন্ট্রি জার্নাল",
      "রিয়েল-টাইম লাভ-ক্ষতি বিবরণী (P&L), ব্যালেন্স শীট ও ট্রায়াল ব্যালেন্স",
      "ভাউচার ও রসিদ যুক্ত করে ব্যবসায়িক খরচের সঠিক হিসাব",
      "পাঠাও, স্টেডফাস্ট ও রেডএক্স কুরিয়ার রেমিট্যান্স রিকনসিলিয়েশন",
    ],
    cta: "অ্যাকাউন্টিং ইঞ্জিন দেখুন",
    statementTitle: "আর্থিক লাভ-ক্ষতি বিবরণী (P&L Summary)",
    grossSales: "মোট বিক্রয়",
    costOfGoods: "বিক্রিত পণ্যের ব্যয় (COGS)",
    grossMargin: "মোট মুনাফার হার (Margin)",
    operatingExpenses: "পরিচালন ব্যয়",
    netProfit: "প্রকৃত ব্যবসায়িক মুনাফা",
    journalEntry: "ডাবল-এন্ট্রি লেজার সক্রিয়",
  },
  hrm: {
    eyebrow: "মানবসম্পদ (HRM) ও বেতন ব্যবস্থা",
    title: "টিমের হাজিরা, ছুটি ও মাসিক বেতন ব্যবস্থাপনা এক প্ল্যাটফর্মে",
    description:
      "কর্মীদের বায়োমেট্রিক হাজিরা থেকে শুরু করে ১-ক্লিকে ট্যাক্স ও কর্তন সহ বেতন স্লিপ তৈরি—সবকিছু অত্যন্ত স্বচ্ছ ও নির্ভুল।",
    bullets: [
      "রোল ভিত্তিক পারমিশন ও পদবী সহ কর্মী ডিরেক্টরি",
      "শিফট শিডিউল, ওভারটাইম ও দেরিতে আসার স্বয়ংক্রিয় হিসাব",
      "১-ক্লিকে মাসিক প্যারোল ও প্রিন্টযোগ্য PDF পে-স্লিপ",
      "ছুটির আবেদন ও পে-স্লিপের জন্য কর্মী সেলফ-সার্ভিস পোর্টাল",
    ],
    cta: "টিম ম্যানেজ করুন",
    portalTitle: "এইচআরএম ও প্যারোল ড্যাশবোর্ড",
    activeEmployees: "মোট সক্রিয় কর্মী",
    onTimeAttendance: "সময়মত হাজিরা হার",
    payrollStatus: "মাসিক প্যারোল স্ট্যাটাস",
    payslipGenerated: "পে-স্লিপ প্রস্তুত (#PS-2026-09)",
  },
  analytics: {
    eyebrow: "বিজনেস কমান্ড সেন্টার",
    title: "আপনার পুরো ব্যবসা এক নজরে বুঝে নিন",
    description:
      "লাইভ সেলস ট্রেন্ড, লাভ-মার্জিন, গ্রাহক বৃদ্ধি এবং সর্বাধিক বিক্রিত পণ্যের ডাটা ইন্টারেক্টিভ চার্টে পর্যবেক্ষণ করুন।",
    periods: {
      "7D": "৭ দিন",
      "30D": "৩০ দিন",
      "90D": "৯০ দিন",
      "1Y": "১ বছর",
    },
    kpis: {
      grossSales: "মোট বিক্রয় (Gross Sales)",
      orders: "সম্পন্ন অর্ডার",
      conversion: "ওয়েবসাইট কনভার্শন রেট",
      topCategory: "শীর্ষ ক্যাটাগরি",
    },
    topProductsTitle: "সর্বাধিক বিক্রিত পণ্যসমূহ (নির্বাচিত সময়)",
  },
  security: {
    eyebrow: "নিরাপত্তা ও বিশ্বস্ততা",
    title: "ব্যাংক-গ্রেড নিরাপত্তা ও মাল্টি-টেন্যান্ট আইসোলেশন",
    description:
      "আপনার ব্যবসার সকল তথ্য কঠোর টেন্যান্ট আইসোলেশন ও ডেটা এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত।",
    items: [
      {
        title: "মাল্টি-টেন্যান্ট আইসোলেশন",
        description: "কঠোর ডাটাবেস পার্টিশনিং যা এক দোকানের ডাটা অন্য দোকানে ফাঁস হতে দেয় না।",
        badge: "১০০% সুরক্ষিত",
      },
      {
        title: "রোল-ভিত্তিক অ্যাক্সেস (RBAC)",
        description: "ক্যাশিয়ার, ওয়্যারহাউস ম্যানেজার ও হিসাবরক্ষকের জন্য আলাদা অনুমতি নির্ধারণ।",
        badge: "সুনির্দিষ্ট পারমিশন",
      },
      {
        title: "অডিট ট্রেইল ও অ্যাক্টিভিটি লগ",
        description: "দামের পরিবর্তন, স্টক ট্রান্সফার বা ইনভয়েস এডিটের প্রতিটি কার্যক্রম টাইমস্ট্যাম্প সহ সংরক্ষিত।",
        badge: "অডিট রেডি",
      },
      {
        title: "স্বয়ংক্রিয় ক্লাউড ব্যাকআপ",
        description: "নিয়মিত ব্যাকআপ সিস্টেমের মাধ্যমে যেকোনো দুর্যোগে তাৎক্ষণিক ডাটা রিকভারি।",
        badge: "৯৯.৯৯% আপটাইম",
      },
    ],
  },
  testimonials: {
    eyebrow: "সফল উদ্যোক্তাদের অভিজ্ঞতা",
    title: "বাংলাদেশের শীর্ষস্থানীয় ব্যবসায়ীদের প্রথম পছন্দ",
    description: "দেখুন কীভাবে বিভিন্ন ব্র্যান্ড BornoLand ব্যবহার করে ব্যবসা পরিচালনা করছে।",
    stats: {
      merchants: "৫০০+",
      merchantsLabel: "সক্রিয় ব্যবসায়ী",
      orders: "১,৫০,০০০+",
      ordersLabel: "অর্ডার প্রসেসড",
      gmv: "৳২৫+ কোটি",
      gmvLabel: "মোট লেনদেন",
      rating: "৪.৯ / ৫.০",
      ratingLabel: "মার্চেন্ট সন্তুষ্টি",
    },
    items: [
      {
        name: "সারা আহমেদ",
        role: "প্রতিষ্ঠাতা ও ব্যবস্থাপনা পরিচালক",
        business: "অরা লাইফস্টাইল বুটিক",
        avatar: "SA",
        text: "আগে অনলাইন অর্ডার, দোকানের পিওএস আর স্টক মেলাতে ৫টি আলাদা অ্যাপ লাগত। BornoLand-এ সব একসাথে আসার পর আমাদের বিক্রি ৪০% বেড়েছে এবং কোনো স্টক গরমিল হয় না।",
        verified: "যাচাইকৃত মার্চেন্ট",
      },
      {
        name: "রাফিউল হাসান",
        role: "হেড অব অপারেশনস",
        business: "অ্যাপেক্স টেক রিটেল লিমিটেড",
        avatar: "RH",
        text: "মাল্টি-ওয়্যারহাউস স্টক এবং অটোমেটেড অ্যাকাউন্টিং অসাধারণ। মাসের শেষে হিসাব মেলাতে যেখানে আগে ৪ দিন লাগত, এখন মাত্র ১০ মিনিটে নির্ভুল আর্থিক বিবরণী পাই।",
        verified: "যাচাইকৃত এন্টারপ্রাইজ",
      },
      {
        name: "নুসরাত জাহান",
        role: "সহ-প্রতিষ্ঠাতা",
        business: "আর্টিসান ক্রাফট স্টুডিও",
        avatar: "NJ",
        text: "স্টোরফ্রন্ট বিল্ডার অত্যন্ত চমৎকার এবং দ্রুত লোড হয়। বিকাশ পেমেন্ট ও পাঠাও কুরিয়ার বুকিং একদম স্বয়ংক্রিয়। যেকোনো সিরিয়াস ব্র্যান্ডের জন্য অপরিহার্য।",
        verified: "যাচাইকৃত ব্র্যান্ড",
      },
    ],
  },
  pricing: {
    eyebrow: "সহজ ও স্বচ্ছ মূল্য তালিকা",
    title: "ন্যায্য মূল্য। ব্যবসা বৃদ্ধির সাথে সাথে আপগ্রেড করুন।",
    description: "আজই ফ্রি ট্রায়াল শুরু করুন। বড় স্কেলের জন্য যেকোনো সময় আপগ্রেড করার সুযোগ।",
    monthly: "মাসিক",
    yearly: "বার্ষিক",
    yearlyDiscount: "২০% ছাড়",
    perMonth: "/ মাস",
    popular: "সবচেয়ে জনপ্রিয়",
    startTrial: "১৪ দিনের ফ্রি ট্রায়াল শুরু করুন",
    contactSales: "এন্টারপ্রাইজ সেলসের সাথে কথা বলুন",
    plans: [
      {
        id: "starter",
        name: "স্টার্টার (Starter)",
        desc: "বুটি শপ ও একক ব্রাঞ্চের খুচরা দোকানের জন্য আদর্শ।",
        monthlyPrice: 999,
        yearlyPrice: 799,
        features: [
          "১টি নিজস্ব ব্র্যান্ডেড অনলাইন স্টোরফ্রন্ট",
          "১টি ক্লাউড পিওএস (POS) টার্মিনাল",
          "৫০০টি পর্যন্ত পণ্য ও ভ্যারিয়েন্ট",
          "বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি চেকআউট",
          "কুরিয়ার এপিআই অটোমেশন",
          "স্ট্যান্ডার্ড ইনভেন্টরি ট্র্যাকিং",
        ],
        limits: "১টি স্টোর • ২টি স্টাফ সিট",
      },
      {
        id: "growth",
        name: "গ্রোথ (Growth)",
        desc: "দ্রুত বর্ধনশীল ব্র্যান্ড যাদের অনলাইন ও ইন-স্টোর উভয় সেলস রয়েছে।",
        monthlyPrice: 1999,
        yearlyPrice: 1599,
        popular: true,
        features: [
          "২টি অনলাইন স্টোরফ্রন্ট + কাস্টম ডোমেইন",
          "৩টি ক্লাউড পিওএস (POS) টার্মিনাল",
          "আনলিমিটেড পণ্য ও বারকোড জেনারেশন",
          "মাল্টি-ওয়্যারহাউস স্টক রাউটিং",
          "স্বয়ংক্রিয় ডাবল-এন্ট্রি অ্যাকাউন্টিং",
          "এইচআরএম ও বায়োমেট্রিক হাজিরা ব্যবস্থাপনা",
          "এসএমএস ও কুরিয়ার অটো বুকিং",
        ],
        limits: "২টি স্টোর • ৫টি স্টাফ সিট",
      },
      {
        id: "business",
        name: "বিজনেস (Business)",
        desc: "উচ্চ ভলিউম রিটেলার এবং মাল্টি-ব্রাঞ্চ চেইনের জন্য সম্পূর্ণ বিওএস (BOS) সমাধান।",
        monthlyPrice: 3999,
        yearlyPrice: 3199,
        features: [
          "৫টি স্টোর ও মাল্টি-ব্র্যান্ড সেন্ট্রাল ম্যানেজমেন্ট",
          "আনলিমিটেড পিওএস রেজিস্টার",
          "পূর্ণাঙ্গ চার্ট অব অ্যাকাউন্টস ও লাভ-ক্ষতি বিবরণী",
          "স্বয়ংক্রিয় মাসিক প্যারোল ও পে-স্লিপ ইঞ্জিন",
          "পাইকারি ও ক্রয় আদেশ (PO) সমন্বয়",
          "সিআরএম ডিল পাইপলাইন ও সাপোর্ট ডেস্ক",
          "২৪/৭ ডেডিকেটেড ফোন ও এসএলএ সাপোর্ট",
        ],
        limits: "৫টি স্টোর • ১৫টি স্টাফ সিট",
      },
      {
        id: "enterprise",
        name: "এন্টারপ্রাইজ (Enterprise)",
        desc: "কাস্টম ইনফ্রাস্ট্রাকচার, ইআরপি মাইগ্রেশন এবং ডেডিকেটেড সাপোর্ট।",
        monthlyPrice: 9999,
        yearlyPrice: 7999,
        features: [
          "আনলিমিটেড স্টোর ও ওয়্যারহাউস",
          "ডেডিকেটেড ডাটাবেস ক্লাস্টার ও আইসোলেশন",
          "কাস্টম ইআরপি ও ব্যাংক এপিআই ইন্টিগ্রেশন",
          "কাস্টম রোল-ভিত্তিক অ্যাক্সেস রুলস",
          "ডেডিকেটেড সলিউশন আর্কিটেক্ট",
          "৯৯.৯৯% আপটাইম এন্টারপ্রাইজ এসএলএ",
        ],
        limits: "আনলিমিটেড সকল সুবিধা",
      },
    ],
  },
  faq: {
    eyebrow: "সাধারণ জিজ্ঞাসা",
    title: "BornoLand সম্পর্কে আপনার সাধারণ প্রশ্নের উত্তর",
    description: "প্ল্যাটফর্মের সুবিধা, সেটআপ, নিরাপত্তা ও বিলিং সম্পর্কিত পরিষ্কার তথ্য।",
    items: [
      {
        q: "সাধারণ ই-কমার্স ওয়েবসাইট আর BornoLand-এর মধ্যে পার্থক্য কী?",
        a: "সাধারণ ওয়েবসাইট শুধু অনলাইন কার্ট পরিচালনা করে। আর BornoLand হলো একটি পূর্ণাঙ্গ বিজনেস অপারেটিং সিস্টেম (BOS)—যা আপনার অনলাইন শপ, দোকানের পিওএস, গুদামের স্টক, কর্মীদের বেতন এবং লাভ-ক্ষতির খাতা একই ডাটাবেসে পরিচালনা করে।",
      },
      {
        q: "আমার দোকানের পিওএস এবং অনলাইন শপ কি একসাথে যুক্ত থাকবে?",
        a: "হ্যাঁ! দোকানে কোনো পণ্য বিক্রি হলে সাথে সাথে অনলাইন স্টকের পরিমাণ কমে যাবে, যাতে কোনো ওভারসেলিং না হয়। দোকানের নগদ লেনদেন ও দৈনিক বিক্রি স্বয়ংক্রিয়ভাবে অ্যাকাউন্টিং লেজারে যুক্ত হয়।",
      },
      {
        q: "বিকাশ, নগদ ও দেশীয় কুরিয়ার সার্ভিস কি সরাসরি যুক্ত করা সম্ভব?",
        a: "হ্যাঁ। বিকাশ মার্চেন্ট এপিআই, নগদ, রকেট, কার্ড এবং ক্যাশ অন ডেলিভারি আগে থেকেই কনফিগার করা থাকে। এছাড়া স্টেডফাস্ট, পাঠাও ও রেডএক্স কুরিয়ারে ১-ক্লিকেই পার্সেল বুকিং করা যায়।",
      },
      {
        q: "স্বয়ংক্রিয় হিসাববিজ্ঞান ও লাভ-ক্ষতির হিসাব কীভাবে কাজ করে?",
        a: "প্রতিটি বিক্রি, কুরিয়ার চার্জ বা সাপ্লায়ার থেকে পণ্য কেনার সাথে সাথে স্বয়ংক্রিয় ডাবল-এন্ট্রি ডেবিট ও ক্রেডিট পোস্টিং হয়। ফলে খাতা না লিখেও মুহূর্তে নির্ভুল লাভ-ক্ষতি বিবরণী (P&L) ও ব্যালেন্স শীট পাওয়া যায়।",
      },
      {
        q: "আমার বিভিন্ন কর্মচারীকে কি আলাদা পারমিশন দেওয়া যাবে?",
        a: "অবশ্যই। আমাদের রোল-ভিত্তিক পারমিশন (RBAC) সুবিধার মাধ্যমে আপনি ক্যাশিয়ারকে শুধু পিওএস, গুদামের কর্মীকে শুধু স্টক এবং হিসাবরক্ষককে শুধু হিসাবের অপশন ব্যবহারের অনুমতি দিতে পারবেন।",
      },
      {
        q: "আমি কি আমার নিজস্ব কাস্টম ডোমেইন (.com, .com.bd) ব্যবহার করতে পারব?",
        a: "হ্যাঁ। আপনার যেকোনো নিজস্ব ডোমেইন সহজেই যুক্ত করতে পারবেন। সাথে স্বয়ংক্রিয় ফ্রি SSL সিকিউরিটি সার্টিফিকেট অন্তর্ভুক্ত থাকবে।",
      },
    ],
  },
  finalCta: {
    badge: "কয়েক মিনিটেই শুরু করুন",
    title: "আপনার পুরো ব্যবসা একটি আধুনিক প্ল্যাটফর্মে চালানোর জন্য প্রস্তুত?",
    description:
      "আলাদা আলাদা পেপার ও সফটওয়্যারের জটিলতা দূর করে আজই BornoLand-এর ইউনিফাইড সিস্টেমে যুক্ত হোন।",
    primary: "আজই ফ্রি শুরু করুন",
    secondary: "প্রোডাক্ট ডেমো শিডিউল করুন",
    bullets: ["কোনো ক্রেডিট কার্ড লাগবে না", "তাৎক্ষণিক সেটআপ", "সকল প্ল্যানে ১৪ দিনের ফ্রি ট্রায়াল"],
  },
  footer: {
    tagline: "ব্যবসা তৈরি, পরিচালনা ও সম্প্রসারণের আধুনিক বিজনেস অপারেটিং সিস্টেম।",
    status: "সকল সিস্টেম সক্রিয়",
    columns: {
      product: {
        title: "প্রোডাক্ট",
        links: [
          { label: "স্টোরফ্রন্ট বিল্ডার", href: "#builder" },
          { label: "পয়েন্ট অব সেল (POS)", href: "#pos" },
          { label: "মাল্টি-ওয়্যারহাউস", href: "#inventory" },
          { label: "এইচআরএম ও বেতন", href: "#hrm" },
          { label: "ডাবল-এন্ট্রি অ্যাকাউন্টিং", href: "#accounting" },
          { label: "অ্যানালিটিক্স ও বিআই", href: "#analytics" },
        ],
      },
      solutions: {
        title: "সমাধান",
        links: [
          { label: "ফ্যাশন ও লাইফস্টাইল", href: "#transformation" },
          { label: "ইলেকট্রনিক্স ও গ্যাজেট", href: "#transformation" },
          { label: "পাইকারি ও ডিস্ট্রিবিউশন", href: "#transformation" },
          { label: "মাল্টি-ব্রাঞ্চ রিটেল", href: "#transformation" },
        ],
      },
      resources: {
        title: "রিসোর্স",
        links: [
          { label: "ডকুমেন্টেশন", href: "/docs" },
          { label: "এপিআই রেফারেন্স", href: "/docs" },
          { label: "প্ল্যাটফর্ম স্ট্যাটাস", href: "#" },
          { label: "রিলিজ নোটস", href: "#" },
        ],
      },
      company: {
        title: "কোম্পানি",
        links: [
          { label: "আমাদের সম্পর্কে", href: "/about" },
          { label: "ক্যারিয়ার", href: "/careers" },
          { label: "যোগাযোগ", href: "/contact" },
          { label: "মার্চেন্টদের গল্প", href: "#testimonials" },
        ],
      },
      legal: {
        title: "আইনি ও নিরাপত্তা",
        links: [
          { label: "প্রাইভেসি পলিসি", href: "/privacy" },
          { label: "ব্যবহারের শর্তাবলী", href: "/terms" },
          { label: "সিকিউরিটি ওভারভিউ", href: "#security" },
          { label: "রিফান্ড পলিসি", href: "/refund" },
        ],
      },
    },
    rights: "সর্বস্বত্ব সংরক্ষিত। বাংলাদেশ ও বৈশ্বিক ব্যবসার জন্য নির্মিত।",
  },
};

const dictionaries: Record<LandingLocale, LandingCopy> = { en, bn };

type LandingLocaleContextValue = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  t: LandingCopy;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();

  const currentLocale: LandingLocale = (language === "en" || language === "bn") ? language : "en";

  const value = useMemo(
    () => ({
      locale: currentLocale,
      setLocale: setLanguage as (locale: LandingLocale) => void,
      t: dictionaries[currentLocale] || dictionaries.en,
    }),
    [currentLocale, setLanguage]
  );

  return (
    <LandingLocaleContext.Provider value={value}>{children}</LandingLocaleContext.Provider>
  );
}

export function useLandingLocale() {
  const ctx = useContext(LandingLocaleContext);
  if (!ctx) {
    throw new Error("useLandingLocale must be used within LandingLocaleProvider");
  }
  return ctx;
}
