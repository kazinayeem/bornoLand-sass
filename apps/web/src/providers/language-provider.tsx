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

export type Language = "en";

export type Dictionary = {
  navigation: {
    workspace: string;
    dashboard: string;
    stores: string;
    createStore: string;
    allStores: string;
    archived: string;
    billing: string;
    team: string;
    activity: string;
    notifications: string;
    analytics: string;
    visitors: string;
    liveVisitors: string;
    trafficSources: string;
    reports: string;
    store: string;
    account: string;
    settings: string;
    security: string;
    help: string;
    signOut: string;
    selectStore: string;
    noStoreSelected: string;
    myWorkspace: string;
    storesCount: (count: number) => string;
    expandSidebar: string;
    collapseSidebar: string;
  };
  header: {
    searchPlaceholder: string;
    quickCreate: string;
    newStore: string;
    importStore: string;
    inviteMember: string;
    upgradePlan: string;
    noResultsFound: string;
    language: string;
    bengali: string;
    english: string;
  };
  dropdowns: {
    profile: string;
    accountSettings: string;
    security: string;
    activityLog: string;
    billing: string;
    helpCenter: string;
    logout: string;
    notifications: string;
    unread: (count: number) => string;
    allCaughtUp: string;
    updating: string;
    markAllRead: string;
    viewAllNotifications: string;
    noNotifications: string;
  };
  common: {
    refresh: string;
    create: string;
    edit: string;
    delete: string;
    cancel: string;
    confirm: string;
    back: string;
    save: string;
    loading: string;
    active: string;
    trial: string;
    expired: string;
    awaitingApproval: string;
  };
  storeNav: {
    people: string;
    finance: string;
    customerGrowth: string;
    catalog: string;
    sales: string;
    growth: string;
    store: string;
    operations: string;
    content: string;
    system: string;
    dashboard: string;
    products: string;
    categories: string;
    inventory: string;
    wasteLoss: string;
    stockLedger: string;
    warehouses: string;
    purchasing: string;
    suppliers: string;
    orders: string;
    pos: string;
    posShifts: string;
    incompleteOrders: string;
    customers: string;
    reviews: string;
    employees: string;
    organization: string;
    attendance: string;
    leaves: string;
    payroll: string;
    selfService: string;
    accounting: string;
    chartOfAccounts: string;
    journalEntries: string;
    expenses: string;
    financialReports: string;
    crmDeals: string;
    supportTickets: string;
    marketing: string;
    coupons: string;
    trackingPixels: string;
    tasks: string;
    approvals: string;
    analytics: string;
    overview: string;
    visitors: string;
    liveVisitors: string;
    trafficSources: string;
    devices: string;
    browsers: string;
    countries: string;
    cities: string;
    pages: string;
    referrers: string;
    campaigns: string;
    conversion: string;
    reports: string;
    design: string;
    navigation: string;
    seo: string;
    domain: string;
    socialLinks: string;
    shipping: string;
    courier: string;
    payments: string;
    taxes: string;
    media: string;
    messages: string;
    faq: string;
    settings: string;
    apps: string;
    activity: string;
    billing: string;
    storage: string;
    storageAlmostFull: string;
    upgrade: string;
    yourStores: string;
    currentlyManaging: (name: string) => string;
  };
  incompleteOrders: {
    title: string;
    subtitle: string;
    badge: string;
    incomplete: string;
    potentialValue: string;
    recovered: string;
    converted: string;
    recoveryRate: string;
    abandonedCount: (abandoned: number, inProgress: number) => string;
    unconvertedTotal: string;
    returnedToCheckout: string;
    completedOrders: string;
    overallConversion: (rate: number) => string;
    searchPlaceholder: string;
    all: string;
    abandoned: string;
    inProgress: string;
    recoveredStatus: string;
    convertedStatus: string;
    expiredStatus: string;
    today: string;
    yesterday: string;
    days7: string;
    days30: string;
    thisMonth: string;
    allTime: string;
    custom: string;
    thCustomer: string;
    thContact: string;
    thItems: string;
    thPotentialTotal: string;
    thStarted: string;
    thLastActivity: string;
    thStatus: string;
    thActions: string;
    recoveryLink: string;
    copied: string;
    view: string;
    noIncompleteFound: string;
    clearFiltersTip: string;
    recoveryCopiedToast: string;
    failedCopyToast: string;
    detailsTitle: string;
  };
  settings: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    matchingSettings: (count: number) => string;
    noSettingsFound: (query: string) => string;
    groups: {
      GENERAL: string;
      GENERALDesc: string;
      STORE: string;
      STOREDesc: string;
      COMMERCE: string;
      COMMERCEDesc: string;
      CONTENT: string;
      CONTENTDesc: string;
      COMMUNICATION: string;
      COMMUNICATIONDesc: string;
      ADVANCED: string;
      ADVANCEDDesc: string;
    };
    sections: {
      general: string;
      generalDesc: string;
      branding: string;
      brandingDesc: string;
      contact: string;
      contactDesc: string;
      localization: string;
      localizationDesc: string;
      currency: string;
      currencyDesc: string;
      seo: string;
      seoDesc: string;
      domain: string;
      domainDesc: string;
      checkout: string;
      checkoutDesc: string;
      payments: string;
      paymentsDesc: string;
      shipping: string;
      shippingDesc: string;
      courier: string;
      courierDesc: string;
      taxes: string;
      taxesDesc: string;
      invoice: string;
      invoiceDesc: string;
      navigation: string;
      navigationDesc: string;
      cmsPages: string;
      cmsPagesDesc: string;
      policies: string;
      policiesDesc: string;
      faq: string;
      faqDesc: string;
      socialLinks: string;
      socialLinksDesc: string;
      email: string;
      emailDesc: string;
      messages: string;
      messagesDesc: string;
      security: string;
      securityDesc: string;
      advanced: string;
      advancedDesc: string;
    };
    currency: {
      title: string;
      subtitle: string;
      code: string;
      symbol: string;
      position: string;
      before: string;
      after: string;
      decimalPlaces: string;
      preview: string;
    };
    localization: {
      title: string;
      subtitle: string;
      dateFormat: string;
      timezone: string;
      language: string;
      adminLanguage: string;
      bengali: string;
      english: string;
    };
    tax: {
      title: string;
      subtitle: string;
      rate: string;
    };
    branding: {
      title: string;
      subtitle: string;
      logo: string;
      favicon: string;
      primaryColor: string;
      accentColor: string;
      name: string;
      shortName: string;
      tagline: string;
      upload: string;
      remove: string;
      save: string;
      reset: string;
      preview: string;
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      phone: string;
      address: string;
      website: string;
      supportEmail: string;
      businessHours: string;
    };
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    overviewSubtitle: string;
    quickActionsTitle: string;
    quickActions: {
      newOrder: string;
      addProduct: string;
      newPurchase: string;
      addExpense: string;
      openPOS: string;
      builder: string;
      visitStore: string;
      editStore: string;
      upgradePlan: string;
      manageShifts: string;
    };
    kpis: {
      totalProducts: string;
      totalOrders: string;
      totalRevenue: string;
      conversionRate: string;
      todaySales: string;
      pendingOrders: string;
      lowStockAlert: string;
      activeStaff: string;
      grossProfit: string;
      netProfit: string;
      customerDue: string;
      stockValue: string;
    };
    storage: {
      title: string;
      used: string;
      limit: string;
      unlimited: string;
      remaining: string;
      upgrade: string;
    };
    plan: {
      title: string;
      features: string;
      managePlan: string;
      daysRemaining: (days: number) => string;
      bandwidth: string;
    };
    storeHealth: {
      title: string;
      products: string;
      orders: string;
      media: string;
      pageViews: string;
    };
    activity: {
      title: string;
      storeCreated: string;
      lastUpdated: string;
      allTimeOrders: (count: number) => string;
      allTimeRevenue: string;
      allTime: string;
    };
    storeDetails: {
      title: string;
      name: string;
      category: string;
      subdomain: string;
      plan: string;
      created: string;
    };
    emptyStates: {
      noProductsTitle: string;
      noProductsDesc: string;
      noOrdersTitle: string;
      noOrdersDesc: string;
      addProductBtn: string;
    };
  };
};

