/**
 * Storefront architecture:
 * - Home (`/`) is Builder-controlled.
 * - Every other customer page is a fixed system template (Shopify-style).
 */

export type SystemPageKind =
  | "builder"
  | "commerce"
  | "account"
  | "content"
  | "system";

export type SystemPageDef = {
  /** Canonical storefront path (no tenant prefix). */
  path: string;
  title: string;
  kind: SystemPageKind;
  /** Builder may edit this page's sections. */
  builderEditable: boolean;
  /** CMS slug when content comes from CMS. */
  cmsSlug?: string;
  description: string;
};

/** Single source of truth for customer-facing system pages. */
export const SYSTEM_PAGES: SystemPageDef[] = [
  { path: "/", title: "Home", kind: "builder", builderEditable: true, description: "Fully customizable with the Builder" },
  { path: "/shop", title: "Shop", kind: "commerce", builderEditable: false, description: "Browse all products" },
  { path: "/products/[slug]", title: "Product Details", kind: "commerce", builderEditable: false, description: "Product detail page" },
  { path: "/categories", title: "Categories", kind: "commerce", builderEditable: false, description: "Category index" },
  { path: "/category/[slug]", title: "Category", kind: "commerce", builderEditable: false, description: "Products in a category" },
  { path: "/search", title: "Search", kind: "commerce", builderEditable: false, description: "Search products" },
  { path: "/cart", title: "Cart", kind: "commerce", builderEditable: false, description: "Shopping cart" },
  { path: "/checkout", title: "Checkout", kind: "commerce", builderEditable: false, description: "Checkout" },
  { path: "/wishlist", title: "Wishlist", kind: "commerce", builderEditable: false, description: "Saved products" },
  { path: "/account", title: "Account", kind: "account", builderEditable: false, description: "Customer account" },
  { path: "/account/login", title: "Login", kind: "account", builderEditable: false, description: "Customer login" },
  { path: "/account/register", title: "Register", kind: "account", builderEditable: false, description: "Create account" },
  { path: "/account/forgot-password", title: "Forgot Password", kind: "account", builderEditable: false, description: "Reset password" },
  { path: "/orders", title: "Orders", kind: "account", builderEditable: false, description: "Order history" },
  { path: "/orders/[id]", title: "Order Details", kind: "account", builderEditable: false, description: "Single order" },
  { path: "/order-tracking", title: "Order Tracking", kind: "account", builderEditable: false, description: "Track an order" },
  { path: "/contact", title: "Contact", kind: "content", builderEditable: false, cmsSlug: "contact-us", description: "Contact form and store details" },
  { path: "/about", title: "About", kind: "content", builderEditable: false, cmsSlug: "about-us", description: "About the store" },
  { path: "/faq", title: "FAQ", kind: "content", builderEditable: false, cmsSlug: "faq", description: "Frequently asked questions" },
  { path: "/privacy", title: "Privacy Policy", kind: "content", builderEditable: false, cmsSlug: "privacy-policy", description: "Privacy policy" },
  { path: "/terms", title: "Terms & Conditions", kind: "content", builderEditable: false, cmsSlug: "terms-conditions", description: "Terms and conditions" },
  { path: "/shipping", title: "Shipping Policy", kind: "content", builderEditable: false, cmsSlug: "shipping-info", description: "Shipping information" },
  { path: "/returns", title: "Returns Policy", kind: "content", builderEditable: false, cmsSlug: "returns", description: "Returns and exchanges" },
  { path: "/blog", title: "Blog", kind: "content", builderEditable: false, cmsSlug: "blog", description: "Blog index" },
  { path: "/blog/[slug]", title: "Blog Details", kind: "content", builderEditable: false, description: "Blog post" },
  { path: "/404", title: "Not Found", kind: "system", builderEditable: false, description: "404 page" },
  { path: "/500", title: "Error", kind: "system", builderEditable: false, description: "Server error page" },
];

export function isBuilderEditablePage(page: { pageType?: string; isHomePage?: boolean; slug?: string }) {
  if (page.isHomePage) return true;
  if (page.pageType === "home") return true;
  if (page.slug === "/" || page.slug === "home" || page.slug === "") return true;
  return false;
}

export function getSystemPageByPath(path: string) {
  return SYSTEM_PAGES.find((p) => p.path === path);
}
