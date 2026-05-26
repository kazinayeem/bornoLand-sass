"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <section className="py-20 sm:py-28 text-center px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}02 100%)` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>Contact</span>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {page?.title || "Get in Touch"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            Have a question? We&apos;d love to hear from you.
          </p>
        </motion.div>
      </section>

      {page?.html && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-zinc max-w-none"
            style={{
              color: isDark ? "#a1a1aa" : "#52525b",
              "--tw-prose-headings": isDark ? "#fafafa" : "#18181b",
              "--tw-prose-links": primaryColor,
              "--tw-prose-bold": isDark ? "#fafafa" : "#18181b",
              "--tw-prose-quotes": isDark ? "#a1a1aa" : "#52525b",
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Send us a message</h2>
            <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Fill out the form and we&apos;ll get back to you within 24 hours.
            </p>

            {sent ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}12` }}>
                  <Check className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Message Sent!</h3>
                <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>We&apos;ll respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Name *</label>
                    <input type="text" value={form.name} onChange={handleChange("name")} required
                      className="h-10 w-full rounded-xl border bg-transparent px-3 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Email *</label>
                    <input type="email" value={form.email} onChange={handleChange("email")} required
                      className="h-10 w-full rounded-xl border bg-transparent px-3 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={handleChange("phone")}
                    className="h-10 w-full rounded-xl border bg-transparent px-3 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Message *</label>
                  <textarea value={form.message} onChange={handleChange("message")} required rows={5}
                    className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
                </div>
                <button type="submit" disabled={sending}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#18181b" }}>
                  <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="rounded-2xl border p-6"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
              <h3 className="mb-4 font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@example.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Address", value: "123 Commerce St, New York, NY 10001" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${primaryColor}12` }}>
                      <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{label}</p>
                      <p className="text-sm" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden border"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
              <div className="flex h-full items-center justify-center" style={{ backgroundColor: isDark ? "#18181b" : "#f4f4f5" }}>
                <MapPin className="h-10 w-10" style={{ color: isDark ? "#52525b" : "#d4d4d8" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