const bn: Dictionary = {
  navigation: {
    workspace: "ওয়ার্কস্পেস",
    dashboard: "ড্যাশবোর্ড",
    stores: "দোকানসমূহ",
    createStore: "দোকান তৈরি করুন",
    allStores: "সব দোকান",
    archived: "আর্কাইভ",
    billing: "বিলিং",
    team: "টিম",
    activity: "কার্যক্রম",
    notifications: "নোটিফিকেশন",
    analytics: "অ্যানালিটিক্স",
    visitors: "ভিজিটর",
    liveVisitors: "লাইভ ভিজিটর",
    trafficSources: "ট্রাফিক সোর্স",
    reports: "রিপোর্ট",
    store: "দোকান",
    account: "অ্যাকাউন্ট",
    settings: "সেটিংস",
    security: "নিরাপত্তা",
    help: "সহায়তা",
    signOut: "লগআউট",
    selectStore: "দোকান বেছে নিন",
    noStoreSelected: "কোনো দোকান নির্বাচন করা হয়নি",
    myWorkspace: "আমার ওয়ার্কস্পেস",
    storesCount: (count) => `${count}টি দোকান`,
    expandSidebar: "সাইডবার প্রসারিত করুন",
    collapseSidebar: "সাইডবার সংকুচিত করুন",
  },
  header: {
    searchPlaceholder: "খুঁজুন... (⌘K)",
    quickCreate: "দ্রুত তৈরি",
    newStore: "নতুন দোকান",
    importStore: "ইমপোর্ট করুন",
    inviteMember: "সদস্য যোগ করুন",
    upgradePlan: "প্ল্যান আপগ্রেড",
    noResultsFound: "কোনো ফলাফল পাওয়া যায়নি",
    language: "ভাষা",
    bengali: "বাংলা",
    english: "English",
  },
  dropdowns: {
    profile: "প্রোফাইল",
    accountSettings: "অ্যাকাউন্ট সেটিংস",
    security: "নিরাপত্তা",
    activityLog: "কার্যক্রম লগ",
    billing: "বিলিং",
    helpCenter: "সহায়তা কেন্দ্র",
    logout: "লগআউট",
    notifications: "নোটিফিকেশন",
    unread: (count) => `${count}টি অপঠিত`,
    allCaughtUp: "সব নোটিফিকেশন পড়া শেষ",
    updating: "আপডেট হচ্ছে",
    markAllRead: "সব পড়া হয়েছে",
    viewAllNotifications: "সব নোটিফিকেশন দেখুন",
    noNotifications: "কোনো নতুন নোটিফিকেশন নেই",
  },
  common: {
    refresh: "রিফ্রেশ",
    create: "তৈরি করুন",
    edit: "এডিট করুন",
    delete: "মুছে ফেলুন",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    back: "পেছনে যান",
    save: "সংরক্ষণ করুন",
    loading: "লোড হচ্ছে...",
    active: "সক্রিয়",
    trial: "ট্রায়াল",
    expired: "মেয়াদ শেষ",
    awaitingApproval: "অনুমোদনের অপেক্ষায়",
  },
  storeNav: {
    people: "কর্মী ও মানবসম্পদ (HRM)",
    finance: "হিসাববিজ্ঞান ও অর্থায়ন",
    customerGrowth: "গ্রাহক ও সিআরএম",
    catalog: "ক্যাটালগ",
    sales: "বিক্রয়",
    growth: "বৃদ্ধি ও মার্কেটিং",
    store: "স্টোর ও ডিজাইন",
    operations: "অপারেশনস ও টাস্ক",
    content: "কন্টেন্ট",
    system: "সিস্টেম",
    dashboard: "ড্যাশবোর্ড",
    products: "পণ্যসমূহ",
    categories: "ক্যাটাগরি",
    inventory: "ইনভেন্টরি ও স্টক",
    wasteLoss: "ক্ষয়ক্ষতি ও অপচয় (Waste)",
    stockLedger: "স্টক মুভমেন্ট লেজার",
    warehouses: "মাল্টি-ওয়্যারহাউস",
    purchasing: "ক্রয় ও পারচেজ অর্ডার",
    suppliers: "সরবরাহকারী (Suppliers)",
    orders: "অর্ডার",
    pos: "পয়েন্ট অব সেল (POS)",
    posShifts: "POS ক্যাশ রেজিস্টার",
    incompleteOrders: "অসম্পূর্ণ অর্ডার",
    customers: "গ্রাহক মাস্টার",
    reviews: "রিভিউ",
    employees: "কর্মকর্তা-কর্মচারী",
    organization: "বিভাগ ও পদবী",
    attendance: "হাজিরা ও ওভারটাইম",
    leaves: "ছুটি ব্যবস্থাপনা",
    payroll: "বেতন ও পে-রোল",
    selfService: "কর্মী পোর্টাল",
    accounting: "অ্যাকাউন্টিং ড্যাশবোর্ড",
    chartOfAccounts: "হিসাবের তালিকা (COA)",
    journalEntries: "ডাবল-এন্ট্রি জার্নাল",
    expenses: "ব্যয় ও খরচ (Expenses)",
    financialReports: "আর্থিক বিবরণী (P&L / BS)",
    crmDeals: "সিআরএম পাইপলাইন",
    supportTickets: "সাপোর্ট টিকিট",
    marketing: "মার্কেটিং ক্যাম্পেইন",
    coupons: "কুপন",
    trackingPixels: "ট্র্যাকিং ও পিক্সেল",
    tasks: "টাস্ক ও কার্যতালিকা",
    approvals: "অনুমোদন কেন্দ্র (Approvals)",
    analytics: "অ্যানালিটিক্স",
    overview: "ওভারভিউ",
    visitors: "ভিজিটর",
    liveVisitors: "লাইভ ভিজিটর",
    trafficSources: "ট্রাফিক সোর্স",
    devices: "ডিভাইস",
    browsers: "ব্রাউজার",
    countries: "দেশ",
    cities: "শহর",
    pages: "পেজসমূহ",
    referrers: "রেফারার",
    campaigns: "ক্যাম্পেইন",
    conversion: "রূপান্তর",
    reports: "রিপোর্ট",
    design: "ডিজাইন",
    navigation: "নেভিগেশন",
    seo: "এসইও",
    domain: "ডোমেইন",
    socialLinks: "সোশ্যাল লিংক",
    shipping: "শিপিং",
    courier: "কুরিয়ার",
    payments: "পেমেন্ট",
    taxes: "ট্যাক্স",
    media: "মিডিয়া",
    messages: "বার্তা",
    faq: "প্রশ্ন উত্তর",
    settings: "সেটিংস",
    apps: "অ্যাপস",
    activity: "অ্যাক্টিভিটি",
    billing: "বিলিং",
    storage: "স্টোরেজ",
    storageAlmostFull: "স্টোরেজ প্রায় পূর্ণ",
    upgrade: "আপগ্রেড",
    yourStores: "আপনার দোকানসমূহ",
    currentlyManaging: (name) => `বর্তমান দোকান: ${name}`,
  },
  incompleteOrders: {
    title: "অসম্পূর্ণ অর্ডার",
    subtitle: "গ্রাহকরা তথ্য দেওয়ার পর অর্ডার সম্পন্ন না করলে সেই অসম্পূর্ণ চেকআউটগুলো দেখুন এবং পুনরুদ্ধার করুন।",
    badge: "পরিত্যক্ত চেকআউট",
    incomplete: "অসম্পূর্ণ",
    potentialValue: "সম্ভাব্য মূল্য",
    recovered: "পুনরুদ্ধার",
    converted: "রূপান্তরিত",
    recoveryRate: "পুনরুদ্ধারের হার",
    abandonedCount: (abandoned, inProgress) => `${abandoned}টি পরিত্যক্ত, ${inProgress}টি চলমান`,
    unconvertedTotal: "রূপান্তর না হওয়া কার্টের মোট মূল্য",
    returnedToCheckout: "চেকআউটে ফিরে এসেছে",
    completedOrders: "সম্পন্ন অর্ডার",
    overallConversion: (rate) => `${rate}% সামগ্রিক রূপান্তর`,
    searchPlaceholder: "গ্রাহক, ফোন, ইমেইল বা পণ্য খুঁজুন...",
    all: "সব",
    abandoned: "পরিত্যক্ত",
    inProgress: "চলমান",
    recoveredStatus: "পুনরুদ্ধার করা",
    convertedStatus: "রূপান্তরিত",
    expiredStatus: "মেয়াদোত্তীর্ণ",
    today: "আজ",
    yesterday: "গতকাল",
    days7: "৭ দিন",
    days30: "৩০ দিন",
    thisMonth: "এই মাস",
    allTime: "সব সময়",
    custom: "কাস্টম",
    thCustomer: "গ্রাহক",
    thContact: "যোগাযোগ",
    thItems: "পণ্য",
    thPotentialTotal: "সম্ভাব্য মোট",
    thStarted: "শুরু হয়েছে",
    thLastActivity: "সর্বশেষ কার্যক্রম",
    thStatus: "স্ট্যাটাস",
    thActions: "অ্যাকশন",
    recoveryLink: "পুনরুদ্ধার লিংক",
    copied: "কপি হয়েছে",
    view: "দেখুন",
    noIncompleteFound: "কোনো অসম্পূর্ণ অর্ডার পাওয়া যায়নি।",
    clearFiltersTip: "ফিল্টার মুছে ফেলে আবার চেষ্টা করুন।",
    recoveryCopiedToast: "পুনরুদ্ধার লিংক ক্লিপবোর্ডে কপি হয়েছে",
    failedCopyToast: "পুনরুদ্ধার লিংক তৈরি করা যায়নি",
    detailsTitle: "অসম্পূর্ণ চেকআউট বিবরণ",
  },
  settings: {
    title: "স্টোর সেটিংস",
    subtitle: "ব্র্যান্ডিং, ব্যবসায়িক কার্যক্রম, স্থানীয়করণ, কনটেন্ট ও যোগাযোগের সেটিংস পরিচালনা করুন।",
    searchPlaceholder: "সেটিংস খুঁজুন...",
    matchingSettings: (count) => `মিলে যাওয়া সেটিংস (${count})`,
    noSettingsFound: (query) => `"${query}" এর জন্য কোনো সেটিংস পাওয়া যায়নি`,
    groups: {
      GENERAL: "সাধারণ",
      GENERALDesc: "মৌলিক স্টোর তথ্য, ব্র্যান্ডিং ও যোগাযোগের বিস্তারিত",
      STORE: "স্টোর",
      STOREDesc: "স্থানীয়করণ, মুদ্রা, সার্চ ইঞ্জিন ও ডোমেইন সেটিংস",
      COMMERCE: "কমার্স",
      COMMERCEDesc: "চেকআউট নিয়ম, পেমেন্ট, শিপিং, ট্যাক্স ও ইনভয়েস",
      CONTENT: "কনটেন্ট",
      CONTENTDesc: "মেনু, পেজ, নীতিমালা এবং প্রশ্ন উত্তর",
      COMMUNICATION: "যোগাযোগ",
      COMMUNICATIONDesc: "ইমেইল নোটিফিকেশন ও গ্রাহক বার্তার সেটিংস",
      ADVANCED: "অ্যাডভান্সড",
      ADVANCEDDesc: "স্টোর নিরাপত্তা, ডেভেলপার টুলস ও অ্যাডভান্সড বিকল্প",
    },
    sections: {
      general: "সাধারণ",
      generalDesc: "স্টোরের নাম, স্লাগ, বিবরণ ও স্ট্যাটাস",
      branding: "ব্র্যান্ডিং",
      brandingDesc: "লোগো, ফ্যাভিকন, ব্র্যান্ড কালার ও ভিজ্যুয়াল চিহ্ন",
      contact: "যোগাযোগ",
      contactDesc: "পাবলিক ফোন, ইমেইল, ঠিকানা ও কর্মঘণ্টা",
      localization: "স্থানীয়করণ",
      localizationDesc: "টাইমজোন, তারিখের ফরম্যাট এবং ভাষা",
      currency: "মুদ্রা",
      currencyDesc: "ডিফল্ট মুদ্রার কোড, প্রতীক এবং ফরম্যাটিং",
      seo: "SEO",
      seoDesc: "সার্চ ইঞ্জিন টাইটেল, মেটা ট্যাগ ও সার্চ প্রিভিউ",
      domain: "ডোমেইন",
      domainDesc: "কাস্টম ডোমেইন কানেকশন ও ফ্রি SSL কনফিগারেশন",
      checkout: "চেকআউট",
      checkoutDesc: "গেস্ট চেকআউট, প্রয়োজনীয় ফিল্ড ও সর্বনিম্ন অর্ডার",
      payments: "পেমেন্ট",
      paymentsDesc: "ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও পেমেন্ট গেটওয়ে",
      shipping: "শিপিং",
      shippingDesc: "ডেলিভারি জোন, রেট ও ফ্রি শিপিং সুবিধা",
      courier: "কুরিয়ার",
      courierDesc: "স্টিডফাস্ট, পাঠাও ও রেডএক্স লজিস্টিকস ইন্টিগ্রেশন",
      taxes: "ট্যাক্স",
      taxesDesc: "ডিফল্ট ট্যাক্স শতকরা হার ও ট্যাক্সসহ মূল্য নির্ধারণ",
      invoice: "ইনভয়েস",
      invoiceDesc: "ইনভয়েস নম্বর ফরম্যাট, প্রিফিক্স ও ডাউনলোড টেমপ্লেট",
      navigation: "নেভিগেশন",
      navigationDesc: "হেডার মেনু, ফুটার লিংক ও নেভিগেশন শটকাট",
      cmsPages: "পেজসমূহ",
      cmsPagesDesc: "আমাদের সম্পর্কে, কাস্টম কনটেন্ট পেজ ও রিচ এডিটর",
      policies: "নীতিমালা",
      policiesDesc: "প্রাইভেসি পলিসি, রিফান্ড রুলস ও শর্তাবলী",
      faq: "FAQ",
      faqDesc: "সাধারণ জিজ্ঞাসা ও উত্তরসমূহ",
      socialLinks: "সোশ্যাল লিংক",
      socialLinksDesc: "ফেসবুক, ইনস্টাগ্রাম, ইউটিউব ও হোয়াটসঅ্যাপ লিংক",
      email: "ইমেইল নোটিফিকেশন",
      emailDesc: "অর্ডার কনফার্মেশন, শিপমেন্ট ও নোটিফিকেশন টেমপ্লেট",
      messages: "গ্রাহকের বার্তা",
      messagesDesc: "কনট্যাক্ট ফর্ম ইনবক্স ও বার্তা গ্রহণ সেটিংস",
      security: "নিরাপত্তা",
      securityDesc: "স্টোর পাসওয়ার্ড সুরক্ষা ও সেশন ব্যবস্থাপনা",
      advanced: "অ্যাডভান্সড",
      advancedDesc: "ডেভেলপার API কি, ওয়েব হুক ও অ্যাডভান্সড সুবিধা",
    },
    currency: {
      title: "মুদ্রা ও ফরম্যাটিং",
      subtitle: "লেনদেনের প্রধান মুদ্রা (BDT, USD) এবং দশমিকের নিয়ম কনফিগার করুন।",
      code: "মুদ্রার কোড",
      symbol: "প্রতীক",
      position: "অবস্থান",
      before: "আগে (৳১০০)",
      after: "পরে (১০০৳)",
      decimalPlaces: "দশমিক ঘর",
      preview: "প্রিভিউ:",
    },
    localization: {
      title: "স্থানীয়করণ",
      subtitle: "টাইমজোন, তারিখের ফরম্যাট এবং ভাষার সেটিংস পরিচালনা করুন।",
      dateFormat: "তারিখের ফরম্যাট",
      timezone: "টাইমজোন",
      language: "স্টোর ভাষা",
      adminLanguage: "এডমিন ইন্টারফেস ভাষা",
      bengali: "বাংলা",
      english: "English",
    },
    tax: {
      title: "ট্যাক্স ও ভ্যাট",
      subtitle: "ডিফল্ট ট্যাক্স বা ভ্যাট শতকরা হার এবং ট্যাক্সসহ মূল্য নির্ধারণ করুন।",
      rate: "ট্যাক্সের হার (%)",
    },
    branding: {
      title: "ব্র্যান্ডিং সেটিংস",
      subtitle: "স্টোরের লোগো, আইকন, প্রাথমি ও সেকেন্ডারি রং কাস্টমাইজ করুন।",
      logo: "স্টোর লোগো",
      favicon: "ফ্যাভিকন",
      primaryColor: "প্রধান রং",
      accentColor: "দ্বিতীয় রং",
      name: "স্টোরের নাম",
      shortName: "সংক্ষিপ্ত নাম",
      tagline: "ট্যাগলাইন",
      upload: "আপলোড",
      remove: "সরান",
      save: "পরিবর্তন সংরক্ষণ করুন",
      reset: "রিসেট",
      preview: "প্রিভিউ",
    },
    contact: {
      title: "যোগাযোগের তথ্য",
      subtitle: "পাবলিক ফোন নম্বর, ইমেইল, ঠিকানা ও সাপোর্ট বিবরণ কনফিগার করুন।",
      email: "ইমেইল",
      phone: "ফোন নম্বর",
      address: "ঠিকানা",
      website: "ওয়েবসাইট",
      supportEmail: "সাপোর্ট ইমেইল",
      businessHours: "ব্যবসার সময়",
    },
  },
  dashboard: {
    greetingMorning: "শুভ সকাল",
    greetingAfternoon: "শুভ অপরাহ্ন",
    greetingEvening: "শুভ সন্ধ্যা",
    overviewSubtitle: "আপনার ব্যবসার আজকের পারফরম্যান্স ও তাৎক্ষণিক অ্যাকশনসমূহ।",
    quickActionsTitle: "দ্রুত অ্যাকশন",
    quickActions: {
      newOrder: "নতুন অর্ডার",
      addProduct: "পণ্য যোগ করুন",
      newPurchase: "ক্রয় আদেশ (PO)",
      addExpense: "খরচ যোগ করুন",
      openPOS: "POS টার্মিনাল",
      builder: "স্টোর বিল্ডার",
      visitStore: "দোকান ভিজিট করুন",
      editStore: "স্টোর সেটিংস",
      upgradePlan: "প্ল্যান আপগ্রেড",
      manageShifts: "ক্যাশ শিফট",
    },
    kpis: {
      totalProducts: "মোট পণ্য",
      totalOrders: "মোট অর্ডার",
      totalRevenue: "মোট বিক্রয় (Revenue)",
      conversionRate: "কনভার্শন রেট",
      todaySales: "আজকের বিক্রয়",
      pendingOrders: "অপেক্ষারত অর্ডার",
      lowStockAlert: "লো-স্টক পণ্য",
      activeStaff: "উপস্থিত কর্মী",
      grossProfit: "মোট লাভ (Gross Margin)",
      netProfit: "প্রকৃত মুনাফা",
      customerDue: "বাকি / দেনা",
      stockValue: "বর্তমান মজুদ মূল্য",
    },
    storage: {
      title: "স্টোরেজ ব্যবহার",
      used: "ব্যবহৃত",
      limit: "সর্বোচ্চ সীমা",
      unlimited: "সীমাহীন",
      remaining: "অবশিষ্ট",
      upgrade: "আপগ্রেড করুন",
    },
    plan: {
      title: "বর্তমান প্ল্যান",
      features: "অন্তর্ভুক্ত সুবিধাসমূহ",
      managePlan: "প্ল্যান পরিচালনা",
      daysRemaining: (days) => `${days} দিন ট্রায়াল বাকি`,
      bandwidth: "ব্যান্ডউইথ",
    },
    storeHealth: {
      title: "স্টোর সক্ষমতা ও সীমা",
      products: "পণ্য সংখ্যা",
      orders: "অর্ডার ভলিউম",
      media: "মিডিয়া ফাইল",
      pageViews: "পেজ ভিউ",
    },
    activity: {
      title: "সাম্প্রতিক কার্যক্রম",
      storeCreated: "দোকান তৈরি হয়েছে",
      lastUpdated: "সর্বশেষ আপডেট",
      allTimeOrders: (count) => `সর্বমোট ${count}টি অর্ডার`,
      allTimeRevenue: "সর্বমোট বিক্রয়",
      allTime: "সর্বকালের হিসাব",
    },
    storeDetails: {
      title: "দোকানের বিবরণ",
      name: "নাম",
      category: "ক্যাটাগরি",
      subdomain: "সাবডোমেইন",
      plan: "প্ল্যান",
      created: "তৈরি হয়েছে",
    },
    emptyStates: {
      noProductsTitle: "এখনও কোনো পণ্য যোগ করা হয়নি",
      noProductsDesc: "আপনার অনলাইন শপে বিক্রি শুরু করতে এবং স্টক ট্র্যাক করতে প্রথম পণ্যটি যোগ করুন।",
      noOrdersTitle: "এখনও কোনো অর্ডার আসেনি",
      noOrdersDesc: "অর্ডার আসলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে এবং হিসাব আপডেট হবে।",
      addProductBtn: "পণ্য যোগ করুন",
    },
  },
};

