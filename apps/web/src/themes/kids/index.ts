import type { ThemeDefinition } from "../types";

export const KIDS_THEME: ThemeDefinition = {
  id: "kids",
  name: "Kids & Baby",
  slug: "kids",
  description: "A joyful, colorful, friendly theme crafted for baby care, kids clothing, educational toys, nursery essentials, and parenting lifestyle brands.",
  category: "kids",
  previewImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80",
  mobilePreviewImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
  version: "2.0.0",
  author: "BornoLand",
  tags: ["Kids", "Baby", "Toys", "Children", "Newborn", "Parenting", "Educational"],

  tokens: {
    colors: {
      primary: "#8b5cf6", // Joyful soft violet
      secondary: "#0891b2", // Playful sky cyan
      background: "#fdf4ff", // Sweet pastel lavender tint
      surface: "#ffffff",
      text: "#1e1b4b", // Deep plum navy
      textMuted: "#6b7280",
      border: "#f5d0fe",
      accent: "#f43f5e",
      accentHover: "#e11d48",
      badgeBg: "#f3e8ff",
      badgeText: "#7c3aed",
      headerBg: "#ffffff",
      headerText: "#1e1b4b",
      footerBg: "#2e1065", // Deep plum purple
      footerText: "#f5d0fe",
    },
    typography: {
      fontFamily: "'Quicksand', 'Hind Siliguri', sans-serif",
      headingFont: "'Quicksand', 'Hind Siliguri', sans-serif",
      bodyFont: "'Quicksand', 'Hind Siliguri', sans-serif",
      headingWeight: "700",
      baseFontSize: "15px",
    },
    layout: {
      containerWidth: "1280px",
      borderRadius: 22, // Extra playful bubbly rounded corners
      shadowSize: "md",
      spacing: 26,
      gridGap: "22px",
    },
    cards: {
      productCardStyle: "kids",
      categoryCardStyle: "kids-fun",
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
    announcementText: "🎈 ১০০% নন-টক্সিক ও শিশুদের জন্য নিরাপদ পণ্য | প্রথম অর্ডারে বিশেষ গিফট!",
    announcementBg: "#8b5cf6",
    announcementTextColor: "#ffffff",
    showSearch: true,
    searchPlaceholder: "বেবি ড্রেস, লার্নিং টয়, ডায়পার কিংবা বেবি ফুড খুঁজুন...",
    showWishlist: true,
    showCart: true,
    showAccount: true,
    showCategoryBar: true,
    sticky: true,
    logoHeight: 46,
    mobileMenuType: "drawer",
    quickLinks: [
      { label: "নবজাতক যত্ন", href: "/newborn", icon: "Heart" },
      { label: "লার্নিং টয়েস", href: "/toys", icon: "Smile" },
      { label: "কম্বো গিফট বক্স", href: "/gift-boxes", icon: "Gift" },
    ],
  },

  footer: {
    layout: "multi-column",
    columns: 4,
    aboutText: "আপনার সোনামণির হাসিমুখ ও সুরক্ষায় আমরা নিয়ে এসেছি শতভাগ নিরাপদ, নন-টক্সিক ও প্রিমিয়াম মানের বেবি এবং কিডস পণ্য সামগ্রী।",
    hotline: "09613-110099",
    email: "care@bornoland-kids.com",
    address: "লেভেল ৩, যমুনা ফিউচার পার্ক, বারিধারা, ঢাকা-১২২৯",
    showSocial: true,
    showNewsletter: true,
    showPaymentIcons: true,
    showAppLinks: true,
    showCopyright: true,
    copyrightText: `© ${new Date().getFullYear()} BornoLand Kids. All rights reserved.`,
  },

  defaultSections: [
    {
      id: "kids-hero",
      type: "slider-hero",
      label: "Playful Kids & Baby World Hero",
      visible: true,
      props: {
        headline: "শিশুর কোমল যত্ন ও আনন্দের পৃথিবী",
        subheadline: "শতভাগ নিরাপদ বেবি কেয়ার, আরামদায়ক পোশাক ও শিক্ষণীয় খেলনা",
        buttonText: "কালেকশন দেখুন",
        buttonLink: "/shop",
        secondaryButtonText: "বয়স অনুযায়ী বাছাই",
        secondaryButtonLink: "/categories",
        heroHeight: "md",
        imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&q=80",
        overlayColor: "rgba(30, 27, 75, 0.35)",
        textAlignment: "left",
      },
    },
    {
      id: "kids-categories",
      type: "category-grid",
      label: "Age & Category Groups",
      visible: true,
      props: {
        title: "বয়স ও ক্যাটাগরি অনুযায়ী পছন্দ করুন",
        subtitle: "নবজাতক থেকে ১২ বছর পর্যন্ত সকল শিশুর প্রয়োজনীয় পণ্য",
        gridColumns: "6",
        cardStyle: "kids-fun",
        showProductCount: "true",
      },
    },
    {
      id: "kids-featured",
      type: "featured-products",
      label: "Parents Top Loved Items",
      visible: true,
      props: {
        title: "অভিভাবকদের সবচেয়ে পছন্দের পণ্য",
        subtitle: "হাজারো মা-বাবার আস্থা ও ভালোবাসায় সেরা নির্বাচিত আইটেম",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "kids-trust",
      type: "trust-badges",
      label: "Non-Toxic & Certified Safe Guarantee",
      visible: true,
      props: {
        title: "শিশুর নিরাপত্তায় আমাদের অঙ্গীকার",
        subtitle: "BPA-ফ্রি, নন-টক্সিক ও ১০০% ত্বকের জন্য নিরাপদ উপাদান",
      },
    },
    {
      id: "kids-deals",
      type: "discount-banner",
      label: "Baby Care Value Bundles",
      visible: true,
      props: {
        headline: "বেবি কেয়ার ও ডায়পার বান্ডেলে ৩০% পর্যন্ত ক্যাশব্যাক!",
        subheadline: "মান্থলি বেবি সাপ্লাই কম্বো প্যাকে পান আকর্ষণীয় ছাড়",
        badge: "PARENTS SPECIAL",
        buttonText: "বান্ডেল অর্ডার করুন",
        buttonLink: "/shop",
        discountPercent: "30%",
        couponCode: "BABY30",
      },
    },
  ],

  supportedSections: [
    "slider-hero", "image-hero", "category-grid", "featured-products",
    "discount-banner", "trust-badges", "testimonials", "newsletter"
  ],

  productCardVariant: "kids",
  categoryCardVariant: "kids-fun",
};
