import type { BuilderSection } from "@/redux/slices/builder-slice";

export type StarterTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnail?: string;
  sections: BuilderSection[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
    buttonStyle?: string;
    layoutWidth?: string;
    darkMode?: boolean;
    navbarStyle?: string;
  };
};

// ─── TEMPLATE 1: ECOMMERCE STORE ────────────────────────────────────────────

const ecommerceTemplate: StarterTemplate = {
  id: "ecommerce-store",
  name: "Ecommerce Store",
  slug: "ecommerce-store",
  description: "Complete online store with products, categories, and checkout flow",
  category: "ecommerce",
  sections: [
    {
      id: "hero-1",
      type: "hero-banner",
      label: "Hero Banner",
      visible: true,
      props: {
        kicker: "Welcome",
        headline: "Discover Amazing Products",
        subheadline: "Shop the latest trends and exclusive deals curated just for you",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "/about",
        heroHeight: "lg",
        imageUrl: "",
        overlayColor: "rgba(15, 23, 42, 0.4)",
        textAlignment: "center",
      },
    },
    {
      id: "categories-1",
      type: "featured-categories",
      label: "Featured Categories",
      visible: true,
      props: {
        title: "Shop by Category",
        subtitle: "Browse our curated collections",
        gridColumns: "4",
        cardStyle: "elevated",
        showProductCount: "true",
      },
    },
    {
      id: "featured-products-1",
      type: "featured-products",
      label: "Featured Products",
      visible: true,
      props: {
        title: "Featured Products",
        subtitle: "Handpicked favorites just for you",
        gridColumns: "4",
        productCount: "8",
        showBadges: "true",
        showRatings: "true",
        showViewAll: "true",
        viewAllLink: "/shop",
      },
    },
    {
      id: "discount-1",
      type: "discount-banner",
      label: "Sale Banner",
      visible: true,
      props: {
        headline: "Summer Sale",
        discountText: "UP TO 50% OFF",
        subheadline: "Limited time offer on selected items",
        buttonText: "Shop Sale",
        buttonLink: "/sale",
        bgColor: "#ef4444",
        textColor: "#ffffff",
      },
    },
    {
      id: "best-sellers-1",
      type: "best-sellers",
      label: "Best Sellers",
      visible: true,
      props: {
        title: "Best Sellers",
        subtitle: "Our most popular products",
        gridColumns: "4",
        productCount: "8",
      },
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      label: "Customer Reviews",
      visible: true,
      props: {
        title: "What Our Customers Say",
        subtitle: "Real reviews from real customers",
        layout: "grid",
        cardStyle: "elevated",
        avatarStyle: "circle",
        testimonialsCount: "6",
      },
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      label: "Newsletter",
      visible: true,
      props: {
        headline: "Stay Updated",
        subheadline: "Subscribe to get special offers, free giveaways, and exclusive deals",
        buttonText: "Subscribe",
        placeholderText: "Enter your email",
        showName: "false",
      },
    },
    {
      id: "footer-1",
      type: "ecommerce-footer",
      label: "Footer",
      visible: true,
      props: {
        copyright: "© 2026 Your Store. All rights reserved.",
        showSocial: "true",
        showNewsletter: "false",
        showPaymentIcons: "true",
        contactEmail: "hello@yourstore.com",
        contactPhone: "+1 (555) 123-4567",
        bgColor: "#09090b",
        textColor: "#fafafa",
        columns: "4",
      },
    },
  ],
  theme: {
    primaryColor: "#18181b",
    secondaryColor: "#3b82f6",
    font: "Inter",
    buttonStyle: "rounded",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "default",
  },
};

// ─── TEMPLATE 2: FASHION STORE ──────────────────────────────────────────────

