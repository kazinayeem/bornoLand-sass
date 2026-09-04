export interface CalloutItem {
  number: number;
  label: string;
  descriptionBn: string;
  target?: string;
}

export interface CrudWorkflow {
  action: "Create" | "Read" | "Update" | "Delete" | "Process" | "Audit";
  titleBn: string;
  stepsBn: string[];
}

export interface GuidePageItem {
  id: string;
  titleEn: string;
  titleBn: string;
  role: "Merchant" | "Employee" | "Super Admin" | "Public";
  module: string;
  route: string;
  screenshot: string;
  mobileScreenshot?: string;
  summaryBn: string;
  howToOpenBn: string[];
  callouts: CalloutItem[];
  availableActionsBn: string[];
  crudWorkflows?: CrudWorkflow[];
  formFields?: Array<{ name: string; required: boolean; purposeBn: string }>;
  importantNotesBn?: string[];
  tags: string[];
}

export interface GuideCategory {
  id: string;
  titleEn: string;
  titleBn: string;
  icon: string;
  descriptionBn: string;
  pages: GuidePageItem[];
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  // ── 1. শুরু করার নির্দেশিকা (GETTING STARTED) ──
  {
    id: "getting-started",
    titleEn: "Getting Started",
    titleBn: "শুরু করার নির্দেশিকা",
    icon: "Rocket",
    descriptionBn: "BornoLand SaaS প্ল্যাটফর্মে অ্যাকাউন্ট লগইন এবং ওয়ার্কস্পেস ও স্টোর সিলেকশন গাইড।",
    pages: [
      {
        id: "auth-login",
        titleEn: "Login & Authentication",
        titleBn: "লগইন ও অথেনটিকেশন",
        role: "Public",
        module: "Getting Started",
        route: "/login",
        screenshot: "/docs/screenshots/auth-login.png",
        summaryBn: "BornoLand প্ল্যাটফর্মে আপনার মার্চেন্ট, স্টাফ বা অ্যাডমিন ক্রেডেনশিয়াল দিয়ে নিরাপদে লগইন করুন।",
        howToOpenBn: [
          "ব্রাউজারে http://localhost:3000/login ওপেন করুন।",
          "আপনার রেজিস্টার্ড Email এবং Password প্রদান করুন।",
          "টেস্টিংয়ের জন্য 'Demo Merchant' অথবা 'Demo Super Admin' বাটনে ক্লিক করতে পারেন।",
          "'Sign In' চাপুন।",
        ],
        callouts: [
          { number: 1, label: "Email Address Input", descriptionBn: "আপনার নিবন্ধিত ইমেইল ঠিকানা প্রদান করার ঘর।" },
          { number: 2, label: "Password Input", descriptionBn: "আপনার গোপন পাসওয়ার্ড ইনপুট দিন।" },
          { number: 3, label: "Quick Demo Buttons", descriptionBn: "টেস্টিং ও ডেমো অ্যাকাউন্টে দ্রুত এক ক্লিকে প্রবেশ করার বাটন।" },
          { number: 4, label: "Sign In Button", descriptionBn: "ক্রেডেনশিয়াল ভেরিফাই করে সিস্টেমে প্রবেশের প্রধান বাটন।" },
        ],
        availableActionsBn: [
          "Email & Password দিয়ে নিরাপদ লগইন",
          "পাসওয়ার্ড ভুলে গেলে 'Forgot Password' লিঙ্ক ব্যবহার",
          "নতুন মার্চেন্ট হিসেবে সাইন আপ বা রেজিস্ট্রেশন",
        ],
        crudWorkflows: [
          {
            action: "Process",
            titleBn: "সিস্টেমে সাইন ইন করার ধাপ",
            stepsBn: [
              "লগইন ফর্মে আপনার সঠিক ইমেইল ও পাসওয়ার্ড লিখুন।",
              "'Sign In' বাটনে ক্লিক করুন।",
              "সফলভাবে অথেনটিকেশন সম্পন্ন হলে সিস্টেম স্বয়ংক্রিয়ভাবে আপনাকে ওয়ার্কস্পেস বা ড্যাশবোর্ডে রিডাইরেক্ট করবে।",
            ],
          },
        ],
        tags: ["login", "auth", "password", "signin", "লগইন", "অ্যাকাউন্ট"],
      },
      {
        id: "workspace-selection",
        titleEn: "Workspace & Store Selection",
        titleBn: "ওয়ার্কস্পেস ও স্টোর সিলেকশন",
        role: "Merchant",
        module: "Getting Started",
        route: "/workshops",
        screenshot: "/docs/screenshots/workspace-selection.png",
        summaryBn: "আপনার প্রতিষ্ঠানের ওয়ার্কস্পেস এবং পরিচালনা করার জন্য নির্দিষ্ট স্টোর নির্বাচন করুন।",
        howToOpenBn: [
          "লগইন করার পর স্বয়ংক্রিয়ভাবে ওয়ার্কস্পেস পেজে আসবেন অথবা টপ মেনু থেকে '/workshops' এ যান।",
          "তালিকায় থাকা স্টোর কার্ডগুলোর মধ্য থেকে কাঙ্ক্ষিত স্টোরে ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Store Cards", descriptionBn: "আপনার একাউন্টের অধীনে থাকা সমস্ত স্টোরের তালিকা ও স্থিতি।" },
          { number: 2, label: "Create Store Button", descriptionBn: "নতুন শাখা বা আলাদা অনলাইন স্টোর তৈরির বাটন।" },
          { number: 3, label: "Open Store Action", descriptionBn: "নির্দিষ্ট স্টোরের ম্যানেজমেন্ট ড্যাশবোর্ডে প্রবেশের বাটন।" },
        ],
        availableActionsBn: [
          "বিদ্যমান যেকোনো সক্রিয় স্টোরে প্রবেশ",
          "নতুন স্টোর বা আউটলেট তৈরি",
          "স্টোরের সাবডোমেন ও অ্যাক্টিভেশন স্ট্যাটাস পরীক্ষা",
        ],
        tags: ["workspace", "store", "outlet", "ওয়ার্কস্পেস", "স্টোর", "সিলেকশন"],
      },
    ],
  },

  // ── 2. ড্যাশবোর্ড (DASHBOARD) ──
  {
    id: "dashboard",
    titleEn: "Store Dashboard",
    titleBn: "স্টোর ড্যাশবোর্ড",
    icon: "LayoutDashboard",
    descriptionBn: "রিয়েল-টাইম বিক্রয়, অর্ডার সংখ্যা, রাজস্ব এবং সামগ্রিক ব্যবসার পারফরম্যান্স সামারি।",
    pages: [
      {
        id: "store-dashboard",
        titleEn: "Store Dashboard Overview",
        titleBn: "স্টোর ড্যাশবোর্ড ওভারভিউ",
        role: "Merchant",
        module: "Dashboard",
        route: "/store/[storeSlug]/dashboard",
        screenshot: "/docs/screenshots/store-dashboard.png",
        mobileScreenshot: "/docs/screenshots/mobile-dashboard.png",
        summaryBn: "স্টোরের কেন্দ্রীয় কন্ট্রোল রুম। এখান থেকে মোট সেলস, পেন্ডিং অর্ডার, গ্রাহক বৃদ্ধি এবং সাম্প্রতিক লেনদেন একনজরে দেখা যায়।",
        howToOpenBn: [
          "লেফট সাইডবার থেকে সবার উপরে থাকা 'Home / Dashboard' এ ক্লিক করুন।",
          "অথবা স্টোরে প্রবেশের পর ডিফল্ট পেজ হিসেবে এটি লোড হবে।",
        ],
        callouts: [
          { number: 1, label: "Sidebar Navigation", descriptionBn: "ব্যবসার সমস্ত মডিউল (Commerce, Inventory, POS, HRM, Finance ইত্যাদি)-এ যাওয়ার প্রধান মেনু।" },
          { number: 2, label: "Store Switcher", descriptionBn: "সাইডবারের শীর্ষে বর্তমান স্টোরের ব্র্যান্ড মার্ক এবং অন্য স্টোরে সহজে সুইচ করার ড্রপডাউন।" },
          { number: 3, label: "KPI Summary Cards", descriptionBn: "মোট রাজস্ব (Gross Revenue), মোট অর্ডার, গড় অর্ডার ভ্যালু এবং মোট কাস্টমার সংখ্যা।" },
          { number: 4, label: "Revenue Charts", descriptionBn: "নির্দিষ্ট সময়ের বিক্রয় প্রবণতা এবং গ্রাফিকাল তুলনামূলক চিত্র।" },
          { number: 5, label: "Recent Orders Table", descriptionBn: "সর্বশেষ প্রাপ্ত কাস্টমার অর্ডারগুলোর লাইভ তালিকা।" },
        ],
        availableActionsBn: [
          "দৈনিক, সাপ্তাহিক ও মাসিক রাজস্ব পারফরম্যান্স পর্যবেক্ষণ",
          "পেন্ডিং অর্ডারের দ্রুত স্ট্যাটাস দেখা ও সরাসরি অ্যাকশন নেওয়া",
          "লো-স্টক অ্যালার্ট এবং দ্রুত প্রসেসিং নোটিফিকেশন চেক",
        ],
        tags: ["dashboard", "revenue", "analytics", "overview", "ড্যাশবোর্ড", "বিক্রয়", "রাজস্ব"],
      },
    ],
  },

  // ── 3. ব্যবসা ও বাণিজ্য (COMMERCE) ──
  {
    id: "commerce",
    titleEn: "Commerce & Sales",
    titleBn: "ব্যবসা ও বাণিজ্য (অর্ডার ও প্রোডাক্ট)",
    icon: "ShoppingBag",
    descriptionBn: "গ্রাহকের অর্ডার প্রসেসিং, পণ্য ক্যাটালগ তৈরি, ক্যাটাগরি এবং গ্রাহক ডাটাবেস পরিচালনা।",
    pages: [
      {
        id: "orders",
        titleEn: "Orders Management",
        titleBn: "অর্ডার ব্যবস্থাপনা",
        role: "Merchant",
        module: "Commerce",
        route: "/store/[storeSlug]/orders",
        screenshot: "/docs/screenshots/orders.png",
        mobileScreenshot: "/docs/screenshots/mobile-orders.png",
        summaryBn: "ওয়েবসাইট, আউটলেট বা সোশ্যাল মিডিয়া থেকে আসা সকল অর্ডারের কেন্দ্রীয় তালিকা ও ডেলিভারি ট্র্যাকিং।",
        howToOpenBn: [
          "সাইডবার থেকে 'Commerce' সেকশনে যান।",
          "'Orders' মেনুতে ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Search & Filter Bar", descriptionBn: "অর্ডার নম্বর, কাস্টমারের নাম বা মোবাইল নম্বর দিয়ে অর্ডার সার্চ করার বক্স।" },
          { number: 2, label: "Status Tabs", descriptionBn: "All, Pending, Processing, Shipped, Delivered ও Cancelled স্ট্যাটাস অনুযায়ী ফিল্টারিং।" },
          { number: 3, label: "Orders Data Table", descriptionBn: "অর্ডার আইডি, তারিখ, কাস্টমার, আইটেম সংখ্যা, মোট মূল্য ও পেমেন্ট স্ট্যাটাস।" },
          { number: 4, label: "Quick Action Controls", descriptionBn: "অর্ডার ভিউ, ইনভয়েস প্রিন্ট এবং কুরিয়ারে পাঠানোর বাটন।" },
        ],
        availableActionsBn: [
          "নতুন অর্ডারের বিস্তারিত তথ্য দেখা ও পেমেন্ট ভেরিফাই করা",
          "অর্ডার স্ট্যাটাস আপডেট করা (যেমন: Processing থেকে Shipped)",
          "কুরিয়ার এপিআই (Pathao/Steadfast) এর মাধ্যমে পার্সেল বুক করা",
          "ইনভয়েস বা চালান ডাউনলোড এবং প্রিন্ট করা",
        ],
        crudWorkflows: [
          {
            action: "Read",
            titleBn: "অর্ডার বিস্তারিত দেখার নিয়ম",
            stepsBn: [
              "Orders পেজে গিয়ে কাঙ্ক্ষিত অর্ডারের রো-তে ক্লিক করুন।",
              "অর্ডারের আইটেম তালিকা, ডেলিভারি ঠিকানা এবং কাস্টমার নোট দেখুন।",
            ],
          },
          {
            action: "Update",
            titleBn: "অর্ডারের স্ট্যাটাস পরিবর্তন",
            stepsBn: [
              "অর্ডারের পাশে থাকা স্ট্যাটাস ড্রপডাউনে ক্লিক করুন।",
              "'Processing' বা 'Shipped' নির্বাচন করুন।",
              "সিস্টেম স্বয়ংক্রিয়ভাবে কাস্টমারকে এসএমএস ও ট্র্যাকিং আপডেট পাঠাবে।",
            ],
          },
        ],
        tags: ["orders", "sales", "shipping", "invoice", "অর্ডার", "ডেলিভারি", "চালান"],
      },
      {
        id: "products",
        titleEn: "Products Catalog",
        titleBn: "পণ্য ক্যাটালগ ও তালিকা",
        role: "Merchant",
        module: "Commerce",
        route: "/store/[storeSlug]/products",
        screenshot: "/docs/screenshots/products.png",
        summaryBn: "স্টোরের যাবতীয় পণ্য, দাম, ভ্যারিয়েন্ট (যেমন সাইজ বা রঙ), বারকোড এবং স্টক ট্র্যাক করার পেজ।",
        howToOpenBn: [
          "সাইডবারে 'Commerce' এর অধীনে 'Products' অপশনটি বেছে নিন।",
        ],
        callouts: [
          { number: 1, label: "Create Product Button", descriptionBn: "নতুন পণ্য যোগ করার প্রধান অ্যাকশন বাটন।" },
          { number: 2, label: "Product Search Bar", descriptionBn: "পণ্যের নাম, এসকেইউ (SKU) বা বারকোড দিয়ে দ্রুত খুঁজে বের করার ইনপুট।" },
          { number: 3, label: "Product Listing Table", descriptionBn: "পণ্যের থাম্বনেইল ছবি, নাম, রেগুলার প্রাইস, সেল প্রাইস এবং স্টক লেভেল।" },
          { number: 4, label: "Action Menu", descriptionBn: "পণ্য এডিট, ডুপ্লিকেট অথবা নিষ্ক্রিয় করার অপশন।" },
        ],
        availableActionsBn: [
          "নতুন পণ্য তৈরি ও ছবি আপলোড",
          "মূল্য ও ডিসকাউন্ট রেট পরিবর্তন",
          "মাল্টি-ভ্যারিয়েন্ট (Size, Color, Weight) কনফিগারেশন",
          "স্টক লিমিট ও ইনভেন্টরি ট্র্যাকিং অন/অফ করা",
        ],
        crudWorkflows: [
          {
            action: "Create",
            titleBn: "নতুন পণ্য যোগ করার ধাপ",
            stepsBn: [
              "Products পেজের উপরে ডানদিকের '+ Create Product' বাটনে ক্লিক করুন।",
              "পণ্যের শিরোনাম (Title), বিবরণ (Description) এবং ক্যাটাগরি দিন।",
              "পণ্যটির বিক্রয়মূল্য (Selling Price) এবং প্রয়োজনে কেনাদাম (Cost Price) নির্ধারণ করুন।",
              "পণ্যের ছবি আপলোড করুন এবং 'Save' বাটনে ক্লিক করুন।",
            ],
          },
          {
            action: "Update",
            titleBn: "বিদ্যমান পণ্য সম্পাদনা (Edit)",
            stepsBn: [
              "তালিকায় থাকা যেকোনো পণ্যের নামের উপর বা 'Edit' আইকনে ক্লিক করুন।",
              "প্রয়োজনীয় তথ্য (যেমন দাম বা স্টক) সংশোধন করুন।",
              "'Update Product' বাটনে ক্লিক করে সেভ করুন।",
            ],
          },
        ],
        formFields: [
          { name: "Product Title", required: true, purposeBn: "পণ্যের মূল নাম যা ওয়েবসাইটে ও চালানে প্রদর্শিত হবে।" },
          { name: "Regular Price", required: true, purposeBn: "পণ্যের স্বাভাবিক খুচরা বিক্রয় মূল্য (BDT)।" },
          { name: "SKU / Barcode", required: false, purposeBn: "ইউনিক স্টক কিপিং ইউনিট কোড বা স্ক্যানার বারকোড।" },
          { name: "Category", required: true, purposeBn: "পণ্যটি যে ক্যাটাগরির অন্তর্ভুক্ত।" },
        ],
        tags: ["products", "catalog", "sku", "pricing", "পণ্য", "প্রোডাক্ট", "দাম"],
      },
      {
        id: "customers",
        titleEn: "Customer Directory",
        titleBn: "কাস্টমার ডিরেক্টরি",
        role: "Merchant",
        module: "Commerce",
        route: "/store/[storeSlug]/customers",
        screenshot: "/docs/screenshots/customers.png",
        summaryBn: "আপনার সকল নিবন্ধিত ও অন-ডিমান্ড ক্রেতার পরিচিতি, যোগাযোগের তথ্য এবং তাদের ক্রয়ের ইতিহাস।",
        howToOpenBn: [
          "সাইডবার থেকে 'Commerce' > 'Customers' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Search Customers", descriptionBn: "নাম, ফোন নম্বর বা ইমেইল ঠিকানা দিয়ে গ্রাহক খোঁজা।" },
          { number: 2, label: "Customer List Table", descriptionBn: "গ্রাহকের নাম, যোগাযোগের নম্বর, অর্ডারের সংখ্যা ও মোট ব্যয় (Total Spend)।" },
          { number: 3, label: "Customer Profile Details", descriptionBn: "গ্রাহকের বিগত সকল অর্ডার এবং শিপিং ঠিকানার হিস্ট্রি।" },
        ],
        availableActionsBn: [
          "নিয়মিত গ্রাহকদের ক্রয়ের পরিমাণ এবং লয়্যালটি ট্র্যাকিং",
          "গ্রাহকের প্রোফাইল তথ্য বা ডেলিভারি ফোন নম্বর আপডেট",
          "নির্দিষ্ট গ্রাহককে লক্ষ্য করে অফার বা প্রমোশন নির্ধারণ",
        ],
        tags: ["customers", "crm", "contacts", "কাস্টমার", "গ্রাহক"],
      },
      {
        id: "categories",
        titleEn: "Categories & Collections",
        titleBn: "ক্যাটাগরি ও কালেকশন",
        role: "Merchant",
        module: "Commerce",
        route: "/store/[storeSlug]/categories",
        screenshot: "/docs/screenshots/categories.png",
        summaryBn: "স্টোরের পণ্যগুলোকে বিভিন্ন গ্রুপ বা ক্যাটাগরিতে সাজিয়ে রাখা যাতে ক্রেতারা সহজেই ব্রাউজ করতে পারেন।",
        howToOpenBn: [
          "সাইডবার থেকে 'Commerce' > 'Categories' মেনু ওপেন করুন।",
        ],
        callouts: [
          { number: 1, label: "Add Category Button", descriptionBn: "নতুন বিভাগ বা সাব-ক্যাটাগরি তৈরির বাটন।" },
          { number: 2, label: "Category Hierarchy List", descriptionBn: "ক্যাটাগরির নাম, স্লাগ এবং এর আওতাধীন পণ্যের সংখ্যা।" },
        ],
        availableActionsBn: [
          "নতুন ক্যাটাগরি ও ব্যানার ছবি যোগ করা",
          "ওয়েবসাইটের নেভিগেশন মেনুর জন্য ক্যাটাগরি লিঙ্ক প্রস্তুত রাখা",
        ],
        tags: ["categories", "collections", "ক্যাটাগরি", "শ্রেণিবিভাগ"],
      },
    ],
  },

  // ── 4. ইনভেন্টরি ও গুদাম (INVENTORY) ──
  {
    id: "inventory",
    titleEn: "Inventory & Warehouses",
    titleBn: "ইনভেন্টরি ও গুদাম ব্যবস্থাপনা",
    icon: "Boxes",
    descriptionBn: "মাল্টি-ওয়্যারহাউস স্টক ট্র্যাকিং, স্টক মুভমেন্ট লেজার এবং ক্ষয়ক্ষতি/অপচয়ের নিখুঁত হিসাব।",
    pages: [
      {
        id: "inventory-stock",
        titleEn: "Stock Overview",
        titleBn: "স্টক বিবরণী ও লাইভ ট্র্যাকিং",
        role: "Merchant",
        module: "Inventory",
        route: "/store/[storeSlug]/inventory",
        screenshot: "/docs/screenshots/inventory-stock.png",
        summaryBn: "রিয়েল-টাইমে প্রতিটি পণ্যের বর্তমান মজুত সংখ্যা, অ্যাভেইলেবল স্টক এবং লো-স্টক সতর্কবার্তা প্রদর্শনের পেজ।",
        howToOpenBn: [
          "সাইডবার থেকে 'Inventory' মডিউলে যান।",
          "'Stock Overview' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Warehouse Selector", descriptionBn: "নির্দিষ্ট কোনো গুদাম বা সবগুলোর সম্মিলিত স্টক দেখার ড্রপডাউন।" },
          { number: 2, label: "Stock Metrics Cards", descriptionBn: "ইন-হ্যান্ড স্টক, রিজার্ভড স্টক এবং লো-স্টক আইটেমের সংখ্যা।" },
          { number: 3, label: "Inventory Grid", descriptionBn: "পণ্যের SKU, বর্তমান মজুত সংখ্যা, ইউনিট কস্ট এবং রিস্টক স্ট্যাটাস।" },
          { number: 4, label: "Adjust Stock Action", descriptionBn: "ম্যানুয়ালি স্টক বাড়ানো বা কমানোর বাটন।" },
        ],
        availableActionsBn: [
          "বর্তমান মজুত পণ্যের পরিমাণ দেখা",
          "স্টক কম হলে রিস্টক করার সিদ্ধান্ত গ্রহণ",
          "গুদাম ভিত্তিক স্টক ফিল্টারিং ও স্প্রেডশিটে এক্সপোর্ট",
        ],
        crudWorkflows: [
          {
            action: "Update",
            titleBn: "স্টক সমন্বয় (Adjust Stock)",
            stepsBn: [
              "কাঙ্ক্ষিত পণ্যের পাশে থাকা 'Adjust Stock' বাটনে চাপুন।",
              "নতুন প্রাপ্ত সংখ্যা লিখুন এবং সমন্বয়ের কারণ (যেমন: New Purchase বা Physical Audit) সিলেক্ট করুন।",
              "'Confirm Adjustment' চাপুন; সিস্টেমে তাৎক্ষণিক আপডেট হবে।",
            ],
          },
        ],
        tags: ["inventory", "stock", "warehouse", "ইনভেন্টরি", "স্টক", "গুদাম"],
      },
      {
        id: "warehouses",
        titleEn: "Warehouses & Hubs",
        titleBn: "ওয়্যারহাউস ও সংরক্ষণ কেন্দ্র",
        role: "Merchant",
        module: "Inventory",
        route: "/store/[storeSlug]/inventory/warehouses",
        screenshot: "/docs/screenshots/warehouses.png",
        summaryBn: "আপনার প্রতিষ্ঠানের সেন্ট্রাল ওয়্যারহাউস, শোরুম গুদাম বা বিভিন্ন অঞ্চলের হাবগুলোর তালিকা ও লোকেশন ম্যানেজমেন্ট।",
        howToOpenBn: [
          "সাইডবার থেকে 'Inventory' > 'Warehouses' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Add Warehouse Button", descriptionBn: "নতুন গুদাম বা শাখা লোকেশন যুক্ত করার বাটন।" },
          { number: 2, label: "Warehouse Cards", descriptionBn: "গুদামের নাম, কোড, ঠিকানা, ম্যানেজার এবং মোট সংরক্ষিত আইটেম।" },
        ],
        availableActionsBn: [
          "নতুন স্টোরেজ হাব বা গুদাম খোলা",
          "গুদাম ভিত্তিক ইনভেন্টরি আলাদা রাখা",
          "এক গুদাম থেকে অন্য গুদামে পণ্য স্থানান্তরের গন্তব্য ঠিক করা",
        ],
        tags: ["warehouses", "hubs", "storage", "ওয়্যারহাউস", "হাব"],
      },
      {
        id: "stock-ledger",
        titleEn: "Stock Movement Ledger",
        titleBn: "স্টক মুভমেন্ট লেজার",
        role: "Merchant",
        module: "Inventory",
        route: "/store/[storeSlug]/inventory/ledger",
        screenshot: "/docs/screenshots/stock-ledger.png",
        summaryBn: "কোন পণ্য কখন এসেছে, কখন বিক্রি হয়ে বের হয়েছে বা নষ্ট হিসেবে বাদ গেছে তার তারিখওয়ারী অডিট লগ।",
        howToOpenBn: [
          "সাইডবারে 'Inventory' এর অধীনে 'Stock Movement' নির্বাচন করুন।",
        ],
        callouts: [
          { number: 1, label: "Transaction Filters", descriptionBn: "তারিখ এবং ট্রানজ্যাকশন টাইপ (In/Out/Transfer/Adjustment) ফিল্টার।" },
          { number: 2, label: "Audit Ledger Table", descriptionBn: "তারিখ, পণ্যের নাম, আগের স্টক, ট্রানজ্যাকশন পরিমাণ, পরবর্তী ব্যালেন্স এবং অনুমোদনের রেফারেন্স।" },
        ],
        availableActionsBn: [
          "কোনো স্টকে গরমিল দেখা দিলে পেছনের মুভমেন্ট হিস্ট্রি পরীক্ষা করা",
          "ইনভেন্টরি অডিট ও মাস শেষের হিসাব মেলানো",
        ],
        tags: ["ledger", "movement", "audit", "লেজার", "স্টক অডিট"],
      },
      {
        id: "waste-loss",
        titleEn: "Waste & Loss Tracking",
        titleBn: "ক্ষয়ক্ষতি ও অপচয়ের হিসাব",
        role: "Merchant",
        module: "Inventory",
        route: "/store/[storeSlug]/inventory/waste",
        screenshot: "/docs/screenshots/waste-loss.png",
        summaryBn: "মেয়াদোত্তীর্ণ, ক্ষতিগ্রস্ত বা পরিবহনে নষ্ট হওয়া মালামালের হিসাব লিপিবদ্ধ করার স্থান।",
        howToOpenBn: [
          "সাইডবার থেকে 'Inventory' > 'Waste & Loss' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Log Waste Button", descriptionBn: "নষ্ট পণ্যের এন্ট্রি দেওয়ার বাটন।" },
          { number: 2, label: "Waste Registry Table", descriptionBn: "তারিখ, ক্ষয়ক্ষতির কারণ (Damaged/Expired), পণ্যের পরিমাণ এবং আর্থিক ক্ষতির মূল্য।" },
        ],
        availableActionsBn: [
          "ক্ষতিগ্রস্ত পণ্য স্টক থেকে বাদ দেওয়া",
          "মাসিক আর্থিক ক্ষতি রিপোর্ট ফাইন্যান্স মডিউলে সিঙ্ক রাখা",
        ],
        tags: ["waste", "loss", "damaged", "ক্ষয়ক্ষতি", "অপচয়"],
      },
    ],
  },

  // ── 5. ক্রয় ও সরবরাহকারী (PURCHASING) ──
  {
    id: "purchasing",
    titleEn: "Purchasing & Procurement",
    titleBn: "ক্রয় ও সরবরাহকারী (PO & Suppliers)",
    icon: "Receipt",
    descriptionBn: "সরবরাহকারী থেকে কাঁচামাল বা পণ্য ক্রয়ের জন্য পারচেজ অর্ডার তৈরি এবং ভেন্ডর লেজার।",
    pages: [
      {
        id: "purchase-orders",
        titleEn: "Purchase Orders (PO)",
        titleBn: "পারচেজ অর্ডার (ক্রয়াদেশ)",
        role: "Merchant",
        module: "Purchasing",
        route: "/store/[storeSlug]/inventory/purchasing",
        screenshot: "/docs/screenshots/purchase-orders.png",
        summaryBn: "সাপ্লায়ার বা প্রস্তুতকারককে নতুন পণ্য পাঠানোর আনুষ্ঠানিক অর্ডার এবং মাল পৌঁছালে Goods Receipt বুকিং।",
        howToOpenBn: [
          "সাইডবার থেকে 'Purchasing' মডিউলে যান।",
          "'Purchase Orders' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Create PO Button", descriptionBn: "নতুন ক্রয়াদেশ বা পারচেজ অর্ডার তৈরি করার বাটন।" },
          { number: 2, label: "PO Registry Table", descriptionBn: "PO নম্বর, সরবরাহকারীর নাম, প্রত্যাশিত তারিখ, মোট অর্ডারের মূল্য এবং স্ট্যাটাস (Draft/Ordered/Received)।" },
          { number: 3, label: "Receive Goods Action", descriptionBn: "পণ্য গুদামে পৌঁছানোর পর স্টকে রিসিভ করার বাটন।" },
        ],
        availableActionsBn: [
          "নতুন ক্রয়াদেশ তৈরি করে সরবরাহকারীকে পাঠানো",
          "মাল ডেলিভারি হলে গুদামের স্টকে স্বয়ংক্রিয় ইনপুট দেওয়া",
          "বকেয়া বিল ফাইন্যান্স ও প্রকিউরমেন্ট সিস্টেমে যুক্ত করা",
        ],
        crudWorkflows: [
          {
            action: "Create",
            titleBn: "নতুন পারচেজ অর্ডার তৈরির ধাপ",
            stepsBn: [
              "'+ Create PO' বাটনে ক্লিক করুন।",
              "সাপ্লায়ার নির্বাচন করুন এবং ডেলিভারি নেওয়ার গুদাম ঠিক করুন।",
              "পণ্যের তালিকা ও পরিমাণ নির্ধারণ করে 'Submit PO' চাপুন।",
            ],
          },
        ],
        tags: ["purchasing", "po", "procurement", "পারচেজ", "ক্রয়াদেশ", "সাপ্লায়ার"],
      },
      {
        id: "suppliers",
        titleEn: "Suppliers Master",
        titleBn: "সরবরাহকারী তালিকা (Suppliers)",
        role: "Merchant",
        module: "Purchasing",
        route: "/store/[storeSlug]/inventory/suppliers",
        screenshot: "/docs/screenshots/suppliers.png",
        summaryBn: "ভেন্ডর বা ব্যবসায়িক সরবরাহকারীদের নাম, ব্যাংক তথ্য, ক্রেডিট লিমিট এবং পাওনা টাকার লেজার।",
        howToOpenBn: [
          "সাইডবারে 'Purchasing' এর অধীনে 'Suppliers Master' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Add Supplier Button", descriptionBn: "নতুন ভেন্ডর বা সাপ্লায়ার প্রোফাইল যুক্ত করার বাটন।" },
          { number: 2, label: "Supplier Directory Table", descriptionBn: "কোম্পানির নাম, ফোকাল পারসনের ফোন নম্বর, বর্তমান বকেয়া এবং ট্র্রেড শর্তাবলী।" },
        ],
        availableActionsBn: [
          "সাপ্লায়ার প্রোফাইল তৈরি ও এডিট",
          "সাপ্লায়ারের সাথে লেনদেনের ইতিহাস ও পেমেন্ট ক্লিয়ারেন্স রেকর্ড",
        ],
        tags: ["suppliers", "vendors", "সরবরাহকারী", "ভেন্ডর"],
      },
    ],
  },

  // ── 6. পয়েন্ট অব সেল (POS) ──
  {
    id: "pos",
    titleEn: "Point of Sale (POS)",
    titleBn: "পয়েন্ট অব সেল (পিওএস টার্মিনাল ও ক্যাশ)",
    icon: "Calculator",
    descriptionBn: "শোরুম বা কাউন্টারে দ্রুতগতির বারকোড স্ক্যানিং, ক্যাশ ড্রয়ার পরিচালনা ও থার্মাল রসিদ প্রিন্টিং।",
    pages: [
      {
        id: "pos-terminal",
        titleEn: "POS Terminal Counter",
        titleBn: "পিওএস টার্মিনাল ও ক্যাশ কাউন্টার",
        role: "Merchant",
        module: "POS",
        route: "/store/[storeSlug]/pos",
        screenshot: "/docs/screenshots/pos-terminal.png",
        mobileScreenshot: "/docs/screenshots/mobile-pos.png",
        summaryBn: "কাউন্টার সেলসের জন্য অপ্টিমাইজড দ্রুতগতির বিলিং স্ক্রিন। কিবোর্ড শর্টকাট, বারকোড স্ক্যানার এবং মাল্টিপল পেমেন্ট মেথড সাপোর্ট করে।",
        howToOpenBn: [
          "সাইডবার থেকে 'Point of Sale (POS)' মেনু সিলেক্ট করুন।",
          "'POS Terminal' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Barcode / Item Search", descriptionBn: "বারকোড স্ক্যান করলে সরাসরি কার্টে পণ্য যুক্ত হওয়ার ইনপুট বার।" },
          { number: 2, label: "Product Grid with Quick Tap", descriptionBn: "জনপ্রিয় পণ্যে এক ট্যাপে কার্টে যুক্ত করার ভিজ্যুয়াল গ্রিড।" },
          { number: 3, label: "Cart Summary & Totals", descriptionBn: "আইটেম সংখ্যা, সাবটোটাল, ডিসকাউন্ট, ট্যাক্স এবং নেট পেয়েবল অ্যামাউন্ট।" },
          { number: 4, label: "Payment Method Buttons", descriptionBn: "Cash, bKash, Nagad, কার্ড অথবা স্প্লিট পেমেন্ট নির্বাচন।" },
          { number: 5, label: "Complete Order & Print", descriptionBn: "বিল সম্পন্ন করে থার্মাল পিওএস প্রিন্টারে রসিদ প্রিন্ট করার বাটন।" },
        ],
        availableActionsBn: [
          "দ্রুত বিল তৈরি ও গ্রাহককে ক্যাশ মেমো প্রদান",
          "নগদ বা ডিজিটাল পেমেন্ট রিসিভ করা",
          "কুপন বা ডিসকাউন্ট কোড প্রয়োগ করা",
        ],
        crudWorkflows: [
          {
            action: "Process",
            titleBn: "পিওএস কাউন্টারে সেল সম্পন্ন করার ধাপ",
            stepsBn: [
              "বারকোড স্ক্যানার দিয়ে পণ্য স্ক্যান করুন অথবা গ্রিড থেকে প্রোডাক্ট ট্যাপ করুন।",
              "প্রয়োজনে কাস্টমারের মোবাইল নম্বর ইনপুট দিন।",
              "পেমেন্ট মেথড (যেমন Cash বা bKash) সিলেক্ট করে প্রাপ্ত টাকা লিখুন।",
              "'Pay & Print Receipt' চাপলে তাৎক্ষণিক অর্ডার সেভ হবে এবং ক্যাশ মেমো প্রিন্ট হবে।",
            ],
          },
        ],
        tags: ["pos", "terminal", "billing", "receipt", "পিওএস", "বিলিং", "কাউন্টার"],
      },
      {
        id: "pos-shifts",
        titleEn: "Registers & Cash Shifts",
        titleBn: "ক্যাশ রেজিস্টার ও শিফট হিসেব",
        role: "Merchant",
        module: "POS",
        route: "/store/[storeSlug]/pos/shifts",
        screenshot: "/docs/screenshots/pos-shifts.png",
        summaryBn: "কাউন্টার খোলার সময় ওপেনিং ব্যালেন্স দিয়ে শিফট শুরু এবং দিনশেষে ক্যাশ ড্রয়ারের টাকা গুনে শিফট ক্লোজিং।",
        howToOpenBn: [
          "সাইডবারে 'Point of Sale' এর অধীনে 'Registers & Shifts' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Start / Close Shift Button", descriptionBn: "ক্যাশিয়ারের শিফট শুরু বা সমাপ্তির বাটন।" },
          { number: 2, label: "Shift Summary Cards", descriptionBn: "ওপেনিং ক্যাশ, মোট নগদ বিক্রয়, ডিজিটাল বিক্রয় এবং এক্সপেক্টেড ক্যাশ ড্রয়ার ব্যালেন্স।" },
        ],
        availableActionsBn: [
          "শিফট ওপেন করে প্রারম্ভিক ক্যাশ এন্ট্রি দেওয়া",
          "শিফট শেষে ক্যাশ ড্রয়ারের টাকা মিলিয়ে শিফট ক্লোজ করা",
          "ক্যাশিয়ার ভিত্তিক সেলস হিসেব অডিট করা",
        ],
        tags: ["shifts", "cash", "register", "শিফট", "ক্যাশ রেজিস্টার"],
      },
    ],
  },

  // ── 7. কর্মী ও মানবসম্পদ (HRM) ──
  {
    id: "hrm",
    titleEn: "People & HRM",
    titleBn: "কর্মী ও মানবসম্পদ ব্যবস্থাপনা (HRM)",
    icon: "Users",
    descriptionBn: "কর্মী প্রোফাইল, উপস্থিতি, ছুটির আবেদন এবং মাসিক বেতনের পে-রোল প্রস্তুতকরণ।",
    pages: [
      {
        id: "hrm-employees",
        titleEn: "Employees Directory",
        titleBn: "কর্মচারী ডিরেক্টরি ও তথ্য",
        role: "Merchant",
        module: "HRM",
        route: "/store/[storeSlug]/hrm/employees",
        screenshot: "/docs/screenshots/hrm-employees.png",
        summaryBn: "প্রতিষ্ঠানের সমস্ত কর্মীর ব্যক্তিগত তথ্য, বিভাগ, পদবী, চুক্তির মেয়াদ এবং যোগাযোগের বিবরণ।",
        howToOpenBn: [
          "সাইডবারে 'People & HRM' মডিউলে ক্লিক করুন।",
          "'Employees Directory' নির্বাচন করুন।",
        ],
        callouts: [
          { number: 1, label: "Add Employee Button", descriptionBn: "নতুন কর্মী নিয়োগের তথ্য এন্ট্রি দেওয়ার বাটন।" },
          { number: 2, label: "Employees Table", descriptionBn: "নাম, এমপ্লয়ি আইডি, বিভাগ, পদবী, যোগদানের তারিখ এবং অ্যাক্টিভ স্ট্যাটাস।" },
          { number: 3, label: "Manage Profile Action", descriptionBn: "কর্মীর বেতন কাঠামো ও রোল পারমিশন সেট করার বাটন।" },
        ],
        availableActionsBn: [
          "নতুন কর্মী যুক্ত করা এবং কর্মীর আইডি প্রদান",
          "বেসিক বেতন ও এলাউন্স নির্ধারণ করা",
          "কর্মী প্রোফাইল ও ডকুমেন্টস দেখা",
        ],
        crudWorkflows: [
          {
            action: "Create",
            titleBn: "নতুন কর্মী যুক্ত করার ধাপ",
            stepsBn: [
              "'+ Add Employee' বাটনে ক্লিক করুন।",
              "কর্মীর পুরো নাম, ইমেইল, ফোন এবং বিভাগ (Department) নির্বাচন করুন।",
              "পদবী (Designation) ও মূল বেতন (Basic Salary) লিখুন।",
              "'Save Employee' চাপলে কর্মীর প্রোফাইল তৈরি হবে।",
            ],
          },
        ],
        tags: ["hrm", "employees", "staff", "কর্মী", "কর্মচারী", "এইচআরএম"],
      },
      {
        id: "hrm-attendance",
        titleEn: "Attendance & Shifts",
        titleBn: "দৈনিক হাজিরা ও শিফট ট্র্যাকিং",
        role: "Merchant",
        module: "HRM",
        route: "/store/[storeSlug]/hrm/attendance",
        screenshot: "/docs/screenshots/hrm-attendance.png",
        summaryBn: "কর্মীদের ইন-টাইম, আউট-টাইম, লেট প্রেজেন্স এবং ওভারটাইমের তারিখওয়ারী হাজিরা রেকর্ড।",
        howToOpenBn: [
          "সাইডবার থেকে 'People & HRM' > 'Attendance & Shifts' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Date & Department Filter", descriptionBn: "নির্দিষ্ট তারিখ ও বিভাগের কর্মীদের হাজিরা ফিল্টারিং।" },
          { number: 2, label: "Attendance Summary", descriptionBn: "আজকের মোট উপস্থিত, অনুপস্থিত, দেরিতে আসা ও ছুটিতে থাকা কর্মীদের সংখ্যা।" },
          { number: 3, label: "Clock In/Out Log Table", descriptionBn: "কর্মীভিত্তিক সঠিক লগইন সময়, লগআউট সময় এবং কাজের মোট কর্মঘণ্টা।" },
        ],
        availableActionsBn: [
          "দৈনিক উপস্থিতির হার পর্যবেক্ষণ",
          "ম্যানুয়াল অ্যাডজাস্টমেন্ট বা অনুপস্থিত কর্মীর হাজিরা অনুমোদন",
        ],
        tags: ["attendance", "clock-in", "shifts", "হাজিরা", "উপস্থিতি"],
      },
      {
        id: "hrm-leaves",
        titleEn: "Leave Management",
        titleBn: "ছুটি ব্যবস্থাপনা ও অনুমোদন",
        role: "Merchant",
        module: "HRM",
        route: "/store/[storeSlug]/hrm/leaves",
        screenshot: "/docs/screenshots/hrm-leaves.png",
        summaryBn: "কর্মীদের ছুটির আবেদন (Sick, Casual, Annual Leave) পর্যালোচনা ও ম্যানেজারের অনুমোদন বা বাতিলের কেন্দ্র।",
        howToOpenBn: [
          "সাইডবারে 'People & HRM' এর অধীনে 'Leave Management' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Pending Leave Requests", descriptionBn: "অনুমোদনের অপেক্ষায় থাকা ছুটির আবেদনের তালিকা।" },
          { number: 2, label: "Approve / Reject Buttons", descriptionBn: "ছুটির আবেদন এক ক্লিকে মঞ্জুর বা বাতিল করার নিয়ন্ত্রণ।" },
          { number: 3, label: "Annual Leave Balances", descriptionBn: "কর্মীদের বার্ষিক ছুটির অবশিষ্ট ব্যালেন্স রিপোর্ট।" },
        ],
        availableActionsBn: [
          "ছুটির আবেদন পর্যালোচনা এবং অনুমোদনের নোটিফিকেশন প্রদান",
          "বাৎসরিক ছুটির কোটা পর্যবেক্ষণ",
        ],
        tags: ["leaves", "vacation", "approval", "ছুটি", "অনুমোদন"],
      },
      {
        id: "hrm-payroll",
        titleEn: "Payroll & Payslips",
        titleBn: "পেরোল ও পে-স্লিপ জেনারেশন",
        role: "Merchant",
        module: "HRM",
        route: "/store/[storeSlug]/hrm/payroll",
        screenshot: "/docs/screenshots/hrm-payroll.png",
        summaryBn: "মাসিক বেতন প্রক্রিয়াকরণ, বোনাস যোগ, অনুপস্থিতির কর্তন এবং ডিজিটাল পে-স্লিপ তৈরি ও ডাউনলোড।",
        howToOpenBn: [
          "সাইডবার থেকে 'People & HRM' > 'Payroll & Payslips' নির্বাচন করুন।",
        ],
        callouts: [
          { number: 1, label: "Generate Payroll Button", descriptionBn: "চলতি মাসের সব কর্মীর বেতন স্বয়ংক্রিয়ভাবে প্রস্তুত করার বাটন।" },
          { number: 2, label: "Payroll Ledger Table", descriptionBn: "কর্মীর নাম, মূল বেতন, ভাতা, কর্তন (Deductions) এবং নেট প্রদেয় বেতন।" },
          { number: 3, label: "Payslip Download Action", descriptionBn: "কর্মীভিত্তিক আনুষ্ঠানিক পে-স্লিপ পিডিএফ ডাউনলোড বা প্রিন্ট করার বাটন।" },
        ],
        availableActionsBn: [
          "মাসিক স্যালারি শিট এক ক্লিকে জেনারেট করা",
          "বেতন পরিশোধের পর স্ট্যাটাস 'Paid' হিসেবে মার্ক করা",
          "কর্মীর জন্য অফিসিয়াল পে-স্লিপ ইস্যু করা",
        ],
        tags: ["payroll", "salary", "payslip", "পেরোল", "বেতন", "পে-স্লিপ"],
      },
    ],
  },

  // ── 8. কর্মী সেলফ-সার্ভিস (EMPLOYEE SELF-SERVICE) ──
  {
    id: "employee-self-service",
    titleEn: "Employee Self-Service",
    titleBn: "কর্মী সেলফ-সার্ভিস পোর্টাল",
    icon: "UserCheck",
    descriptionBn: "স্টাফ বা সাধারণ কর্মীদের নিজস্ব ড্যাশবোর্ড; যেখান থেকে নিজে হাজিরা দেওয়া, ছুটি চাওয়া ও পে-স্লিপ দেখা যায়।",
    pages: [
      {
        id: "employee-portal",
        titleEn: "Self-Service Workspace",
        titleBn: "সেলফ-সার্ভিস পোর্টাল ও হাজিরা",
        role: "Employee",
        module: "Employee Self-Service",
        route: "/store/[storeSlug]/hrm/self-service",
        screenshot: "/docs/screenshots/employee-self-service.png",
        mobileScreenshot: "/docs/screenshots/mobile-self-service.png",
        summaryBn: "কর্মীদের ব্যক্তিগত সুরক্ষিত ওয়ার্কস্পেস। এখানে মার্চেন্টের গোপন ফাইনান্সিয়াল ডাটা লুকানো থাকে এবং কেবল কর্মীর নিজস্ব হাজিরা ও স্যালারি তথ্য দেখা যায়।",
        howToOpenBn: [
          "কর্মীর অ্যাকাউন্ট দিয়ে লগইন করলে সাইডবারে স্বয়ংক্রিয়ভাবে 'Self-Service Portal' প্রদর্শিত হবে।",
          "অথবা সাইডবার থেকে 'My Workspace' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Quick Clock In / Out Button", descriptionBn: "কর্মস্থলে প্রবেশের পর বা বের হওয়ার সময় হাজিরা রেকর্ড করার লাইভ বাটন।" },
          { number: 2, label: "Attendance Summary Card", descriptionBn: "চলতি মাসে উপস্থিতির দিনসংখ্যা, লেট এন্ট্রি এবং কাজের মোট ঘণ্টা।" },
          { number: 3, label: "Apply for Leave Action", descriptionBn: "ছুটি নেওয়ার জন্য সরাসরি কারণ ও তারিখ লিখে রিকোয়েস্ট পাঠানোর ফর্ম।" },
          { number: 4, label: "My Payslips Section", descriptionBn: "নিজের বিগত মাসের বেতন ও পে-স্লিপ দেখার এবং ডাউনলোড করার তালিকা।" },
        ],
        availableActionsBn: [
          "কাজে যোগদানের সাথে সাথে 'Clock In' বোতামে চাপ দিয়ে হাজিরা দেওয়া",
          "ছুটির আবেদন পেশ করা এবং ম্যানেজারের অনুমোদনের স্থিতি চেক করা",
          "নিজের মাসিক বেতনের পে-স্লিপ ডাউনলোড করা",
        ],
        crudWorkflows: [
          {
            action: "Process",
            titleBn: "সেলফ-সার্ভিস থেকে হাজিরা দেওয়ার নিয়ম",
            stepsBn: [
              "Self-Service Portal পেজে প্রবেশ করুন।",
              "উপরে থাকা নীল রঙের 'Clock In' বাটনে ক্লিক করুন।",
              "সিস্টেমে বর্তমান সময় সংরক্ষিত হবে। দিনশেষে বের হওয়ার সময় একইভাবে 'Clock Out' চাপুন।",
            ],
          },
          {
            action: "Create",
            titleBn: "ছুটির আবেদন করার নিয়ম",
            stepsBn: [
              "'Request Leave' অপশনে যান।",
              "ছুটির ধরন (যেমন Casual বা Sick Leave) বেছে নিন।",
              "ছুটির শুরু ও শেষের তারিখ এবং কারণ লিখে 'Submit Request' চাপুন।",
            ],
          },
        ],
        tags: ["employee", "self-service", "clock-in", "payslip", "leave", "কর্মী", "হাজিরা", "পে-স্লিপ"],
      },
    ],
  },

  // ── 9. হিসাববিজ্ঞান ও অর্থ (FINANCE) ──
  {
    id: "finance",
    titleEn: "Finance & Accounting",
    titleBn: "হিসাববিজ্ঞান ও অর্থ (Finance & COA)",
    icon: "Landmark",
    descriptionBn: "চার্ট অব অ্যাকাউন্টস, দ্বৈত-দাখিলা জার্নাল এন্ট্রি, ব্যবসায়িক খরচ এবং আর্থিক লাভ-ক্ষতির প্রতিবেদন।",
    pages: [
      {
        id: "finance-accounting",
        titleEn: "Accounting Overview",
        titleBn: "অ্যাকাউন্টিং ওভারভিউ ও সামারি",
        role: "Merchant",
        module: "Finance",
        route: "/store/[storeSlug]/finance/accounting",
        screenshot: "/docs/screenshots/finance-accounting.png",
        summaryBn: "প্রতিষ্ঠানের সম্পদ (Assets), দায় (Liabilities), রাজস্ব (Revenue) এবং ব্যয়ের সামগ্রিক আর্থিক ব্যালেন্স সামারি।",
        howToOpenBn: [
          "সাইডবারে 'Finance & Accounting' এ ক্লিক করুন।",
          "'Accounting Overview' নির্বাচন করুন।",
        ],
        callouts: [
          { number: 1, label: "Financial Health Cards", descriptionBn: "বর্তমান নগদ তহবিল, মোট দায় এবং চলতি মাসের ব্যয়ের সারসংক্ষেপ।" },
          { number: 2, label: "Quick Links", descriptionBn: "চার্ট অব অ্যাকাউন্টস (COA) এবং জার্নাল এন্ট্রিতে যাওয়ার সরাসরি বোতাম।" },
        ],
        availableActionsBn: [
          "আর্থিক স্বাস্থ্য ও ব্যালেন্স একনজরে দেখা",
          "হিসাবের লেজারে দ্রুত নেভিগেট করা",
        ],
        tags: ["finance", "accounting", "ledger", "হিসাববিজ্ঞান", "অর্থ"],
      },
      {
        id: "finance-coa",
        titleEn: "Chart of Accounts (COA)",
        titleBn: "হিসাবের তালিকা (Chart of Accounts)",
        role: "Merchant",
        module: "Finance",
        route: "/store/[storeSlug]/finance/accounting/coa",
        screenshot: "/docs/screenshots/finance-coa.png",
        summaryBn: "অ্যাকাউন্টিংয়ের মৌলিক কাঠামো— যেখানে ক্যাশ, ব্যাংক, দেনাদার, পাওনাদার, বিক্রয় ও খরচের হেড সাজানো থাকে।",
        howToOpenBn: [
          "সাইডবার থেকে 'Finance & Accounting' > 'Chart of Accounts' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Add Account Head Button", descriptionBn: "নতুন ব্যাংক অ্যাকাউন্ট বা ব্যয়ের হেড তৈরি করার বাটন।" },
          { number: 2, label: "COA Tree Structure", descriptionBn: "Assets, Liabilities, Equity, Revenue এবং Expenses এর ক্রমানুযায়ী তালিকা।" },
        ],
        availableActionsBn: [
          "নতুন লেজার হেড তৈরি করা",
          "হেড ভিত্তিক ডেবিট ও ক্রেডিট ব্যালেন্স নিরীক্ষা করা",
        ],
        tags: ["coa", "chart-of-accounts", "assets", "liabilities", "হিসাব"],
      },
      {
        id: "finance-journal",
        titleEn: "Journal Entries",
        titleBn: "জার্নাল এন্ট্রি ও ভাউচার",
        role: "Merchant",
        module: "Finance",
        route: "/store/[storeSlug]/finance/accounting/journal",
        screenshot: "/docs/screenshots/finance-journal.png",
        summaryBn: "দ্বৈত-দাখিলা পদ্ধতিতে ডেবিট ও ক্রেডিটের সমন্বয়ে সাধারণ জার্নাল ও লেনদেনের ভাউচার লিপিবদ্ধ করার পেজ।",
        howToOpenBn: [
          "সাইডবারে 'Finance & Accounting' এর অধীনে 'Journal Entries' এ যান।",
        ],
        callouts: [
          { number: 1, label: "New Journal Entry Button", descriptionBn: "ম্যানুয়াল ডেবিট-ক্রেডিট ভাউচার তৈরির বাটন।" },
          { number: 2, label: "Journal Records Table", descriptionBn: "ভাউচার নম্বর, তারিখ, বিবরণ, ডেবিট অ্যাকাউন্ট, ক্রেডিট অ্যাকাউন্ট এবং পরিমাণ।" },
        ],
        availableActionsBn: [
          "ব্যাংক অ্যাডজাস্টমেন্ট বা স্পেশাল ট্রানজ্যাকশন ভাউচার তৈরি",
          "ডেবিট ও ক্রেডিটের সমতা যাচাই",
        ],
        tags: ["journal", "entries", "voucher", "জার্নাল", "ভাউচার", "ডেবিট", "ক্রেডিট"],
      },
      {
        id: "finance-expenses",
        titleEn: "Business Expenses",
        titleBn: "দৈনিক খরচ ও বিল (Expenses)",
        role: "Merchant",
        module: "Finance",
        route: "/store/[storeSlug]/finance/expenses",
        screenshot: "/docs/screenshots/finance-expenses.png",
        summaryBn: "দোকানের ভাড়া, বিদ্যুৎ বিল, আপ্যায়ন খরচ, ইন্টারনেট বিল ইত্যাদি ব্যবসায়িক দৈনন্দিন খরচের ভাউচার এন্ট্রি।",
        howToOpenBn: [
          "সাইডবার থেকে 'Finance & Accounting' > 'Business Expenses' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Add Expense Button", descriptionBn: "নতুন ব্যয়ের ভাউচার এন্ট্রি দেওয়ার বোতাম।" },
          { number: 2, label: "Expense Table", descriptionBn: "তারিখ, খরচের খাত (Category), পরিমাণ, পেমেন্ট মেথড এবং রসিদের সংযুক্তি।" },
        ],
        availableActionsBn: [
          "দৈনিক বা মাসিক খরচের এন্ট্রি দেওয়া",
          "কোন খাতে সবচেয়ে বেশি ব্যয় হচ্ছে তা বিশ্লেষণ করা",
        ],
        tags: ["expenses", "bills", "cost", "খরচ", "ব্যয়", "বিল"],
      },
    ],
  },

  // ── 10. গ্রোথ ও সিআরএম (GROWTH & CRM) ──
  {
    id: "growth",
    titleEn: "Growth & CRM",
    titleBn: "গ্রোথ, সিআরএম ও মার্কেটিং",
    icon: "Target",
    descriptionBn: "কাস্টমার ডিলস পাইপলাইন, সাপোর্ট টিকিট, কুপন ডিসকাউন্ট ও ট্র্যাকিং পিক্সেল কনফিগারেশন।",
    pages: [
      {
        id: "crm-deals",
        titleEn: "CRM Deals Pipeline",
        titleBn: "সিআরএম পাইপলাইন ও ডিলস",
        role: "Merchant",
        module: "Growth",
        route: "/store/[storeSlug]/crm/deals",
        screenshot: "/docs/screenshots/crm-deals.png",
        summaryBn: "সম্ভাব্য ক্লায়েন্ট বা বড় বাল্ক অর্ডারের সেলস পাইপলাইন (Lead -> Qualified -> Proposal -> Won)।",
        howToOpenBn: [
          "সাইডবার থেকে 'Growth & CRM' > 'CRM Pipeline' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Kanban Pipeline Board", descriptionBn: "ডিলগুলোকে বিভিন্ন ধাপে টেনে এনে স্ট্যাটাস পরিবর্তনের কানবান বোর্ড।" },
          { number: 2, label: "Add Deal Button", descriptionBn: "নতুন সেলস অপরচুনিটি বা সম্ভাব্য ক্লায়েন্ট যুক্ত করার বাটন।" },
        ],
        availableActionsBn: [
          "লিড থেকে সেলস ডিল ট্র্যাক করা",
          "প্রত্যাশিত আয়ের পরিমাণ ও ক্লোজিং তারিখ পর্যবেক্ষণ",
        ],
        tags: ["crm", "deals", "pipeline", "leads", "সিআরএম", "ডিল"],
      },
      {
        id: "support-tickets",
        titleEn: "Support Helpdesk",
        titleBn: "সাপোর্ট হেল্পডেস্ক ও টিকিট",
        role: "Merchant",
        module: "Growth",
        route: "/store/[storeSlug]/support/tickets",
        screenshot: "/docs/screenshots/support-tickets.png",
        summaryBn: "গ্রাহকদের অভিযোগ, প্রশ্ন বা সার্ভিস রিকোয়েস্টের সমাধান করার হেল্পডেস্ক সিস্টেম।",
        howToOpenBn: [
          "সাইডবার থেকে 'Growth & CRM' > 'Support Helpdesk' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Ticket Queue Table", descriptionBn: "টিকিট নম্বর, গ্রাহকের নাম, বিষয়, অগ্রাধিকার (High/Normal) এবং স্ট্যাটাস।" },
          { number: 2, label: "Reply to Customer Action", descriptionBn: "গ্রাহকের বার্তার সরাসরি উত্তর ও টিকিট সমাধান করার বাটন।" },
        ],
        availableActionsBn: [
          "গ্রাহকের প্রশ্নের উত্তর দেওয়া",
          "টিকিটের সমাধান করে 'Closed' হিসেবে মার্ক করা",
        ],
        tags: ["support", "tickets", "helpdesk", "সাপোর্ট", "টিকিট"],
      },
      {
        id: "coupons",
        titleEn: "Coupons & Discounts",
        titleBn: "কুপন কোড ও প্রমোশনাল অফার",
        role: "Merchant",
        module: "Growth",
        route: "/store/[storeSlug]/coupons",
        screenshot: "/docs/screenshots/coupons.png",
        summaryBn: "অনলাইন চেকআউটের জন্য কুপন কোড (যেমন EID20 বা DISCOUNT100) তৈরি ও ব্যবহারের নিয়ম নির্ধারণ।",
        howToOpenBn: [
          "সাইডবারে 'Growth & CRM' > 'Coupons & Discounts' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Create Coupon Button", descriptionBn: "নতুন প্রোমোকোড তৈরির বাটন।" },
          { number: 2, label: "Coupon Registry Table", descriptionBn: "কোড, ডিসকাউন্টের ধরন (Percentage বা Flat BDT), মেয়াদের তারিখ ও ব্যবহারের সীমা।" },
        ],
        availableActionsBn: [
          "নতুন ডিসকাউন্ট কুপন তৈরি ও প্রচার",
          "নির্দিষ্ট সর্বনিম্ন ক্রয়ের শর্ত (Minimum Spend) যুক্ত করা",
        ],
        tags: ["coupons", "discounts", "promo", "কুপন", "ডিসকাউন্ট", "অফার"],
      },
    ],
  },

  // ── 11. অপারেশনস (OPERATIONS) ──
  {
    id: "operations",
    titleEn: "Operations & Workflows",
    titleBn: "অপারেশনস ও অনুমোদন কেন্দ্র",
    icon: "CheckSquare",
    descriptionBn: "ম্যানেজারিয়াল অনুমোদন, টিম টাস্ক তালিকা, কুরিয়ার সংযোগ এবং পেমেন্ট গেটওয়ে সেটআপ।",
    pages: [
      {
        id: "operations-approvals",
        titleEn: "Approval Center",
        titleBn: "অনুমোদন কেন্দ্র (Approvals)",
        role: "Merchant",
        module: "Operations",
        route: "/store/[storeSlug]/operations/approvals",
        screenshot: "/docs/screenshots/operations-approvals.png",
        summaryBn: "পেন্ডিং পারচেজ অর্ডার, ছুটির দরখাস্ত ও স্পেশাল ডিসকাউন্টের কেন্দ্রীয় অনুমোদন ড্যাশবোর্ড।",
        howToOpenBn: [
          "সাইডবার থেকে 'Operations' > 'Approval Center' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Approval Category Tabs", descriptionBn: "ছুটি, পারচেজ অর্ডার বা ব্যয়ের অনুমোদনের বিভাগভিত্তিক ট্যাব।" },
          { number: 2, label: "Batch Approve / Reject Actions", descriptionBn: "একসাথে একাধিক রিকোয়েস্ট অনুমোদন বা প্রত্যাখ্যান করার অ্যাকশন।" },
        ],
        availableActionsBn: [
          "টিমের বিভিন্ন অনুরোধ দ্রুত অনুমোদন দেওয়া",
          "অনুমোদনের ট্র্যাকিং নিশ্চিত করা",
        ],
        tags: ["approvals", "operations", "অনুমোদন", "অপারেশনস"],
      },
      {
        id: "operations-tasks",
        titleEn: "Tasks & Checklists",
        titleBn: "টাস্ক ও কার্যক্রম তালিকা",
        role: "Merchant",
        module: "Operations",
        route: "/store/[storeSlug]/operations/tasks",
        screenshot: "/docs/screenshots/operations-tasks.png",
        summaryBn: "দৈনন্দিন কাজের তালিকা তৈরি, কর্মীদের মাঝে দায়িত্ব বণ্টন এবং কাজের অগ্রগতি ট্র্যাকিং।",
        howToOpenBn: [
          "সাইডবার থেকে 'Operations' > 'Tasks & Workflows' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Create Task Button", descriptionBn: "নতুন কাজের অ্যাসাইনমেন্ট তৈরি করার বাটন।" },
          { number: 2, label: "Task Board", descriptionBn: "To Do, In Progress এবং Completed কলামে সাজানো টাস্কসমূহ।" },
        ],
        availableActionsBn: [
          "টিমের কাজের দায়িত্ব নির্ধারণ ও মনিটরিং",
        ],
        tags: ["tasks", "workflows", "টাস্ক", "কাজ"],
      },
    ],
  },

  // ── 12. ওয়েবসাইট ও থিম (WEBSITE) ──
  {
    id: "website",
    titleEn: "Store Website & Design",
    titleBn: "অনলাইন স্টোর ও ওয়েবসাইট ডিজাইন",
    icon: "Palette",
    descriptionBn: "পাবলিক স্টোরফ্রন্ট কাস্টমাইজেশন, থিম নির্বাচন, ব্র্যান্ডিং রং এবং কাস্টম পেজ ম্যানেজমেন্ট।",
    pages: [
      {
        id: "theme-design",
        titleEn: "Theme & Design Builder",
        titleBn: "থিম ও ব্র্যান্ডিং ডিজাইন",
        role: "Merchant",
        module: "Website",
        route: "/store/[storeSlug]/design",
        screenshot: "/docs/screenshots/theme-design.png",
        summaryBn: "আপনার অনলাইন শপের বাহ্যিক সৌন্দর্য, ব্র্যান্ড কালার, লোগো, হোমপেজ ব্যানার এবং লেআউট সাজানোর পেজ।",
        howToOpenBn: [
          "সাইডবার থেকে 'Store Website' > 'Theme & Design' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Theme Selector", descriptionBn: "আধুনিক রেডিমেড ই-কমার্স থিমের মধ্য থেকে পছন্দের থিম চয়েস।" },
          { number: 2, label: "Brand Color & Typography", descriptionBn: "কোম্পানির প্রাথমিক রং ও ফন্ট নির্ধারণের কন্ট্রোল।" },
          { number: 3, label: "Storefront Live Preview", descriptionBn: "পরিবর্তনগুলো ওয়েবসাইটে কেমন দেখাবে তার রিয়েল-টাইম লাইভ প্রিভিউ।" },
        ],
        availableActionsBn: [
          "স্টোরের ডিজাইন নিজের ব্র্যান্ড অনুযায়ী কাস্টমাইজ করা",
          "হোমপেজের ব্যানার ও প্রমোশনাল সেকশন আপডেট করা",
        ],
        tags: ["theme", "design", "builder", "branding", "থিম", "ডিজাইন", "ওয়েবসাইট"],
      },
      {
        id: "custom-pages",
        titleEn: "Custom Pages & Policies",
        titleBn: "কাস্টম পেজ ও পলিসি পাতা",
        role: "Merchant",
        module: "Website",
        route: "/store/[storeSlug]/pages",
        screenshot: "/docs/screenshots/custom-pages.png",
        summaryBn: "About Us, Contact Us, Privacy Policy এবং Return Policy এর মতো প্রয়োজনীয় পাবলিক পেজ তৈরি ও এডিটের পেজ।",
        howToOpenBn: [
          "সাইডবার থেকে 'Store Website' > 'Custom Pages' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Create Page Button", descriptionBn: "নতুন পেইজ যুক্ত করার বোতাম।" },
          { number: 2, label: "Pages Table", descriptionBn: "পেজের শিরোনাম, স্লাগ (URL) এবং প্রকাশনার স্ট্যাটাস।" },
        ],
        availableActionsBn: [
          "ওয়েবসাইটের জন্য শর্তাবলী বা সাধারণ পেজ লিখে প্রকাশ করা",
        ],
        tags: ["pages", "cms", "policy", "পেজ", "পলিসি"],
      },
    ],
  },

  // ── 13. সিস্টেম ও সেটিংস (SETTINGS) ──
  {
    id: "settings",
    titleEn: "Store Settings & Team",
    titleBn: "স্টোর সেটিংস, টিম ও বিলিং",
    icon: "Settings",
    descriptionBn: "স্টোরের সাধারণ কনফিগারেশন, সদস্য আমন্ত্রণ, রোল পারমিশন এবং সাবস্ক্রিপশন প্ল্যান।",
    pages: [
      {
        id: "store-settings",
        titleEn: "General Store Settings",
        titleBn: "সাধারণ স্টোর সেটিংস",
        role: "Merchant",
        module: "Settings",
        route: "/store/[storeSlug]/settings?section=general",
        screenshot: "/docs/screenshots/store-settings.png",
        summaryBn: "স্টোরের মৌলিক তথ্য, নাম, মুদ্রা (BDT), যোগাযোগের ফোন নম্বর ও সময় অঞ্চল (Timezone) কনফিগার করার স্থান।",
        howToOpenBn: [
          "সাইডবার থেকে 'System & Settings' > 'Store Settings' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Store Name & Contact Inputs", descriptionBn: "প্রতিষ্ঠানের শিরোনাম, অফিশিয়াল ইমেইল ও হোয়াটসঅ্যাপ নম্বর।" },
          { number: 2, label: "Currency & Timezone", descriptionBn: "ডিফল্ট মুদ্রা হিসেবে BDT (৳) ও Asia/Dhaka নির্ধারণ।" },
          { number: 3, label: "Save Changes Button", descriptionBn: "কনফিগারেশন সংরক্ষণ করার বাটন।" },
        ],
        availableActionsBn: [
          "স্টোরের তথ্য আপডেট করা",
          "কাস্টমার সাপোর্টের নম্বর পরিবর্তন করা",
        ],
        tags: ["settings", "store", "profile", "সেটিংস", "কনফিগারেশন"],
      },
      {
        id: "team-permissions",
        titleEn: "Team & Permissions",
        titleBn: "টিম মেম্বার ও পারমিশন (RBAC)",
        role: "Merchant",
        module: "Settings",
        route: "/store/[storeSlug]/members",
        screenshot: "/docs/screenshots/team-permissions.png",
        summaryBn: "টিম মেম্বারদের ইনভাইট পাঠানো এবং ভূমিকা (Manager, Cashier, Employee) অনুযায়ী মডিউল ব্যবহারের অনুমতি নিয়ন্ত্রণ।",
        howToOpenBn: [
          "সাইডবার থেকে 'System & Settings' > 'Team & Permissions' এ ক্লিক করুন।",
        ],
        callouts: [
          { number: 1, label: "Invite Member Button", descriptionBn: "ইমেইলের মাধ্যমে নতুন কর্মীকে স্টোরে যুক্ত করার বাটন।" },
          { number: 2, label: "Team Members Table", descriptionBn: "নাম, ইমেইল, পদবী ও রোল পারমিশনের তালিকা।" },
        ],
        availableActionsBn: [
          "টিম সদস্যের অ্যাক্সেস সীমা নির্ধারণ করা",
          "প্রয়োজনে কোনো সদস্যকে সাময়িক নিষ্ক্রিয় বা অপসারণ করা",
        ],
        tags: ["team", "members", "permissions", "rbac", "টিম", "পারমিশন"],
      },
    ],
  },

  // ── 14. সুপার অ্যাডমিন (SUPER ADMIN) ──
  {
    id: "super-admin",
    titleEn: "Super Admin Platform",
    titleBn: "সুপার অ্যাডমিন প্ল্যাটফর্ম ওভারসাইট",
    icon: "ShieldCheck",
    descriptionBn: "প্ল্যাটফর্মের গ্লোবাল ইউজার, স্টোর টেন্যান্সি, সাবস্ক্রিপশন প্ল্যান এবং সার্বিক সিস্টেম ওভারসাইট।",
    pages: [
      {
        id: "admin-dashboard",
        titleEn: "Super Admin Platform Dashboard",
        titleBn: "সুপার অ্যাডমিন ড্যাশবোর্ড",
        role: "Super Admin",
        module: "Super Admin",
        route: "/admin/dashboard",
        screenshot: "/docs/screenshots/admin-dashboard.png",
        summaryBn: "BornoLand SaaS-এর কেন্দ্রীয় প্ল্যাটফর্ম নিয়ন্ত্রণ কেন্দ্র। এখান থেকে সারা দেশের সমস্ত স্টোর, মোট রেভিনিউ ও সিস্টেম হেলথ পর্যবেক্ষণ করা যায়।",
        howToOpenBn: [
          "Super Admin অ্যাকাউন্ট দিয়ে লগইন করে '/admin/dashboard' এ যান।",
        ],
        callouts: [
          { number: 1, label: "Platform Metrics", descriptionBn: "মোট সক্রিয় স্টোর, মোট গ্রাহক এবং মান্থলি রিকারিং রেভিনিউ (MRR)।" },
          { number: 2, label: "Global Management Navigation", descriptionBn: "Users, Stores, Plans, Subscriptions পরিচালনা করার মেনু।" },
        ],
        availableActionsBn: [
          "প্ল্যাটফর্মের সকল স্টোরের স্বাস্থ্য মনিটর করা",
          "নতুন প্রাইসিং প্ল্যান বা সাবস্ক্রিপশন ফিচার তৈরি করা",
        ],
        tags: ["admin", "superadmin", "platform", "tenants", "অ্যাডমিন", "সুপার অ্যাডমিন"],
      },
    ],
  },
];

