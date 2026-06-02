"use client";

import { motion } from "framer-motion";
import {
  Store, ShoppingBag, ShoppingCart, Users, CreditCard, Truck, BarChart3,
  FileText, Palette, Search, Package, Percent, Mail, Globe, Link2, Smartphone,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  { icon: Store, title: "Store Builder", description: "Drag-and-drop builder to design your store exactly how you want it." },
  { icon: ShoppingBag, title: "Products", description: "Manage inventory, variants, categories, and pricing in one place." },
  { icon: ShoppingCart, title: "Orders", description: "View, track, update, and fulfill orders with real-time status." },
  { icon: Users, title: "Customers", description: "Manage customer profiles, orders, and engagement history." },
  { icon: CreditCard, title: "Payments", description: "Accept bKash, Nagad, Rocket, Stripe, SSLCommerz & more." },
  { icon: Truck, title: "Delivery", description: "Pathao, SteadFast, RedX, Paperfly — manage shipping zones & charges." },
  { icon: BarChart3, title: "Analytics", description: "Revenue, conversion, top products, and store performance dashboards." },
  { icon: FileText, title: "CMS", description: "Rich text editor, pages, blogs, and SEO content management." },
  { icon: Palette, title: "Theme Editor", description: "Customize colors, fonts, layouts without touching code." },
  { icon: Search, title: "SEO Tools", description: "Meta tags, sitemaps, structured data, and social previews." },
  { icon: Package, title: "Inventory", description: "Stock tracking, low stock alerts, and bulk inventory updates." },
  { icon: Percent, title: "Discount System", description: "Coupons, percentage discounts, BOGO, and flash sales." },
  { icon: Mail, title: "Email Marketing", description: "Automated order confirmations, newsletters, and campaigns." },
  { icon: Globe, title: "Custom Domain", description: "Connect your own domain with free SSL in one click." },
  { icon: Link2, title: "Subdomain", description: "Get a free branded subdomain instantly on setup." },
  { icon: Smartphone, title: "Mobile Ready", description: "Every store is fully responsive and mobile-optimized." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export function Features() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything You Need To Run An Online Business"
          description="From store builder to analytics, BornoLand gives you every tool to launch, manage, and grow your ecommerce business."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              className="group rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200/80 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 transition-colors group-hover:from-blue-100 group-hover:to-indigo-100">
                <f.icon className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
