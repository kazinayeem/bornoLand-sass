import type { ThemeDefinition } from "../types";

export const BOOKS_THEME: ThemeDefinition = {
  id: "books",
  name: "Books & Education",
  slug: "books",
  description: "A scholarly, literary theme built for bookstores, publishers, academic bookshops, and stationery stores with author spotlights, genre shelves, and reader reviews.",
  category: "books",
  previewImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Books", "Publishing", "Bookstore", "Education", "Stationery", "Islamic", "Literature"],

  tokens: {
    colors: {
      primary: "#0284c7", // Scholarly deep blue
      secondary: "#0f172a", // Midnight ink
      background: "#f8fafc", // Crisp reader background
      surface: "#ffffff",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
      accent: "#0d9488", // Teal scholar accent
      accentHover: "#0f766e",
      badgeBg: "#e0f2fe",
      badgeText: "#0369a1",
      headerBg: "#ffffff",
      headerText: "#0f172a",
      footerBg: "#0f172a", // Midnight ink
      footerText: "#f1f5f9",
    },
    typography: {
      fontFamily: "'Merriweather', 'Hind Siliguri', serif",
      headingFont: "'Merriweather', 'Hind Siliguri', serif",
      bodyFont: "Inter, 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1280px",
      borderRadius: 10,
      shadowSize: "sm",
      spacing: 28,
      gridGap: "20px",
    },
    cards: {
      productCardStyle: "books",
      categoryCardStyle: "book-spine",
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
    announcementText: "📚 দেশি-বিদেশি সকল ধরণের আসল বইয়ের সুবিশাল সমাহার | 50% পর্যন্ত কমিশন",
    announcementBg: "#0f172a",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "বইয়ের নাম, লেখক কিংবা প্রকাশনীর নাম দিয়ে খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 44,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "বেস্টসেলার বই", href: "/bestsellers", icon: "BookOpen" },
      { label: "জনপ্রিয় লেখক", href: "/authors", icon: "Users" },
      { label: "ইসলামিক কর্নার", href: "/islamic", icon: "Bookmark" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "বই পড়ার আনন্দ ছড়িয়ে দিতে আমরা কাজ করছি দেশের প্রতিটি প্রান্তে। প্রিয় লেখকের নতুন ও ধ্রুপদী বই সরাসরি প্রকাশনী থেকে আপনার কাছে পৌঁছে দিই।",
    hotline: "09613-221100",
    email: "reader@bornoland-books.com",
    address: "বাংলাবাজার ও কনকর্ড এম্পোরিয়াম, কাঁটাবন, ঢাকা-1205",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Books. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "books-hero",
      type: "split-hero",
      label: "Literary Bestsellers Spotlight Hero",
      visible: true,
      props: {
        headline: "বইয়ের পাতায় জ্ঞানের আলো ও মনের আনন্দ",
        subheadline: "উপন্যাস, আত্মউন্নয়ন, ইতিহাস, বিজ্ঞান ও ইসলামিক সাহিত্যের বিশাল কালেকশন",
        buttonText: "বইসমগ্র ব্রাউজ করুন",
        buttonLink: "/shop",
        secondaryButtonText: "বেস্টসেলার তালিকা",
        secondaryButtonLink: "/categories",
        heroHeight: "md",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&q=80",
        overlayColor: "transparent",
        textAlignment: "left",
      },
    },
    {
      id: "books-categories",
      type: "category-grid",
      label: "Genres & Subjects Shelf",
      visible: true,
      props: {
        title: "বিষয় ও জনরা অনুযায়ী বেছে নিন",
        subtitle: "ফিকশন, নন-ফিকশন, সমকালীন উপন্যাস, ইসলামিক ও একাডেমিক বই",
        gridColumns: "6",
        cardStyle: "book-spine",
        showProductCount: "true",
      },
    },
    {
      id: "books-bestsellers",
      type: "best-sellers",
      label: "Top Reader Favorites",
      visible: true,
      props: {
        title: "সর্বাধিক পঠিত ও প্রশংসিত বইসমূহ",
        subtitle: "চলতি মাসের সেরা বিক্রিত বইয়ের তালিকা",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "books-deal-banner",
      type: "discount-banner",
      label: "Book Fair Special Discount",
      visible: true,
      props: {
        headline: "প্রকাশনী স্পেশাল মেলা — সর্বোচ্চ 35% পর্যন্ত ছাড়!",
        subheadline: "5টি বা তার বেশি বই অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি",
        badge: "BOOK FAIR OFFER",
        buttonText: "বই সংগ্রহ করুন",
        buttonLink: "/shop",
        discountPercent: "35%",
        couponCode: "BOIPOKA",
      },
    },
    {
      id: "books-testimonials",
      type: "testimonials",
      label: "Reader Reviews & Notes",
      visible: true,
      props: {
        title: "পাঠকদের অনুভূতি ও বুক রিভিউ",
        subtitle: "বইপ্রেমীদের মূল্যবান মন্তব্য ও রেটিং",
      },
    },
  ],

  supportedSections: [
    "split-hero", "image-hero", "slider-hero", "category-grid", "best-sellers",
    "discount-banner", "testimonials", "newsletter", "trust-badges"
  ],

  productCardVariant: "books",
  categoryCardVariant: "book-spine",
};
