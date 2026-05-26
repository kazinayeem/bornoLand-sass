"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import { toast } from "sonner";
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

export default function ContactPage() {
  const { store, theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store._id) return;
    setLoading(true);
    const apiUrl = config.apiUrl;
    fetch(`${apiUrl}/public/page/contact-us?storeId=${store._id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.page) setPage(json.data.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id]);

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill required fields");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, storeId: store._id }),
      });
      const json = await res.json();
      if (json.success) {
        setSent(true);
        toast.success("Message sent!");
      } else {
        toast.error(json.message || "Failed to send message");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ backgroundColor: isDark ? "#000000" : "#ffffff", minHeight: "100vh" }}>
      <section className="py-20 sm:py-28 px-4 text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}02 100%)` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>Contact</span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {page?.title || "Get in Touch"}
          </h1>
          <p className="mt-3 text-lg" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
            {page?.seoDescription || "We'd love to hear from you."}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
