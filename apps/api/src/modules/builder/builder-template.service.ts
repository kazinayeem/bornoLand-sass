import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { BuilderTemplateModel } from "./builder-template.model.js";
import { StorePageModel } from "../pages/store-page.model.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return crypto.randomBytes(8).toString("hex");
}

async function generateUniqueSlug(storeId: string, baseSlug: string): Promise<string> {
  const slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const existing = await BuilderTemplateModel.findOne({ storeId, slug });
  if (!existing) return slug;

  let counter = 2;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const dup = await BuilderTemplateModel.findOne({ storeId, slug: candidate });
    if (!dup) return candidate;
    counter++;
  }
}

// ─── Built-in starter templates ──────────────────────────────────────────────

const STORE_ID_PLACEHOLDER = "BUILT_IN";

// ─── Unsplash demo images ────────────────────────────────────────────────────
const IMG = {
  // Hero backgrounds
  heroEcom: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
  heroFashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80",
  heroElectronics: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&q=80",
  heroFurniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80",
  heroGrocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80",
  heroCosmetics: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80",
  heroJewelry: "https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=1600&q=80",
  heroRestaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
  heroPortfolio: "https://images.unsplash.com/photo-1467489002782-20b62519a37f?w=1600&q=80",
  heroLanding: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
  // Fashion slider images
  fashionSlide1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
  fashionSlide2: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
  fashionSlide3: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1600&q=80",
  // Products
  prodBackpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  prodHeadphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  prodWatch: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
  prodHoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
  prodTracker: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80",
  prodJournal: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
  prodShoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  prodSunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
  prodCoffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  prodCandle: "https://images.unsplash.com/photo-1602607718885-e7f1d76677e7?w=600&q=80",
  prodLamp: "https://images.unsplash.com/photo-1507473885765-e6ed057ab788?w=600&q=80",
  prodMug: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  // Furniture products
  prodSofa: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  prodChair: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",
  prodTable: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600&q=80",
  prodBed: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
  // Grocery products
  prodFruit: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80",
  prodBread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
  prodCheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
  // Cosmetics products
  prodSkincare: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
  prodPerfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
  prodMakeup: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
  // Jewelry products
  prodRing: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
  prodNecklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
  prodEarrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  // Restaurant
  restDish1: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  restDish2: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  restDish3: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80",
  restDish4: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  restDish5: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80",
  restDish6: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  // Categories
  catElectronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  catClothing: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
  catAccessories: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
  catHome: "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=600&q=80",
  catSports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  catBooks: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
  catBeauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  catFurniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  catJewelry: "https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=600&q=80",
  catGrocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  catFood: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  catFashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  // Gallery
  gal1: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  gal2: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  gal3: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
  gal4: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
  gal5: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  gal6: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  // Newsletter backgrounds
  nlEcom: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
  nlFashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
  nlJewelry: "https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=1200&q=80",
};

// Common section prop defaults
const S = (extra: Record<string, string>) => ({
  maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "",
  visibility: "all", animation: "none", paddingY: "64", paddingX: "16",
  marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "",
  bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center",
  ...extra,
});