const en: Dictionary = {
  navigation: {
    workspace: "WORKSPACE",
    dashboard: "Dashboard",
    stores: "Stores",
    createStore: "Create Store",
    allStores: "All Stores",
    archived: "Archived",
    billing: "Billing",
    team: "Team",
    activity: "Activity",
    notifications: "Notifications",
    analytics: "Analytics",
    visitors: "Visitors",
    liveVisitors: "Live Visitors",
    trafficSources: "Traffic Sources",
    reports: "Reports",
    store: "STORE",
    account: "ACCOUNT",
    settings: "Settings",
    security: "Security",
    help: "Help",
    signOut: "Sign out",
    selectStore: "Select Store",
    noStoreSelected: "No store selected",
    myWorkspace: "My Workspace",
    storesCount: (count) => `${count} store${count !== 1 ? "s" : ""}`,
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
  },
  header: {
    searchPlaceholder: "Search... (⌘K)",
    quickCreate: "Quick Create",
    newStore: "New Store",
    importStore: "Import Store",
    inviteMember: "Invite Member",
    upgradePlan: "Upgrade Plan",
    noResultsFound: "No results found",
    language: "Language",
    bengali: "Bengali",
    english: "English",
  },
  dropdowns: {
    profile: "Profile",
    accountSettings: "Account Settings",
    security: "Security",
    activityLog: "Activity Log",
    billing: "Billing",
    helpCenter: "Help Center",
    logout: "Logout",
    notifications: "Notifications",
    unread: (count) => `${count} unread`,
    allCaughtUp: "You're all caught up",
    updating: "Updating",
    markAllRead: "Mark all read",
    viewAllNotifications: "View all notifications",
    noNotifications: "No notifications yet",
  },
  common: {
    refresh: "Refresh",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    save: "Save",
    loading: "Loading...",
    active: "Active",
    trial: "Trial",
    expired: "Expired",
    awaitingApproval: "Awaiting Approval",
  },
  storeNav: {
    people: "PEOPLE & HRM",
    finance: "FINANCE & ACCOUNTING",
    customerGrowth: "CUSTOMER & CRM",
    catalog: "COMMERCE & CATALOG",
    sales: "SALES & ORDERS",
    growth: "GROWTH & MARKETING",
    store: "WEBSITE & CMS",
    operations: "OPERATIONS & WORKFLOW",
    content: "CONTENT & MEDIA",
    system: "SYSTEM & ACCESS",
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    inventory: "Inventory & Stock",
    wasteLoss: "Waste & Loss Tracker",
    stockLedger: "Stock Movement Ledger",
    warehouses: "Multi-Warehouse",
    purchasing: "Purchasing & POs",
    suppliers: "Suppliers Master",
    orders: "Orders",
    pos: "Point of Sale (POS)",
    posShifts: "POS Register & Shifts",
    incompleteOrders: "Incomplete Orders",
    customers: "Customer Master",
    reviews: "Reviews",
    employees: "Employees Directory",
    organization: "Depts & Designations",
    attendance: "Attendance & Shifts",
    leaves: "Leave Management",
    payroll: "Payroll & Payslips",
    selfService: "Employee Portal",
    accounting: "Accounting Dashboard",
    chartOfAccounts: "Chart of Accounts",
    journalEntries: "Journal Entries",
    expenses: "Business Expenses",
    financialReports: "Financial Statements",
    crmDeals: "CRM Pipeline & Deals",
    supportTickets: "Support Desk",
    marketing: "Campaigns",
    coupons: "Coupons",
    trackingPixels: "Tracking & Pixels",
    tasks: "Tasks Management",
    approvals: "Approvals Center",
    analytics: "Analytics",
    overview: "Overview",
    visitors: "Visitors",
    liveVisitors: "Live Visitors",
    trafficSources: "Traffic Sources",
    devices: "Devices",
    browsers: "Browsers",
    countries: "Countries",
    cities: "Cities",
    pages: "Pages",
    referrers: "Referrers",
    campaigns: "Campaigns",
    conversion: "Conversion",
    reports: "Reports",
    design: "Design & Themes",
    navigation: "Navigation",
    seo: "SEO",
    domain: "Domain",
    socialLinks: "Social Links",
    shipping: "Shipping",
    courier: "Courier Logistics",
    payments: "Payments",
    taxes: "Taxes",
    media: "Media Library",
    messages: "Messages",
    faq: "FAQ",
    settings: "Settings",
    apps: "Apps & Integrations",
    activity: "Audit Activity",
    billing: "Billing & Plans",
    storage: "Storage",
    storageAlmostFull: "Storage almost full",
    upgrade: "Upgrade",
    yourStores: "Your Stores",
    currentlyManaging: (name) => `Currently managing ${name}`,
  },
  incompleteOrders: {
    title: "Incomplete Orders",
    subtitle: "Track and recover abandoned checkout sessions when customers enter their details but do not complete order placement.",
    badge: "Abandoned Checkouts",
    incomplete: "INCOMPLETE",
    potentialValue: "POTENTIAL VALUE",
    recovered: "RECOVERED",
    converted: "CONVERTED",
    recoveryRate: "RECOVERY RATE",
    abandonedCount: (abandoned, inProgress) => `${abandoned} abandoned, ${inProgress} in progress`,
    unconvertedTotal: "Unconverted cart total",
    returnedToCheckout: "Returned to checkout",
    completedOrders: "Completed orders",
    overallConversion: (rate) => `${rate}% overall conversion`,
    searchPlaceholder: "Search customer, phone, email, item...",
    all: "All",
    abandoned: "Abandoned",
    inProgress: "In Progress",
    recoveredStatus: "Recovered",
    convertedStatus: "Converted",
    expiredStatus: "Expired",
    today: "Today",
    yesterday: "Yesterday",
    days7: "7 days",
    days30: "30 days",
    thisMonth: "This month",
    allTime: "All time",
    custom: "Custom",
    thCustomer: "CUSTOMER",
    thContact: "CONTACT",
    thItems: "ITEMS",
    thPotentialTotal: "POTENTIAL TOTAL",
    thStarted: "STARTED",
    thLastActivity: "LAST ACTIVITY",
    thStatus: "STATUS",
    thActions: "ACTIONS",
    recoveryLink: "Recovery Link",
    copied: "Copied",
    view: "View",
    noIncompleteFound: "No incomplete orders found",
    clearFiltersTip: "Try clearing filters to view all records.",
    recoveryCopiedToast: "Recovery link copied to clipboard!",
    failedCopyToast: "Failed to generate recovery link",
    detailsTitle: "Incomplete Checkout Details",
  },
  settings: {
    title: "Store Settings",
    subtitle: "Configure branding, commerce operations, localization, content, and communications.",
    searchPlaceholder: "Search settings...",
    matchingSettings: (count) => `Matching Settings (${count})`,
    noSettingsFound: (query) => `No settings found for "${query}"`,
    groups: {
      GENERAL: "GENERAL",
      GENERALDesc: "Basic store identity, branding, and contact details",
      STORE: "STORE",
      STOREDesc: "Localization, currency, search engine, and domain",
      COMMERCE: "COMMERCE",
      COMMERCEDesc: "Checkout rules, payments, shipping, taxes, and invoicing",
      CONTENT: "CONTENT",
      CONTENTDesc: "Storefront menus, static pages, legal policies, and FAQ",
      COMMUNICATION: "COMMUNICATION",
      COMMUNICATIONDesc: "Email notifications and customer message settings",
      ADVANCED: "ADVANCED",
      ADVANCEDDesc: "Store security, developer tools, and advanced options",
    },
    sections: {
      general: "General",
      generalDesc: "Store name, slug, description, and status",
      branding: "Branding",
      brandingDesc: "Logo, favicon, brand colors, and visual mark",
      contact: "Contact",
      contactDesc: "Public phone, email, address, and operating hours",
      localization: "Localization",
      localizationDesc: "Timezone, date format, and language",
      currency: "Currency",
      currencyDesc: "Default currency code, symbol, and formatting",
      seo: "SEO",
      seoDesc: "Search engine title, meta tags, and robots.txt",
      domain: "Domain",
      domainDesc: "Custom domain connection and SSL configuration",
      checkout: "Checkout",
      checkoutDesc: "Guest checkout, required fields, and minimum order",
      payments: "Payments",
      paymentsDesc: "Cash on delivery, bKash, Nagad, and payment gateways",
      shipping: "Shipping",
      shippingDesc: "Delivery zones, rates, and free shipping thresholds",
      courier: "Courier",
      courierDesc: "Steadfast, Pathao, and RedX logistics integration",
      taxes: "Taxes",
      taxesDesc: "Default tax rate and tax-inclusive pricing toggle",
      invoice: "Invoice",
      invoiceDesc: "Invoice numbering format, prefix, and PDF template",
      navigation: "Navigation",
      navigationDesc: "Header menus, footer menus, and navigation links",
      cmsPages: "CMS Pages",
      cmsPagesDesc: "About us, custom content pages, and rich editors",
      policies: "Policies",
      policiesDesc: "Privacy policy, refund rules, and terms of service",
      faq: "FAQ",
      faqDesc: "Frequently asked questions and accordion answers",
      socialLinks: "Social Links",
      socialLinksDesc: "Facebook, Instagram, YouTube, and WhatsApp links",
      email: "Email Notifications",
      emailDesc: "Order confirmation, shipment, and customer templates",
      messages: "Customer Messages",
      messagesDesc: "Contact form inbox and customer inquiry settings",
      security: "Security",
      securityDesc: "Store password protection and session management",
      advanced: "Advanced",
      advancedDesc: "Developer API keys, webhooks, and store deletion",
    },
    currency: {
      title: "Currency & Formatting",
      subtitle: "Configure base transaction currency (BDT, USD) and decimal rules.",
      code: "Currency Code",
      symbol: "Symbol",
      position: "Position",
      before: "Before ($100)",
      after: "After (100$)",
      decimalPlaces: "Decimal Places",
      preview: "Preview:",
    },
    localization: {
      title: "Localization",
      subtitle: "Date format, timezone, and language settings.",
      dateFormat: "Date Format",
      timezone: "Timezone",
      language: "Store Language",
      adminLanguage: "Admin UI Language",
      bengali: "Bengali",
      english: "English",
    },
    tax: {
      title: "Taxes & VAT",
      subtitle: "Set default product tax percentage and tax-included pricing rules.",
      rate: "Tax Rate (%)",
    },
    branding: {
      title: "Branding Settings",
      subtitle: "Logo, favicon, brand colors, and visual identity.",
      logo: "Store Logo",
      favicon: "Favicon",
      primaryColor: "Primary Color",
      accentColor: "Secondary Color",
      name: "Store Name",
      shortName: "Short Name",
      tagline: "Tagline",
      upload: "Upload",
      remove: "Remove",
      save: "Save Changes",
      reset: "Reset",
      preview: "Preview",
    },
    contact: {
      title: "Contact Information",
      subtitle: "Public phone, email, address, and support details.",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      website: "Website",
      supportEmail: "Support Email",
      businessHours: "Business Hours",
    },
  },
  dashboard: {
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    overviewSubtitle: "Today's business performance, critical KPIs, and quick operational actions.",
    quickActionsTitle: "Quick Actions",
    quickActions: {
      newOrder: "New Order",
      addProduct: "Add Product",
      newPurchase: "New Purchase (PO)",
      addExpense: "Add Expense",
      openPOS: "POS Terminal",
      builder: "Store Builder",
      visitStore: "Visit Store",
      editStore: "Store Settings",
      upgradePlan: "Upgrade Plan",
      manageShifts: "Cash Shifts",
    },
    kpis: {
      totalProducts: "Total Products",
      totalOrders: "Total Orders",
      totalRevenue: "Gross Revenue",
      conversionRate: "Storefront Conversion",
      todaySales: "Today's Sales",
      pendingOrders: "Pending Orders",
      lowStockAlert: "Low Stock Alert",
      activeStaff: "Staff Present",
      grossProfit: "Gross Profit Margin",
      netProfit: "Net Business Profit",
      customerDue: "Customer Due",
      stockValue: "Total Inventory Value",
    },
    storage: {
      title: "Storage Utilization",
      used: "Used",
      limit: "Limit",
      unlimited: "Unlimited",
      remaining: "Remaining",
      upgrade: "Upgrade",
    },
    plan: {
      title: "Current Plan",
      features: "Included Features",
      managePlan: "Manage Plan",
      daysRemaining: (days) => `${days} days left in trial`,
      bandwidth: "Bandwidth",
    },
    storeHealth: {
      title: "Store Limits & Capacity",
      products: "Products Count",
      orders: "Processed Orders",
      media: "Media Files",
      pageViews: "Page Views",
    },
    activity: {
      title: "Recent Activity",
      storeCreated: "Store Created",
      lastUpdated: "Last Updated",
      allTimeOrders: (count) => `${count} Total Orders`,
      allTimeRevenue: "All-Time Revenue",
      allTime: "All-Time",
    },
    storeDetails: {
      title: "Store Details",
      name: "Store Name",
      category: "Category",
      subdomain: "Subdomain",
      plan: "Plan",
      created: "Created At",
    },
    emptyStates: {
      noProductsTitle: "No products added yet",
      noProductsDesc: "Add your first product to start tracking inventory and accepting orders.",
      noOrdersTitle: "No orders placed yet",
      noOrdersDesc: "Orders placed through storefront checkout or POS will appear here automatically.",
      addProductBtn: "Add Product",
    },
  },
};

const dictionaries: Record<Language, Dictionary> = { en };
const STORAGE_KEY = "bornoland.language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "en");
      localStorage.setItem("language", "en");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  const setLanguage = useCallback((_next: Language) => {
    setLanguageState("en");
    try {
      localStorage.setItem(STORAGE_KEY, "en");
      localStorage.setItem("language", "en");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState("en");
    try {
      localStorage.setItem(STORAGE_KEY, "en");
      localStorage.setItem("language", "en");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
