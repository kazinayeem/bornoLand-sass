"use client";

import { useState } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Cpu,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface TechElectronicsFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function TechElectronicsFooter({ footerSettings = {} }: TechElectronicsFooterProps) {
  const { store, categories = [], brands = [], contact } = useTenant();
  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const storeName = store.name || "BornoLand Tech";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  const storePhone = contact?.phone || store.phone || "16789";
  const storeEmail = contact?.email || store.email || "support@startech.local";
  const storeAddress = contact?.address || (store as any).address || "Dhaka, Bangladesh";

  const rootCategories = (categories as Category[]).filter((c) => !c.parentId);
  const [mobileExpandedCol, setMobileExpandedCol] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleMobileCol = (colId: string) => {
    setMobileExpandedCol((prev) => (prev === colId ? null : colId));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    setNewsletterEmail("");
    toast.success("Thank you for subscribing to tech deals and updates!");
  };

  const showNewsletter = footerSettings.showNewsletter !== false;
  const showSocial = footerSettings.showSocial !== false;
  const copyrightText =
    (footerSettings.copyrightText as string) ||
    `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="w-full bg-[#081621] text-zinc-300 border-t border-[#172b3c] select-none">
      {/* ── Top Newsletter & Help Strip ── */}
      {showNewsletter && (
        <div className="bg-[#050e15] border-b border-[#172b3c] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#0071dc]/20 border border-[#0071dc] flex items-center justify-center text-[#0071dc] shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">SUBSCRIBE TO TECH DEALS & OFFERS</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Get instant notifications about newly launched GPUs, laptops & flash discounts</p>
              </div>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex items-center w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="h-10 px-4 rounded-xl border border-[#172b3c] bg-[#0c1d2c] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0071dc] w-full md:w-72"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-[#0071dc] hover:bg-[#005bb5] text-white text-xs font-bold shrink-0 transition-colors shadow-md"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Main Multi-Column Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Col 1: Store Bio & Hotline */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={storeName}
                  width={160}
                  height={44}
                  className="max-h-11 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-[#0071dc] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                    {storeName.charAt(0) || "T"}
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">{storeName}</span>
                </div>
              )}
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Leading tech store for genuine desktop components, high-performance laptops, gaming gear, monitors and computer peripherals with official warranty.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#0071dc]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Helpline & Hotline</span>
                <p className="font-black text-white text-sm">{storePhone}</p>
              </div>
            </div>

            {/* Social Icons */}
            {showSocial && (
              <div className="flex items-center gap-2 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Top Tech Categories */}
          <div>
            <div
              onClick={() => toggleMobileCol("cats")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Tech Categories
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "cats" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-400",
                mobileExpandedCol !== "cats" && "hidden md:block"
              )}
            >
              {rootCategories.slice(0, 6).map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                </li>
              ))}
              {rootCategories.length === 0 && (
                <>
                  <li><Link href="/shop" className="hover:text-white transition-colors">Laptops</Link></li>
                  <li><Link href="/shop" className="hover:text-white transition-colors">Desktop PCs</Link></li>
                  <li><Link href="/shop" className="hover:text-white transition-colors">Graphics Cards</Link></li>
                  <li><Link href="/shop" className="hover:text-white transition-colors">Monitors</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <div
              onClick={() => toggleMobileCol("service")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Customer Service
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "service" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-400",
                mobileExpandedCol !== "service" && "hidden md:block"
              )}
            >
              <li><Link href="/order-tracking" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Warranty Claim</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          {/* Col 4: Partner Brands */}
          <div>
            <div
              onClick={() => toggleMobileCol("brands")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Partner Brands
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "brands" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-400",
                mobileExpandedCol !== "brands" && "hidden md:block"
              )}
            >
              {brands.slice(0, 6).map((brand) => (
                <li key={brand._id}>
                  <Link href={`/brand/${brand.slug}`} className="hover:text-white transition-colors">
                    {brand.name}
                  </Link>
                </li>
              ))}
              {brands.length === 0 && (
                <>
                  <li><span className="text-zinc-500">ASUS</span></li>
                  <li><span className="text-zinc-500">Lenovo</span></li>
                  <li><span className="text-zinc-500">HP</span></li>
                  <li><span className="text-zinc-500">Dell</span></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Payment Badges & Legal */}
        <div className="mt-12 pt-6 border-t border-[#172b3c] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">bKash</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">Nagad</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">Visa</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
