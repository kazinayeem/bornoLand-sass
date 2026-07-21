"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LandingLocale = "en" | "bn";

export type LandingCopy = {
  nav: {
    features: string;
    builder: string;
    management: string;
    pricing: string;
    faq: string;
    login: string;
    startFree: string;
    getStarted: string;
    platform: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    benefits: string[];
    dashboard: string;
    live: string;
    revenueMonth: string;
    orders: string;
    products: string;
    customers: string;
    conversion: string;
  };
  trust: {
    stores: string;
    products: string;
    orders: string;
    rating: string;
    logosLabel: string;
  };
  features: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  builder: {
    eyebrow: string;
    title: string;
    description: string;
    why: string[];
    cta: string;
    desktop: string;
    tablet: string;
    mobile: string;
    shopNow: string;
    livePreview: string;
    editSections: string;
  };
  management: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  pricing: {
    eyebrow: string;
    title: string;
    description: string;
    recommended: string;
    mostPopular: string;
    perMonth: string;
    yearly: string;
    trialDays: string;
    included: string;
    limits: string;
    compare: string;
    compareHint: string;
    featureOrLimit: string;
    unavailableTitle: string;
    unavailableBody: string;
    comingSoonTitle: string;
    comingSoonBody: string;
    contactSales: string;
    startTrial: string;
    getStarted: string;
    custom: string;
    free: string;
    labels: Record<string, string>;
    limitLabels: Record<string, { label: string; suffix?: string }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      business: string;
      avatar: string;
      color: string;
      text: string;
    }>;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ q: string; a: string }>;
  };
  finalCta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
  footer: {
    tagline: string;
    product: string;
    resources: string;
    company: string;
    legal: string;
    rights: string;
    links: {
      features: string;
      builder: string;
      pricing: string;
      blog: string;
      docs: string;
      about: string;
      contact: string;
      support: string;
      terms: string;
      privacy: string;
      refund: string;
    };
  };
};

