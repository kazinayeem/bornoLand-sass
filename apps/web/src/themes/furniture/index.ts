import type { ThemeDefinition } from "../types";

export const FURNITURE_THEME: ThemeDefinition = {
  id: "furniture",
  name: "Home & Furniture",
  slug: "furniture",
  description: "A warm, architectural lifestyle theme built for modern furniture brands, interior decor shops, and home showrooms with room-by-room tours and solid wood warranty badges.",
  category: "furniture",
  previewImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Furniture", "Home Decor", "Interior", "Wood", "Living Room", "Architecture"],

  tokens: {
    colors: {
      primary: "#78350f", // Solid timber oak
      secondary: "#1e293b", // Slate charcoal
      background: "#faf8f5", // Warm linen cream
      surface: "#ffffff",
      text: "#1c1917",
      textMuted: "#78716c",
      border: "#e7dfd5",
      accent: "#d97706",
      accentHover: "#b45309",
      badgeBg: "#fef3c7",
      badgeText: "#92400e",
      headerBg: "#ffffff",
      headerText: "#1c1917",
      footerBg: "#1c1917", // Deep charcoal wood
      footerText: "#f5f5f4",
    },
    typography: {
      fontFamily: "'Cinzel', 'Hind Siliguri', serif",
      headingFont: "'Cinzel', 'Hind Siliguri', serif",
      bodyFont: "Inter, 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1320px",
      borderRadius: 8,
      shadowSize: "sm",
      spacing: 32,
      gridGap: "24px",
    },
    cards: {
      productCardStyle: "furniture",
      categoryCardStyle: "furniture-box",
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
    announcementText: "🛋️ প্রিমিয়াম সেগুন কাঠের ফার্নিচারে ১০ বছরের ওয়ারেন্টি | ফ্রি হোম ডেলিভারি ও ফিটিং",
    announcementBg: "#78350f",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "সোফা সেট, খাট, ডাইনিং টেবিল কিংবা অফিস টেবিল খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 44,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "লিভিং রুম", href: "/living-room", icon: "Home" },
      { label: "বেডরুম সেট", href: "/bedroom", icon: "Bed" },
      { label: "ডাইনিং স্পেস", href: "/dining", icon: "Coffee" },
      { label: "ওয়ারেন্টি পলিসি", href: "/warranty", icon: "Shield" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আমরা প্রাকৃতিক কাঠের সৌন্দর্য ও আধুনিক স্থাপত্যের সমন্বয়ে দীর্ঘস্থায়ী ফার্নিচার তৈরি করি যা আপনার ঘরকে করবে আরও নান্দনিক ও আরামদায়ক।",
    hotline: "09613-332211",
    email: "info@bornoland-furniture.com",
    address: "শোরুম #০৫, প্রগতি সরণি, বাড্ডা, ঢাকা-১২১২",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Furniture. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "furniture-hero",
      type: "slider-hero",
      label: "Architectural Living Room Showroom Hero",
      visible: true,
      props: {
        headline: "আভিজাত্য ও স্থায়িত্বের নিখুঁত ফার্নিচার",
        subheadline: "শতভাগ সলিড কাঠের তৈরি আধুনিক সোফা, খাট, ডাইনিং ও অফিস ইন্টেরিয়র",
        buttonText: "কালেকশন দেখুন",
        buttonLink: "/shop",
        secondaryButtonText: "রুম অনুযায়ী ব্রাউজ",
        secondaryButtonLink: "/categories",
        heroHeight: "lg",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80",
        overlayColor: "rgba(28, 25, 23, 0.4)",
        textAlignment: "left",
      },
    },
    {
      id: "furniture-categories",
      type: "category-grid",
      label: "Room Categories",
      visible: true,
      props: {
        title: "রুম অনুযায়ী ফার্নিচার বাছাই করুন",
        subtitle: "লিভিং রুম, বেডরুম, ডাইনিং স্পেস ও হোম অফিসের নান্দনিক ডিজাইন",
        gridColumns: "4",
        cardStyle: "furniture-box",
        showProductCount: "true",
      },
    },
    {
      id: "furniture-featured",
      type: "featured-products",
      label: "Signature Wooden Furniture",
      visible: true,
      props: {
        title: "সিগনেচার সলিড উড কালেকশন",
        subtitle: "অভিজ্ঞ কারিগরদের নিখুঁত হাতে গড়া ক্লাসিক ও মডার্ন ফার্নিচার",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "furniture-story",
      type: "rich-text",
      label: "Craftsmanship & Solid Wood Story",
      visible: true,
      props: {
        title: "আমাদের কারিগরী দক্ষতা ও মানের অঙ্গীকার",
        subtitle: "প্রতিটি কাঠে সিজনিং ও ট্রিটমেন্টের মাধ্যমে ঘুণপোকা ও ফাটলমুক্ত নিশ্চয়তা।",
      },
    },
    {
      id: "furniture-trust",
      type: "trust-badges",
      label: "Warranty & Delivery Badges",
      visible: true,
      props: {
        title: "আমাদের সেবা ও ওয়ারেন্টির সুবিধা",
        subtitle: "১০ বছরের ওয়ারেন্টি, ফ্রি ইনস্টলেশন ও সারা দেশে হোম ডেলিভারি",
      },
    },
  ],

  supportedSections: [
    "slider-hero", "image-hero", "category-grid", "featured-products",
    "rich-text", "trust-badges", "discount-banner", "testimonials", "newsletter"
  ],

  productCardVariant: "furniture",
  categoryCardVariant: "furniture-box",
};
