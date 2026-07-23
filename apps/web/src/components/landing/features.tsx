"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Truck,
  Package,
  BarChart3,
  MonitorSmartphone,
  Smartphone,
  Settings2,
  MapPin,
  Search,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import {
  landingContainer,
  landingSection,
  staggerContainer,
  staggerItem,
} from "./landing-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const toolkit = [
  {
    title: "Shipping Made Simple",
    description:
      "Connect couriers, manage pickup and drop-off, and keep deliveries moving without leaving BornoLand.",
    icon: Truck,
    visual: "shipping" as const,
  },
  {
    title: "Inventory & Order Management",
    description:
      "Track stock, fulfill orders, and keep product catalogs organized in one clear workspace.",
    icon: Package,
    visual: "inventory" as const,
  },
  {
    title: "Real-Time Analytics & Insights",
    description:
      "See sales trends, top products, and conversion signals so you know what to grow next.",
    icon: BarChart3,
    visual: "analytics" as const,
  },
  {
    title: "Perfect on every screen",
    description:
      "Your storefront stays polished on desktop, tablet, and mobile — automatically.",
    icon: MonitorSmartphone,
    visual: "responsive" as const,
  },
  {
    title: "Manage Your Store Anytime",
    description:
      "Check orders, update products, and reply to customers from anywhere on the go.",
    icon: Smartphone,
    visual: "mobile" as const,
  },
  {
    title: "Customize Your Store",
    description:
      "Tune branding, promos, and store settings with a visual builder built for merchants.",
    icon: Settings2,
    visual: "customize" as const,
  },
];

function ShippingVisual() {
  return (
    <div className="space-y-2 p-4">
      <div className="rounded-apple-lg border border-border bg-card p-2.5 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-primary">
          <MapPin className="h-3 w-3" aria-hidden />
          Pickup
        </div>
        <p className="text-[10px] text-muted-foreground">Gulshan, Dhaka</p>
      </div>
      <div className="mx-auto h-4 w-px border-l border-dashed border-primary/40" aria-hidden />
      <div className="rounded-apple-lg border border-border bg-card p-2.5 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-success">
          <MapPin className="h-3 w-3" aria-hidden />
          Drop-off
        </div>
        <p className="text-[10px] text-muted-foreground">Mirpur, Dhaka</p>
      </div>
      <div className="flex items-center gap-2 rounded-apple-lg border border-primary/20 bg-primary/5 p-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          DR
        </div>
        <div>
          <p className="text-[10px] font-semibold text-foreground">Delivery rider</p>
          <p className="text-[9px] text-muted-foreground">Assigned · Pathao</p>
        </div>
      </div>
    </div>
  );
}

function InventoryVisual() {
  const rows = [
    { name: "SmartWatch", stock: "42" },
    { name: "Sneakers", stock: "18" },
    { name: "T-Shirt", stock: "96" },
  ];
  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-apple-lg border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border bg-muted/50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Product</span>
          <span>Stock</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/60 px-3 py-2 last:border-0"
          >
            <span className="text-[11px] font-medium text-foreground">{row.name}</span>
            <Badge variant="primary" className="h-5 px-1.5 text-[9px]">
              {row.stock}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="p-4">
      <div className="rounded-apple-lg border border-border bg-card p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold text-foreground">Analytics</p>
          <span className="text-[9px] text-muted-foreground">Jul 14 – Jul 24</span>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md bg-primary/80"
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResponsiveVisual() {
  return (
    <div className="flex items-end justify-center gap-2 p-4 pt-6">
      <div className="h-16 w-24 rounded-apple-md border border-border bg-card p-1.5 shadow-sm">
        <div className="h-full rounded-sm bg-gradient-to-br from-primary/20 to-muted" />
      </div>
      <div className="h-20 w-14 rounded-apple-md border border-border bg-card p-1 shadow-sm">
        <div className="h-full rounded-sm bg-gradient-to-br from-primary/30 to-muted" />
      </div>
      <div className="h-24 w-10 rounded-apple-lg border border-border bg-card p-1 shadow-md">
        <div className="mb-1 flex justify-center">
          <div className="h-1 w-4 rounded-pill bg-foreground/80" />
        </div>
        <div className="h-[calc(100%-0.5rem)] rounded-sm bg-gradient-to-br from-primary/40 to-muted" />
      </div>
    </div>
  );
}

function MobileVisual() {
  return (
    <div className="flex justify-center p-4">
      <div className="w-[140px] overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-md">
        <div className="bg-primary px-3 py-2.5 text-primary-foreground">
          <p className="text-[10px] font-bold">Orders</p>
          <div className="mt-1.5 flex items-center gap-1 rounded-pill bg-primary-foreground/15 px-2 py-1">
            <Search className="h-2.5 w-2.5" aria-hidden />
            <span className="text-[8px] opacity-80">Search orders…</span>
          </div>
        </div>
        <div className="space-y-1.5 p-2.5">
          {["#1042 · Paid", "#1041 · Pending", "#1040 · Shipped"].map((row) => (
            <div
              key={row}
              className="rounded-apple-md border border-border bg-muted/40 px-2 py-1.5 text-[9px] font-medium text-foreground"
            >
              {row}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomizeVisual() {
  return (
    <div className="p-4">
      <div className="rounded-apple-lg border border-border bg-card p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-bold text-foreground">Configuration</p>
        <div className="space-y-2">
          {["Manage Shop", "Upload Product", "Promo Codes"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "rounded-apple-md px-2.5 py-2 text-[10px] font-semibold",
                i === 1
                  ? "border border-primary bg-primary/5 text-primary"
                  : "border border-border bg-muted/40 text-foreground",
              )}
            >
              {item}
            </div>
          ))}
          <div className="flex items-center justify-between rounded-apple-md border border-border px-2.5 py-2">
            <span className="text-[10px] font-medium text-muted-foreground">Live store</span>
            <Switch defaultChecked aria-label="Live store" />
          </div>
        </div>
      </div>
    </div>
  );
}

const visuals = {
  shipping: ShippingVisual,
  inventory: InventoryVisual,
  analytics: AnalyticsVisual,
  responsive: ResponsiveVisual,
  mobile: MobileVisual,
  customize: CustomizeVisual,
};

export function Features() {
  const { t } = useLandingLocale();
  const f = t.features;
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className={cn(landingSection, "bg-gradient-to-b from-background via-secondary/40 to-background")}
    >
      <div id="builder" className="scroll-mt-28" aria-hidden />
      <div className={landingContainer}>
        <SectionHeading
          eyebrow={f.eyebrow}
          title="Your Complete Ecommerce Toolkit"
          description={f.description}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {toolkit.map((item) => {
            const Visual = visuals[item.visual];
            return (
              <motion.div key={item.title} variants={staggerItem}>
                <Card
                  className={cn(
                    "group h-full overflow-hidden rounded-3xl border-border/70 bg-card shadow-[0_8px_30px_-14px_rgba(15,23,42,0.14)] transition-all duration-300",
                    "hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_22px_44px_-18px_rgba(15,23,42,0.2)]",
                  )}
                >
                  <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-muted/60 to-secondary">
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : { y: [0, -4, 0] }
                      }
                      transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Visual />
                    </motion.div>
                  </div>
                  <CardContent className="space-y-2 p-5 sm:p-6">
                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-apple-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="h-4 w-4" aria-hidden />
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
