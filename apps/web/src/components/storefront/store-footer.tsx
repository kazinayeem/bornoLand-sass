"use client";

import Link from "next/link";
import { ShoppingBag, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

export function StoreFooter() {
  const { store, theme } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  return (
    <footer style={{ backgroundColor: isDark ? "#09090b" : "#fafafa", borderTop: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`, fontFamily: font }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                {store.name[0]}
              </div>
              <span className="text-lg font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{store.name}</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              {store.description || "Premium ecommerce store offering curated products with fast shipping and exceptional service."}
            </p>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a key={idx} href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: isDark ? "#18181b" : "#f4f4f5", color: isDark ? "#a1a1aa" : "#71717a" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? "#18181b" : "#f4f4f5"; e.currentTarget.style.color = isDark ? "#a1a1aa" : "#71717a"; }}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { name: "Home", href: "/" },
                { name: "Shop All", href: "/shop" },
                { name: "Categories", href: "/categories" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#a1a1aa" : "#52525b"}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Support</h3>
            <ul className="space-y-2.5">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Shipping Info", href: "/shipping" },
                { name: "Returns", href: "/returns" },
                { name: "Size Guide", href: "/size-guide" },
                { name: "Contact Us", href: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#a1a1aa" : "#52525b"}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Contact</h3>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: "hello@example.com" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: MapPin, text: "123 Commerce St, NY 10001" }
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                  <Icon className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t py-6" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#000000" : "#ffffff" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