const fashionTemplate: StarterTemplate = {
  id: "fashion-store",
  name: "Fashion Store",
  slug: "fashion-store",
  description: "Elegant fashion boutique with style and sophistication",
  category: "fashion",
  sections: [
    {
      id: "hero-1",
      type: "split-hero",
      label: "Split Hero",
      visible: true,
      props: {
        headline: "New Collection",
        subheadline: "Discover the latest trends in fashion. Elevate your style with our curated collection.",
        buttonText: "Shop Collection",
        buttonLink: "/collection/new",
        imageUrl: "",
        imagePosition: "right",
        contentWidth: "50",
      },
    },
    {
      id: "new-arrivals-1",
      type: "new-arrivals",
      label: "New Arrivals",
      visible: true,
      props: {
        title: "Just Landed",
        subtitle: "Fresh styles added daily",
        gridColumns: "4",
        productCount: "8",
        showBadge: "true",
        daysNew: "30",
      },
    },
    {
      id: "category-banner-1",
      type: "category-banner",
      label: "Summer Collection",
      visible: true,
      props: {
        imageUrl: "",
        categoryName: "Summer 2026",
        description: "Light, breezy styles perfect for the season",
        buttonText: "Explore Summer",
        buttonLink: "/category/summer",
      },
    },
    {
      id: "product-tabs-1",
      type: "product-tabs",
      label: "Shop by Gender",
      visible: true,
      props: {
        title: "Collections",
        tab1Label: "Women",
        tab2Label: "Men",
        tab3Label: "Kids",
        productCount: "4",
      },
    },
    {
      id: "instagram-1",
      type: "instagram-feed",
      label: "Instagram Feed",
      visible: true,
      props: {
        title: "Style Inspiration",
        subtitle: "@yourfashionstore",
        handle: "@yourfashionstore",
        postCount: "6",
        columns: "6",
        showLikes: "true",
      },
    },
    {
      id: "trust-1",
      type: "trust-badges",
      label: "Why Shop With Us",
      visible: true,
      props: {
        title: "Shop With Confidence",
        showPayment: "true",
        showShipping: "true",
        showSecurity: "true",
        showGuarantee: "true",
        showSupport: "true",
      },
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      label: "Newsletter",
      visible: true,
      props: {
        headline: "Get Style Tips",
        subheadline: "Be the first to know about new arrivals and exclusive offers",
        buttonText: "Subscribe",
        placeholderText: "Enter your email",
      },
    },
    {
      id: "footer-1",
      type: "mega-footer",
      label: "Footer",
      visible: true,
      props: {
        copyright: "© 2026 Fashion Store",
        showBrand: "true",
        showLinks: "true",
        showSocial: "true",
        showNewsletter: "false",
        showPayment: "true",
        showBadges: "true",
        bgColor: "#09090b",
        textColor: "#fafafa",
      },
    },
  ],
  theme: {
    primaryColor: "#000000",
    secondaryColor: "#f97316",
    font: "Playfair Display",
    buttonStyle: "square",
    layoutWidth: "1400px",
    darkMode: false,
    navbarStyle: "minimal",
  },
};

// ─── TEMPLATE 3: ELECTRONICS STORE ──────────────────────────────────────────

const electronicsTemplate: StarterTemplate = {
  id: "electronics-store",
  name: "Electronics Store",
  slug: "electronics-store",
  description: "Modern tech store for gadgets and electronics",
  category: "electronics",
  sections: [
    {
      id: "hero-1",
      type: "fullscreen-hero",
      label: "Fullscreen Hero",
      visible: true,
      props: {
        imageUrl: "",
        headline: "Next-Gen Technology",
        subheadline: "Discover cutting-edge gadgets and electronics at unbeatable prices",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        secondaryButtonText: "View Deals",
        secondaryButtonLink: "/deals",
        showScrollIndicator: "true",
      },
    },
    {
      id: "product-carousel-1",
      type: "product-carousel",
      label: "Featured Gadgets",
      visible: true,
      props: {
        title: "Featured Gadgets",
        subtitle: "The latest in tech innovation",
        productCount: "12",
        autoplay: "true",
        autoplaySpeed: "3000",
        showArrows: "true",
      },
    },
    {
      id: "categories-1",
      type: "category-grid",
      label: "Shop by Category",
      visible: true,
      props: {
        title: "Browse Electronics",
        subtitle: "Find exactly what you need",
        gridColumns: "4",
        cardStyle: "bordered",
        showProductCount: "true",
      },
    },
    {
      id: "flash-sale-1",
      type: "flash-sale",
      label: "Flash Sale",
      visible: true,
      props: {
        title: "Flash Sale",
        subtitle: "Limited time tech deals",
        gridColumns: "4",
        productCount: "4",
        endDate: "2026-12-31",
        showTimer: "true",
        timerLabel: "Sale Ends In:",
      },
    },
    {
      id: "product-by-category-1",
      type: "product-by-category",
      label: "Products by Category",
      visible: true,
      props: {
        title: "Explore by Category",
        gridColumns: "4",
        categoriesPerRow: "3",
        productsPerCategory: "4",
      },
    },
    {
      id: "trust-badges-1",
      type: "trust-badges",
      label: "Trust Badges",
      visible: true,
      props: {
        title: "Why Choose Us",
        showPayment: "true",
        showShipping: "true",
        showSecurity: "true",
        showGuarantee: "true",
        showSupport: "true",
      },
    },
    {
      id: "faq-1",
      type: "faq",
      label: "FAQ",
      visible: true,
      props: {
        title: "Common Questions",
        subtitle: "Everything you need to know",
        faqCount: "5",
        layout: "accordion",
        showSearch: "false",
      },
    },
    {
      id: "footer-1",
      type: "ecommerce-footer",
      label: "Footer",
      visible: true,
      props: {
        copyright: "© 2026 Electronics Store",
        showSocial: "true",
        showNewsletter: "true",
        showPaymentIcons: "true",
        contactEmail: "support@electronics.com",
        contactPhone: "+1 (555) 987-6543",
        bgColor: "#09090b",
        textColor: "#fafafa",
        columns: "4",
      },
    },
  ],
  theme: {
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
    font: "Inter",
    buttonStyle: "rounded",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "tech",
  },
};

