export type BlogCategory =
  | "Payments"
  | "Inventory"
  | "Growth"
  | "Product"
  | "Guides"
  | "Market";

export type BlogAuthor = {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  authorId: string;
  readTime: string;
  date: string;
  featured?: boolean;
  popular?: boolean;
};

export const BLOG_AUTHORS: BlogAuthor[] = [
  {
    id: "a-nabila",
    name: "Nabila Rahman",
    role: "Head of Merchant Success",
    bio: "Helps Bangladesh sellers launch and scale stores on BornoLand.",
    initials: "NR",
  },
  {
    id: "a-rafiq",
    name: "Rafiq Hasan",
    role: "Product Manager",
    bio: "Owns checkout, payments, and inventory workflows across the platform.",
    initials: "RH",
  },
  {
    id: "a-sadia",
    name: "Sadia Chowdhury",
    role: "Growth Editor",
    bio: "Writes practical playbooks for D2C brands and multi-city sellers.",
    initials: "SC",
  },
  {
    id: "a-imran",
    name: "Imran Kabir",
    role: "Engineering Lead",
    bio: "Builds the BornoLand API, webhooks, and developer tooling.",
    initials: "IK",
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Payments",
  "Inventory",
  "Growth",
  "Product",
  "Guides",
  "Market",
];

export const BLOG_TRENDING_TOPICS = [
  "bKash checkout",
  "COD best practices",
  "SKU hygiene",
  "Dhaka delivery zones",
  "Ramadan campaigns",
  "Store analytics",
  "Multi-store agencies",
  "Webhook security",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "p1",
    slug: "bkash-nagad-checkout-setup",
    title: "How to set up bKash and Nagad checkout on BornoLand",
    excerpt:
      "Connect Bangladesh’s most-used mobile wallets, test payments safely, and reduce abandoned checkouts with clear COD and wallet options.",
    category: "Payments",
    tags: ["bKash", "Nagad", "checkout", "Bangladesh"],
    authorId: "a-rafiq",
    readTime: "7 min",
    date: "2026-07-18",
    featured: true,
    popular: true,
  },
  {
    id: "p2",
    slug: "inventory-sync-multi-warehouse",
    title: "Keep inventory accurate across warehouses and couriers",
    excerpt:
      "Prevent overselling during flash sales with SKU mapping, low-stock alerts, and webhook-driven stock updates from your fulfillment partner.",
    category: "Inventory",
    tags: ["inventory", "webhooks", "fulfillment"],
    authorId: "a-imran",
    readTime: "8 min",
    date: "2026-07-14",
    popular: true,
  },
  {
    id: "p3",
    slug: "ramadan-ecommerce-playbook-bd",
    title: "Ramadan ecommerce playbook for Bangladesh sellers",
    excerpt:
      "Plan campaigns, prep COD capacity, and time promotions for peak traffic nights — without breaking your storefront or delivery promises.",
    category: "Growth",
    tags: ["Ramadan", "campaigns", "COD"],
    authorId: "a-sadia",
    readTime: "9 min",
    date: "2026-07-10",
    popular: true,
  },
  {
    id: "p4",
    slug: "sslcommerz-vs-stripe-bornoland",
    title: "SSLCommerz vs Stripe on BornoLand: which should you enable?",
    excerpt:
      "Compare local card acquiring, international reach, settlement timelines, and when dual-gateway setups make sense for growing brands.",
    category: "Payments",
    tags: ["SSLCommerz", "Stripe", "payments"],
    authorId: "a-rafiq",
    readTime: "6 min",
    date: "2026-07-05",
  },
  {
    id: "p5",
    slug: "reduce-cod-returns-dhaka",
    title: "Cut COD returns in Dhaka with smarter order verification",
    excerpt:
      "Practical steps for confirming addresses, scoring high-risk orders, and coaching couriers — without frustrating genuine customers.",
    category: "Guides",
    tags: ["COD", "Dhaka", "returns"],
    authorId: "a-nabila",
    readTime: "7 min",
    date: "2026-06-28",
    popular: true,
  },
  {
    id: "p6",
    slug: "bornoland-visual-builder-tips",
    title: "10 visual builder tips for a faster, clearer storefront",
    excerpt:
      "Use sections intentionally, keep mobile CTAs above the fold, and avoid the clutter that slows conversions on 4G connections.",
    category: "Product",
    tags: ["builder", "UX", "mobile"],
    authorId: "a-sadia",
    readTime: "5 min",
    date: "2026-06-22",
  },
  {
    id: "p7",
    slug: "api-product-sync-agencies",
    title: "Agency guide: sync client catalogs with the BornoLand API",
    excerpt:
      "Authenticate per store, batch product updates, and handle rate limits when you manage dozens of merchant catalogs from one pipeline.",
    category: "Guides",
    tags: ["API", "agencies", "catalog"],
    authorId: "a-imran",
    readTime: "10 min",
    date: "2026-06-15",
  },
  {
    id: "p8",
    slug: "bangladesh-ecommerce-trends-2026",
    title: "Bangladesh ecommerce trends shaping 2026 store strategy",
    excerpt:
      "From wallet-first checkout to social commerce and same-city delivery expectations — what merchants should prioritize this year.",
    category: "Market",
    tags: ["trends", "Bangladesh", "strategy"],
    authorId: "a-nabila",
    readTime: "8 min",
    date: "2026-06-08",
    popular: true,
  },
  {
    id: "p9",
    slug: "low-stock-alerts-that-work",
    title: "Low-stock alerts that actually prevent lost sales",
    excerpt:
      "Configure thresholds by SKU velocity, notify the right teammates, and auto-hide out-of-stock variants before customers hit a dead end.",
    category: "Inventory",
    tags: ["stock", "alerts", "SKU"],
    authorId: "a-rafiq",
    readTime: "5 min",
    date: "2026-05-30",
  },
  {
    id: "p10",
    slug: "launch-checklist-first-store",
    title: "Launch checklist: publish your first BornoLand store",
    excerpt:
      "Domain, SSL, payments, shipping zones, policies, and a smoke-test order — the minimum path from empty workspace to accepting customers.",
    category: "Guides",
    tags: ["launch", "checklist", "onboarding"],
    authorId: "a-nabila",
    readTime: "6 min",
    date: "2026-05-20",
  },
  {
    id: "p11",
    slug: "analytics-dashboard-metrics",
    title: "Which BornoLand analytics metrics matter in the first 90 days",
    excerpt:
      "Focus on conversion rate, average order value, COD success, and repeat purchase — not vanity traffic charts that don’t drive decisions.",
    category: "Growth",
    tags: ["analytics", "metrics", "retention"],
    authorId: "a-sadia",
    readTime: "7 min",
    date: "2026-05-12",
  },
  {
    id: "p12",
    slug: "secure-webhooks-order-events",
    title: "Secure your order webhooks before you automate fulfillment",
    excerpt:
      "Verify signatures, retry safely, and design idempotent handlers so duplicate events never create double shipments.",
    category: "Product",
    tags: ["webhooks", "security", "orders"],
    authorId: "a-imran",
    readTime: "9 min",
    date: "2026-05-04",
  },
];

export function getAuthor(authorId: string): BlogAuthor {
  return (
    BLOG_AUTHORS.find((a) => a.id === authorId) ?? {
      id: "unknown",
      name: "BornoLand Team",
      role: "Editorial",
      bio: "Updates from the BornoLand product and merchant success teams.",
      initials: "BL",
    }
  );
}

export function formatBlogDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
