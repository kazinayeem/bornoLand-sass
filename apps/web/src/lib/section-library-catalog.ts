/**
 * Business-facing Section Library catalog.
 * Overrides labels/categories for store owners without renaming persisted `type` keys.
 */
import type { SectionCategory, SectionDef, SectionPropDef } from "@/lib/section-registry";
import {
  sectionRegistry,
  getDefaultProps as registryDefaults,
  registerSectionDef,
  registerSectionTypeAlias,
} from "@/lib/section-registry";

export type LibraryCategoryId =
  | "hero"
  | "header"
  | "footer"
  | "products"
  | "category"
  | "reviews"
  | "promotions"
  | "gallery"
  | "about"
  | "contact"
  | "services"
  | "newsletter"
  | "statistics"
  | "video"
  | "blog"
  | "faq";

export type LibraryCategory = {
  id: LibraryCategoryId;
  label: string;
  emoji: string;
  description: string;
};

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id: "hero", label: "Hero", emoji: "🏠", description: "First impression banners" },
  { id: "header", label: "Header", emoji: "🧭", description: "Navigation & branding" },
  { id: "footer", label: "Footer", emoji: "🦶", description: "Links & store info" },
  { id: "products", label: "Products", emoji: "🛍", description: "Show your catalog" },
  { id: "category", label: "Categories", emoji: "📂", description: "Browse by collection" },
  { id: "reviews", label: "Reviews", emoji: "⭐", description: "Trust & social proof" },
  { id: "promotions", label: "Promotions", emoji: "🎯", description: "Sales & offers" },
  { id: "gallery", label: "Gallery", emoji: "🖼", description: "Photos & visuals" },
  { id: "about", label: "About", emoji: "📖", description: "Your brand story" },
  { id: "contact", label: "Contact", emoji: "📞", description: "Get in touch" },
  { id: "services", label: "Services", emoji: "📦", description: "Why shop with you" },
  { id: "newsletter", label: "Newsletter", emoji: "📧", description: "Grow your list" },
  { id: "statistics", label: "Statistics", emoji: "📊", description: "Numbers that impress" },
  { id: "video", label: "Video", emoji: "🎥", description: "Video storytelling" },
  { id: "blog", label: "Blog", emoji: "📰", description: "Articles & news" },
  { id: "faq", label: "FAQ", emoji: "❓", description: "Answers & support" },
];

export type LibrarySection = SectionDef & {
  keywords: string[];
  libraryCategory: LibraryCategoryId;
};

/** Types hidden from the library (layout atoms, technical pieces). Still render if already on a page. */
const HIDDEN_FROM_LIBRARY = new Set([
  "one-column", "two-column", "three-column", "four-column",
  "container", "full-width", "grid-layout", "masonry-layout", "tabs-layout",
  "header-logo", "header-nav", "header-icons",
  "footer-links", "footer-social", "footer-copyright",
  "rich-text",
]);

type Meta = {
  category: LibraryCategoryId;
  label?: string;
  description?: string;
  keywords?: string[];
};