const en: LandingCopy = {
  nav: {
    features: "Features",
    builder: "Builder",
    management: "Manage",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log In",
    startFree: "Start Free",
    getStarted: "Get Started",
    platform: "Platform",
  },
  hero: {
    badge: "All-in-one ecommerce platform",
    titleLine1: "Your online store,",
    titleHighlight: "ready in minutes",
    description:
      "Create a store, sell products, take payments, and manage everything from one clean dashboard.",
    primaryCta: "Start Free",
    secondaryCta: "Book Demo",
    benefits: ["No coding", "Custom domain", "Mobile ready", "SSL included"],
    dashboard: "Dashboard",
    live: "Live",
    revenueMonth: "Revenue this month",
    orders: "Orders",
    products: "Products",
    customers: "Customers",
    conversion: "Conversion",
  },
  trust: {
    stores: "Stores launched",
    products: "Products managed",
    orders: "Orders processed",
    rating: "Average rating",
    logosLabel: "Trusted by growing brands",
  },
  features: {
    eyebrow: "What BornoLand does",
    title: "Everything you need. Nothing you don’t.",
    description:
      "One platform to create your store, sell products, and run day-to-day operations.",
    items: [
      {
        title: "Create your store",
        description: "Launch a branded online store with your own domain and subdomain.",
      },
      {
        title: "Manage products",
        description: "Add products, variants, prices, and images without spreadsheets.",
      },
      {
        title: "Track inventory",
        description: "Know what’s in stock, what’s low, and what needs restocking.",
      },
      {
        title: "Receive orders",
        description: "See new orders instantly and update status as you fulfill them.",
      },
      {
        title: "Accept payments",
        description: "Take bKash, Nagad, cards, COD, and more — right at checkout.",
      },
      {
        title: "Manage customers",
        description: "Keep customer history, contacts, and order details in one place.",
      },
      {
        title: "Create invoices",
        description: "Generate professional store invoices from every completed order.",
      },
      {
        title: "Customize homepage",
        description: "Design your storefront visually — change sections live, no code.",
      },
    ],
  },
  builder: {
    eyebrow: "Store builder",
    title: "Design your storefront visually",
    description:
      "Drag sections, tweak layout, and preview desktop, tablet, and mobile before you publish.",
    why: [
      "See changes live as you edit",
      "Build pages without writing code",
      "Preview every screen size instantly",
      "Ship a polished homepage faster",
    ],
    cta: "Try the builder",
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
    shopNow: "Shop Now →",
    livePreview: "Live preview",
    editSections: "Edit sections",
  },
  management: {
    eyebrow: "Store management",
    title: "Run your business from one dashboard",
    description: "Products, orders, inventory, invoices, and analytics — together.",
    items: [
      {
        title: "Products",
        description: "Catalog, variants, pricing, and media in one workspace.",
      },
      {
        title: "Orders",
        description: "Track, fulfill, and update orders with a clear timeline.",
      },
      {
        title: "Inventory",
        description: "Stock levels and low-stock alerts you can act on.",
      },
      {
        title: "Invoices",
        description: "Branded PDFs for every order — download, share, or email.",
      },
      {
        title: "Analytics",
        description: "Revenue, customers, and product performance at a glance.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple plans. Clear value.",
    description: "Pick a plan that fits today. Upgrade when your store grows.",
    recommended: "Recommended",
    mostPopular: "Most popular",
    perMonth: "/ month",
    yearly: "Yearly",
    trialDays: "-day free trial",
    included: "Included",
    limits: "Limits",
    compare: "Compare plans",
    compareHint: "Live from your current plan settings.",
    featureOrLimit: "Feature or limit",
    unavailableTitle: "Pricing is temporarily unavailable",
    unavailableBody: "Please refresh or contact us for current plans.",
    comingSoonTitle: "Plans coming soon",
    comingSoonBody: "We’re preparing the right options for your store.",
    contactSales: "Contact Sales",
    startTrial: "Start Free Trial",
    getStarted: "Get Started",
    custom: "Custom",
    free: "Free",
    labels: {
      productVariants: "Product variants",
      inventory: "Inventory",
      advancedInventory: "Advanced inventory",
      digitalProducts: "Digital products",
      coupons: "Coupons",
      reviews: "Reviews",
      blog: "Blog",
      cms: "CMS",
      pageBuilder: "Visual builder",
      dragDropBuilder: "Drag & drop builder",
      themeEditor: "Theme editor",
      advancedAnalytics: "Advanced analytics",
      seo: "SEO tools",
      customDomain: "Custom domain",
      subdomain: "Store subdomain",
      invoiceGenerator: "Invoices",
      reports: "Reports",
      shipping: "Shipping",
      staffManagement: "Staff management",
    },
    limitLabels: {
      products: { label: "Products" },
      storage: { label: "Storage", suffix: " MB" },
      staff: { label: "Staff seats" },
      pages: { label: "Pages" },
      orders: { label: "Orders" },
      customers: { label: "Customers" },
      customDomains: { label: "Custom domains" },
      productVariants: { label: "Product variants" },
      categories: { label: "Categories" },
    },
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "Loved by store owners",
    description: "Real teams running real stores on BornoLand.",
    items: [
      {
        name: "Sarah Ahmed",
        role: "Store Owner",
        business: "Fashion Boutique",
        avatar: "SA",
        color: "bg-blue-500",
        text: "I launched my store in an afternoon. Payments, orders, and the builder all live in one place — I finally stopped juggling five tools.",
      },
      {
        name: "Rafi Hasan",
        role: "Agency Partner",
        business: "WebWorks Digital",
        avatar: "RH",
        color: "bg-violet-500",
        text: "We run client stores on BornoLand. It’s stable, modern, and clients actually enjoy managing their own products and orders.",
      },
      {
        name: "Nusrat Jahan",
        role: "Maker",
        business: "Handmade Crafts",
        avatar: "NJ",
        color: "bg-emerald-500",
        text: "I moved from social-media DMs to a real store with bKash and delivery. Setup took one afternoon — and my first order came the same week.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    description: "Short answers to the things people ask first.",
    items: [
      {
        q: "How do I create a store?",
        a: "Sign up free, pick a store name, customize your homepage in the builder, add products, connect payments, and publish — usually in under 30 minutes.",
      },
      {
        q: "Can I use my own domain?",
        a: "Yes. Connect any custom domain. Free SSL is included for both custom domains and BornoLand subdomains.",
      },
      {
        q: "Do you support bKash and COD?",
        a: "Yes. bKash, Nagad, Rocket, cards, and Cash on Delivery are supported. You control which methods appear at checkout.",
      },
      {
        q: "Can I sell digital products?",
        a: "Yes. Sell physical and digital products. Upload files, set download rules, and keep inventory organized.",
      },
      {
        q: "Can I manage multiple stores?",
        a: "Yes on Business and Agency plans — multiple stores under one account with shared team access.",
      },
      {
        q: "Is there a free plan or trial?",
        a: "You can start free. Many paid plans also include a free trial so you can explore before you commit.",
      },
    ],
  },
  finalCta: {
    title: "Ready to open your store?",
    description: "Start free today. No coding. No clutter. Just a clear path from idea to first order.",
    primary: "Start Free",
    secondary: "Book Demo",
  },
  footer: {
    tagline: "Build, manage, and grow your online store from one place.",
    product: "Product",
    resources: "Resources",
    company: "Company",
    legal: "Legal",
    rights: "All rights reserved.",
    links: {
      features: "Features",
      builder: "Builder",
      pricing: "Pricing",
      blog: "Blog",
      docs: "Documentation",
      about: "About",
      contact: "Contact",
      support: "Support",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      refund: "Refund Policy",
    },
  },
};

const bn: LandingCopy = {
  nav: {
    features: "ফিচার",
    builder: "বিল্ডার",
    management: "ম্যানেজ",
    pricing: "প্রাইসিং",
    faq: "জিজ্ঞাসা",
    login: "লগ ইন",
    startFree: "ফ্রি শুরু করুন",
    getStarted: "শুরু করুন",
    platform: "প্ল্যাটফর্ম",
  },
  hero: {
    badge: "সবকিছু এক প্ল্যাটফর্মে",
    titleLine1: "আপনার অনলাইন দোকান,",
    titleHighlight: "মিনিটেই রেডি",
    description:
      "সহজেই নিজের অনলাইন দোকান তৈরি করুন। পণ্য, অর্ডার, পেমেন্ট আর কাস্টমার—সব এক ড্যাশবোর্ডে।",
    primaryCta: "ফ্রি শুরু করুন",
    secondaryCta: "ডেমো বুক করুন",
    benefits: ["কোডিং লাগে না", "কাস্টম ডোমেইন", "মোবাইল ফ্রেন্ডলি", "SSL ফ্রি"],
    dashboard: "ড্যাশবোর্ড",
    live: "লাইভ",
    revenueMonth: "এই মাসের সেলস",
    orders: "অর্ডার",
    products: "পণ্য",
    customers: "কাস্টমার",
    conversion: "কনভার্শন",
  },
  trust: {
    stores: "দোকান চালু",
    products: "পণ্য ম্যানেজ",
    orders: "অর্ডার প্রসেস",
    rating: "গড় রেটিং",
    logosLabel: "বিশ্বস্ত ব্র্যান্ডগুলোর পছন্দ",
  },
  features: {
    eyebrow: "BornoLand দিয়ে যা করতে পারবেন",
    title: "দরকারি সবকিছু। অপ্রয়োজনীয় কিছুই নয়।",
    description:
      "এক প্ল্যাটফর্মে দোকান বানান, পণ্য বিক্রি করুন, আর প্রতিদিনের কাজ চালান।",
    items: [
      {
        title: "অনলাইন দোকান তৈরি করুন",
        description: "নিজের ব্র্যান্ড, ডোমেইন আর সাবডোমেইন দিয়ে দোকান চালু করুন।",
      },
      {
        title: "পণ্য ম্যানেজ করুন",
        description: "পণ্য, ভ্যারিয়েন্ট, দাম আর ছবি এক জায়গায় রাখুন।",
      },
      {
        title: "ইনভেন্টরি ট্র্যাক করুন",
        description: "স্টক কত আছে, কী কমছে—সব এক নজরে দেখুন।",
      },
      {
        title: "অর্ডার নিন",
        description: "নতুন অর্ডার সাথে সাথে দেখুন, স্ট্যাটাস আপডেট করুন।",
      },
      {
        title: "পেমেন্ট নিন",
        description: "বিকাশ, নগদ, কার্ড, ক্যাশ অন ডেলিভারি—চেকআউটেই।",
      },
      {
        title: "কাস্টমার ম্যানেজ করুন",
        description: "কাস্টমারের অর্ডার হিস্ট্রি ও যোগাযোগ এক জায়গায়।",
      },
      {
        title: "ইনভয়েস তৈরি করুন",
        description: "প্রতিটি অর্ডার থেকে পেশাদার ইনভয়েস বানিয়ে নিন।",
      },
      {
        title: "হোমপেজ কাস্টমাইজ করুন",
        description: "কোড ছাড়াই সেকশন সাজিয়ে স্টোরফ্রন্ট ডিজাইন করুন।",
      },
    ],
  },
  builder: {
    eyebrow: "স্টোর বিল্ডার",
    title: "চোখের সামনেই স্টোর ডিজাইন করুন",
    description:
      "সেকশন টেনে আনুন, লেআউট বদলান, আর পাবলিশের আগে ডেস্কটপ–মোবাইল প্রিভিউ দেখুন।",
    why: [
      "এডিট করার সাথে সাথে লাইভ দেখুন",
      "কোড লিখে কিছু করতে হয় না",
      "সব স্ক্রিন সাইজ এক ক্লিকে চেক করুন",
      "সুন্দর হোমপেজ দ্রুত পাবলিশ করুন",
    ],
    cta: "বিল্ডার ট্রাই করুন",
    desktop: "ডেস্কটপ",
    tablet: "ট্যাবলেট",
    mobile: "মোবাইল",
    shopNow: "কিনুন →",
    livePreview: "লাইভ প্রিভিউ",
    editSections: "সেকশন এডিট",
  },
  management: {
    eyebrow: "স্টোর ম্যানেজমেন্ট",
    title: "এক ড্যাশবোর্ডে পুরো ব্যবসা চালান",
    description: "পণ্য, অর্ডার, ইনভেন্টরি, ইনভয়েস আর অ্যানালিটিক্স—একসাথে।",
    items: [
      {
        title: "পণ্য",
        description: "ক্যাটালগ, ভ্যারিয়েন্ট, দাম আর মিডিয়া এক ওয়ার্কস্পেসে।",
      },
      {
        title: "অর্ডার",
        description: "অর্ডার ট্র্যাক করুন, ডেলিভারি আপডেট করুন।",
      },
      {
        title: "ইনভেন্টরি",
        description: "স্টক লেভেল আর লো-স্টক অ্যালার্ট হাতের কাছে।",
      },
      {
        title: "ইনভয়েস",
        description: "ব্র্যান্ডেড PDF—ডাউনলোড, শেয়ার বা ইমেইল করুন।",
      },
      {
        title: "অ্যানালিটিক্স",
        description: "সেলস, কাস্টমার আর টপ প্রোডাক্ট এক নজরে।",
      },
    ],
  },
  pricing: {
    eyebrow: "প্রাইসিং",
    title: "সহজ প্ল্যান। পরিষ্কার মূল্য।",
    description: "আজকের দরকার অনুযায়ী প্ল্যান নিন। দোকান বড় হলে আপগ্রেড করুন।",
    recommended: "সাজেস্টেড",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    perMonth: "/ মাস",
    yearly: "বার্ষিক",
    trialDays: " দিনের ফ্রি ট্রায়াল",
    included: "যা পাবেন",
    limits: "লিমিট",
    compare: "প্ল্যান তুলনা",
    compareHint: "লাইভ প্ল্যান সেটিংস থেকে।",
    featureOrLimit: "ফিচার বা লিমিট",
    unavailableTitle: "প্রাইসিং এখন দেখা যাচ্ছে না",
    unavailableBody: "পেজ রিফ্রেশ করুন অথবা আমাদের সাথে যোগাযোগ করুন।",
    comingSoonTitle: "প্ল্যান শিগগির আসছে",
    comingSoonBody: "আপনার দোকানের জন্য সঠিক অপশন তৈরি হচ্ছে।",
    contactSales: "সেলস টিমের সাথে কথা বলুন",
    startTrial: "ফ্রি ট্রায়াল শুরু করুন",
    getStarted: "শুরু করুন",
    custom: "কাস্টম",
    free: "ফ্রি",
    labels: {
      productVariants: "প্রোডাক্ট ভ্যারিয়েন্ট",
      inventory: "ইনভেন্টরি",
      advancedInventory: "অ্যাডভান্সড ইনভেন্টরি",
      digitalProducts: "ডিজিটাল প্রোডাক্ট",
      coupons: "কুপন",
      reviews: "রিভিউ",
      blog: "ব্লগ",
      cms: "CMS",
      pageBuilder: "ভিজুয়াল বিল্ডার",
      dragDropBuilder: "ড্র্যাগ অ্যান্ড ড্রপ",
      themeEditor: "থিম এডিটর",
      advancedAnalytics: "অ্যাডভান্সড অ্যানালিটিক্স",
      seo: "SEO টুলস",
      customDomain: "কাস্টম ডোমেইন",
      subdomain: "স্টোর সাবডোমেইন",
      invoiceGenerator: "ইনভয়েস",
      reports: "রিপোর্ট",
      shipping: "শিপিং",
      staffManagement: "স্টাফ ম্যানেজমেন্ট",
    },
    limitLabels: {
      products: { label: "পণ্য" },
      storage: { label: "স্টোরেজ", suffix: " MB" },
      staff: { label: "স্টাফ সিট" },
      pages: { label: "পেজ" },
      orders: { label: "অর্ডার" },
      customers: { label: "কাস্টমার" },
      customDomains: { label: "কাস্টম ডোমেইন" },
      productVariants: { label: "ভ্যারিয়েন্ট" },
      categories: { label: "ক্যাটাগরি" },
    },
  },
  testimonials: {
    eyebrow: "কাস্টমারদের কথা",
    title: "দোকান মালিকরা ভালোবাসেন",
    description: "আসল ব্যবসা, আসল অভিজ্ঞতা।",
    items: [
      {
        name: "সারা আহমেদ",
        role: "স্টোর ওনার",
        business: "Fashion Boutique",
        avatar: "SA",
        color: "bg-blue-500",
        text: "এক বিকেলেই দোকান চালু করেছি। পেমেন্ট, অর্ডার আর বিল্ডার এক জায়গায়—আর পাঁচটা টুল নিয়ে দৌড়াতে হয় না।",
      },
      {
        name: "রাফি হাসান",
        role: "এজেন্সি পার্টনার",
        business: "WebWorks Digital",
        avatar: "RH",
        color: "bg-violet-500",
        text: "ক্লায়েন্টদের স্টোর BornoLand-এ চালাই। সিস্টেম স্থিতিশীল, আর ক্লায়েন্টরা নিজেরাই পণ্য ও অর্ডার ম্যানেজ করতে পারেন।",
      },
      {
        name: "নুসরাত জাহান",
        role: "মেকার",
        business: "Handmade Crafts",
        avatar: "NJ",
        color: "bg-emerald-500",
        text: "ইনবক্স থেকে আসল দোকানে এসেছি—বিকাশ আর ডেলিভারি সহ। এক বিকেলে সেটআপ, সেই সপ্তাহেই প্রথম অর্ডার।",
      },
    ],
  },
  faq: {
    eyebrow: "জিজ্ঞাসা",
    title: "যে প্রশ্নগুলো সবার আগে আসে",
    description: "ছোট উত্তর, পরিষ্কার কথা।",
    items: [
      {
        q: "দোকান কীভাবে তৈরি করব?",
        a: "ফ্রি সাইন আপ করুন, দোকানের নাম দিন, বিল্ডারে হোমপেজ সাজান, পণ্য যোগ করুন, পেমেন্ট কানেক্ট করুন—সাধারণত ৩০ মিনিটের মধ্যে পাবলিশ করা যায়।",
      },
      {
        q: "নিজের ডোমেইন ব্যবহার করা যাবে?",
        a: "হ্যাঁ। যেকোনো কাস্টম ডোমেইন কানেক্ট করতে পারবেন। কাস্টম ডোমেইন ও BornoLand সাবডোমেইনে SSL ফ্রি।",
      },
      {
        q: "বিকাশ আর COD আছে?",
        a: "আছে। বিকাশ, নগদ, রকেট, কার্ড ও ক্যাশ অন ডেলিভারি সাপোর্ট করে। চেকআউটে কোনগুলো দেখাবেন, সেটা আপনিই কন্ট্রোল করবেন।",
      },
      {
        q: "ডিজিটাল পণ্য বিক্রি করা যাবে?",
        a: "হ্যাঁ। ফিজিক্যাল ও ডিজিটাল—দুই ধরনের পণ্যই বিক্রি করতে পারবেন। ফাইল আপলোড, ডাউনলোড রুল ও ইনভেন্টরি একসাথে ম্যানেজ হবে।",
      },
      {
        q: "একাধিক দোকান ম্যানেজ করা যাবে?",
        a: "বিজনেস ও এজেন্সি প্ল্যানে এক অ্যাকাউন্টের নিচে একাধিক দোকান ও টিম অ্যাক্সেস পাবেন।",
      },
      {
        q: "ফ্রি প্ল্যান বা ট্রায়াল আছে?",
        a: "ফ্রি দিয়ে শুরু করতে পারেন। অনেক পেইড প্ল্যানে ফ্রি ট্রায়ালও থাকে, যাতে কমিট করার আগে ঘুরে দেখতে পারেন।",
      },
    ],
  },
  finalCta: {
    title: "দোকান খোলার জন্য রেডি?",
    description: "আজই ফ্রি শুরু করুন। কোডিং নেই, জটিলতা নেই—আইডিয়া থেকে প্রথম অর্ডার পর্যন্ত সোজা পথ।",
    primary: "ফ্রি শুরু করুন",
    secondary: "ডেমো বুক করুন",
  },
  footer: {
    tagline: "এক জায়গা থেকে অনলাইন দোকান বানান, চালান ও বাড়ান।",
    product: "প্রোডাক্ট",
    resources: "রিসোর্স",
    company: "কোম্পানি",
    legal: "লিগ্যাল",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
    links: {
      features: "ফিচার",
      builder: "বিল্ডার",
      pricing: "প্রাইসিং",
      blog: "ব্লগ",
      docs: "ডকুমেন্টেশন",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      support: "সাপোর্ট",
      terms: "সার্ভিসের শর্তাবলী",
      privacy: "প্রাইভেসি পলিসি",
      refund: "রিফান্ড পলিসি",
    },
  },
};

const dictionaries: Record<LandingLocale, LandingCopy> = { en, bn };
const STORAGE_KEY = "bornoland.landing.locale";

type LandingLocaleContextValue = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  t: LandingCopy;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LandingLocale | null;
      if (saved === "en" || saved === "bn") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "bn" ? "bn" : "en";
  }, [locale]);

  const setLocale = useCallback((next: LandingLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
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
