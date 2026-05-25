"use client";

import { useState } from "react";
import { Send, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

export function NewsletterSection({ section }: { section?: StorefrontSectionLike }) {
  const { theme } = useTenant();
  const { primaryColor, buttonStyle, font, darkMode } = theme;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDark = darkMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: isDark ? "#09090b" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16"
          style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}15` }}>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: primaryColor }} />
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
              <Mail className="h-3 w-3" /> Newsletter
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              {section?.props?.headline ?? "Stay in the Loop"}
            </h2>
            <p className="mt-3 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            {subscribed ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium" style={{ color: primaryColor }}>
                <Check className="h-5 w-5" /> You&apos;re subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 flex-1 rounded-xl border bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: `${primaryColor}30` }}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = `${primaryColor}30`} />
                <button type="submit" disabled={loading}
                  className="flex h-12 items-center gap-2 px-6 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
                  <Send className="h-4 w-4" /> {loading ? "..." : (section?.props?.buttonText ?? "Subscribe")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