/** Per-type business-friendly metadata. */
const META: Record<string, Meta> = {
  // Hero
  "hero-banner": { category: "hero", label: "Hero Banner", description: "Big headline with a call-to-action", keywords: ["homepage", "banner", "cta", "welcome"] },
  "split-hero": { category: "hero", label: "Split Hero", description: "Image and text side by side", keywords: ["split", "image", "story"] },
  "video-hero": { category: "hero", label: "Video Hero", description: "Background video with overlay text", keywords: ["video", "cinematic"] },
  "slider-hero": { category: "hero", label: "Slider Hero", description: "Rotating hero slides", keywords: ["slider", "carousel", "slides"] },
  "image-hero": { category: "hero", label: "Minimal Hero", description: "Clean hero with one striking image", keywords: ["minimal", "simple", "photo"] },
  "fullscreen-hero": { category: "hero", label: "Fullscreen Hero", description: "Edge-to-edge immersive hero", keywords: ["fullscreen", "impact"] },
  "countdown-hero": { category: "hero", label: "Seasonal Hero", description: "Hero with countdown for launches & sales", keywords: ["countdown", "seasonal", "launch", "sale"] },
  "flash-sale-hero": { category: "hero", label: "Sale Hero", description: "Urgent flash-sale style hero", keywords: ["sale", "flash", "discount", "offer"] },
  "product-hero": { category: "hero", label: "Product Spotlight", description: "Feature one hero product", keywords: ["product", "spotlight", "feature"] },
  "image-carousel": { category: "hero", label: "Banner Slider", description: "Multi-slide promotional banner", keywords: ["slider", "carousel", "banner", "sale"] },

  // Products
  "featured-products": { category: "products", label: "Featured Products", description: "Hand-picked products to highlight", keywords: ["featured", "highlight", "shop"] },
  "new-arrivals": { category: "products", label: "New Arrivals", description: "Show your newest products", keywords: ["new", "latest", "arrivals"] },
  "best-sellers": { category: "products", label: "Best Sellers", description: "What customers buy most", keywords: ["best", "popular", "top"] },
  "flash-sale": { category: "products", label: "Flash Sale", description: "Limited-time discounted products", keywords: ["sale", "flash", "discount", "deal"] },
  "trending-products": { category: "products", label: "Trending Products", description: "What's popular right now", keywords: ["trending", "hot", "popular"] },
  "recently-viewed": { category: "products", label: "Recently Viewed", description: "Help shoppers return to products they saw", keywords: ["recent", "history", "viewed"] },
  "recommended-products": { category: "products", label: "Recommended", description: "Personalized product suggestions", keywords: ["recommended", "for you", "suggest"] },
  "related-products": { category: "products", label: "Related Products", description: "Similar items shoppers may like", keywords: ["related", "similar"] },
  "product-slider": { category: "products", label: "Product Slider", description: "Swipeable product row", keywords: ["slider", "carousel", "products"] },
  "product-carousel": { category: "products", label: "Product Carousel", description: "Animated product carousel", keywords: ["carousel", "products"] },
  "product-grid": { category: "products", label: "Product Grid", description: "Classic multi-column product grid", keywords: ["grid", "catalog", "shop"] },
  "product-tabs": { category: "products", label: "Product Tabs", description: "Switch between product groups", keywords: ["tabs", "collections"] },
  "product-collection": { category: "products", label: "Collection Showcase", description: "Feature a product collection", keywords: ["collection", "group"] },
  "product-by-category": { category: "products", label: "Shop by Category Products", description: "Products filtered by category", keywords: ["category", "filter"] },
  "bundle-products": { category: "products", label: "Product Bundles", description: "Sell products as a set", keywords: ["bundle", "pack", "deal"] },

  // Categories
  "category-grid": { category: "category", label: "Category Grid", description: "Browse categories in a grid", keywords: ["categories", "grid", "browse"] },
  "featured-categories": { category: "category", label: "Featured Categories", description: "Highlight top categories", keywords: ["featured", "categories"] },
  "category-slider": { category: "category", label: "Category Slider", description: "Swipe through categories", keywords: ["slider", "categories"] },
  "category-masonry": { category: "category", label: "Circle Categories", description: "Round category icons layout", keywords: ["circle", "icons", "categories"] },
  "mega-category-grid": { category: "category", label: "Icon Categories", description: "Large icon-style category tiles", keywords: ["icons", "categories"] },
  "category-banner": { category: "category", label: "Category Banner", description: "Promotional category banner", keywords: ["banner", "category"] },

  // Reviews
  "testimonials": { category: "reviews", label: "Testimonials", description: "Customer quotes and stories", keywords: ["reviews", "testimonials", "quotes"] },
  "customer-reviews": { category: "reviews", label: "Customer Reviews", description: "Star ratings with written reviews", keywords: ["reviews", "ratings", "stars"] },
  "video-testimonials": { category: "reviews", label: "Video Testimonials", description: "Customers on camera", keywords: ["video", "reviews", "testimonials"] },
  "star-ratings": { category: "reviews", label: "Star Ratings", description: "Simple rating highlights", keywords: ["stars", "rating"] },
  "trust-badges": { category: "reviews", label: "Trust Badges", description: "Secure checkout & guarantee badges", keywords: ["trust", "badges", "secure", "guarantee"] },
  "guarantee-section": { category: "reviews", label: "Brand Logos", description: "Logos of brands you carry or trust marks", keywords: ["logos", "brands", "partners"] },
  "success-stories": { category: "reviews", label: "Success Stories", description: "Longer customer success stories", keywords: ["stories", "case study"] },
  "social-proof": { category: "reviews", label: "Social Proof", description: "Live social proof moments", keywords: ["social", "proof", "popular"] },

  // Promotions
  "countdown-timer": { category: "promotions", label: "Countdown Banner", description: "Tick down to a sale or launch", keywords: ["countdown", "timer", "sale", "urgency"] },
  "coupon-section": { category: "promotions", label: "Coupon Banner", description: "Share a discount code", keywords: ["coupon", "code", "discount", "sale"] },
  "discount-banner": { category: "promotions", label: "Sale Banner", description: "Bold promotional banner", keywords: ["sale", "banner", "promo", "discount"] },
  "offer-banner": { category: "promotions", label: "Promo Cards", description: "Card-style promotional offers", keywords: ["promo", "cards", "offer", "sale"] },
  "announcement-bar": { category: "promotions", label: "Announcement Bar", description: "Slim top bar for shipping & deals", keywords: ["announcement", "bar", "shipping", "promo"] },
  "floating-promotion": { category: "promotions", label: "Floating Offer", description: "Sticky floating promo chip", keywords: ["floating", "offer", "promo"] },
  "deal-of-day": { category: "promotions", label: "Deal of the Day", description: "One featured daily deal", keywords: ["deal", "daily", "sale"] },
  "limited-time-offer": { category: "promotions", label: "Limited Offer", description: "Scarcity-driven promotion", keywords: ["limited", "offer", "sale"] },
  "bogo": { category: "promotions", label: "Buy One Get One", description: "BOGO style promotion", keywords: ["bogo", "sale", "offer"] },
  "seasonal-sale": { category: "promotions", label: "Seasonal Sale", description: "Holiday or seasonal campaign", keywords: ["seasonal", "holiday", "sale"] },
  "black-friday-banner": { category: "promotions", label: "Event Sale Banner", description: "Big event sale creative", keywords: ["black friday", "event", "sale"] },
  "sales-popup": { category: "promotions", label: "Sale Popup", description: "Attention-grabbing sale popup", keywords: ["popup", "sale"] },

  // Gallery
  "masonry-gallery": { category: "gallery", label: "Masonry Gallery", description: "Pinterest-style photo layout", keywords: ["gallery", "masonry", "photos"] },
  "image-grid": { category: "gallery", label: "Image Grid", description: "Even photo grid", keywords: ["gallery", "grid", "photos"] },
  "gallery": { category: "gallery", label: "Portfolio", description: "Portfolio-style image gallery", keywords: ["portfolio", "gallery", "work"] },
  "before-after": { category: "gallery", label: "Before & After", description: "Compare two images", keywords: ["before", "after", "compare"] },
  "instagram-feed": { category: "gallery", label: "Instagram Gallery", description: "Show your Instagram photos", keywords: ["instagram", "social", "ugc", "gallery"] },
  "image-banner": { category: "gallery", label: "Image Banner", description: "Single full-width image", keywords: ["banner", "image"] },
  "ugc": { category: "gallery", label: "Customer Photos", description: "User-generated photo wall", keywords: ["ugc", "customers", "photos"] },

  // About
  "about-section": { category: "about", label: "About Us", description: "Introduce your store", keywords: ["about", "story", "brand"] },
  "company-story": { category: "about", label: "Brand Story", description: "Tell how you started", keywords: ["story", "brand", "about"] },
  "mission-section": { category: "about", label: "Founder Message", description: "A personal note from the founder", keywords: ["founder", "message", "mission"] },
  "team-members": { category: "about", label: "Team Members", description: "Meet the people behind the brand", keywords: ["team", "people", "staff"] },
  "timeline": { category: "about", label: "Timeline", description: "Milestones through the years", keywords: ["timeline", "history", "milestones"] },

  // Contact
  "contact-section": { category: "contact", label: "Contact Cards", description: "Email, phone, address, and map", keywords: ["contact", "cards", "email", "phone", "location"] },
  "google-map": { category: "contact", label: "Google Map", description: "Show your store on Google Maps", keywords: ["contact", "map", "google", "location"] },
  "popup-form": { category: "contact", label: "Contact Form", description: "Let customers message you", keywords: ["contact", "form", "message", "support"] },
  "email-capture": { category: "contact", label: "Email Capture", description: "Simple email capture form", keywords: ["contact", "email", "subscribe"] },

  // Services
  "why-choose-us": { category: "services", label: "Why Choose Us", description: "Reasons to shop with you", keywords: ["why", "benefits", "services"] },
  "feature-list": { category: "services", label: "Features", description: "Feature highlights with icons", keywords: ["features", "benefits", "services"] },
  "benefits-section": { category: "services", label: "Delivery", description: "Shipping & delivery promises", keywords: ["delivery", "shipping", "benefits"] },

  // Newsletter
  "newsletter": { category: "newsletter", label: "Email Subscribe", description: "Collect email subscribers", keywords: ["newsletter", "email", "subscribe"] },

  // Statistics
  "visitor-counter": { category: "statistics", label: "Animated Counters", description: "Animated number counters", keywords: ["counters", "stats", "numbers"] },
  "order-counter": { category: "statistics", label: "Business Metrics", description: "Orders, customers, and growth stats", keywords: ["metrics", "stats", "orders"] },
  "stock-counter": { category: "statistics", label: "Achievement Cards", description: "Highlight key achievements", keywords: ["achievements", "awards", "stats"] },
  "live-visitors": { category: "statistics", label: "Live Activity", description: "Show live visitor activity", keywords: ["live", "visitors", "activity"] },

  // Video
  "youtube-embed": { category: "video", label: "YouTube Section", description: "Embed a YouTube video", keywords: ["youtube", "video", "embed"] },
  "video-section": { category: "video", label: "Video Banner", description: "Hosted or linked video section", keywords: ["video", "banner"] },
  "vimeo-embed": { category: "video", label: "Product Demo", description: "Demo video for your product", keywords: ["demo", "product", "video", "vimeo"] },
  "tiktok-embed": { category: "video", label: "Short Video", description: "Embed short-form video", keywords: ["tiktok", "short", "video"] },

  // FAQ
  "faq": { category: "faq", label: "Accordion FAQ", description: "Expandable questions and answers", keywords: ["faq", "help", "questions", "accordion", "support", "contact"] },
  "accordion": { category: "faq", label: "Searchable FAQ", description: "FAQ list customers can scan quickly", keywords: ["faq", "search", "help", "support"] },
};

