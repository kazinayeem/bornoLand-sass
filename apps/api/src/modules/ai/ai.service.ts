export interface GenerateShopRequest {
  storeType: string;
  description: string;
  style?: string;
  language?: "bn" | "en" | string;
  storeName?: string;
  targetAudience?: string;
}

export interface GeneratedSection {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: Record<string, any>;
}

export interface GeneratedShopConfig {
  storeName: string;
  storeType: string;
  themeId: string;
  style: string;
  tagline: string;
  description: string;
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textMuted: string;
      border: string;
    };
    typography: {
      fontFamily: string;
      headingFont: string;
    };
    layout: {
      borderRadius: number;
      shadowSize: string;
      spacing: number;
    };
  };
  sections: GeneratedSection[];
  navigation: {
    items: Array<{ label: string; href: string }>;
  };
  announcement?: {
    enabled: boolean;
    text: string;
  };
}

const ALLOWED_THEME_IDS = [
  "grocery",
  "electronics",
  "fashion",
  "beauty",
  "restaurant",
  "furniture",
  "sports",
  "books",
  "kids",
  "marketplace",
];

const THEME_FALLBACK_MAP: Record<string, string> = {
  grocery: "grocery",
  organic: "grocery",
  food: "restaurant",
  restaurant: "restaurant",
  electronics: "electronics",
  tech: "electronics",
  gadget: "electronics",
  fashion: "fashion",
  clothing: "fashion",
  apparel: "fashion",
  boutique: "fashion",
  beauty: "beauty",
  cosmetics: "beauty",
  skincare: "beauty",
  furniture: "furniture",
  home: "furniture",
  decor: "furniture",
  sports: "sports",
  fitness: "sports",
  gym: "sports",
  books: "books",
  stationery: "books",
  education: "books",
  kids: "kids",
  baby: "kids",
  toy: "kids",
  general: "marketplace",
  marketplace: "marketplace",
};

/**
 * Deterministic fallback generator for when Agent Router is offline or credentials are not yet verified.
 */
