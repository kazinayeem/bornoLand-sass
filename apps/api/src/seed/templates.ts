import { connectDatabase } from "../config/database.js";
import { TemplateModel } from "../models/template.model.js";

const templates = [
  {
    name: "Modern SaaS", slug: "modern-saas", category: "SaaS",
    description: "Clean, modern SaaS landing page with hero, features, pricing, and testimonials. Perfect for B2B and B2C software products.",
    status: "published",
    theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-xl", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Section", visible: true, props: { headline: "Build Faster with BornoLand", subheadline: "AI-powered landing page builder for modern teams", buttonText: "Get Started", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Features", visible: true, props: { title: "Everything you need", description: "Powerful features to launch your product" } },
      { id: "pricing", type: "pricing", label: "Pricing", visible: true, props: { title: "Simple pricing", description: "Start free, scale as you grow" } },
      { id: "testimonials", type: "testimonials", label: "Testimonials", visible: true, props: { title: "Loved by teams" } },
      { id: "cta", type: "cta", label: "Call to Action", visible: true, props: { headline: "Ready to get started?", buttonText: "Start Free Trial" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 BornoLand. All rights reserved." } }
    ]
  },
  {
    name: "Creative Agency", slug: "creative-agency", category: "Agency",
    description: "Bold, creative agency portfolio with showcase, services, team, and contact sections. Designed for design studios and creative agencies.",
    status: "published",
    theme: { primaryColor: "#7c3aed", secondaryColor: "#1e1b4b", font: "Plus Jakarta Sans", buttonStyle: "rounded-full", layoutWidth: "1200px", darkMode: true, navbarStyle: "floating" },
    sections: [
      { id: "hero", type: "hero", label: "Hero Section", visible: true, props: { headline: "We Create Digital Experiences", subheadline: "Award-winning design studio crafting brands that matter", buttonText: "View Work", buttonUrl: "#" } },
      { id: "services", type: "services", label: "Services", visible: true, props: { title: "What we do", description: "Full-service digital agency" } },
      { id: "showcase", type: "gallery", label: "Showcase", visible: true, props: { title: "Our Work" } },
      { id: "team", type: "team", label: "Team", visible: true, props: { title: "Meet the Team" } },
      { id: "contact", type: "contact", label: "Contact", visible: true, props: { title: "Let's Talk", buttonText: "Send Message" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Agency. All rights reserved." } }
    ]
  },
  {
    name: "Startup Launch", slug: "startup-launch", category: "Startup",
    description: "High-impact landing page for startup launches. Features countdown, waitlist, investor deck, and social proof sections.",
    status: "published",
    theme: { primaryColor: "#f59e0b", secondaryColor: "#0f172a", font: "DM Sans", buttonStyle: "rounded-lg", layoutWidth: "1100px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Launch Your Startup", subheadline: "Join thousands of founders building the future", buttonText: "Join Waitlist", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Features", visible: true, props: { title: "Built for founders" } },
      { id: "stats", type: "stats", label: "Stats", visible: true, props: { title: "Trusted by founders" } },
      { id: "testimonials", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What founders say" } },
      { id: "cta", type: "cta", label: "CTA", visible: true, props: { headline: "Ready to launch?", buttonText: "Get Early Access" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Startup. All rights reserved." } }
    ]
  },
  {
    name: "Restaurant Pro", slug: "restaurant-pro", category: "Restaurant",
    description: "Elegant restaurant website with menu display, reservations, gallery, and location sections. Perfect for cafes, bistros, and fine dining.",
    status: "published",
    theme: { primaryColor: "#dc2626", secondaryColor: "#1c1917", font: "Playfair Display", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Fine Dining Experience", subheadline: "Authentic cuisine crafted with passion", buttonText: "Reserve a Table", buttonUrl: "#" } },
      { id: "about", type: "about", label: "About", visible: true, props: { title: "Our Story" } },
      { id: "features", type: "features", label: "Menu", visible: true, props: { title: "Our Menu" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "What Guests Say" } },
      { id: "contact", type: "contact", label: "Contact", visible: true, props: { title: "Find Us", buttonText: "Get Directions" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Restaurant. All rights reserved." } }
    ]
  },
  {
    name: "Online Store", slug: "online-store", category: "Ecommerce",
    description: "Modern e-commerce storefront with product showcase, categories, featured items, and newsletter signup.",
    status: "published",
    theme: { primaryColor: "#0891b2", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-xl", layoutWidth: "1280px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "New Collection Drop", subheadline: "Shop the latest trends online", buttonText: "Shop Now", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Categories", visible: true, props: { title: "Shop by Category" } },
      { id: "testimonials", type: "testimonials", label: "Reviews", visible: true, props: { title: "Customer Reviews" } },
      { id: "cta", type: "cta", label: "Newsletter", visible: true, props: { headline: "Stay in the loop", buttonText: "Subscribe" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Store. All rights reserved." } }
    ]
  },
  {
    name: "Education Hub", slug: "education-hub", category: "Education",
    description: "Educational platform landing page with courses, instructors, curriculum, and enrollment sections.",
    status: "published",
    theme: { primaryColor: "#059669", secondaryColor: "#022c22", font: "Outfit", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Learn Without Limits", subheadline: "World-class education, accessible to everyone", buttonText: "Start Learning", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Courses", visible: true, props: { title: "Popular Courses" } },
      { id: "pricing", type: "pricing", label: "Plans", visible: true, props: { title: "Choose Your Plan" } },
      { id: "team", type: "team", label: "Instructors", visible: true, props: { title: "Meet Your Instructors" } },
      { id: "cta", type: "cta", label: "CTA", visible: true, props: { headline: "Join millions of learners", buttonText: "Enroll Now" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Education Hub. All rights reserved." } }
    ]
  },
  {
    name: "Real Estate Plus", slug: "real-estate-plus", category: "Real Estate",
    description: "Premium real estate website with property listings, virtual tours, agent profiles, and mortgage calculator.",
    status: "published",
    theme: { primaryColor: "#1d4ed8", secondaryColor: "#0f172a", font: "Manrope", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Find Your Dream Home", subheadline: "Browse thousands of properties nationwide", buttonText: "Search Properties", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Services", visible: true, props: { title: "Our Services" } },
      { id: "stats", type: "stats", label: "Stats", visible: true, props: { title: "By the Numbers" } },
      { id: "testimonials", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Clients Say" } },
      { id: "contact", type: "contact", label: "Contact", visible: true, props: { title: "Get in Touch", buttonText: "Contact Agent" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Real Estate. All rights reserved." } }
    ]
  },
  {
    name: "Event Landing", slug: "event-landing", category: "Event",
    description: "Dynamic event landing page with schedule, speakers, ticket tiers, venue info, and countdown timer.",
    status: "published",
    theme: { primaryColor: "#e11d48", secondaryColor: "#0f172a", font: "Clash Display", buttonStyle: "rounded-xl", layoutWidth: "1200px", darkMode: true, navbarStyle: "floating" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Biggest Tech Event of 2026", subheadline: "Join 10,000+ innovators for a 3-day experience", buttonText: "Get Tickets", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Schedule", visible: true, props: { title: "Event Schedule" } },
      { id: "pricing", type: "pricing", label: "Tickets", visible: true, props: { title: "Ticket Tiers" } },
      { id: "team", type: "team", label: "Speakers", visible: true, props: { title: "Featured Speakers" } },
      { id: "cta", type: "cta", label: "CTA", visible: true, props: { headline: "Don't miss out", buttonText: "Register Now" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Event. All rights reserved." } }
    ]
  },
  {
    name: "Personal Portfolio", slug: "personal-portfolio", category: "Portfolio",
    description: "Stunning personal portfolio with project showcase, skills timeline, blog, and contact form. Built for designers and developers.",
    status: "published",
    theme: { primaryColor: "#0ea5e9", secondaryColor: "#0c4a6e", font: "Satoshi", buttonStyle: "rounded-full", layoutWidth: "1000px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Hi, I'm a Designer", subheadline: "Building beautiful digital experiences", buttonText: "See My Work", buttonUrl: "#" } },
      { id: "about", type: "about", label: "About", visible: true, props: { title: "About Me" } },
      { id: "services", type: "services", label: "Skills", visible: true, props: { title: "What I Do" } },
      { id: "gallery", type: "gallery", label: "Projects", visible: true, props: { title: "Featured Projects" } },
      { id: "contact", type: "contact", label: "Contact", visible: true, props: { title: "Get in Touch", buttonText: "Say Hello" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Portfolio. All rights reserved." } }
    ]
  },
  {
    name: "Digital Product", slug: "digital-product", category: "Ecommerce",
    description: "High-converting digital product sales page with features, demo, testimonials, and checkout integration.",
    status: "published",
    theme: { primaryColor: "#8b5cf6", secondaryColor: "#1e1b4b", font: "Inter", buttonStyle: "rounded-xl", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
    sections: [
      { id: "hero", type: "hero", label: "Hero", visible: true, props: { headline: "Supercharge Your Workflow", subheadline: "The all-in-one productivity tool for modern teams", buttonText: "Buy Now — $49", buttonUrl: "#" } },
      { id: "features", type: "features", label: "Features", visible: true, props: { title: "Powerful Features" } },
      { id: "pricing", type: "pricing", label: "Pricing", visible: true, props: { title: "Simple Pricing" } },
      { id: "testimonials", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Customers Say" } },
      { id: "faq", type: "faq", label: "FAQ", visible: true, props: { title: "Frequently Asked Questions" } },
      { id: "cta", type: "cta", label: "CTA", visible: true, props: { headline: "Start building today", buttonText: "Get Started Now" } },
      { id: "footer", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Digital Product. All rights reserved." } }
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