const HEADER_BASE_PROPS = (): Record<string, SectionPropDef> => {
  const base = sectionRegistry.find((s) => s.type === "header-bar")?.props;
  return base ? { ...base } : {};
};

const FOOTER_SIMPLE_PROPS = (): Record<string, SectionPropDef> => {
  const base = sectionRegistry.find((s) => s.type === "simple-footer")?.props;
  return base ? { ...base } : {};
};

const FOOTER_ECOM_PROPS = (): Record<string, SectionPropDef> => {
  const base = sectionRegistry.find((s) => s.type === "ecommerce-footer")?.props;
  return base ? { ...base } : {};
};

const FOOTER_MEGA_PROPS = (): Record<string, SectionPropDef> => {
  const base = sectionRegistry.find((s) => s.type === "mega-footer")?.props;
  return base ? { ...base } : FOOTER_ECOM_PROPS();
};

function cloneProps(type: string): Record<string, SectionPropDef> {
  const base = sectionRegistry.find((s) => s.type === type)?.props;
  return base ? { ...base } : {};
}

function presetTemplate(
  type: string,
  baseType: string,
  label: string,
  description: string,
  libraryCategory: LibraryCategoryId,
  keywords: string[],
  defaults: Record<string, string> = {},
): SectionDef & { keywords: string[]; libraryCategory: LibraryCategoryId; renderAs: string } {
  const props = cloneProps(baseType);
  for (const [key, value] of Object.entries(defaults)) {
    if (props[key]) props[key] = { ...props[key], default: value };
  }
  return {
    type,
    label,
    category: (libraryCategory === "reviews" ? "trust"
      : libraryCategory === "services" || libraryCategory === "about" || libraryCategory === "faq" || libraryCategory === "blog" ? "content"
      : libraryCategory === "gallery" || libraryCategory === "video" ? "media"
      : libraryCategory === "newsletter" || libraryCategory === "contact" ? "marketing"
      : libraryCategory === "statistics" ? "advanced"
      : libraryCategory) as SectionCategory,
    icon: sectionRegistry.find((s) => s.type === baseType)?.icon ?? "Layout",
    description,
    props,
    keywords,
    libraryCategory,
    renderAs: baseType,
  };
}

