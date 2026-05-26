"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, Shield, HeadphonesIcon, RefreshCw, Star } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { config } from "@/lib/config";

type CmsPage = {
  _id: string;
  storeId: string;
  slug: string;
  title: string;
  html: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  published: boolean;
  layout: string;
};

const features = [
  { icon: ShoppingBag, title: "Curated Products", desc: "Handpicked items from top brands and artisans worldwide." },
  { icon: Truck, title: "Fast Shipping", desc: "Free shipping on orders over $100. Delivery in 3-5 business days." },
  { icon: Shield, title: "Secure Shopping", desc: "SSL-encrypted checkout with 100% purchase protection." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock customer service, ready to help anytime." },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy. No questions asked." },
  { icon: Star, title: "Premium Quality", desc: "Every product meets our strict quality standards." },
];

export default function AboutPage() {
  const { store, theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store._id) return;
    setLoading(true);
    const apiUrl = config.apiUrl;
    fetch(`${apiUrl}/public/page/about-us?storeId=${store._id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.page) setPage(json.data.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id]);

  return (
    <div style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <section className="py-20 sm:py-28 text-center px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}02 100%)` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>About Us</span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {page?.title || "Our Story"}
          </h1>
        </motion.div>
      </section>
    </div>
  );
}