export interface TroubleshootingItem {
  issueBn: string;
  causeBn: string;
  solutionBn: string[];
}

export const TROUBLESHOOTING_GUIDE: TroubleshootingItem[] = [
  {
    issueBn: "স্টোরে লগইন করার পর 'Store not found' বা রিডাইরেক্ট সমস্যা হচ্ছে",
    causeBn: "লগইন করা অ্যাকাউন্টটির সাথে কোনো সক্রিয় স্টোর টেন্যান্ট যুক্ত না থাকলে বা সাবডোমেন ভুল টাইপ করলে এই সমস্যা হতে পারে।",
    solutionBn: [
      "প্রথমে http://localhost:3000/workshops পেজে যান।",
      "সেখান থেকে আপনার নির্ধারিত স্টোরটি সিলেক্ট করুন।",
      "যদি স্টোর না থাকে, তবে '+ Create Store' বাটনে ক্লিক করে একটি নতুন স্টোর খুলুন।",
      "ব্রাউজারের ক্যাশ ও কুকি একবার রিফ্রেশ করুন।",
    ],
  },
  {
    issueBn: "পিওএস (POS) কাউন্টারে বারকোড স্ক্যান হচ্ছে না বা প্রোডাক্ট আসছে না",
    causeBn: "পণ্যের এন্ট্রির সময় সঠিক SKU বা বারকোড ফিল্ড পূরণ করা না থাকলে কিংবা স্ক্যানারের ফোকাস অন্য বক্সে থাকলে এমন হতে পারে।",
    solutionBn: [
      "পণ্যটি Products পেজে গিয়ে চেক করুন যে বারকোড/SKU ফিল্ডটি সঠিক আছে কিনা।",
      "পিওএস টার্মিনালের সার্চ বক্সে কার্সার রেখে আবার বারকোড স্ক্যান করুন।",
      "প্রয়োজনে পণ্যের নাম সরাসরি টাইপ করে ম্যানুয়ালি কার্টে যুক্ত করুন।",
    ],
  },
  {
    issueBn: "কর্মীর হাজিরায় 'Clock In' বাটন কাজ করছে না",
    causeBn: "কর্মীর দৈনিক শিফট আগেই শেষ হয়ে থাকলে অথবা কর্মীর অ্যাকাউন্টে সেলফ-সার্ভিস রোল বরাদ্দ না থাকলে এই মেসেজ আসতে পারে।",
    solutionBn: [
      "নিশ্চিত হোন যে লগইন করা প্রোফাইলটি একজন অনুমোদিত কর্মচারীর (Employee Role)।",
      "মার্চেন্ট সেটিংসের HRM > Employees থেকে কর্মীর স্ট্যাটাস 'Active' আছে কিনা চেক করুন।",
    ],
  },
  {
    issueBn: "পার্সেল বুকিং বা ডেলিভারি কুরিয়ারে সাবমিট হচ্ছে না",
    causeBn: "স্টোর সেটিংসে কুরিয়ার এপিআই কি (API Key) বা মার্চেন্ট ক্রেডেনশিয়াল সঠিকভাবে কনফিগার করা না থাকলে বুকিং ব্যর্থ হতে পারে।",
    solutionBn: [
      "Sidebar > Operations > Courier Integrations-এ যান।",
      "আপনার Steadfast বা Pathao মার্চেন্ট API Key এবং Secret Key সঠিক কিনা যাচাই করুন।",
      "গ্রাহকের ডেলিভারি ঠিকানা ও সঠিক মোবাইল নম্বর আছে কিনা পরীক্ষা করুন।",
    ],
  },
];