function headerTemplate(
  type: string,
  label: string,
  description: string,
  keywords: string[],
  defaults: Record<string, string>,
): SectionDef & { keywords: string[] } {
  const props = HEADER_BASE_PROPS();
  for (const [key, value] of Object.entries(defaults)) {
    if (props[key]) props[key] = { ...props[key], default: value };
  }
  return {
    type,
    label,
    category: "header" as SectionCategory,
    icon: "Layout",
    description,
    props,
    keywords,
  };
}

function footerTemplate(
  type: string,
  label: string,
  description: string,
  keywords: string[],
  base: "simple" | "ecom" | "mega",
  defaults: Record<string, string>,
): SectionDef & { keywords: string[] } {
  const props =
    base === "simple" ? FOOTER_SIMPLE_PROPS()
    : base === "mega" ? FOOTER_MEGA_PROPS()
    : FOOTER_ECOM_PROPS();
  for (const [key, value] of Object.entries(defaults)) {
    if (props[key]) props[key] = { ...props[key], default: value };
  }
  return {
    type,
    label,
    category: "footer" as SectionCategory,
    icon: "Minimize",
    description,
    props,
    keywords,
  };
}

/** Header presets — all render via header-bar with different defaults. */
export const HEADER_LIBRARY_TEMPLATES: Array<SectionDef & { keywords: string[] }> = [
  headerTemplate("header-minimal", "Minimal Header", "Clean logo and links only", ["minimal", "simple", "clean"], { layout: "logo-nav-icons", sticky: "false", transparent: "false", headerBg: "#ffffff", showSearch: "false", showWishlist: "false" }),
  headerTemplate("header-modern", "Modern Header", "Balanced nav with search and cart", ["modern", "default"], { layout: "logo-nav-icons", sticky: "true", headerBg: "#ffffff", showSearch: "true" }),
  headerTemplate("header-center-logo", "Center Logo Header", "Logo centered with nav around it", ["center", "logo", "fashion"], { layout: "nav-logo-icons", navPosition: "center", sticky: "true" }),
  headerTemplate("header-mega", "Mega Menu Header", "Roomy header for large menus", ["mega", "menu", "large"], { layout: "logo-nav-icons", headerHeight: "80", sticky: "true", showSearch: "true" }),
  headerTemplate("header-transparent", "Transparent Header", "Overlays your hero image", ["transparent", "overlay", "hero"], { transparent: "true", sticky: "true", headerBg: "transparent" }),
  headerTemplate("header-sticky", "Sticky Header", "Stays visible while scrolling", ["sticky", "fixed"], { sticky: "true", headerBg: "#ffffff" }),
  headerTemplate("header-luxury", "Luxury Header", "Elegant dark header for premium brands", ["luxury", "premium", "dark"], { headerBg: "#0a0a0a", sticky: "true", showWishlist: "true" }),
  headerTemplate("header-fashion", "Fashion Header", "Editorial style for apparel stores", ["fashion", "apparel", "clothing"], { layout: "nav-logo-icons", headerHeight: "72", sticky: "true", showWishlist: "true" }),
  headerTemplate("header-electronics", "Electronics Header", "Search-first header for tech shops", ["electronics", "tech", "search"], { showSearch: "true", layout: "logo-icons-nav", sticky: "true" }),
  headerTemplate("header-grocery", "Grocery Header", "Practical header for everyday shopping", ["grocery", "food", "daily"], { showSearch: "true", showCart: "true", sticky: "true", headerHeight: "64" }),
  headerTemplate("header-mobile", "Mobile Header", "Compact layout tuned for phones", ["mobile", "compact"], { headerHeight: "48", showSearch: "true", showAccount: "false" }),
  headerTemplate("header-search-focus", "Search Focus Header", "Search bar front and center", ["search", "find"], { showSearch: "true", layout: "logo-icons-nav", sticky: "true" }),
  headerTemplate("header-brand", "Brand Header", "Logo-forward with sparse links", ["brand", "logo"], { showName: "true", showSearch: "false", showWishlist: "false", sticky: "false" }),
  headerTemplate("header-marketplace", "Marketplace Header", "Dense utility header for many categories", ["marketplace", "multi"], { showSearch: "true", showCart: "true", showAccount: "true", sticky: "true", headerHeight: "72" }),
  headerTemplate("header-light", "Light Utility Header", "Bright utility bar with all icons", ["utility", "light"], { headerBg: "#f5f5f7", showSearch: "true", showWishlist: "true", showCart: "true", showAccount: "true" }),
  headerTemplate("header-split", "Split Utility Header", "Icons grouped for quick actions", ["split", "utility"], { layout: "logo-icons-nav", sticky: "true" }),
];

