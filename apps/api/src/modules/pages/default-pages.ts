import type { PageType } from "./store-page.model.js";

export type DefaultPageDef = {
  pageType: PageType;
  title: string;
  slug: string;
  description: string;
  isSystem: boolean;
  settings?: Record<string, unknown>;
};

export const DEFAULT_PAGES: DefaultPageDef[] = [
  {
    pageType: "home",
    title: "Home",
    slug: "/",
    description: "Your store homepage",
    isSystem: true,
    settings: { layoutWidth: "1200px" },
  },
  {
    pageType: "shop",
    title: "Shop",
    slug: "/shop",
    description: "Browse all products",
    isSystem: true,
  },
  {
    pageType: "cart",
    title: "Cart",
    slug: "/cart",
    description: "Shopping cart",
    isSystem: true,
    settings: { showHeader: true, showFooter: true },
  },
  {
    pageType: "checkout",
    title: "Checkout",
    slug: "/checkout",
    description: "Checkout page",
    isSystem: true,
    settings: { showHeader: true, showFooter: false, layoutStyle: "full-width" },
  },
  {
    pageType: "wishlist",
    title: "Wishlist",
    slug: "/wishlist",
    description: "Your wishlist",
    isSystem: true,
  },
  {
    pageType: "login",
    title: "Login",
    slug: "/login",
    description: "Customer login",
    isSystem: true,
    settings: { layoutStyle: "landing" },
  },
  {
    pageType: "register",
    title: "Register",
    slug: "/register",
    description: "Create an account",
    isSystem: true,
    settings: { layoutStyle: "landing" },
  },
  {
    pageType: "forgot_password",
    title: "Forgot Password",
    slug: "/forgot-password",
    description: "Reset your password",
    isSystem: true,
    settings: { layoutStyle: "landing" },
  },
  {
    pageType: "account",
    title: "Account",
    slug: "/account",
    description: "Your account dashboard",
    isSystem: true,
    settings: { showHeader: true, showFooter: true },
  },
  {
    pageType: "order_tracking",
    title: "Order Tracking",
    slug: "/order-tracking",
    description: "Track your order",
    isSystem: true,
  },
  {
    pageType: "search",
    title: "Search",
    slug: "/search",
    description: "Search products",
    isSystem: true,
  },
  {
    pageType: "contact",
    title: "Contact",
    slug: "/contact",
    description: "Get in touch with us",
    isSystem: true,
  },
  {
    pageType: "about",
    title: "About Us",
    slug: "/about",
    description: "Learn about our store",
    isSystem: true,
  },
  {
    pageType: "faq",
    title: "FAQ",
    slug: "/faq",
    description: "Frequently asked questions",
    isSystem: true,
  },
  {
    pageType: "privacy_policy",
    title: "Privacy Policy",
    slug: "/privacy-policy",
    description: "Our privacy policy",
    isSystem: true,
  },
  {
    pageType: "terms_conditions",
    title: "Terms & Conditions",
    slug: "/terms-conditions",
    description: "Terms and conditions",
    isSystem: true,
  },
  {
    pageType: "shipping_policy",
    title: "Shipping Policy",
    slug: "/shipping-policy",
    description: "Shipping information",
    isSystem: true,
  },
  {
    pageType: "returns_policy",
    title: "Returns Policy",
    slug: "/returns-policy",
    description: "Returns and exchanges",
    isSystem: true,
  },
  {
    pageType: "blog",
    title: "Blog",
    slug: "/blog",
    description: "Our blog posts",
    isSystem: true,
  },
  {
    pageType: "blog_details",
    title: "Blog Post",
    slug: "/blog",
    description: "Individual blog post — rendered dynamically",
    isSystem: true,
  },
  {
    pageType: "system_404",
    title: "404 Not Found",
    slug: "/404",
    description: "Page not found",
    isSystem: true,
    settings: { showHeader: true, showFooter: true },
  },
  {
    pageType: "product",
    title: "Product Detail",
    slug: "/product",
    description: "Individual product page — rendered dynamically",
    isSystem: true,
  },
  {
    pageType: "category",
    title: "Category",
    slug: "/category",
    description: "Product category page — rendered dynamically",
    isSystem: true,
  },
  {
    pageType: "collection",
    title: "Collection",
    slug: "/collections",
    description: "Product collection page",
    isSystem: true,
  },
  {
    pageType: "landing",
    title: "Landing Page",
    slug: "/landing",
    description: "Landing page template",
    isSystem: false,
  },
  {
    pageType: "custom",
    title: "Custom Page",
    slug: "/custom",
    description: "Custom page",
    isSystem: false,
  },
];

export function getDefaultForPageType(pageType: PageType): DefaultPageDef | undefined {
  return DEFAULT_PAGES.find((p) => p.pageType === pageType);
}