export function generateHeuristicShopConfig(req: GenerateShopRequest): GeneratedShopConfig {
  const lang = req.language === "bn" ? "bn" : "en";
  const typeLower = (req.storeType || req.description || "general").toLowerCase();

  let themeId = "marketplace";
  for (const [key, tid] of Object.entries(THEME_FALLBACK_MAP)) {
    if (typeLower.includes(key)) {
      themeId = tid;
      break;
    }
  }

  const isBn = lang === "bn";
  const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (themeId === "grocery") {
    return {
      storeName: req.storeName || (isBn ? "তাজা বাজার" : "FreshBazaar"),
      storeType: "grocery",
      themeId: "grocery",
      style: req.style || "fresh-organic",
      tagline: isBn ? "১০০% খাঁটি ও তাজা অর্গানিক খাদ্যপণ্য" : "100% Organic & Farm Fresh Groceries",
      description: isBn ? "প্রতিদিনের প্রয়োজনীয় তাজা শাকসবজি, ফলমূল ও নিত্যপ্রয়োজনীয় বাজার" : "Fresh daily essentials, fruits, vegetables and organic food delivered to your door.",
      tokens: {
        colors: {
          primary: "#e05a00",
          secondary: "#055c3a",
          accent: "#22c55e",
          background: "#fafafa",
          text: "#0f172a",
          textMuted: "#64748b",
          border: "#e2e8f0",
        },
        typography: { fontFamily: "Inter", headingFont: "Inter" },
        layout: { borderRadius: 16, shadowSize: "sm", spacing: 24 },
      },
      sections: [
        {
          id: genId("hero-slider"),
          type: "hero-slider",
          label: "Organic Hero Slider",
          visible: true,
          props: {
            headline: isBn ? "তাজা শাকসবজি ও অর্গানিক বাজার" : "Fresh Farm Produce & Organic Groceries",
            subheadline: isBn ? "সরাসরি কৃষক থেকে আপনার দ্বারে, ৩০ মিনিটে দ্রুত ডেলিভারি" : "Directly from farm to your kitchen with 30-min express delivery",
            buttonText: isBn ? "এখনই কিনুন" : "Shop Fresh Now",
            buttonLink: "/products",
            badgeText: isBn ? "🌿 ১০০% প্রাকৃতিক" : "🌿 100% Certified Organic",
            badgeColor: "#055c3a",
          },
        },
        {
          id: genId("category-pills"),
          type: "category-pills",
          label: "Fresh Categories",
          visible: true,
          props: {
            title: isBn ? "বাজার ক্যাটাগরি" : "Explore Grocery Categories",
            subtitle: isBn ? "আপনার পছন্দের খাদ্যপণ্য বেছে নিন" : "Select what you need today",
            layout: "pills",
          },
        },
        {
          id: genId("featured-products"),
          type: "featured-products",
          label: "Daily Top Sellers",
          visible: true,
          props: {
            title: isBn ? "আজকের সেরা অফার ও পণ্য" : "Today's Best Picks & Daily Deals",
            subtitle: isBn ? "সর্বোচ্চ মানের যাচাইকৃত খাঁটি বাজার" : "Hand-picked organic essentials with farm guarantee",
            gridColumns: "4",
            limit: "8",
          },
        },
        {
          id: genId("flash-sale-banner"),
          type: "flash-sale-banner",
          label: "Fresh Combo Deals",
          visible: true,
          props: {
            headline: isBn ? "সাপ্তাহিক বাজার কম্বো প্যাকে ৩০% ছাড়!" : "Weekly Grocery Combo - Flat 30% Off!",
            subheadline: isBn ? "চাল, ডাল, তেল ও মসলার স্পেশাল ফ্যামিলি প্যাক" : "Essential kitchen pantry bundles at wholesale pricing",
            buttonText: isBn ? "কম্বো অফার দেখুন" : "Claim Bundle Deal",
            buttonLink: "/products",
            badge: isBn ? "🔥 সীমিত সময়ের অফার" : "🔥 Limited Time Offer",
          },
        },
        {
          id: genId("trust-badges"),
          type: "trust-badges",
          label: "Organic Guarantee Badges",
          visible: true,
          props: {
            badge1Title: isBn ? "৩০ মিনিটে এক্সপ্রেস ডেলিভারি" : "30-Min Fast Delivery",
            badge1Sub: isBn ? "ঢাকা সিটির যেকোনো প্রান্তে" : "Across city with cold storage",
            badge2Title: isBn ? "১০০% খাঁটি পণ্যের নিশ্চয়তা" : "100% Pure & Organic",
            badge2Sub: isBn ? "কোনো রাসায়নিক বা ভেজাল নেই" : "Chemical-free verified quality",
            badge3Title: isBn ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
            badge3Sub: isBn ? "পণ্য দেখে মূল্য পরিশোধের সুবিধা" : "Pay after checking products",
            badge4Title: isBn ? "সহজ রিটার্ন সুবিধা" : "Instant Easy Return",
            badge4Sub: isBn ? "পছন্দ না হলে সাথে সাথে ফেরত" : "No questions asked guarantee",
          },
        },
        {
          id: genId("newsletter-box"),
          type: "newsletter-box",
          label: "Fresh Newsletter",
          visible: true,
          props: {
            title: isBn ? "সাপ্তাহিক অফার ও ভাউচার পেতে সাবস্ক্রাইব করুন" : "Get Weekly Grocery Discounts & Vouchers",
            subtitle: isBn ? "আপনার প্রথম অর্ডারে অতিরিক্ত ১০০ টাকা ছাড় পান" : "Subscribe to get exclusive member deals and discounts",
            buttonText: isBn ? "যুক্ত হোন" : "Subscribe",
            placeholder: isBn ? "আপনার ইমেইল বা ফোন নম্বর দিন" : "Enter your email or phone",
          },
        },
      ],
      navigation: {
        items: [
          { label: isBn ? "হোম" : "Home", href: "/" },
          { label: isBn ? "সব পণ্য" : "All Products", href: "/products" },
          { label: isBn ? "শাকসবজি" : "Vegetables", href: "/category/vegetables" },
          { label: isBn ? "ফলমূল" : "Fruits", href: "/category/fruits" },
          { label: isBn ? "কম্বো অফার" : "Offers", href: "/products" },
        ],
      },
      announcement: {
        enabled: true,
        text: isBn ? "🚚 ১০০০ টাকার অর্ডারে ফ্রি হোম ডেলিভারি! কোড: FRESH100" : "🚚 Free Delivery on orders over $30! Use Code: FRESHFREE",
      },
    };
  }

  if (themeId === "electronics") {
    return {
      storeName: req.storeName || (isBn ? "টেক মাস্টার" : "TechVibe Gadgets"),
      storeType: "electronics",
      themeId: "electronics",
      style: req.style || "tech-dark",
      tagline: isBn ? "অরিজিনাল গ্যাজেট ও লেটেস্ট টেক এক্সেসরিজ" : "Official Gadgets, Smart Devices & PC Components",
      description: isBn ? "স্মার্টফোন, ল্যাপটপ, স্মার্টওয়াচ এবং প্রিমিয়াম গ্যাজেট স্টোর" : "Premium tech shop with official brand warranties and latest gadget drops.",
      tokens: {
        colors: {
          primary: "#2563eb",
          secondary: "#06b6d4",
          accent: "#38bdf8",
          background: "#09090b",
          text: "#f8fafc",
          textMuted: "#94a3b8",
          border: "#1e293b",
        },
        typography: { fontFamily: "Outfit", headingFont: "Outfit" },
        layout: { borderRadius: 12, shadowSize: "md", spacing: 24 },
      },
      sections: [
        {
          id: genId("hero-slider"),
          type: "hero-slider",
          label: "Tech Hero Slider",
          visible: true,
          props: {
            headline: isBn ? "লেটেস্ট ফ্ল্যাগশিপ গ্যাজেট ও অ্যাক্সেসরিজ" : "Next-Gen Flagship Gadgets & Tech",
            subheadline: isBn ? "১০০% অফিশিয়াল ওয়ারেন্টি ও সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি" : "Official brand warranty with high-speed express nationwide delivery",
            buttonText: isBn ? "গ্যাজেট দেখুন" : "Explore Flagships",
            buttonLink: "/products",
            badgeText: isBn ? "⚡ নতুন অ্যারাইভাল" : "⚡ New Drops 2026",
          },
        },
        {
          id: genId("category-grid"),
          type: "category-grid",
          label: "Tech Categories",
          visible: true,
          props: {
            title: isBn ? "জনপ্রিয় টেক ক্যাটাগরি" : "Top Tech Categories",
            subtitle: isBn ? "স্মার্ট ডিভাইস থেকে পিসি পার্টস" : "From smart devices to gaming components",
            gridColumns: "4",
          },
        },
        {
          id: genId("featured-products"),
          type: "featured-products",
          label: "Featured Gadgets",
          visible: true,
          props: {
            title: isBn ? "ট্রেন্ডিং ও টপ সেলিং গ্যাজেট" : "Trending & Best Selling Tech",
            subtitle: isBn ? "অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি সম্বলিত গ্যাজেট" : "Verified genuine devices with manufacturer warranty",
            gridColumns: "4",
            limit: "8",
          },
        },
        {
          id: genId("flash-sale-banner"),
          type: "flash-sale-banner",
          label: "Mega Flash Sale",
          visible: true,
          props: {
            headline: isBn ? "স্মার্টওয়াচ ও ইয়ারবাডসে মেগা ফ্ল্যাশ সেল!" : "Smartwatch & Earbuds Mega Flash Sale!",
            subheadline: isBn ? "সর্বোচ্চ ৫০% পর্যন্ত ইনস্ট্যান্ট ডিসকাউন্ট" : "Get up to 50% instant discount on premium audio gear",
            buttonText: isBn ? "ফ্ল্যাশ ডিল নিন" : "Shop Flash Sale",
            buttonLink: "/products",
          },
        },
        {
          id: genId("trust-badges"),
          type: "trust-badges",
          label: "Tech Warranty Badges",
          visible: true,
          props: {
            badge1Title: isBn ? "১০০% অফিশিয়াল প্রোডাক্ট" : "100% Genuine Products",
            badge1Sub: isBn ? "অথোরাইজড ডিস্ট্রিবিউটর পার্টনার" : "Direct authorized distribution",
            badge2Title: isBn ? "অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি" : "Official Warranty",
            badge2Sub: isBn ? "১ থেকে ৩ বছর পর্যন্ত রিপ্লেসমেন্ট" : "Comprehensive brand warranty support",
            badge3Title: isBn ? "দ্রুততম ডেলিভারি" : "Express Delivery",
            badge3Sub: isBn ? "২৪-৪৮ ঘণ্টার মধ্যে সারা দেশে" : "Safe insured delivery",
            badge4Title: isBn ? "সহজ ইএমআই সুবিধা" : "0% EMI Available",
            badge4Sub: isBn ? "সব প্রধান ক্রেডিট কার্ডে" : "Up to 12 months EMI facility",
          },
        },
      ],
      navigation: {
        items: [
          { label: isBn ? "হোম" : "Home", href: "/" },
          { label: isBn ? "সব গ্যাজেট" : "All Gadgets", href: "/products" },
          { label: isBn ? "স্মার্টওয়াচ" : "Smartwatches", href: "/category/smartwatches" },
          { label: isBn ? "অডিও" : "Audio", href: "/category/audio" },
          { label: isBn ? "অফার" : "Deals", href: "/products" },
        ],
      },
      announcement: {
        enabled: true,
        text: isBn ? "⚡ মেগা টেক ডিল! যেকোনো গ্যাজেট অর্ডারে ফ্রি ডেলিভারি!" : "⚡ Flash Sale Live: Extra 10% Off on Audio Gear!",
      },
    };
  }

  if (themeId === "fashion") {
    return {
      storeName: req.storeName || (isBn ? "লাক্সারি বুটিক" : "Luxe Attire"),
      storeType: "fashion",
      themeId: "fashion",
      style: req.style || "luxury",
      tagline: isBn ? "এক্সক্লুসিভ ফ্যাশন ও প্রিমিয়াম লাইফস্টাইল" : "Exclusive High Fashion & Modern Lifestyle",
      description: isBn ? "নতুন মৌসুমের ট্রেন্ডি পোশাক, প্রিমিয়াম শাড়ি, পাঞ্জাবি ও লাইফস্টাইল কালেকশন" : "Curated designer apparel, luxury wear and timeless fashion collections.",
      tokens: {
        colors: {
          primary: "#18181b",
          secondary: "#be185d",
          accent: "#fb7185",
          background: "#ffffff",
          text: "#18181b",
          textMuted: "#71717a",
          border: "#e4e4e7",
        },
        typography: { fontFamily: "Playfair Display", headingFont: "Playfair Display" },
        layout: { borderRadius: 8, shadowSize: "sm", spacing: 28 },
      },
      sections: [
        {
          id: genId("hero-slider"),
          type: "hero-slider",
          label: "Fashion Editorial Hero",
          visible: true,
          props: {
            headline: isBn ? "নতুন মৌসুমের প্রিমিয়াম কালেকশন" : "New Season Luxury Lookbook 2026",
            subheadline: isBn ? "অভিজাত ডিজাইন ও প্রিমিয়াম ফ্যাব্রিকের অপূর্ব সমন্বয়" : "Elegance redefined with handcrafted fabrics and designer aesthetics",
            buttonText: isBn ? "কালেকশন দেখুন" : "Explore Lookbook",
            buttonLink: "/products",
            badgeText: isBn ? "✨ লিমিটেড এডিশন" : "✨ Limited Edition",
          },
        },
        {
          id: genId("category-grid"),
          type: "category-grid",
          label: "Style Collections",
          visible: true,
          props: {
            title: isBn ? "সিগনেচার কালেকশন" : "Signature Collections",
            subtitle: isBn ? "প্রতিটি মুহূর্তের জন্য আকর্ষণীয় পোশাক" : "Curated styles for every occasion",
            gridColumns: "3",
          },
        },
        {
          id: genId("featured-products"),
          type: "featured-products",
          label: "New Arrivals",
          visible: true,
          props: {
            title: isBn ? "নতুন আগমনী ফ্যাশন" : "Trending New Arrivals",
            subtitle: isBn ? "সর্বাধুনিক ট্রেন্ডের সেরা নির্বাচন" : "Handcrafted pieces designed for elegance",
            gridColumns: "4",
            limit: "8",
          },
        },
        {
          id: genId("flash-sale-banner"),
          type: "flash-sale-banner",
          label: "Exclusive Season Sale",
          visible: true,
          props: {
            headline: isBn ? "সিজনাল ফ্যাশন ফেস্টিভালে ৩০% ছাড়!" : "Mid-Season Fashion Fest - Flat 30% Off",
            subheadline: isBn ? "নির্বাচিত প্রিমিয়াম ডিজাইনে বিশেষ ডিসকাউন্ট" : "Exclusive member discounts on signature collections",
            buttonText: isBn ? "অফার উপভোগ করুন" : "Shop Collection",
            buttonLink: "/products",
          },
        },
        {
          id: genId("trust-badges"),
          type: "trust-badges",
          label: "Luxe Guarantees",
          visible: true,
          props: {
            badge1Title: isBn ? "প্রিমিয়াম ফ্যাব্রিক" : "Premium Craftsmanship",
            badge1Sub: isBn ? "১০০% খাঁটি প্রিমিয়াম ফেব্রিক" : "Hand-selected luxury fabrics",
            badge2Title: isBn ? "ফ্রি সাইজ এক্সচেঞ্জ" : "Complimentary Exchanges",
            badge2Sub: isBn ? "৭ দিনের মধ্যে সহজ এক্সচেঞ্জ" : "Hassle-free 7-day exchanges",
            badge3Title: isBn ? "লাক্সারি গিফট প্যাকেজিং" : "Luxury Gift Packaging",
            badge3Sub: isBn ? "প্রতিটি অর্ডারে প্রিমিয়াম বক্স" : "Complimentary custom box",
            badge4Title: isBn ? "সারা দেশে ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
            badge4Sub: isBn ? "দেখে বুঝে নেওয়ার সুবিধা" : "Secure nationwide payment",
          },
        },
      ],
      navigation: {
        items: [
          { label: isBn ? "হোম" : "Home", href: "/" },
          { label: isBn ? "কালেকশন" : "Collections", href: "/products" },
          { label: isBn ? "নতুন কালেকশন" : "New Arrivals", href: "/products" },
          { label: isBn ? "অফার" : "Sale", href: "/products" },
        ],
      },
      announcement: {
        enabled: true,
        text: isBn ? "✨ নতুন কালেকশন উন্মোচিত! প্রথম অর্ডারে ১০% ছাড় কোড: LUXE10" : "✨ New Autumn Luxury Drop is Live. Use code LUXE10 for 10% Off",
      },
    };
  }

  // Default General / Marketplace
  return {
    storeName: req.storeName || (isBn ? "প্রাইম বাজার" : "PrimeStore"),
    storeType: req.storeType || "marketplace",
    themeId: "marketplace",
    style: req.style || "modern",
    tagline: isBn ? "সব পণ্যের নির্ভরযোগ্য অনলাইন শপ" : "Your All-in-One Premier Online Marketplace",
    description: isBn ? "সেরা মূল্যে সেরা ব্র্যান্ডের হাজারো পণ্য নিয়ে আপনার বিশ্বস্ত প্ল্যাটফর্ম" : "Shop trending electronics, fashion, home essentials and daily favorites.",
    tokens: {
      colors: {
        primary: "#0284c7",
        secondary: "#ef4444",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#0f172a",
        textMuted: "#64748b",
        border: "#e2e8f0",
      },
      typography: { fontFamily: "Inter", headingFont: "Inter" },
      layout: { borderRadius: 14, shadowSize: "sm", spacing: 24 },
    },
    sections: [
      {
        id: genId("hero-slider"),
        type: "hero-slider",
        label: "Marketplace Mega Hero",
        visible: true,
        props: {
          headline: isBn ? "সেরা ব্র্যান্ডের মেগা অফার ও ডিসকাউন্ট" : "Mega Department Deals & Top Brands",
          subheadline: isBn ? "হাজারো পণ্যে অবিশ্বাস্য ছাড় ও দ্রুততম ক্যাশ অন ডেলিভারি" : "Discover thousands of curated products at unbeatable prices",
          buttonText: isBn ? "শুরু করুন" : "Shop Deals Now",
          buttonLink: "/products",
          badgeText: isBn ? "🔥 মেগা ক্যাম্পেইন" : "🔥 Hot Campaign",
        },
      },
      {
        id: genId("category-grid"),
        type: "category-grid",
        label: "Shop By Department",
        visible: true,
        props: {
          title: isBn ? "ক্যাটাগরি অনুযায়ী শপিং করুন" : "Shop by Category",
          subtitle: isBn ? "আপনার প্রয়োজনীয় পণ্য দ্রুত খুঁজে নিন" : "Browse all popular departments",
          gridColumns: "4",
        },
      },
      {
        id: genId("featured-products"),
        type: "featured-products",
        label: "Trending Products",
        visible: true,
        props: {
          title: isBn ? "সর্বাধিক বিক্রীত পণ্য" : "Trending Best Sellers",
          subtitle: isBn ? "গ্রাহকদের সর্বোচ্চ রেটিংপ্রাপ্ত কালেকশন" : "Top rated by thousands of satisfied customers",
          gridColumns: "4",
          limit: "8",
        },
      },
      {
        id: genId("flash-sale-banner"),
        type: "flash-sale-banner",
        label: "Daily Flash Sale",
        visible: true,
        props: {
          headline: isBn ? "আজকের মেগা ফ্ল্যাশ সেল — ৫০% পর্যন্ত ছাড়!" : "Today's Mega Flash Deals — Up to 50% Off!",
          subheadline: isBn ? "স্টক শেষ হওয়ার আগেই লুফে নিন আপনার পছন্দের পণ্য" : "Grab the hottest deals before timer expires",
          buttonText: isBn ? "ফ্ল্যাশ সেল দেখুন" : "View All Deals",
          buttonLink: "/products",
        },
      },
      {
        id: genId("trust-badges"),
        type: "trust-badges",
        label: "Marketplace Trust Guarantees",
        visible: true,
        props: {
          badge1Title: isBn ? "দ্রুততম ডেলিভারি" : "Super Fast Delivery",
          badge1Sub: isBn ? "সারা বাংলাদেশে ঘরে বসে ডেলিভারি" : "Nationwide doorstep delivery",
          badge2Title: isBn ? "১০০% নিরাপদ পেমেন্ট" : "100% Safe Payments",
          badge2Sub: isBn ? "ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট" : "COD & all major payment methods",
          badge3Title: isBn ? "সহজ রিটার্ন পলিসি" : "7-Day Return Policy",
          badge3Sub: isBn ? "কোনো ঝামেলা ছাড়াই পণ্য ফেরত" : "Hassle-free easy returns",
          badge4Title: isBn ? "২৪/৭ কাস্টমার সাপোর্ট" : "24/7 Dedicated Support",
          badge4Sub: isBn ? "যেকোনো সহায়তায় আমরা পাশে আছি" : "Friendly customer care anytime",
        },
      },
      {
        id: genId("newsletter-box"),
        type: "newsletter-box",
        label: "VIP Discount Newsletter",
        visible: true,
        props: {
          title: isBn ? "ডিসকাউন্ট ও সিক্রেট ভাউচার পেতে সাবস্ক্রাইব করুন" : "Subscribe for Flash Deals & Secret Coupons",
          subtitle: isBn ? "নতুন অফার এবং ডিসকাউন্ট সবার আগে জানতে আমাদের সাথে থাকুন" : "Join over 50,000+ smart shoppers receiving weekly deals",
          buttonText: isBn ? "সাবস্ক্রাইব" : "Join VIP Club",
          placeholder: isBn ? "আপনার ইমেইল বা ফোন" : "Enter your email address",
        },
      },
    ],
    navigation: {
      items: [
        { label: isBn ? "হোম" : "Home", href: "/" },
        { label: isBn ? "সব পণ্য" : "All Products", href: "/products" },
        { label: isBn ? "ফ্ল্যাশ সেল" : "Flash Deals", href: "/products" },
        { label: isBn ? "ক্যাটাগরি" : "Categories", href: "/categories" },
      ],
    },
    announcement: {
      enabled: true,
      text: isBn ? "🎉 মেগা ক্যাম্পেইন লাইভ! ফ্রি হোম ডেলিভারি পেতে কোড ব্যবহার করুন: FREESHIP" : "🎉 Mega Sale is Live! Use code FREESHIP for Free Delivery on all orders",
    },
  };
}