// ─── TEMPLATE 4: RESTAURANT ─────────────────────────────────────────────────

const restaurantTemplate: StarterTemplate = {
  id: "restaurant",
  name: "Restaurant",
  slug: "restaurant",
  description: "Appetizing restaurant website with menu and ordering",
  category: "food",
  sections: [
    {
      id: "hero-1",
      type: "video-hero",
      label: "Video Hero",
      visible: true,
      props: {
        videoUrl: "",
        posterImage: "",
        headline: "Fresh, Delicious Food",
        subheadline: "Experience culinary excellence with every bite",
        buttonText: "View Menu",
        buttonLink: "/menu",
        heroHeight: "lg",
        muted: "true",
        loop: "true",
      },
    },
    {
      id: "image-grid-1",
      type: "image-grid",
      label: "Food Gallery",
      visible: true,
      props: {
        title: "Our Signature Dishes",
        columns: "3",
        gap: "16",
        aspectRatio: "1:1",
      },
    },
    {
      id: "about-1",
      type: "about-section",
      label: "About Us",
      visible: true,
      props: {
        title: "Our Story",
        content: "Founded in 2020, we've been serving the community with passion and dedication. Every dish is crafted with love using the finest ingredients.",
        imageUrl: "",
        imagePosition: "left",
        layout: "side-by-side",
      },
    },
    {
      id: "menu-1",
      type: "product-grid",
      label: "Menu",
      visible: true,
      props: {
        title: "Our Menu",
        subtitle: "Explore our delicious offerings",
        gridColumns: "3",
        productCount: "12",
        showFilters: "true",
        showSort: "false",
      },
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      label: "Reviews",
      visible: true,
      props: {
        title: "What Diners Say",
        subtitle: "Reviews from our valued guests",
        layout: "carousel",
        cardStyle: "elevated",
        avatarStyle: "circle",
        testimonialsCount: "6",
      },
    },
    {
      id: "announcement-1",
      type: "announcement-bar",
      label: "Delivery Notice",
      visible: true,
      props: {
        text: "Now offering free delivery on orders over $30!",
        link: "/order",
        linkText: "Order Now",
        bgColor: "#dc2626",
        textColor: "#ffffff",
        dismissible: "false",
        showEmoji: "true",
      },
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      label: "Newsletter",
      visible: true,
      props: {
        headline: "Special Offers",
        subheadline: "Subscribe to receive exclusive deals and updates",
        buttonText: "Subscribe",
        placeholderText: "Enter your email",
      },
    },
    {
      id: "footer-1",
      type: "simple-footer",
      label: "Footer",
      visible: true,
      props: {
        copyright: "© 2026 Restaurant Name. All rights reserved.",
        showSocial: "true",
        bgColor: "#09090b",
        textColor: "#fafafa",
        layout: "centered",
      },
    },
  ],
  theme: {
    primaryColor: "#dc2626",
    secondaryColor: "#f59e0b",
    font: "Lora",
    buttonStyle: "rounded",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "elegant",
  },
};