/** Footer presets. */
export const FOOTER_LIBRARY_TEMPLATES: Array<SectionDef & { keywords: string[] }> = [
  footerTemplate("footer-simple-light", "Simple Footer", "Minimal copyright bar", ["simple", "minimal"], "simple", { layout: "centered", bgColor: "#09090b", showSocial: "true" }),
  footerTemplate("footer-ecommerce", "Ecommerce Footer", "Links, contact, and newsletter", ["ecommerce", "shop", "links"], "ecom", { columns: "4", showNewsletter: "true", showPaymentIcons: "true" }),
  footerTemplate("footer-luxury", "Luxury Footer", "Dark elegant footer for premium brands", ["luxury", "premium", "dark"], "simple", { bgColor: "#0a0a0a", textColor: "#f5f5f7", layout: "split", showSocial: "true" }),
  footerTemplate("footer-newsletter", "Newsletter Footer", "Email signup with store links", ["newsletter", "subscribe", "email"], "ecom", { showNewsletter: "true", columns: "3" }),
  footerTemplate("footer-multi-column", "Multi-column Footer", "Several columns of helpful links", ["columns", "links"], "ecom", { columns: "5", showNewsletter: "false" }),
  footerTemplate("footer-brand", "Brand Footer", "Brand story with social links", ["brand", "story"], "mega", { showBrand: "true", showNewsletter: "false", showPayment: "false" }),
  footerTemplate("footer-dark", "Dark Footer", "High-contrast dark footer", ["dark"], "simple", { bgColor: "#000000", textColor: "#ffffff", layout: "split" }),
  footerTemplate("footer-minimal-light", "Minimal Footer", "Quiet footer that stays out of the way", ["minimal", "light"], "simple", { layout: "centered", showSocial: "false", bgColor: "#f5f5f7", textColor: "#1d1d1f" }),
  footerTemplate("footer-corporate", "Corporate Footer", "Structured links for larger stores", ["corporate", "business"], "ecom", { columns: "4", showPaymentIcons: "true", showNewsletter: "false" }),
  footerTemplate("footer-marketplace", "Marketplace Footer", "Dense footer for multi-vendor style shops", ["marketplace"], "mega", { showLinks: "true", showPayment: "true", showBadges: "true", showNewsletter: "true" }),
  footerTemplate("footer-split", "Split Footer", "Copyright on one side, social on the other", ["split"], "simple", { layout: "split", showSocial: "true" }),
  footerTemplate("footer-contact-heavy", "Contact Footer", "Email, phone, and address forward", ["contact", "support"], "ecom", { columns: "3", showNewsletter: "false", contactEmail: "hello@example.com" }),
  footerTemplate("footer-payment", "Payment Footer", "Emphasize trusted payment methods", ["payment", "trust"], "ecom", { showPaymentIcons: "true", columns: "3" }),
  footerTemplate("footer-social-focus", "Social Footer", "Social channels front and center", ["social", "instagram"], "simple", { showSocial: "true", layout: "centered" }),
  footerTemplate("footer-wide", "Wide Link Footer", "Extra-wide multi-column link footer", ["wide", "links"], "mega", { showLinks: "true", columns: "5" }),
  footerTemplate("footer-store-info", "Store Info Footer", "Hours-friendly store details", ["store", "info", "hours"], "ecom", { columns: "3", showNewsletter: "true" }),
];

