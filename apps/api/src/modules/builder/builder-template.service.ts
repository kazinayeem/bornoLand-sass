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

const STARTER_TEMPLATES = [
  {
    name: "Ecommerce Store",
    slug: "ecommerce-store",
    description: "Complete ecommerce storefront with hero, categories, featured products, reviews, newsletter, and full footer",
    category: "ecommerce",
    templateType: "page" as const,
    thumbnail: "",
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "hero-banner-ecom-1", type: "hero-banner", label: "Welcome Banner", visible: true, props: { kicker: "Welcome to Our Store", headline: "Discover Products You'll Love", subheadline: "Shop the latest trends with free shipping on orders over $50", buttonText: "Shop Now", buttonLink: "/shop", secondaryButtonText: "Learn More", secondaryButtonLink: "/about", heroHeight: "lg", imageUrl: "", mobileImageUrl: "", overlayColor: "rgba(15,23,42,0.45)", overlayOpacity: "45", showVideoModal: "false", videoUrl: "", videoButtonText: "Watch Video", maxWidth: "100%", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "0", paddingX: "0", marginTop: "0", marginBottom: "0", bgColor: "", bgGradient: "linear-gradient(135deg, #0f172a, #1e293b)", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "center", bgOverlayOpacity: "45" } },
      { id: "category-grid-ecom-1", type: "category-grid", label: "Shop by Category", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4", cardStyle: "default", showProductCount: "true", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "featured-products-ecom-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Handpicked favorites just for you", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#fafafa", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "testimonials-ecom-1", type: "testimonials", label: "Customer Reviews", visible: true, props: { title: "What Our Customers Say", subtitle: "Real reviews from real customers", layout: "grid", cardStyle: "default", avatarStyle: "circle", testimonialsCount: "6", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "newsletter-ecom-1", type: "newsletter", label: "Newsletter Signup", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe for exclusive deals and new arrivals", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", bgImage: "", maxWidth: "800px", shadow: "none", borderRadius: "16", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#18181b", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "center" } },
      { id: "ecommerce-footer-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true", showNewsletter: "true", showPaymentIcons: "true", contactEmail: "hello@example.com", contactPhone: "+1 (555) 123-4567", contactAddress: "123 Commerce St, New York, NY", columns: "4", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "48", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#09090b", textColor: "#fafafa", fontSize: "md", textAlignment: "left" } },
    ],
    seo: { title: "Home - Your Store", description: "Welcome to our store. Shop the best products online." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  {
    name: "Fashion Store",
    slug: "fashion-store",
    description: "Stylish fashion storefront with slider hero, lookbook, trending items, Instagram feed, and newsletter",
    category: "fashion",
    templateType: "page" as const,
    thumbnail: "",
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "slider-hero-fashion-1", type: "slider-hero", label: "Hero Slider", visible: true, props: { slideCount: "3", autoplaySpeed: "5000", showArrows: "true", showDots: "true", slide1Image: "", slide1Title: "Summer Collection 2026", slide1ButtonText: "Shop Now", slide2Image: "", slide2Title: "New Arrivals", slide2ButtonText: "Explore", slide3Image: "", slide3Title: "Accessories", slide3ButtonText: "Shop Accessories", maxWidth: "100%", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "0", paddingX: "0", marginTop: "0", marginBottom: "0", bgColor: "", bgGradient: "linear-gradient(135deg, #fdf2f8, #fce7f3)", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "image-grid-fashion-1", type: "image-grid", label: "Lookbook", visible: true, props: { title: "Lookbook", columns: "3", gap: "16", aspectRatio: "1:1", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "featured-products-fashion-1", type: "trending-products", label: "Trending Now", visible: true, props: { title: "Trending Now", subtitle: "What everyone's wearing", gridColumns: "4", productCount: "8", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#fafafa", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "instagram-feed-fashion-1", type: "instagram-feed", label: "Follow Us", visible: true, props: { title: "Follow Us on Instagram", subtitle: "@yourstore", handle: "@yourstore", postCount: "6", columns: "3", showLikes: "true", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "newsletter-fashion-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Get 10% Off Your First Order", subheadline: "Join our fashion community for exclusive deals", buttonText: "Subscribe", buttonLink: "#", placeholderText: "your@email.com", showName: "true", bgImage: "", maxWidth: "800px", shadow: "none", borderRadius: "16", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#fdf2f8", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "simple-footer-fashion-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Fashion Store. All rights reserved.", showSocial: "true", layout: "split", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "32", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#09090b", textColor: "#fafafa", fontSize: "md", textAlignment: "center" } },
    ],
    seo: { title: "Fashion Store - Trendy Styles", description: "Discover the latest fashion trends and styles." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  {
    name: "Electronics Store",
    slug: "electronics-store",
    description: "Modern electronics storefront with product hero, best sellers, trust badges, and detailed footer",
    category: "electronics",
    templateType: "page" as const,
    thumbnail: "",
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "product-hero-electronics-1", type: "product-hero", label: "Featured Product", visible: true, props: { productImage: "", productName: "Latest Tech Gadget", productPrice: "$799.99", originalPrice: "$999.99", description: "Experience next-gen technology with cutting-edge features and premium design.", buttonText: "Buy Now", buttonLink: "/product/featured", badge: "New Arrival", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#0f172a", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "left" } },
      { id: "featured-products-electronics-1", type: "featured-products", label: "Best Sellers", visible: true, props: { title: "Best Sellers", subtitle: "Most popular electronics", gridColumns: "4", productCount: "8", showBadges: "true", showRatings: "true", showViewAll: "true", viewAllLink: "/shop", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "trust-badges-electronics-1", type: "trust-badges", label: "Trust Badges", visible: true, props: { title: "Why Shop With Us", showPayment: "true", showShipping: "true", showSecurity: "true", showGuarantee: "true", showSupport: "true", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "48", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#f8fafc", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "why-choose-us-electronics-1", type: "why-choose-us", label: "Why Choose Us", visible: true, props: { title: "Why Choose Us", subtitle: "What sets us apart", columns: "3", feature1Icon: "Truck", feature1Text: "Free Shipping", feature2Icon: "Shield", feature2Text: "2 Year Warranty", feature3Icon: "Headphones", feature3Text: "24/7 Tech Support", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "newsletter-electronics-1", type: "newsletter", label: "Tech Deals", visible: true, props: { headline: "Get Exclusive Tech Deals", subheadline: "Subscribe for the latest gadgets and offers", buttonText: "Subscribe", buttonLink: "#", placeholderText: "Enter your email", showName: "false", bgImage: "", maxWidth: "800px", shadow: "none", borderRadius: "16", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#0f172a", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "center" } },
      { id: "ecommerce-footer-electronics-1", type: "ecommerce-footer", label: "Footer", visible: true, props: { copyright: "© 2026 TechStore. All rights reserved.", showSocial: "true", showNewsletter: "false", showPaymentIcons: "true", contactEmail: "support@techstore.com", contactPhone: "+1 (555) 987-6543", contactAddress: "456 Tech Blvd, San Francisco, CA", columns: "4", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "48", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#09090b", textColor: "#fafafa", fontSize: "md", textAlignment: "left" } },
    ],
    seo: { title: "TechStore - Latest Electronics", description: "Shop the latest electronics, gadgets, and tech accessories." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  {
    name: "Restaurant",
    slug: "restaurant-template",
    description: "Beautiful restaurant website with ambiance hero, story, menu gallery, reviews, and reservation signup",
    category: "restaurant",
    templateType: "page" as const,
    thumbnail: "",
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "image-hero-restaurant-1", type: "image-hero", label: "Welcome", visible: true, props: { imageUrl: "", overlay: "true", headline: "La Maison", subheadline: "Fine dining experience in the heart of the city", buttonText: "Reserve a Table", buttonLink: "/reservations", maxWidth: "100%", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "0", paddingX: "0", marginTop: "0", marginBottom: "0", bgColor: "#09090b", bgGradient: "", bgImage: "", bgOverlayColor: "rgba(0,0,0,0.5)", bgOverlayOpacity: "50", textColor: "#ffffff", fontSize: "lg", textAlignment: "center" } },
      { id: "rich-text-restaurant-1", type: "rich-text", label: "Our Story", visible: true, props: { title: "Our Story", content: "Founded in 2010, La Maison brings together the finest ingredients from around the world. Our award-winning chefs craft unforgettable dining experiences that celebrate flavor, tradition, and innovation.", showTitle: "true", columns: "1", maxWidth: "800px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "gallery-restaurant-1", type: "gallery", label: "Our Dishes", visible: true, props: { title: "Our Signature Dishes", subtitle: "A taste of excellence", columns: "3", showLightbox: "true", imageCount: "6", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#fafafa", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "testimonials-restaurant-1", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Guests Say", subtitle: "Experiences worth sharing", layout: "carousel", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "4", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "newsletter-restaurant-1", type: "newsletter", label: "Reservations", visible: true, props: { headline: "Make a Reservation", subheadline: "Book your table for an unforgettable evening", buttonText: "Book Now", buttonLink: "/reservations", placeholderText: "Enter your email", showName: "true", bgImage: "", maxWidth: "800px", shadow: "none", borderRadius: "16", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#18181b", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "center" } },
      { id: "simple-footer-restaurant-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 La Maison Restaurant. All rights reserved.", showSocial: "true", layout: "centered", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "32", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#09090b", textColor: "#fafafa", fontSize: "md", textAlignment: "center" } },
    ],
    seo: { title: "La Maison - Fine Dining Restaurant", description: "Experience fine dining at La Maison. Reserve your table today." },
    settings: { showHeader: true, showFooter: true, navigationVisible: true },
  },
  {
    name: "Landing Page",
    slug: "landing-page-template",
    description: "High-converting landing page with fullscreen hero, features, social proof, FAQ, and call-to-action",
    category: "landing",
    templateType: "page" as const,
    thumbnail: "",
    isBuiltIn: true,
    status: "published" as const,
    sections: [
      { id: "fullscreen-hero-landing-1", type: "fullscreen-hero", label: "Hero", visible: true, props: { imageUrl: "", headline: "Transform Your Business Today", subheadline: "The all-in-one platform that helps you grow, manage, and scale your business effortlessly", buttonText: "Get Started Free", buttonLink: "/signup", secondaryButtonText: "Learn More", secondaryButtonLink: "/about", showScrollIndicator: "true", maxWidth: "100%", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "0", paddingX: "0", marginTop: "0", marginBottom: "0", bgColor: "#0f172a", bgGradient: "linear-gradient(135deg, #0f172a, #1e3a5f)", bgImage: "", bgOverlayColor: "rgba(0,0,0,0.3)", bgOverlayOpacity: "30", textColor: "#ffffff", fontSize: "xl", textAlignment: "center" } },
      { id: "feature-list-landing-1", type: "feature-list", label: "Features", visible: true, props: { title: "Everything You Need", subtitle: "Powerful features to accelerate your growth", columns: "3", showIcons: "true", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "testimonials-landing-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "Loved by Thousands", subtitle: "See what our customers say about us", layout: "grid", cardStyle: "elevated", avatarStyle: "circle", testimonialsCount: "6", maxWidth: "1200px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#f8fafc", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "faq-landing-1", type: "faq", label: "FAQ", visible: true, props: { title: "Frequently Asked Questions", subtitle: "Got questions? We've got answers", faqCount: "5", layout: "accordion", showSearch: "true", maxWidth: "800px", shadow: "none", borderRadius: "12", borderWidth: "0", borderColor: "", visibility: "all", animation: "slideUp", paddingY: "64", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#ffffff", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#18181b", fontSize: "lg", textAlignment: "center" } },
      { id: "newsletter-landing-1", type: "newsletter", label: "CTA", visible: true, props: { headline: "Ready to Get Started?", subheadline: "Join thousands of businesses already using our platform", buttonText: "Start Free Trial", buttonLink: "/signup", placeholderText: "Enter your work email", showName: "false", bgImage: "", maxWidth: "800px", shadow: "none", borderRadius: "16", borderWidth: "0", borderColor: "", visibility: "all", animation: "fadeIn", paddingY: "80", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#0f172a", bgGradient: "", bgImage: "", bgOverlayColor: "", bgOverlayOpacity: "40", textColor: "#ffffff", fontSize: "lg", textAlignment: "center" } },
      { id: "simple-footer-landing-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Company. All rights reserved.", showSocial: "true", layout: "centered", maxWidth: "1200px", shadow: "none", borderRadius: "0", borderWidth: "0", borderColor: "", visibility: "all", animation: "none", paddingY: "32", paddingX: "16", marginTop: "0", marginBottom: "0", bgColor: "#09090b", textColor: "#fafafa", fontSize: "md", textAlignment: "center" } },
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
