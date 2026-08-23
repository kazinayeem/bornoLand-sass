/**
 * Centralized Storefront UI Translations & Multilingual Helper
 * Supports English (en), Bangla (bn), and Bilingual (en+bn) modes.
 */

export type StoreLanguage = "en" | "bn" | "bilingual";

export const UI_TRANSLATIONS = {
  // Navigation & Header
  home: { en: "Home", bn: "হোম" },
  shop: { en: "Shop All", bn: "সকল পণ্য" },
  categories: { en: "Categories", bn: "ক্যাটাগরি" },
  allCategories: { en: "All Categories", bn: "সকল ক্যাটাগরি" },
  subcategories: { en: "Subcategories", bn: "সাব-ক্যাটাগরি" },
  brands: { en: "Brands", bn: "ব্র্যান্ডস" },
  popularBrands: { en: "Popular Brands", bn: "জনপ্রিয় ব্র্যান্ড" },
  offers: { en: "Special Offers", bn: "ধামাকা অফার" },
  combos: { en: "Combo Packs", bn: "কম্বো প্যাক" },
  bestSellers: { en: "Best Sellers", bn: "টপ সেলিং" },
  newArrivals: { en: "New Arrivals", bn: "নতুন পণ্য" },
  featured: { en: "Featured", bn: "প্রিমিয়াম কালেকশন" },
  about: { en: "About Us", bn: "আমাদের কথা" },
  contact: { en: "Contact Us", bn: "যোগাযোগ" },
  branches: { en: "Outlets / Branches", bn: "আউটলেট সমূহ" },
  trackOrder: { en: "Track Order", bn: "অর্ডার ট্র্যাকিং" },
  faq: { en: "FAQ", bn: "প্রশ্নোত্তর" },

  // Search & Filters
  search: { en: "Search products, categories, brands...", bn: "পণ্য, ক্যাটাগরি বা ব্র্যান্ড খুঁজুন..." },
  searchButton: { en: "Search", bn: "অনুসন্ধান" },
  filterBy: { en: "Filter By", bn: "ফিল্টার করুন" },
  priceRange: { en: "Price Range", bn: "মূল্য সীমা" },
  inStock: { en: "In Stock Only", bn: "শুধুমাত্র স্টকে আছে" },
  clearFilters: { en: "Clear Filters", bn: "ফিল্টার মুছুন" },
  showingProducts: { en: "Showing products", bn: "পণ্য দেখানো হচ্ছে" },
  noProductsFound: { en: "No products found matching your search.", bn: "আপনার খোঁজের সাথে কোনো পণ্য পাওয়া যায়নি।" },

  // User Actions & Cart
  cart: { en: "Cart", bn: "কার্ট" },
  myCart: { en: "My Cart", bn: "আমার কার্ট" },
  addToCart: { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  buyNow: { en: "Buy Now", bn: "এখনই অর্ডার করুন" },
  viewCart: { en: "View Cart", bn: "কার্ট দেখুন" },
  checkout: { en: "Checkout", bn: "চেকআউট" },
  account: { en: "Account", bn: "অ্যাকাউন্ট" },
  login: { en: "Login / Register", bn: "লগইন / রেজিস্টার" },
  wishlist: { en: "Wishlist", bn: "পছন্দের তালিকা" },
  viewAll: { en: "View All", bn: "সব দেখুন" },
  shopNow: { en: "Shop Now", bn: "এখনই কিনুন" },
  details: { en: "View Details", bn: "বিস্তারিত দেখুন" },

  // Guarantees & Footer
  pureGuarantee: { en: "100% Authentic Products", bn: "১০০% খাঁটি পণ্য" },
  pureGuaranteeSub: { en: "Quality tested and assured", bn: "গুণগত মানের সর্বোচ্চ নিশ্চয়তা" },
  fastDelivery: { en: "Fast Home Delivery", bn: "দ্রুত ডেলিভারি" },
  fastDeliverySub: { en: "Safe delivery across Bangladesh", bn: "সারাদেশে নিরাপদ হোম ডেলিভারি" },
  easyReturn: { en: "Easy Return Policy", bn: "সহজ রিটার্ন" },
  easyReturnSub: { en: "Hassle-free exchange policy", bn: "পণ্য অপছন্দ হলে পরিবর্তনের সুযোগ" },
  support247: { en: "Customer Support", bn: "কাস্টমার সাপোর্ট" },
  support247Sub: { en: "Always here to help you", bn: "যেকোনো তথ্যের জন্য পাশে আছি" },
  hotline: { en: "Hotline", bn: "হটলাইন" },
  workingHours: { en: "9:00 AM - 10:00 PM (Daily)", bn: "সকাল ৯:০০টা - রাত ১০:০০টা" },
  paymentMethods: { en: "Payment Methods:", bn: "পেমেন্ট মেথড:" },
  allRightsReserved: { en: "All rights reserved. Powered by BornoLand.", bn: "সর্বস্বত্ব সংরক্ষিত। Powered by BornoLand." },
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS;

/**
 * Get localized string based on current store language
 */
export function t(key: TranslationKey, lang: StoreLanguage = "bn"): string {
  const item = UI_TRANSLATIONS[key];
  if (!item) return key;

  if (lang === "en") return item.en;
  if (lang === "bn") return item.bn;
  // Bilingual mode
  return `${item.en} (${item.bn})`;
}

/**
 * Helper to get localized name from an entity with nameEn/nameBn or titleEn/titleBn
 */
export function getLocalizedName(
  entity: {
    name?: string;
    nameEn?: string;
    nameBn?: string;
    title?: string;
    titleEn?: string;
    titleBn?: string;
  } | null | undefined,
  lang: StoreLanguage = "bn"
): string {
  if (!entity) return "";

  const name = entity.name || entity.title || "";
  const en = entity.nameEn || entity.titleEn;
  const bn = entity.nameBn || entity.titleBn;

  if (lang === "en") {
    return en || name;
  }
  if (lang === "bn") {
    return bn || name;
  }
  // Bilingual mode
  if (en && bn && en !== bn) {
    return `${en} (${bn})`;
  }
  return name || en || bn || "";
}

/**
 * Helper to get localized description from an entity with descriptionEn/descriptionBn
 */
export function getLocalizedDescription(
  entity: {
    description?: string;
    descriptionEn?: string;
    descriptionBn?: string;
  } | null | undefined,
  lang: StoreLanguage = "bn"
): string {
  if (!entity) return "";
  if (lang === "en") return entity.descriptionEn || entity.description || "";
  if (lang === "bn") return entity.descriptionBn || entity.description || "";
  return entity.description || entity.descriptionEn || entity.descriptionBn || "";
}