/** Named presets that fill gaps in the business catalog (alias → existing components). */
export const EXTRA_LIBRARY_TEMPLATES = [
  presetTemplate("contact-store-location", "contact-section", "Store Location", "Show where customers can find you", "contact", ["contact", "location", "store", "address", "map"]),
  presetTemplate("contact-google-map", "google-map", "Google Map", "Embed your store location on the page", "contact", ["contact", "map", "google", "location"]),
  presetTemplate("contact-business-hours", "feature-list", "Business Hours", "List your opening hours", "contact", ["contact", "hours", "open", "schedule"]),
  presetTemplate("contact-faq", "faq", "FAQ Contact", "Common contact questions answered", "contact", ["contact", "faq", "support", "help"]),
  presetTemplate("contact-cards", "contact-section", "Contact Cards", "Email, phone, and address cards", "contact", ["contact", "cards", "email", "phone"]),
  presetTemplate("contact-form-section", "popup-form", "Contact Form", "Let customers message you", "contact", ["contact", "form", "message", "support"]),
  presetTemplate("services-payment", "trust-badges", "Payment Methods", "Show accepted payment options", "services", ["payment", "methods", "cards", "services"]),
  presetTemplate("services-warranty", "guarantee-section", "Warranty", "Highlight your warranty promise", "services", ["warranty", "guarantee", "services"]),
  presetTemplate("services-returns", "benefits-section", "Returns", "Explain your returns policy", "services", ["returns", "refund", "policy", "services"]),
  presetTemplate("newsletter-sms", "newsletter", "SMS Subscribe", "Collect phone numbers for SMS offers", "newsletter", ["sms", "subscribe", "phone", "newsletter"]),
  presetTemplate("newsletter-popup", "popup-form", "Popup Subscribe", "Popup to grow your email list", "newsletter", ["popup", "subscribe", "newsletter", "email"]),
  presetTemplate("blog-grid", "image-grid", "Blog Grid", "Grid of article-style cards", "blog", ["blog", "grid", "articles", "news"]),
  presetTemplate("blog-featured", "company-story", "Featured Articles", "Spotlight your best stories", "blog", ["blog", "articles", "featured", "news"]),
  presetTemplate("blog-latest", "timeline", "Latest News", "Chronological updates and news", "blog", ["news", "blog", "updates", "latest"]),
  presetTemplate("faq-support-center", "why-choose-us", "Support Center", "Help topics and support highlights", "faq", ["support", "help", "faq", "center"]),
];

