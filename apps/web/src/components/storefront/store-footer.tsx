"use client";

import { ShoppingBag, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

type StoreFooterProps = {
  storeName: string;
  primaryColor: string;
  font: string;
  darkMode: boolean;
};

export function StoreFooter({ storeName, primaryColor, font, darkMode }: StoreFooterProps) {
  const isDark = darkMode;

  return (
    <footer style={{ backgroundColor: isDark ? "#09090b" : "#fafafa", borderTop: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`, fontFamily: font }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                {storeName[0]}
              </div>
              <span className="text-lg font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{storeName}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Premium ecommerce store offering curated products with fast shipping and exceptional service.
            </p>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a key={idx} href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: isDark ? "#18181b" : "#f4f4f5", color: isDark ? "#a1a1aa" : "#71717a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor, e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? "#18181b" : "#f4f4f5", e.currentTarget.style.color = isDark ? "#a1a1aa" : "#71717a")}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Quick Links</h3>
            <ul className="space-y-2.5">
              {["Home", "Shop All", "New Arrivals", "Best Sellers", "Sale"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#a1a1aa" : "#52525b"}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Support</h3>
            <ul className="space-y-2.5">
              {["FAQ", "Shipping Info", "Returns", "Size Guide", "Contact Us"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#a1a1aa" : "#52525b"}>
                    {link}
                  </a>
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
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