const STARTER_TEMPLATES = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ECOMMERCE STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Ecommerce Store",
    slug: "ecommerce-store",
    description: "Complete ecommerce storefront with hero, categories, featured products, reviews, newsletter, and full footer",
    category: "ecommerce",
    templateType: "page" as const,
    thumbnail: IMG.heroEcom,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-ecom-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Welcome to Our Store", headline: "Discover Products You'll Love", subheadline: "Shop the latest trends with free shipping on orders over $50", buttonText: "Shop Now", buttonLink: "/shop", secondaryButtonText: "Learn More", secondaryButtonLink: "/about", heroHeight: "lg", imageUrl: IMG.heroEcom, mobileImageUrl: IMG.heroEcom, overlayColor: "rgba(15,23,42,0.45)", overlayOpacity: "45", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #0f172a, #1e293b)", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "cat-ecom-1", type: "category-grid", label: "Shop by Category", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4", cardStyle: "default", showProductCount: "true", animation: "slideUp", ...S({}) } },
      { id: "feat-ecom-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Handpicked favorites just for you", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({ bgColor: "#fafafa" }) } },
      { id: "trust-ecom-1", type: "trust-badges", label: "Trust Badges", visible: true, props: { title: "Why Shop With Us", showPayment: "true", showShipping: "true", showSecurity: "true", showGuarantee: "true", showSupport: "true", animation: "slideUp", ...S({ bgColor: "#f8fafc", paddingY: "48" }) } },
      { id: "test-ecom-1", type: "testimonials", label: "Customer Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Real reviews from real customers", layout: "grid", cardStyle: "default", avatarStyle: "circle", testimonialsCount: "6", animation: "slideUp", ...S({}) } },
      { id: "nl-ecom-1", type: "newsletter", label: "Newsletter Signup", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe for exclusive deals and new arrivals", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#18181b", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-ecom-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@example.com", contactPhone: "+1 (555) 123-4567", contactAddress: "123 Commerce St, New York, NY", columns: "4", ...S({ maxWidth: "1200px", bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "Home - Your Store", description: "Welcome to our store. Shop the best products online." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 2. FASHION STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Fashion Store",
    slug: "fashion-store",
    description: "Stylish fashion storefront with slider hero, lookbook, trending items, Instagram feed, and newsletter",
    category: "fashion",
    templateType: "page" as const,
    thumbnail: IMG.heroFashion,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-fashion-1", type: "slider-hero", label: "Hero Slider", visible: true, props: { slideCount: "3", autoplaySpeed: "5000", showArrows: "true", showDots: "true", slide1Image: IMG.fashionSlide1, slide1Title: "Summer Collection 2026", slide1ButtonText: "Shop Now", slide2Image: IMG.fashionSlide2, slide2Title: "New Arrivals", slide2ButtonText: "Explore", slide3Image: IMG.fashionSlide3, slide3Title: "Accessories", slide3ButtonText: "Shop Accessories", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #fdf2f8, #fce7f3)", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "lookbook-fashion-1", type: "image-grid", label: "Lookbook", visible: true, props: { title: "Lookbook", columns: "3", gap: "16", aspectRatio: "1:1", animation: "fadeIn", ...S({}) } },
      { id: "trend-fashion-1", type: "trending-products", label: "Trending Now", visible: true, props: { title: "Trending Now", subtitle: "What everyone's wearing", gridColumns: "4", productCount: "8", animation: "slideUp", ...S({ bgColor: "#fafafa" }) } },
      { id: "insta-fashion-1", type: "instagram-feed", label: "Follow Us", visible: true, props: { title: "Follow Us on Instagram", subtitle: "@yourstore", handle: "@yourstore", postCount: "6", columns: "3", showLikes: "true", animation: "fadeIn", ...S({}) } },
      { id: "nl-fashion-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Get 10% Off Your First Order", subheadline: "Join our fashion community for exclusive deals", buttonText: "Subscribe", buttonLink: "#", placeholderText: "your@email.com", showName: "true", animation: "slideUp", ...S({ maxWidth: "800px", bgColor: "#fdf2f8", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-fashion-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Fashion Store. All rights reserved.", showSocial: "true", layout: "split", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "32", borderRadius: "0", textAlignment: "center", fontSize: "md" }) } },
    ],
    seo: { title: "Fashion Store - Trendy Styles", description: "Discover the latest fashion trends and styles." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ELECTRONICS STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Electronics Store",
    slug: "electronics-store",
    description: "Modern electronics storefront with product hero, best sellers, trust badges, and detailed footer",
    category: "electronics",
    templateType: "page" as const,
    thumbnail: IMG.heroElectronics,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-elec-1", type: "product-hero", label: "Featured Product", visible: true, props: { productImage: IMG.prodHeadphones, productName: "Wireless Pro Headphones", productPrice: "$249.99", originalPrice: "$349.99", description: "Experience next-gen noise cancellation with 40-hour battery life and premium sound.", buttonText: "Buy Now", buttonLink: "/product/wireless-pro", badge: "New Arrival", ...S({ bgColor: "#0f172a", textColor: "#ffffff", paddingY: "64", textAlignment: "left", animation: "none" }) } },
      { id: "feat-elec-1", type: "featured-products", label: "Best Sellers", visible: true, props: { title: "Best Sellers", subtitle: "Most popular electronics", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({}) } },
      { id: "trust-elec-1", type: "trust-badges", label: "Trust Badges", visible: true, props: { title: "Why Shop With Us", showPayment: "true", showShipping: "true", showSecurity: "true", showGuarantee: "true", showSupport: "true", animation: "slideUp", ...S({ bgColor: "#f8fafc", paddingY: "48" }) } },
      { id: "wcu-elec-1", type: "why-choose-us", label: "Why Choose Us", visible: true, props: { title: "Why Choose Us", subtitle: "What sets us apart", columns: "3", feature1Icon: "Truck", feature1Text: "Free Shipping", feature2Icon: "Shield", feature2Text: "2 Year Warranty", feature3Icon: "Headphones", feature3Text: "24/7 Tech Support", animation: "fadeIn", ...S({}) } },
      { id: "test-elec-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Real reviews from real customers", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "slideUp", ...S({ bgColor: "#fafafa" }) } },
      { id: "nl-elec-1", type: "newsletter", label: "Tech Deals", visible: true, props: { headline: "Get Exclusive Tech Deals", subheadline: "Subscribe for the latest gadgets and offers", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", animation: "slideUp", ...S({ maxWidth: "800px", bgColor: "#0f172a", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-elec-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 TechStore. All rights reserved.", showSocial: "true", showNewsletter: "false", showPaymentIcons: "true", contactEmail: "support@techstore.com", contactPhone: "+1 (555) 987-6543", contactAddress: "456 Tech Blvd, San Francisco, CA", columns: "4", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "TechStore - Latest Electronics", description: "Shop the latest electronics, gadgets, and tech accessories." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FURNITURE STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Furniture Store",
    slug: "furniture-store",
    description: "Elegant furniture storefront with hero, categories, featured items, testimonials, and newsletter",
    category: "ecommerce",
    templateType: "page" as const,
    thumbnail: IMG.heroFurniture,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-furn-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Modern Living", headline: "Furnish Your Dream Home", subheadline: "Curated furniture collections designed for comfort and style", buttonText: "Shop Collection", buttonLink: "/shop", secondaryButtonText: "Our Story", secondaryButtonLink: "/about", heroHeight: "lg", imageUrl: IMG.heroFurniture, mobileImageUrl: IMG.heroFurniture, overlayColor: "rgba(15,23,42,0.4)", overlayOpacity: "40", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #78716c, #44403c)", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "cat-furn-1", type: "category-grid", label: "Shop by Room", visible: true, props: { title: "Shop by Room", subtitle: "Find the perfect piece for every space", gridColumns: "4", cardStyle: "elevated", showProductCount: "true", animation: "slideUp", ...S({}) } },
      { id: "feat-furn-1", type: "featured-products", label: "Featured Furniture", visible: true, props: { title: "Featured Furniture", subtitle: "Handpicked for your home", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({ bgColor: "#fafafa" }) } },
      { id: "banner-furn-1", type: "discount-banner", label: "Season Sale", visible: true, props: { headline: "Summer Sale", discountText: "UP TO 40% OFF", subheadline: "Refresh your space with our seasonal deals", buttonText: "Shop Sale", buttonLink: "/sale", bgColor: "#78716c", textColor: "#ffffff", animation: "slideUp", ...S({ maxWidth: "100%", paddingY: "48", borderRadius: "0" }) } },
      { id: "test-furn-1", type: "testimonials", label: "Happy Customers", visible: true, props: { title: "What Our Customers Say", subtitle: "Transforming homes across the country", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "fadeIn", ...S({}) } },
      { id: "nl-furn-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Get Interior Design Tips", subheadline: "Subscribe for inspiration and exclusive offers", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#1c1917", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-furn-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 HomeStyle Furniture. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@homestyle.com", contactPhone: "+1 (555) 456-7890", contactAddress: "789 Design Ave, Chicago, IL", columns: "4", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "HomeStyle Furniture - Modern Living", description: "Curated furniture collections for modern living." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GROCERY STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Grocery Store",
    slug: "grocery-store",
    description: "Fresh grocery storefront with hero, categories, best sellers, deals, and newsletter",
    category: "ecommerce",
    templateType: "page" as const,
    thumbnail: IMG.heroGrocery,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-groc-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Fresh & Organic", headline: "Farm Fresh to Your Door", subheadline: "Premium groceries delivered fresh daily. Free delivery on orders over $50.", buttonText: "Shop Now", buttonLink: "/shop", secondaryButtonText: "View Deals", secondaryButtonLink: "/sale", heroHeight: "lg", imageUrl: IMG.heroGrocery, mobileImageUrl: IMG.heroGrocery, overlayColor: "rgba(15,23,42,0.4)", overlayOpacity: "40", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #166534, #14532d)", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "cat-groc-1", type: "category-grid", label: "Shop by Category", visible: true, props: { title: "Shop by Category", subtitle: "Fresh produce, dairy, bakery & more", gridColumns: "4", cardStyle: "default", showProductCount: "true", animation: "slideUp", ...S({}) } },
      { id: "feat-groc-1", type: "featured-products", label: "Popular Items", visible: true, props: { title: "Popular Items", subtitle: "Customer favorites this week", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({ bgColor: "#fafafa" }) } },
      { id: "deal-groc-1", type: "deal-of-day", label: "Deal of the Day", visible: true, props: { title: "Deal of the Day", productName: "Organic Fruit Basket", productImage: IMG.prodFruit, price: "$24.99", originalPrice: "$39.99", buttonText: "Get This Deal", buttonLink: "/product/fruit-basket", endDate: "2026-12-31", animation: "slideUp", ...S({ bgColor: "#f0fdf4" }) } },
      { id: "test-groc-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Freshness you can trust", layout: "grid", cardStyle: "default", avatarStyle: "circle", testimonialsCount: "6", animation: "fadeIn", ...S({}) } },
      { id: "nl-groc-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Get Weekly Deals", subheadline: "Subscribe for fresh deals and seasonal recipes", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#166534", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-groc-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 FreshMart. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@freshmart.com", contactPhone: "+1 (555) 321-0987", contactAddress: "321 Farm Road, Portland, OR", columns: "4", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "FreshMart - Farm Fresh Groceries", description: "Premium groceries delivered fresh to your door." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 6. COSMETICS STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Cosmetics Store",
    slug: "cosmetics-store",
    description: "Luxury cosmetics storefront with hero, categories, featured products, reviews, and newsletter",
    category: "fashion",
    templateType: "page" as const,
    thumbnail: IMG.heroCosmetics,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-cosm-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Beauty & Skincare", headline: "Glow Up Your Routine", subheadline: "Premium beauty products curated for every skin type", buttonText: "Shop Beauty", buttonLink: "/shop", secondaryButtonText: "Skin Quiz", secondaryButtonLink: "/quiz", heroHeight: "lg", imageUrl: IMG.heroCosmetics, mobileImageUrl: IMG.heroCosmetics, overlayColor: "rgba(15,23,42,0.35)", overlayOpacity: "35", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #be185d, #9d174d)", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "cat-cosm-1", type: "category-grid", label: "Shop by Category", visible: true, props: { title: "Shop by Category", subtitle: "Skincare, makeup, fragrance & more", gridColumns: "4", cardStyle: "default", showProductCount: "true", animation: "slideUp", ...S({}) } },
      { id: "feat-cosm-1", type: "featured-products", label: "Best Sellers", visible: true, props: { title: "Best Sellers", subtitle: "Our most-loved beauty products", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({ bgColor: "#fdf2f8" }) } },
      { id: "test-cosm-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Real results from real people", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "slideUp", ...S({}) } },
      { id: "nl-cosm-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Get 15% Off Your First Order", subheadline: "Join our beauty community for tips and exclusive deals", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "true", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#fdf2f8", textColor: "#18181b", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-cosm-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 GlowBeauty. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@glowbeauty.com", contactPhone: "+1 (555) 234-5678", contactAddress: "456 Beauty Blvd, Los Angeles, CA", columns: "4", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "GlowBeauty - Premium Cosmetics", description: "Premium beauty products for every skin type." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 7. JEWELRY STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Jewelry Store",
    slug: "jewelry-store",
    description: "Elegant jewelry storefront with hero, categories, featured pieces, testimonials, and newsletter",
    category: "fashion",
    templateType: "page" as const,
    thumbnail: IMG.heroJewelry,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-jew-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Fine Jewelry", headline: "Timeless Elegance", subheadline: "Handcrafted jewelry pieces that tell your story", buttonText: "Shop Collection", buttonLink: "/shop", secondaryButtonText: "Custom Design", secondaryButtonLink: "/custom", heroHeight: "lg", imageUrl: IMG.heroJewelry, mobileImageUrl: IMG.heroJewelry, overlayColor: "rgba(15,23,42,0.4)", overlayOpacity: "40", ...S({ maxWidth: "100%", bgColor: "", bgGradient: "linear-gradient(135deg, #1e293b, #0f172a)", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "cat-jew-1", type: "category-grid", label: "Shop by Category", visible: true, props: { title: "Shop by Category", subtitle: "Rings, necklaces, earrings & more", gridColumns: "4", cardStyle: "elevated", showProductCount: "true", animation: "slideUp", ...S({}) } },
      { id: "feat-jew-1", type: "featured-products", label: "Featured Pieces", visible: true, props: { title: "Featured Pieces", subtitle: "Exquisite designs for every occasion", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", animation: "fadeIn", ...S({ bgColor: "#fafafa" }) } },
      { id: "banner-jew-1", type: "discount-banner", label: "Gift Special", visible: true, props: { headline: "Gift Guide", discountText: "FREE ENGRAVING", subheadline: "Make it personal with complimentary engraving on all rings", buttonText: "Shop Gifts", buttonLink: "/gifts", bgColor: "#1e293b", textColor: "#ffffff", animation: "slideUp", ...S({ maxWidth: "100%", paddingY: "48", borderRadius: "0" }) } },
      { id: "test-jew-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Cherished by jewelry lovers worldwide", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "fadeIn", ...S({}) } },
      { id: "nl-jew-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Join Our VIP List", subheadline: "Exclusive access to new collections and special offers", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "true", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#1e293b", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-jew-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 LuxeJewels. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@luxejewels.com", contactPhone: "+1 (555) 876-5432", contactAddress: "123 Diamond St, New York, NY", columns: "4", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "48", borderRadius: "0", textAlignment: "left", fontSize: "md" }) } },
    ],
    seo: { title: "LuxeJewels - Fine Jewelry", description: "Handcrafted jewelry pieces that tell your story." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 8. RESTAURANT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Restaurant",
    slug: "restaurant-template",
    description: "Beautiful restaurant website with ambiance hero, story, menu gallery, reviews, and reservation signup",
    category: "restaurant",
    templateType: "page" as const,
    thumbnail: IMG.heroRestaurant,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-rest-1", type: "image-hero", label: "Welcome", visible: true, props: { imageUrl: IMG.heroRestaurant, overlay: "true", headline: "La Maison", subheadline: "Fine dining experience in the heart of the city", buttonText: "Reserve a Table", buttonLink: "/reservations", ...S({ maxWidth: "100%", bgColor: "#09090b", bgOverlayColor: "rgba(0,0,0,0.5)", bgOverlayOpacity: "50", textColor: "#ffffff", paddingY: "0", paddingX: "0", textAlignment: "center" }) } },
      { id: "story-rest-1", type: "rich-text", label: "Our Story", visible: true, props: { title: "Our Story", content: "Founded in 2010, La Maison brings together the finest ingredients from around the world. Our award-winning chefs craft unforgettable dining experiences that celebrate flavor, tradition, and innovation.", showTitle: "true", columns: "1", animation: "fadeIn", ...S({ maxWidth: "800px", paddingY: "80" }) } },
      { id: "gal-rest-1", type: "gallery", label: "Our Dishes", visible: true, props: { title: "Our Signature Dishes", subtitle: "A taste of excellence", columns: "3", showLightbox: "true", imageCount: "6", animation: "slideUp", ...S({ bgColor: "#fafafa" }) } },
      { id: "test-rest-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Guests Say", subtitle: "Experiences worth sharing", layout: "carousel", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "4", animation: "fadeIn", ...S({}) } },
      { id: "nl-rest-1", type: "newsletter", label: "Reservations", visible: true, props: { headline: "Make a Reservation", subheadline: "Book your table for an unforgettable evening", buttonText: "Book Now", buttonLink: "/reservations", placeholderText: "Enter your email", showName: "true", animation: "slideUp", ...S({ maxWidth: "800px", bgColor: "#18181b", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-rest-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 La Maison Restaurant. All rights reserved.", showSocial: "true", layout: "centered", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "32", borderRadius: "0", textAlignment: "center", fontSize: "md" }) } },
    ],
    seo: { title: "La Maison - Fine Dining Restaurant", description: "Experience fine dining at La Maison. Reserve your table today." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 9. PORTFOLIO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Portfolio",
    slug: "portfolio-template",
    description: "Creative portfolio with fullscreen hero, project gallery, about section, testimonials, and contact",
    category: "landing",
    templateType: "page" as const,
    thumbnail: IMG.heroPortfolio,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-port-1", type: "fullscreen-hero", label: "Hero", visible: true, props: { imageUrl: IMG.heroPortfolio, headline: "Creative Design Studio", subheadline: "We craft digital experiences that inspire and engage", buttonText: "View Our Work", buttonLink: "/work", secondaryButtonText: "Get in Touch", secondaryButtonLink: "/contact", showScrollIndicator: "true", ...S({ maxWidth: "100%", bgColor: "#0f172a", bgGradient: "linear-gradient(135deg, #0f172a, #1e3a5f)", bgOverlayColor: "rgba(0,0,0,0.3)", bgOverlayOpacity: "30", textColor: "#ffffff", paddingY: "0", paddingX: "0", fontSize: "xl", textAlignment: "center" }) } },
      { id: "gallery-port-1", type: "gallery", label: "Our Work", visible: true, props: { title: "Our Work", subtitle: "Selected projects", columns: "3", showLightbox: "true", imageCount: "6", animation: "fadeIn", ...S({}) } },
      { id: "about-port-1", type: "about-section", label: "About Us", visible: true, props: { title: "About Us", content: "We are a team of passionate designers and developers dedicated to creating beautiful, functional digital experiences. With over 10 years of experience, we've helped hundreds of brands tell their story.", imageUrl: IMG.heroPortfolio, imagePosition: "right", layout: "side-by-side", animation: "slideUp", ...S({ bgColor: "#fafafa" }) } },
      { id: "test-port-1", type: "testimonials", label: "Client Reviews", visible: true, props: { title: "What Clients Say", subtitle: "Trusted by leading brands", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "fadeIn", ...S({}) } },
      { id: "faq-port-1", type: "faq", label: "FAQ", visible: true, props: { title: "Frequently Asked Questions", subtitle: "Got questions? We've got answers", faqCount: "5", layout: "accordion", showSearch: "false", animation: "slideUp", ...S({ maxWidth: "800px", bgColor: "#fafafa" }) } },
      { id: "nl-port-1", type: "newsletter", label: "Contact", visible: true, props: { headline: "Let's Work Together", subheadline: "Have a project in mind? We'd love to hear from you.", buttonText: "Send Message", buttonLink: "/contact", placeholderText: "Enter your email", showName: "true", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#0f172a", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-port-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Creative Studio. All rights reserved.", showSocial: "true", layout: "centered", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "32", borderRadius: "0", textAlignment: "center", fontSize: "md" }) } },
    ],
    seo: { title: "Creative Studio - Portfolio", description: "We craft digital experiences that inspire and engage." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 10. LANDING PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Landing Page",
    slug: "landing-page-template",
    description: "High-converting landing page with fullscreen hero, features, social proof, FAQ, and call-to-action",
    category: "landing",
    templateType: "page" as const,
    thumbnail: IMG.heroLanding,
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-land-1", type: "fullscreen-hero", label: "Hero", visible: true, props: { imageUrl: IMG.heroLanding, headline: "Transform Your Business Today", subheadline: "The all-in-one platform that helps you grow, manage, and scale your business effortlessly", buttonText: "Get Started Free", buttonLink: "/signup", secondaryButtonText: "Learn More", secondaryButtonLink: "/about", showScrollIndicator: "true", ...S({ maxWidth: "100%", bgColor: "#0f172a", bgGradient: "linear-gradient(135deg, #0f172a, #1e3a5f)", bgOverlayColor: "rgba(0,0,0,0.3)", bgOverlayOpacity: "30", textColor: "#ffffff", paddingY: "0", paddingX: "0", fontSize: "xl", textAlignment: "center" }) } },
      { id: "feat-land-1", type: "feature-list", label: "Features", visible: true, props: { title: "Everything You Need", subtitle: "Powerful features to accelerate your growth", columns: "3", showIcons: "true", animation: "slideUp", ...S({ paddingY: "80" }) } },
      { id: "trust-land-1", type: "trust-badges", label: "Trust Badges", visible: true, props: { title: "Trusted by 10,000+ Businesses", showPayment: "true", showShipping: "true", showSecurity: "true", showGuarantee: "true", showSupport: "true", animation: "fadeIn", ...S({ bgColor: "#f8fafc", paddingY: "48" }) } },
      { id: "test-land-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "Loved by Thousands", subtitle: "See what our customers say about us", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", animation: "fadeIn", ...S({ bgColor: "#f8fafc" }) } },
      { id: "faq-land-1", type: "faq", label: "FAQ", visible: true, props: { title: "Frequently Asked Questions", subtitle: "Got questions? We've got answers", faqCount: "5", layout: "accordion", showSearch: "true", animation: "slideUp", ...S({ maxWidth: "800px" }) } },
      { id: "nl-land-1", type: "newsletter", label: "CTA", visible: true, props: { headline: "Ready to Get Started?", subheadline: "Join thousands of businesses already using our platform", buttonText: "Start Free Trial", buttonLink: "/signup", placeholderText: "Enter your work email", showName: "false", animation: "fadeIn", ...S({ maxWidth: "800px", bgColor: "#0f172a", textColor: "#ffffff", paddingY: "80", borderRadius: "16" }) } },
      { id: "ft-land-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Company. All rights reserved.", showSocial: "true", layout: "centered", ...S({ bgColor: "#09090b", textColor: "#fafafa", paddingY: "32", borderRadius: "0", textAlignment: "center", fontSize: "md" }) } },
    ],
    seo: { title: "Landing Page - Your Product", description: "Discover the best solution for your business needs." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
];

export async function seedBuiltInTemplates(storeId: string) {
  await connectDatabase();

  let created = 0;

  for (const tpl of STARTER_TEMPLATES) {
    const existing = await BuilderTemplateModel.findOne({ storeId, slug: tpl.slug, isBuiltIn: true });
    if (existing) continue;

    const count = await BuilderTemplateModel.countDocuments({ storeId });

    await BuilderTemplateModel.create({
      storeId,
      name: tpl.name,
      slug: tpl.slug,
      description: tpl.description,
      category: tpl.category,
      templateType: tpl.templateType,
      sections: tpl.sections,
      seo: tpl.seo,
      settings: tpl.settings,
      thumbnail: tpl.thumbnail,
      isBuiltIn: true,
      status: "published",
      sortOrder: count,
    });

    created++;
  }

  return { ok: true as const, data: { created } };
}

// ─── List templates ──────────────────────────────────────────────────────────

export async function listTemplates(storeId: string, category?: string, templateType?: string) {
  await connectDatabase();

  // Auto-seed built-in templates if they don't exist
  await seedBuiltInTemplates(storeId);

  const filter: Record<string, unknown> = { storeId, status: { $ne: "archived" } };
  if (category) filter.category = category;
  if (templateType) filter.templateType = templateType;

  const templates = await BuilderTemplateModel.find(filter)
    .populate("createdBy", "name email")
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  return { ok: true as const, data: { templates } };
}

// ─── Get single template ─────────────────────────────────────────────────────

export async function getTemplate(templateId: string) {
  await connectDatabase();
  const template = await BuilderTemplateModel.findById(templateId)
    .populate("createdBy", "name email")
    .lean();
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

// ─── Create template ─────────────────────────────────────────────────────────

export async function createTemplate(
  storeId: string,
  payload: {
    name: string;
    description?: string;
    category?: string;
    templateType?: string;
    sections?: unknown[];
    theme?: Record<string, unknown>;
    seo?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    thumbnail?: string;
    createdBy?: string;
  }
) {
  await connectDatabase();
  const slug = await generateUniqueSlug(storeId, payload.name);

  const count = await BuilderTemplateModel.countDocuments({ storeId });

  const template = await BuilderTemplateModel.create({
    storeId,
    name: payload.name,
    slug,
    description: payload.description ?? "",
    category: payload.category ?? "custom",
    templateType: payload.templateType ?? "section",
    sections: payload.sections ?? [],
    theme: payload.theme ?? {},
    seo: payload.seo ?? {},
    settings: payload.settings ?? {},
    thumbnail: payload.thumbnail ?? "",
    status: "draft",
    createdBy: payload.createdBy,
    sortOrder: count,
  });

  return { ok: true as const, data: { template: template.toObject() } };
}

// ─── Create template from page ───────────────────────────────────────────────

export async function createTemplateFromPage(
  storeId: string,
  pageId: string,
  payload: {
    name: string;
    description?: string;
    category?: string;
    thumbnail?: string;
    createdBy?: string;
  }
) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null }).lean();
  if (!page) return { ok: false as const, message: "Page not found" };

  const slug = await generateUniqueSlug(storeId, payload.name);

  const count = await BuilderTemplateModel.countDocuments({ storeId });

  const template = await BuilderTemplateModel.create({
    storeId,
    name: payload.name,
    slug,
    description: payload.description ?? "",
    category: payload.category ?? "page",
    templateType: "page",
    sections: (page as any).sections ?? [],
    theme: (page as any).theme ?? {},
    seo: (page as any).seo ?? {},
    settings: (page as any).settings ?? {},
    thumbnail: payload.thumbnail ?? "",
    status: "draft",
    createdBy: payload.createdBy,
    sortOrder: count,
  });

  return { ok: true as const, data: { template: template.toObject() } };
}

// ─── Update template ─────────────────────────────────────────────────────────

export async function updateTemplate(
  templateId: string,
  storeId: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const existing = await BuilderTemplateModel.findOne({ _id: templateId, storeId });
  if (!existing) return { ok: false as const, message: "Template not found" };

  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.category !== undefined) update.category = payload.category;
  if (payload.templateType !== undefined) update.templateType = payload.templateType;
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.theme !== undefined) update.theme = payload.theme;
  if (payload.seo !== undefined) update.seo = payload.seo;
  if (payload.settings !== undefined) update.settings = payload.settings;
  if (payload.thumbnail !== undefined) update.thumbnail = payload.thumbnail;
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.sortOrder !== undefined) update.sortOrder = payload.sortOrder;

  const template = await BuilderTemplateModel.findOneAndUpdate(
    { _id: templateId, storeId },
    { $set: update },
    { new: true }
  ).lean();

  return { ok: true as const, data: { template } };
}

// ─── Delete template ─────────────────────────────────────────────────────────

export async function deleteTemplate(templateId: string, storeId: string) {
  await connectDatabase();
  const template = await BuilderTemplateModel.findOne({ _id: templateId, storeId });
  if (!template) return { ok: false as const, message: "Template not found" };

  await BuilderTemplateModel.deleteOne({ _id: templateId, storeId });
  return { ok: true as const, message: "Template deleted" };
}

// ─── Publish template ────────────────────────────────────────────────────────

export async function publishTemplate(templateId: string, storeId: string) {
  await connectDatabase();
  const template = await BuilderTemplateModel.findOneAndUpdate(
    { _id: templateId, storeId },
    { $set: { status: "published" } },
    { new: true }
  ).lean();
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

// ─── Duplicate template ──────────────────────────────────────────────────────

export async function duplicateTemplate(templateId: string, storeId: string) {
  await connectDatabase();
  const original = await BuilderTemplateModel.findOne({ _id: templateId, storeId }).lean();
  if (!original) return { ok: false as const, message: "Template not found" };

  const newSlug = await generateUniqueSlug(storeId, `${(original as any).slug}-copy`);

  const template = await BuilderTemplateModel.create({
    storeId: (original as any).storeId,
    name: `${(original as any).name} (Copy)`,
    slug: newSlug,
    description: (original as any).description,
    category: (original as any).category,
    templateType: (original as any).templateType,
    sections: (original as any).sections,
    theme: (original as any).theme,
    seo: (original as any).seo,
    settings: (original as any).settings,
    thumbnail: (original as any).thumbnail,
    status: "draft",
    sortOrder: ((original as any).sortOrder ?? 0) + 1,
  });

  return { ok: true as const, data: { template: template.toObject() } };
}

// ─── Export template ─────────────────────────────────────────────────────────

export async function exportTemplate(templateId: string, storeId: string) {
  await connectDatabase();
  const template = (await BuilderTemplateModel.findOne({ _id: templateId, storeId }).lean()) as Record<string, unknown> | null;
  if (!template) return { ok: false as const, message: "Template not found" };

  const exportData = {
    version: "1.0",
    type: "builder_template",
    exportedAt: new Date().toISOString(),
    name: template.name,
    description: template.description,
    category: template.category,
    templateType: template.templateType,
    sections: template.sections ?? [],
    theme: template.theme,
    seo: template.seo,
    settings: template.settings,
  };

  return { ok: true as const, data: exportData };
}

// ─── Import template ─────────────────────────────────────────────────────────

export async function importTemplate(
  storeId: string,
  payload: {
    name: string;
    description?: string;
    category?: string;
    templateType?: string;
    sections?: unknown[];
    theme?: Record<string, unknown>;
    seo?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    createdBy?: string;
  }
) {
  await connectDatabase();
  const slug = await generateUniqueSlug(storeId, payload.name);

  const count = await BuilderTemplateModel.countDocuments({ storeId });

  const template = await BuilderTemplateModel.create({
    storeId,
    name: payload.name,
    slug,
    description: payload.description ?? "",
    category: payload.category ?? "imported",
    templateType: payload.templateType ?? "section",
    sections: payload.sections ?? [],
    theme: payload.theme ?? {},
    seo: payload.seo ?? {},
    settings: payload.settings ?? {},
    status: "draft",
    createdBy: payload.createdBy,
    sortOrder: count,
  });

  return { ok: true as const, data: { template: template.toObject() } };
}
