import type { ThemeDefinition } from "../types";

export const BEAUTY_THEME: ThemeDefinition = {
  id: "beauty",
  name: "Beauty & Personal Care",
  slug: "beauty",
  description: "A soft, radiant theme designed for cosmetics, skincare, haircare, and wellness stores with before-after showcases, skin routine categories, and clean pastel aesthetics.",
  category: "beauty",
  previewImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Beauty", "Cosmetics", "Skincare", "Makeup", "Personal Care", "Wellness"],

  tokens: {
    colors: {
      primary: "#ec4899", // Radiant rose pink
      secondary: "#831843", // Deep velvet wine
      background: "#fffbfd", // Soft powder pink tint
      surface: "#ffffff",
      text: "#371b26", // Soft dark berry
      textMuted: "#8a6675",
      border: "#fce7f3",
      accent: "#f472b6",
      accentHover: "#db2777",
      badgeBg: "#fdf2f8",
      badgeText: "#be185d",
      headerBg: "#ffffff",
      headerText: "#371b26",
      footerBg: "#2d0b1a", // Deep rosewood
      footerText: "#fce7f3",
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
      headingFont: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
      bodyFont: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1280px",
      borderRadius: 16, // Soft feminine rounded corners
      shadowSize: "sm",
      spacing: 28,
      gridGap: "22px",
    },
    cards: {
      productCardStyle: "beauty",
      categoryCardStyle: "circle",
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
    announcementText: "🌸 ১০০% অথেন্টিক স্কিনকেয়ার ও বিউটি প্রোডাক্ট | বিশেষজ্ঞ পরামর্শের সুবিধা",
    announcementBg: "#831843",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "সেরাম, সানস্ক্রিন, লিপস্টিক কিংবা ময়েশ্চারাইজার খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 42,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "স্কিনকেয়ার রুটিন", href: "/skincare", icon: "Sparkles" },
      { label: "বেস্ট সেলার", href: "/best-sellers", icon: "Award" },
      { label: "অথেন্টিসিটি গ্যারান্টি", href: "/authenticity", icon: "ShieldCheck" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আমরা শুধুমাত্র সরাসরি আন্তর্জাতিক ব্র্যান্ড ও অফিশিয়াল ডিস্ট্রিবিউটর থেকে সংগৃহীত ১০০% অথেন্টিক বিউটি প্রোডাক্ট সরবরাহ করি। আপনার ত্বকের যত্ন আমাদের দায়িত্ব।",
    hotline: "09613-776655",
    email: "care@bornoland-beauty.com",
    address: "লেভেল ২, ধানমন্ডি ২৭, ঢাকা-১২০৯",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Beauty. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "beauty-hero",
      type: "split-hero",
      label: "Glowing Skincare Hero",
      visible: true,
      props: {
        headline: "ত্বকের উজ্জ্বলতা বাড়ান আসল যত্নে",
        subheadline: "আন্তর্জাতিক মানের ডার্মাটোলজিক্যালি টেস্টেড স্কিনকেয়ার ও প্রসাধন সামগ্রী",
        buttonText: "স্কিনকেয়ার পণ্য দেখুন",
        buttonLink: "/shop",
        secondaryButtonText: "রুটিন গাইড",
        secondaryButtonLink: "/categories",
        heroHeight: "md",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80",
        overlayColor: "transparent",
        textAlignment: "left",
      },
    },
    {
      id: "beauty-categories",
      type: "category-grid",
      label: "Skincare Steps & Categories",
      visible: true,
      props: {
        title: "আপনার প্রয়োজন অনুযায়ী বেছে নিন",
        subtitle: "স্কিনকেয়ার, মেকআপ, হেয়ারকেয়ার ও বডিকেয়ার কালেকশন",
        gridColumns: "6",
        cardStyle: "circle",
        showProductCount: "true",
      },
    },
    {
      id: "beauty-best-sellers",
      type: "best-sellers",
      label: "Top Rated Beauty Products",
      visible: true,
      props: {
        title: "জনপ্রিয় ও সর্বোচ্চ রেটেড প্রোডাক্ট",
        subtitle: "হাজারো কাস্টমারের বিশ্বস্ত ও কার্যকরী বিউটি পণ্য",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "beauty-trust",
      type: "trust-badges",
      label: "Authenticity & Safety",
      visible: true,
      props: {
        title: "আমাদের শতভাগ নিশ্চয়তা",
        subtitle: "নিরাপদ, পরীক্ষিত ও শতভাগ খাঁটি উপাদান",
      },
    },
    {
      id: "beauty-offers",
      type: "discount-banner",
      label: "Beauty Glow Combos",
      visible: true,
      props: {
        headline: "স্পেশাল গ্লো কম্বো প্যাকেজে ২৫% ফ্ল্যাট ছাড়!",
        subheadline: "ক্লিনজার, টোনার ও সানস্ক্রিন একসাথে অর্ডারে বিশেষ ছাড়",
        badge: "BEAUTY DEALS",
        buttonText: "কম্বো অফার নিন",
        buttonLink: "/shop",
        discountPercent: "25%",
        couponCode: "GLOW25",
      },
    },
    {
      id: "beauty-testimonials",
      type: "testimonials",
      label: "Customer Glow Stories",
      visible: true,
      props: {
        title: "গ্রাহকদের ত্বকের পরিবর্তন ও রিভিউ",
        subtitle: "আমাদের প্রোডাক্ট ব্যবহারে কাস্টমারদের আসল অভিজ্ঞতা",
      },
    },
  ],

  supportedSections: [
    "split-hero", "image-hero", "slider-hero", "category-grid", "best-sellers",
    "featured-products", "discount-banner", "trust-badges", "testimonials", "newsletter"
  ],

  productCardVariant: "beauty",
  categoryCardVariant: "circle",
};
