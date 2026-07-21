"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, BarChart3, Users,
  Blocks, Palette
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "builder", label: "Builder", icon: Blocks },
  { id: "theme", label: "Theme Editor", icon: Palette },
];

const previewContent: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard Overview",
    description: "At-a-glance view of revenue, orders, products, and customer activity for your entire store.",
  },
  products: {
    title: "Product Management",
    description: "Add, edit, organize products with variants, categories, SEO metadata, and bulk operations.",
  },
  orders: {
    title: "Order Management",
    description: "Track every order from placement to delivery with status updates, invoices, and notifications.",
  },
  analytics: {
    title: "Analytics Dashboard",
    description: "Deep insights into revenue trends, conversion rates, top-performing products, and customer behavior.",
  },
  customers: {
    title: "Customer Profiles",
    description: "View purchase history, order preferences, and engagement data for every customer.",
  },
  builder: {
    title: "Drag & Drop Builder",
    description: "Visually build your store pages with sections, blocks, and live preview — no code needed.",
  },
  theme: {
    title: "Theme Customization",
    description: "Full control over colors, typography, layout width, button styles, and dark mode.",
  },
};

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const content = previewContent[activeTab];

  return (
    <section id="platform" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Platform Overview"
          title="Full Control From One Dashboard"
          description="Every tool you need to run your ecommerce business is just a click away."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <div className="mb-6 flex flex-wrap gap-1.5 rounded-lg border border-apple-hairline bg-apple-canvas-parchment/50 p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-apple-canvas text-apple-ink"
                    : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas">
            <div className="flex h-48 items-end bg-apple-primary p-6 sm:h-64 sm:p-8 lg:h-80">
              <div className="max-w-xl rounded-lg bg-white/20 p-5 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white sm:text-2xl">{content.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/80">{content.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-apple-divider-soft bg-apple-canvas-parchment/50 p-3">
                  <div className="mb-2 h-2 w-16 rounded-full bg-zinc-200" />
                  <div className="h-4 w-20 rounded-md bg-apple-canvas-parchment" />
                  <div className="mt-2 flex gap-1">
                    {[60, 75, 50, 85].map((h, j) => (
                      <div
                        key={j}
                        className="h-6 flex-1 rounded-sm bg-blue-500/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