const TYPE_ALIASES_FOR_TEMPLATES: Record<string, string> = {
  "header-minimal": "header-bar",
  "header-modern": "header-bar",
  "header-center-logo": "header-bar",
  "header-mega": "header-bar",
  "header-transparent": "header-bar",
  "header-sticky": "header-bar",
  "header-luxury": "header-bar",
  "header-fashion": "header-bar",
  "header-electronics": "header-bar",
  "header-grocery": "header-bar",
  "header-mobile": "header-bar",
  "header-search-focus": "header-bar",
  "header-brand": "header-bar",
  "header-marketplace": "header-bar",
  "header-light": "header-bar",
  "header-split": "header-bar",
  "footer-simple-light": "simple-footer",
  "footer-ecommerce": "ecommerce-footer",
  "footer-luxury": "simple-footer",
  "footer-newsletter": "ecommerce-footer",
  "footer-multi-column": "ecommerce-footer",
  "footer-brand": "mega-footer",
  "footer-dark": "simple-footer",
  "footer-minimal-light": "simple-footer",
  "footer-corporate": "ecommerce-footer",
  "footer-marketplace": "mega-footer",
  "footer-split": "simple-footer",
  "footer-contact-heavy": "ecommerce-footer",
  "footer-payment": "ecommerce-footer",
  "footer-social-focus": "simple-footer",
  "footer-wide": "mega-footer",
  "footer-store-info": "ecommerce-footer",
  "contact-store-location": "contact-section",
  "contact-google-map": "google-map",
  "contact-cards": "contact-section",
  "contact-form-section": "popup-form",
  "contact-business-hours": "feature-list",
  "contact-faq": "faq",
  "services-payment": "trust-badges",
  "services-warranty": "guarantee-section",
  "services-returns": "benefits-section",
  "newsletter-sms": "newsletter",
  "newsletter-popup": "popup-form",
  "blog-grid": "image-grid",
  "blog-featured": "company-story",
  "blog-latest": "timeline",
  "faq-support-center": "why-choose-us",
};

