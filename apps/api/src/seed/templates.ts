import { connectDatabase } from "../config/database.js";
import { TemplateModel } from "../models/template.model.js";

const templates = [
  {
    name: "Fashion Store", slug: "fashion-store", category: "Ecommerce",
    description: "Bold, stylish ecommerce theme for fashion and apparel brands. Large hero imagery, product grids, and lookbook sections.",
    status: "published",
    theme: { primaryColor: "#ec4899", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-xl", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "New Season Collection", subheadline: "Discover the latest trends in fashion", buttonText: "Shop Now", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Category", description: "Browse our curated collections" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Trending Now" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Our Customers Say" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get 20% Off Your First Order", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Fashion Store. All rights reserved." } }
    ]
  },
  {
    name: "Electronics Store", slug: "electronics-store", category: "Ecommerce",
    description: "Tech-focused ecommerce theme with product comparison, specs display, and featured gadgets layout.",
    status: "published",
    theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Tech Deals of the Week", subheadline: "Save big on the latest electronics and gadgets", buttonText: "Shop Electronics", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Department", description: "Find what you need" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Best Sellers" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Customer Reviews" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Stay Updated on New Tech", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Electronics Store. All rights reserved." } }
    ]
  },
  {
    name: "Furniture Store", slug: "furniture-store", category: "Ecommerce",
    description: "Warm, inviting ecommerce theme for furniture and home decor stores. Room showcases and product collections.",
    status: "published",
    theme: { primaryColor: "#b45309", secondaryColor: "#1c1917", font: "Playfair Display", buttonStyle: "rounded-lg", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Design Your Dream Home", subheadline: "Premium furniture curated for every room", buttonText: "Browse Furniture", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Collections", visible: true, props: { title: "Shop by Room", description: "Find the perfect pieces" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "New Arrivals" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Happy Customers" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get Interior Design Tips", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Furniture Store. All rights reserved." } }
    ]
  },
  {
    name: "Cosmetic Store", slug: "cosmetic-store", category: "Ecommerce",
    description: "Elegant beauty and cosmetics ecommerce theme with product showcases, tutorials, and skincare sections.",
    status: "published",
    theme: { primaryColor: "#db2777", secondaryColor: "#0f172a", font: "Poppins", buttonStyle: "rounded-full", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Glow Up Your Routine", subheadline: "Clean beauty products for radiant skin", buttonText: "Shop Beauty", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Concern", description: "Find what your skin needs" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Bestsellers" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Real Results" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get Beauty Tips & Offers", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Cosmetic Store. All rights reserved." } }
    ]
  },
  {
    name: "Minimal Store", slug: "minimal-store", category: "Ecommerce",
    description: "Clean, minimalist ecommerce theme focused on product photography and white space. Perfect for premium brands.",
    status: "published",
    theme: { primaryColor: "#18181b", secondaryColor: "#52525b", font: "Inter", buttonStyle: "rounded-sm", layoutWidth: "1100px", darkMode: false, navbarStyle: "static" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Less is More", subheadline: "Curated essentials for modern living", buttonText: "Explore", buttonUrl: "#" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Featured" } },
      { id: "features", type: "features", label: "Collections", visible: true, props: { title: "Collections" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Join the Community", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Minimal Store. All rights reserved." } }
    ]
  },
  {
    name: "Luxury Brand", slug: "luxury-brand", category: "Ecommerce",
    description: "High-end luxury ecommerce theme with dark tones, elegant typography, and premium product presentation.",
    status: "published",
    theme: { primaryColor: "#d4a574", secondaryColor: "#09090b", font: "Playfair Display", buttonStyle: "rounded-sm", layoutWidth: "1200px", darkMode: true, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Timeless Elegance", subheadline: "Discover our exclusive collection", buttonText: "View Collection", buttonUrl: "#" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "The Collection" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Browse by Category" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Client Testimonials" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Join Our Private Club", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Luxury Brand. All rights reserved." } }
    ]
  },
  {
    name: "Modern Ecommerce", slug: "modern-ecommerce", category: "Ecommerce",
    description: "Versatile modern ecommerce theme suitable for any online store. Clean design with strong conversion elements.",
    status: "published",
    theme: { primaryColor: "#7c3aed", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-xl", layoutWidth: "1280px", darkMode: false, navbarStyle: "sticky" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products at great prices", buttonText: "Start Shopping", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Category", description: "Find exactly what you need" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Featured Products" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Customer Reviews" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get Exclusive Offers", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Modern Store. All rights reserved." } }
    ]
  },
  {
    name: "Sneakers Store", slug: "sneakers-store", category: "Ecommerce",
    description: "Urban streetwear and sneakers ecommerce theme with bold colors, grid layouts, and lifestyle imagery.",
    status: "published",
    theme: { primaryColor: "#f97316", secondaryColor: "#0f172a", font: "Space Grotesk", buttonStyle: "rounded-xl", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Fresh Kicks, Fresh Style", subheadline: "The latest drops in sneakers and streetwear", buttonText: "Shop Now", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Brands", visible: true, props: { title: "Shop by Brand", description: "Top brands available" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "New Drops" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Sneakerheads Say" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get Exclusive Drops", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Sneakers Store. All rights reserved." } }
    ]
  },
  {
    name: "Gadget Store", slug: "gadget-store", category: "Ecommerce",
    description: "Fun, energetic gadgets and accessories ecommerce theme with deal badges, reviews, and category carousels.",
    status: "published",
    theme: { primaryColor: "#06b6d4", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-full", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Gadgets You'll Love", subheadline: "Cool tech accessories and smart gadgets", buttonText: "Shop Gadgets", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Category", description: "Find your next gadget" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Trending Gadgets" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Customers Say" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Get Early Access to New Drops", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Gadget Store. All rights reserved." } }
    ]
  },
  {
    name: "Dark Commerce", slug: "dark-commerce", category: "Ecommerce",
    description: "Sleek dark-themed ecommerce store for premium and tech products. Modern layout with bold visual hierarchy.",
    status: "published",
    theme: { primaryColor: "#a855f7", secondaryColor: "#09090b", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1280px", darkMode: true, navbarStyle: "sticky" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Premium Products, Dark Mode", subheadline: "Experience shopping reimagined", buttonText: "Explore", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Collections", description: "Curated just for you" } },
      { id: "products", type: "products", label: "Featured Products", visible: true, props: { title: "Featured" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Customer Love" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Join the Dark Side", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Dark Commerce. All rights reserved." } }
    ]
  }
];

export async function seedTemplates() {
  await connectDatabase();
  for (const tpl of templates) {
    const existing = await TemplateModel.findOne({ slug: tpl.slug });
    if (!existing) {
      await TemplateModel.create(tpl);
      console.log(`  ✔ Seeded template: ${tpl.name}`);
    } else {
      console.log(`  ○ Skipped (exists): ${tpl.name}`);
    }
  }
  console.log(`\n✅ Template seeding complete. ${templates.length} templates processed.`);
}