// ─── TEMPLATE 5: LANDING PAGE ───────────────────────────────────────────────

const landingPageTemplate: StarterTemplate = {
  id: "landing-page",
  name: "Landing Page",
  slug: "landing-page",
  description: "High-converting landing page for product launches",
  category: "landing",
  sections: [
    {
      id: "hero-1",
      type: "hero-banner",
      label: "Hero Banner",
      visible: true,
      props: {
        kicker: "Introducing",
        headline: "The Future is Here",
        subheadline: "Transform your business with our revolutionary solution. Join thousands of satisfied customers.",
        buttonText: "Get Started Free",
        buttonLink: "/signup",
        secondaryButtonText: "Watch Demo",
        secondaryButtonLink: "#video",
        heroHeight: "full",
        imageUrl: "",
        overlayColor: "rgba(15, 23, 42, 0.5)",
        textAlignment: "center",
      },
    },
    {
      id: "features-1",
      type: "feature-list",
      label: "Key Features",
      visible: true,
      props: {
        title: "Everything You Need",
        subtitle: "Powerful features to grow your business",
        columns: "3",
        showIcons: "true",
      },
    },
    {
      id: "video-1",
      type: "video-section",
      label: "Product Demo",
      visible: true,
      props: {
        title: "See It In Action",
        description: "Watch how our solution can transform your workflow",
        videoUrl: "",
        posterImage: "",
        autoplay: "false",
        controls: "true",
        aspectRatio: "16:9",
      },
    },
    {
      id: "testimonials-1",
      type: "testimonials",
      label: "Social Proof",
      visible: true,
      props: {
        title: "Loved by Thousands",
        subtitle: "See what our customers have to say",
        layout: "grid",
        cardStyle: "elevated",
        avatarStyle: "circle",
        testimonialsCount: "6",
      },
    },
    {
      id: "stats-1",
      type: "why-choose-us",
      label: "Why Choose Us",
      visible: true,
      props: {
        title: "By the Numbers",
        subtitle: "Results that speak for themselves",
        columns: "3",
        feature1Icon: "Users",
        feature1Text: "10,000+ Users",
        feature2Icon: "Star",
        feature2Text: "4.9/5 Rating",
        feature3Icon: "Zap",
        feature3Text: "99.9% Uptime",
      },
    },
    {
      id: "faq-1",
      type: "faq",
      label: "FAQ",
      visible: true,
      props: {
        title: "Frequently Asked Questions",
        subtitle: "Got questions? We've got answers",
        faqCount: "5",
        layout: "accordion",
        showSearch: "true",
      },
    },
    {
      id: "cta-1",
      type: "email-capture",
      label: "Final CTA",
      visible: true,
      props: {
        headline: "Ready to Get Started?",
        subheadline: "Join thousands of satisfied customers today",
        buttonText: "Start Free Trial",
        placeholderText: "Enter your email",
        incentiveText: "No credit card required. Cancel anytime.",
      },
    },
    {
      id: "footer-1",
      type: "simple-footer",
      label: "Footer",
      visible: true,
      props: {
        copyright: "© 2026 Company Name. All rights reserved.",
        showSocial: "true",
        bgColor: "#09090b",
        textColor: "#fafafa",
        layout: "split",
      },
    },
  ],
  theme: {
    primaryColor: "#6366f1",
    secondaryColor: "#ec4899",
    font: "Inter",
    buttonStyle: "rounded",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "floating",
  },
};

// ─── EXPORT ALL TEMPLATES ────────────────────────────────────────────────────

export const starterTemplates: StarterTemplate[] = [
  ecommerceTemplate,
  fashionTemplate,
  electronicsTemplate,
  restaurantTemplate,
  landingPageTemplate,
];

export function getTemplateById(id: string): StarterTemplate | undefined {
  return starterTemplates.find((t) => t.id === id);
}

export function getTemplateByCategory(category: string): StarterTemplate[] {
  return starterTemplates.filter((t) => t.category === category);
}

export const templateCategories = [
  { id: "all", label: "All Templates" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "fashion", label: "Fashion" },
  { id: "electronics", label: "Electronics" },
  { id: "food", label: "Food & Restaurant" },
  { id: "landing", label: "Landing Pages" },
];
