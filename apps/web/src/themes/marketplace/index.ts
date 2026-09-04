import type { ThemeDefinition } from "../types";

export const MARKETPLACE_THEME: ThemeDefinition = {
  id: "marketplace",
  name: "General Marketplace",
  slug: "marketplace",
  description: "A comprehensive, high-volume multi-category marketplace theme designed for general retail stores, department supermarkets, and multi-vendor malls with flash sales and mega menus.",
  category: "marketplace",
  previewImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Marketplace", "General", "Mall", "Retail", "Superstore", "Flash Deals", "Multi-Category"],

  tokens: {
    colors: {
      primary: "#0284c7", // Marketplace electric blue
      secondary: "#f59e0b", // Warm gold amber
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
      accent: "#ef4444", // Flash sale deal red
      accentHover: "#dc2626",
      badgeBg: "#fee2e2",
      badgeText: "#b91c1c",
      headerBg: "#ffffff",
      headerText: "#0f172a",
      footerBg: "#0f172a", // Midnight navy
      footerText: "#f1f5f9",
    },
    typography: {
      fontFamily: "Inter, 'Hind Siliguri', sans-serif",
      headingFont: "Inter, 'Hind Siliguri', sans-serif",
      bodyFont: "Inter, 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1320px",
      borderRadius: 12,
      shadowSize: "sm",
      spacing: 24,
      gridGap: "18px",
    },
    cards: {
      productCardStyle: "marketplace",
      categoryCardStyle: "marketplace-grid",
      showBadges: true,
      showRatings: true,
      showAddToCart: true,
      showWishlist: true,
      showQuickView: true,
    },
  },

  header: {
    layout: "standard",
    showAnnouncement: true,
    announcementText: "🔥 মেগা শপিং ফেস্টিভ্যাল! প্রতিদিন আকর্ষণীয় ফ্ল্যাশ সেল ও সারাদেশে ফ্রি ডেলিভারি",
    announcementBg: "#0284c7",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "যেকোনো ব্র্যান্ড, পণ্য কিংবা ক্যাটাগরি খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 44,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "ফ্ল্যাশ ডিল", href: "/flash-deals", icon: "Flame" },
      { label: "টপ ব্র্যান্ডস", href: "/brands", icon: "Award" },
      { label: "ডেইলি অফার", href: "/offers", icon: "Percent" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আমরা লক্ষাধিক আসল পণ্যের সমাহারে আপনার ঘরের দরজায় বিশ্বস্ততার সাথে অনলাইন শপিং অভিজ্ঞতা পৌঁছে দিচ্ছি।",
    hotline: "09613-998877",
    email: "support@bornoland-marketplace.com",
    address: "লেভেল 5, বসুন্ধরা সিটি শপিং কমপ্লেক্স, পান্থপথ, ঢাকা-1205",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Marketplace. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "marketplace-hero",
      type: "flash-sale-hero",
      label: "Mega Marketplace Flash Deal Hero",
      visible: true,
      props: {
        headline: "সবার জন্য সেরা ডিল ও মেগা ডিসকাউন্ট",
        subheadline: "ইলেকট্রনিক্স, ফ্যাশন, গ্রোসারি, হোম অ্যাপ্লায়েন্স সহ লক্ষাধিক পণ্যের বিশাল কালেকশন",
        buttonText: "মেগা ডিল দেখুন",
        buttonLink: "/shop",
        secondaryButtonText: "সকল ক্যাটাগরি",
        secondaryButtonLink: "/categories",
        heroHeight: "md",
        imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&q=80",
        overlayColor: "rgba(15, 23, 42, 0.4)",
        textAlignment: "left",
      },
    },
    {
      id: "marketplace-categories",
      type: "category-grid",
      label: "Top Departments & Categories",
      visible: true,
      props: {
        title: "জনপ্রিয় ডিপার্টমেন্টসমূহ",
        subtitle: "আপনার প্রয়োজনীয় পণ্য দ্রুত খুঁজে নিন",
        gridColumns: "6",
        cardStyle: "card",
        showProductCount: "true",
      },
    },
    {
      id: "marketplace-flash-sale",
      type: "flash-sale",
      label: "Daily Flash Sale Grid",
      visible: true,
      props: {
        title: "আজকের সেরা ফ্ল্যাশ ডিল",
        subtitle: "সীমিত সময়ের জন্য অবিশ্বাস্য ডিসকাউন্ট",
        gridColumns: "4",
        productCount: "4",
        showBadges: "true",
        showRatings: "true",
      },
    },
    {
      id: "marketplace-trending",
      type: "trending-products",
      label: "Trending Marketplace Items",
      visible: true,
      props: {
        title: "সবচেয়ে বেশি বিক্রিত ও ট্রেন্ডিং পণ্য",
        subtitle: "গ্রাহকদের নির্ভরযোগ্য ও সর্বোচ্চ পছন্দের পণ্যসমূহ",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "marketplace-brands",
      type: "brand-showcase",
      label: "Official Authorized Mall Brands",
      visible: true,
      props: {
        title: "অফিশিয়াল ব্র্যান্ড মল",
        subtitle: "100% আসল প্রোডাক্ট ও অফিশিয়াল ওয়ারেন্টি নিশ্চয়তা",
      },
    },
    {
      id: "marketplace-trust",
      type: "trust-badges",
      label: "Buyer Protection & 7-Day Free Returns",
      visible: true,
      props: {
        title: "কেন আমাদের থেকে কেনাকাটা করবেন?",
        subtitle: "বায়ার প্রোটেকশন, 7 দিনের ফ্রি রিটার্ন ও 24/7 গ্রাহক সেবা",
      },
    },
  ],

  supportedSections: [
    "flash-sale-hero", "slider-hero", "split-hero", "category-grid", "flash-sale",
    "trending-products", "brand-showcase", "trust-badges", "testimonials", "newsletter"
  ],

  productCardVariant: "marketplace",
  categoryCardVariant: "marketplace-grid",
};
