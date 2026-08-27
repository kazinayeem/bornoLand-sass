import type { ThemeDefinition } from "../types";

export const SPORTS_THEME: ThemeDefinition = {
  id: "sports",
  name: "Sports & Fitness",
  slug: "sports",
  description: "A high-octane, dynamic sports theme built for gym equipment, activewear, cricket/football gear, and sports nutrition stores with bold typography and performance highlights.",
  category: "sports",
  previewImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Sports", "Fitness", "Gym", "Cricket", "Football", "Activewear", "Nutrition"],

  tokens: {
    colors: {
      primary: "#ea580c", // High-octane blaze orange
      secondary: "#09090b", // Deep carbon black
      background: "#ffffff",
      surface: "#fafafa",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
      accent: "#e11d48",
      accentHover: "#be123c",
      badgeBg: "#ffedd5",
      badgeText: "#c2410c",
      headerBg: "#09090b", // Athletic dark header
      headerText: "#ffffff",
      footerBg: "#09090b", // Deep athletic carbon
      footerText: "#f4f4f5",
    },
    typography: {
      fontFamily: "'Teko', 'Inter', 'Hind Siliguri', sans-serif",
      headingFont: "'Teko', 'Inter', 'Hind Siliguri', sans-serif",
      bodyFont: "Inter, 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1280px",
      borderRadius: 6, // Angular athletic cuts
      shadowSize: "sm",
      spacing: 28,
      gridGap: "20px",
    },
    cards: {
      productCardStyle: "sports",
      categoryCardStyle: "sports-badge",
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
    announcementText: "⚡ ১০০% আসল ব্র্যান্ডের স্পোর্টস গিয়ার ও প্রোটিন সাপ্লিমেন্ট | দ্রুততম ডেলিভারি",
    announcementBg: "#ea580c",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "ক্রিকেট ব্যাট, ফুটবল, জিম ডাম্বেল কিংবা হোয়ে প্রোটিন খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 42,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "জিম ও ফিটনেস", href: "/gym", icon: "Activity" },
      { label: "ক্রিকেট কর্নার", href: "/cricket", icon: "Zap" },
      { label: "অফিশিয়াল ব্র্যান্ডস", href: "/brands", icon: "ShieldCheck" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আমরা খেলোয়াড় ও ফিটনেস সচেতন তরুণদের জন্য সরবরাহ করি বিশ্বের সেরা ব্র্যান্ডের অরিজিনাল স্পোর্টস সরঞ্জাম ও নিউট্রিশন সামগ্রী।",
    hotline: "09613-443322",
    email: "pro@bornoland-sports.com",
    address: "স্টেডিয়াম মার্কেট, বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা-১০০০",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Sports. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "sports-hero",
      type: "fullscreen-hero",
      label: "Dynamic Athlete Performance Hero",
      visible: true,
      props: {
        headline: "আপনার পারফরম্যান্স বাড়ান সেরা গিয়ারে",
        subheadline: "অরিজিনাল ক্রিকেট ব্যাট, ফুটবল, হোম জিম ইকুইপমেন্ট ও অথেন্টিক নিউট্রিশন",
        buttonText: "গিয়ার্স ব্রাউজ করুন",
        buttonLink: "/shop",
        secondaryButtonText: "ফিটনেস কালেকশন",
        secondaryButtonLink: "/categories",
        heroHeight: "lg",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80",
        overlayColor: "rgba(9, 9, 11, 0.55)",
        textAlignment: "left",
      },
    },
    {
      id: "sports-categories",
      type: "category-grid",
      label: "Sports & Training Categories",
      visible: true,
      props: {
        title: "খেলা ও ট্রেনিং অনুযায়ী বাছাই করুন",
        subtitle: "জিম ইকুইপমেন্ট, ক্রিকেট, ফুটবল, রানিং শু ও নিউট্রিশন",
        gridColumns: "6",
        cardStyle: "sports-badge",
        showProductCount: "true",
      },
    },
    {
      id: "sports-trending",
      type: "trending-products",
      label: "Pro Athlete Picks",
      visible: true,
      props: {
        title: "প্রফেশনাল অ্যাথলেটদের পছন্দের গিয়ার",
        subtitle: "আন্তর্জাতিক মানসম্পন্ন দীর্ঘস্থায়ী ও নির্ভরযোগ্য স্পোর্টস সরঞ্জাম",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "sports-promo",
      type: "discount-banner",
      label: "Performance Flash Deals",
      visible: true,
      props: {
        headline: "জিম ও ফিটনেস ইকুইপমেন্টে ২০% ফ্ল্যাট ক্যাশব্যাক!",
        subheadline: "হোম জিম সেটআপে সম্পূর্ণ ফ্রি ইনস্টলেশন ও ওয়ারেন্টি সুবিধা",
        badge: "PRO ATHLETE OFFER",
        buttonText: "অফারটি লুফে নিন",
        buttonLink: "/shop",
        discountPercent: "20%",
        couponCode: "FITNESS20",
      },
    },
    {
      id: "sports-brands",
      type: "brand-showcase",
      label: "Official Sports Brands",
      visible: true,
      props: {
        title: "অফিশিয়াল অথোরাইজড ব্র্যান্ডসমূহ",
        subtitle: "১০০% আসল ও কিউআর ভেরিফাইড ব্র্যান্ড গ্যারান্টি",
      },
    },
  ],

  supportedSections: [
    "fullscreen-hero", "slider-hero", "category-grid", "trending-products",
    "discount-banner", "brand-showcase", "trust-badges", "testimonials", "newsletter"
  ],

  productCardVariant: "sports",
  categoryCardVariant: "sports-badge",
};