/**
 * Call Agent Router API with strict system instructions and structured JSON response.
 */
export async function generateShopWithAi(req: GenerateShopRequest): Promise<GeneratedShopConfig> {
  const apiKey = process.env.AGENT_ROUTER_API_KEY || "";
  const baseUrl = (process.env.AGENT_ROUTER_BASE_URL || "https://api.agentrouter.org/v1").replace(/\/+$/, "");
  const model = process.env.AGENT_ROUTER_MODEL || "anthropic/claude-3.5-sonnet";

  const startTime = Date.now();
  console.log(`[AI Shop Builder] Request received:`, {
    storeName: req.storeName || "Unnamed Store",
    storeType: req.storeType,
    style: req.style || "Modern",
    language: req.language || "bn",
    descriptionPreview: req.description?.slice(0, 80) + (req.description?.length > 80 ? "..." : ""),
    model,
    hasApiKey: Boolean(apiKey && apiKey !== "mock-key"),
  });

  if (!apiKey || apiKey === "mock-key") {
    console.log(`[AI Shop Builder] No external API key provided. Using built-in heuristic generator.`);
    const result = generateHeuristicShopConfig(req);
    console.log(`[AI Shop Builder] Heuristic generated theme "${result.themeId}" with ${result.sections.length} sections in ${Date.now() - startTime}ms.`);
    return result;
  }

  const isBn = req.language === "bn";
  const systemPrompt = `You are an expert e-commerce storefront architect and conversion-rate optimization (CRO) designer specializing in modern online stores and the Bangladesh & international e-commerce markets.

Your task is to generate a complete, high-converting, professional storefront configuration based on the user's store description.

Allowed Theme IDs (Choose the best match):
- "grocery": Grocery, organic, superstore, fruits, vegetables, food pantry
- "electronics": Tech, gadgets, mobile, computers, gaming, appliances
- "fashion": Clothing, apparel, lifestyle, boutique, saree, panjabi, luxury
- "beauty": Cosmetics, skincare, makeup, wellness, personal care
- "restaurant": Fast food, bakery, cafe, restaurant, takeout
- "furniture": Home decor, living room, interior, woodwork, office
- "sports": Fitness, gym, athletics, activewear, outdoor gear
- "books": Bookstores, stationery, publications, education
- "kids": Baby products, toys, children clothing, maternal
- "marketplace": General multi-category store, department store

Allowed Section Types (Choose 4 to 6 relevant sections):
- "hero-slider": Main banner with headline, subheadline, CTA button, badge
- "hero-banner": Static hero banner
- "category-grid": Multi-column visual category cards
- "category-pills": Pill-shaped quick category filters
- "featured-products": Grid of top products with headline
- "flash-sale-banner": Promotional countdown discount block
- "combo-deals": Bundle packaging offer section
- "trust-badges": 4 trust/guarantee badges (Delivery, Warranty, Payment, Support)
- "brand-slider": Partner brand logos
- "testimonials-grid": Customer social proof reviews
- "newsletter-box": Lead capture newsletter box
- "faq-accordion": FAQ list for customer questions
- "feature-list": Value propositions list

Output Language:
If language is "bn", ALL user-facing text (headlines, subheadlines, button labels, badge texts, descriptions) MUST be written in natural, fluent, highly professional Bengali (বাংলা).
If language is "en", write in polished English.

OUTPUT REQUIREMENT:
You must output ONLY a single valid, raw JSON object conforming exactly to this structure with NO markdown codeblocks, NO commentary, NO explanations:
{
  "storeName": "String",
  "storeType": "String",
  "themeId": "one of the allowed theme IDs",
  "style": "minimal | modern | premium | luxury | bold | clean | dark | colorful",
  "tagline": "String",
  "description": "String",
  "tokens": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex",
      "textMuted": "#hex",
      "border": "#hex"
    },
    "typography": {
      "fontFamily": "Inter | Outfit | Playfair Display | Plus Jakarta Sans | Quicksand | Merriweather",
      "headingFont": "Inter | Outfit | Playfair Display | Plus Jakarta Sans | Quicksand | Merriweather"
    },
    "layout": {
      "borderRadius": 12,
      "shadowSize": "sm | md | lg",
      "spacing": 24
    }
  },
  "sections": [
    {
      "id": "unique-id",
      "type": "valid-section-type",
      "label": "Section Title",
      "visible": true,
      "props": {
        "headline": "String",
        "subheadline": "String",
        "buttonText": "String",
        "buttonLink": "/products",
        "badgeText": "String",
        "title": "String",
        "subtitle": "String",
        "gridColumns": "4",
        "limit": "8"
      }
    }
  ],
  "navigation": {
    "items": [
      { "label": "String", "href": "/" }
    ]
  },
  "announcement": {
    "enabled": true,
    "text": "String"
  }
}`;

  const userPrompt = `Generate a complete storefront configuration:
Store Name: ${req.storeName || "Auto"}
Store Type: ${req.storeType}
Description / Requirements: ${req.description}
Preferred Style: ${req.style || "Modern"}
Language: ${isBn ? "Bengali (বাংলা)" : "English"}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    console.log(`[AI Shop Builder] Calling Agent Router endpoint: ${baseUrl}/chat/completions`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal as any,
    });

    clearTimeout(timeout);
    console.log(`[AI Shop Builder] Agent Router response status: ${response.status} in ${Date.now() - startTime}ms`);

    if (!response.ok) {
      console.warn(`[AI Shop Builder] Agent Router HTTP error ${response.status}. Using heuristic fallback.`);
      return generateHeuristicShopConfig(req);
    }

    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.warn(`[AI Shop Builder] Empty content in Agent Router response. Using heuristic fallback.`);
      return generateHeuristicShopConfig(req);
    }

    // Extract JSON cleanly
    let parsed: any;
    try {
      const cleanJson = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        console.warn(`[AI Shop Builder] Could not parse JSON from model output. Using heuristic fallback.`);
        return generateHeuristicShopConfig(req);
      }
    }

    // Sanitize theme ID
    if (!ALLOWED_THEME_IDS.includes(parsed.themeId)) {
      parsed.themeId = THEME_FALLBACK_MAP[parsed.themeId] || "marketplace";
    }

    // Sanitize sections
    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      const fallback = generateHeuristicShopConfig(req);
      parsed.sections = fallback.sections;
    } else {
      parsed.sections = parsed.sections.map((sec: any) => ({
        id: sec.id || `${sec.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: sec.type || "featured-products",
        label: sec.label || sec.type,
        visible: sec.visible !== false,
        props: sec.props || {},
      }));
    }

    console.log(`[AI Shop Builder] Successfully validated AI configuration for theme "${parsed.themeId}" with ${parsed.sections.length} sections in ${Date.now() - startTime}ms.`);
    return parsed as GeneratedShopConfig;
  } catch (error: any) {
    console.error("[AI Shop Builder] Exception calling Agent Router API:", error?.message || error);
    return generateHeuristicShopConfig(req);
  }
}