export function resolveLibraryRenderType(type: string): string {
  return TYPE_ALIASES_FOR_TEMPLATES[type] ?? type;
}

export const LIBRARY_TEMPLATE_ALIASES = TYPE_ALIASES_FOR_TEMPLATES;

function toLibrarySection(def: SectionDef): LibrarySection | null {
  if (HIDDEN_FROM_LIBRARY.has(def.type)) return null;
  const meta = META[def.type];
  const libraryCategory = meta?.category
    ?? (def.category === "header" || def.category === "footer" || def.category === "hero" || def.category === "products" || def.category === "category" || def.category === "promotions"
      ? (def.category as LibraryCategoryId)
      : null);
  if (!libraryCategory) return null;

  return {
    ...def,
    label: meta?.label ?? def.label,
    description: meta?.description ?? def.description,
    libraryCategory,
    category: libraryCategory as SectionCategory,
    keywords: meta?.keywords ?? [def.label.toLowerCase(), def.category],
  };
}

let cachedLibrary: LibrarySection[] | null = null;

export function getLibrarySections(): LibrarySection[] {
  if (cachedLibrary) return cachedLibrary;

  const fromRegistry = sectionRegistry
    .map(toLibrarySection)
    .filter(Boolean) as LibrarySection[];

  const headers = HEADER_LIBRARY_TEMPLATES.map((t) => ({
    ...t,
    libraryCategory: "header" as LibraryCategoryId,
  }));
  const footers = FOOTER_LIBRARY_TEMPLATES.map((t) => ({
    ...t,
    libraryCategory: "footer" as LibraryCategoryId,
  }));
  const extras = EXTRA_LIBRARY_TEMPLATES.map((t) => ({
    type: t.type,
    label: t.label,
    category: t.category,
    icon: t.icon,
    description: t.description,
    props: t.props,
    keywords: t.keywords,
    libraryCategory: t.libraryCategory,
  }));

  // Prefer templates over base header-bar / simple-footer duplicates
  const hideBase = new Set(["header-bar", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"]);
  const filtered = fromRegistry.filter((s) => !hideBase.has(s.type));

  cachedLibrary = [...headers, ...footers, ...extras, ...filtered];
  return cachedLibrary;
}

export function getLibrarySectionByType(type: string): LibrarySection | undefined {
  return getLibrarySections().find((s) => s.type === type);
}

export function searchLibrarySections(query: string, sections = getLibrarySections()): LibrarySection[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections.filter((s) => {
    const hay = [
      s.label,
      s.description,
      s.libraryCategory,
      s.type,
      ...s.keywords,
    ].join(" ").toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
  });
}

export function getLibraryDefaults(type: string): Record<string, string> {
  const lib = getLibrarySectionByType(type);
  if (lib) {
    const props: Record<string, string> = {};
    for (const [key, propDef] of Object.entries(lib.props)) {
      props[key] = propDef.default;
    }
    return props;
  }
  return registryDefaults(resolveLibraryRenderType(type));
}

export const POPULAR_LIBRARY_TYPES = [
  "hero-banner",
  "header-modern",
  "featured-products",
  "category-grid",
  "flash-sale",
  "testimonials",
  "discount-banner",
  "newsletter",
  "footer-ecommerce",
  "faq",
];

for (const [from, to] of Object.entries(TYPE_ALIASES_FOR_TEMPLATES)) {
  registerSectionTypeAlias(from, to);
}
for (const def of [...HEADER_LIBRARY_TEMPLATES, ...FOOTER_LIBRARY_TEMPLATES, ...EXTRA_LIBRARY_TEMPLATES]) {
  registerSectionDef(def);
}
