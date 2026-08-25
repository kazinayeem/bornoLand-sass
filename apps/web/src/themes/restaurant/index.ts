import type { ThemeDefinition } from "../types";

export const RESTAURANT_THEME: ThemeDefinition = {
  id: "restaurant",
  name: "Restaurant & Food Delivery",
  slug: "restaurant",
  description: "A mouth-watering, high-conversion theme built for cloud kitchens, restaurants, bakeries, and food delivery businesses with fast menu ordering, combos, and chef specials.",
  category: "restaurant",
  previewImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Restaurant", "Food", "Delivery", "Cloud Kitchen", "Burger", "Pizza", "Bakery"],

  tokens: {
    colors: {
      primary: "#dc2626", // Savory crimson red
      secondary: "#78350f", // Roasted amber brown
      background: "#fffdfa", // Warm cream background
      surface: "#ffffff",
      text: "#1c1917", // Warm charcoal
      textMuted: "#78716c",
      border: "#fde047",
      accent: "#ea580c",
      accentHover: "#c2410c",
      badgeBg: "#fef2f2",
      badgeText: "#b91c1c",
      headerBg: "#ffffff",
      headerText: "#1c1917",
      footerBg: "#1c1917", // Dark charcoal
      footerText: "#f5f5f4",
    },
    typography: {
      fontFamily: "'Outfit', 'Hind Siliguri', sans-serif",
      headingFont: "'Outfit', 'Hind Siliguri', sans-serif",
      bodyFont: "'Outfit', 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1280px",
      borderRadius: 18, // Rounded appetizing cards
      shadowSize: "md",
      spacing: 24,
      gridGap: "20px",
    },
    cards: {
      productCardStyle: "food",
      categoryCardStyle: "food-round",
      showBadges: true,
      showRatings: true,
      showAddToCart: true,
      showWishlist: false,
      showQuickView: true,
    },
  },

  header: {
    layout: "standard",
    showAnnouncement: true,
    announcementText: "🍔 ৩০-৪৫ মিনিটে গরম খাবার হোম ডেলিভারি | ক্যাশ অন ডেলিভারি এভেইলেবল",
    announcementBg: "#dc2626",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "বার্গার, পিজ্জা, বিরিয়ানি কিংবা প্ল্যাটার খুঁজুন...",
    showWishlist: false,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 44,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "কম্বো অফার", href: "/combos", icon: "Flame" },
      { label: "শেফস স্পেশাল", href: "/chef-specials", icon: "Utensils" },
      { label: "লাইভ ট্র্যাকিং", href: "/order-tracking", icon: "Clock" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আমরা প্রতিদিন তাজা উপকরণ দিয়ে স্বাস্থ্যসম্মত ও সুস্বাদু খাবার প্রস্তুত করে দ্রুততম সময়ে আপনার টেবিলে পৌঁছে দিই।",
    hotline: "09613-554433",
    email: "orders@bornoland-food.com",
    address: "প্লট #১২, রোড #০২, মিরপুর-১১, ঢাকা-১২১৬",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Food. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "restaurant-hero",
      type: "countdown-hero",
      label: "Savory Food Hero with Live Timer",
      visible: true,
      props: {
        headline: "গরম ও তাজা খাবারের তৃপ্তি",
        subheadline: "শেফের তৈরি সেরা স্বাদের বিরিয়ানি, সিগনেচার বার্গার ও সুস্বাদু প্ল্যাটার",
        buttonText: "মেনু দেখুন ও অর্ডার করুন",
        buttonLink: "/shop",
        secondaryButtonText: "আজকের স্পেশাল ডিল",
        secondaryButtonLink: "/categories",
        heroHeight: "md",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80",
        overlayColor: "rgba(28, 25, 23, 0.45)",
        textAlignment: "left",
      },
    },
    {
      id: "restaurant-categories",
      type: "category-grid",
      label: "Food Menu Categories",
      visible: true,
      props: {
        title: "মেনু ক্যাটাগরি",
        subtitle: "আপনার পছন্দের খাবার নির্বাচন করুন",
        gridColumns: "6",
        cardStyle: "food-round",
        showProductCount: "true",
      },
    },
    {
      id: "restaurant-combos",
      type: "combo-deals",
      label: "Hot Combo Packs",
      visible: true,
      props: {
        title: "জনপ্রিয় কম্বো ও ফ্যামিলি প্যাক",
        subtitle: "অবিশ্বাস্য ছাড়ে পরিবারের সাথে উপভোগ করুন সেরা খাবার",
        buttonText: "কম্বো অর্ডার করুন",
      },
    },
    {
      id: "restaurant-popular",
      type: "featured-products",
      label: "Chef's Popular Dishes",
      visible: true,
      props: {
        title: "শেফের বিশেষ মেনু আইটেম",
        subtitle: "আজকের সবচেয়ে জনপ্রিয় ও বেশি অর্ডার হওয়া খাবার",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "restaurant-why-choose",
      type: "why-choose-us",
      label: "Fast & Fresh Delivery Guarantee",
      visible: true,
      props: {
        title: "কেন আমাদের খাবার বেছে নেবেন?",
        subtitle: "১০০% স্বাস্থ্যকর উপকরণ ও নিরাপদ প্যাকেজিংয়ের নিশ্চয়তা",
      },
    },
  ],

  supportedSections: [
    "countdown-hero", "slider-hero", "split-hero", "category-grid", "combo-deals",
    "featured-products", "discount-banner", "why-choose-us", "testimonials", "newsletter"
  ],

  productCardVariant: "food",
  categoryCardVariant: "food-round",
};
