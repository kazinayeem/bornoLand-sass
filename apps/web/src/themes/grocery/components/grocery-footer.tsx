"use client";

import { useState } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { useStoreCategories } from "@/hooks/use-store-categories";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
} from "lucide-react";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface GroceryFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function GroceryFooter({ footerSettings = {} }: GroceryFooterProps) {
  const { store, brands = [], contact } = useTenant();
  const { categories } = useStoreCategories();
  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const storeName = store.name || "BornoLand Grocery";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  const storePhone = contact?.phone || store.phone || "09613-800800";
  const storeEmail = contact?.email || store.email || "support@bornoland.com";
  const storeAddress = contact?.address || (store as any).address || "Mirpur, Dhaka - 1216";

  const rootCategories = (categories as Category[]).filter((c) => !c.parentId);
  const [mobileExpandedCol, setMobileExpandedCol] = useState<string | null>(null);

  const toggleMobileCol = (colId: string) => {
    setMobileExpandedCol((prev) => (prev === colId ? null : colId));
  };

  const showSocial = footerSettings.showSocial !== false;
  const showPayment = footerSettings.showPaymentIcons !== false;
  const copyrightText =
    (footerSettings.copyrightText as string) ||
    `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="w-full bg-[var(--store-secondary,#11261f)] text-[var(--store-text,#e2e8f0)] border-t border-[var(--store-border,#1d3d32)] select-none">
      {/* ── Value Guarantees Banner ── */}
      <div className="border-b border-[var(--store-border,#1d3d32)] py-8 bg-[var(--store-secondary,#0c1d18)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[var(--store-secondary,#055c3a)]/40 border border-[var(--store-secondary,#055c3a)] flex items-center justify-center text-[var(--store-accent,#f97316)] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">100% Pure Products</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">গুণগত মানের নিশ্চয়তা</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[var(--store-secondary,#055c3a)]/40 border border-[var(--store-secondary,#055c3a)] flex items-center justify-center text-[var(--store-accent,#f97316)] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Fast Delivery</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Nationwide safe home delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[var(--store-secondary,#055c3a)]/40 border border-[var(--store-secondary,#055c3a)] flex items-center justify-center text-[var(--store-accent,#f97316)] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Easy Returns</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Exchange if product is unsatisfactory</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[var(--store-secondary,#055c3a)]/40 border border-[var(--store-secondary,#055c3a)] flex items-center justify-center text-[var(--store-accent,#f97316)] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Customer Support</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">24/7 support for any queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Multi-Column Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={storeName}
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-[var(--store-primary,#e05a00)] text-white flex items-center justify-center font-bold text-lg">
                    {storeName.charAt(0) || "B"}
                  </div>
                  <span className="font-bold text-lg text-white">{storeName}</span>
                </div>
              )}
            </Link>
            <p className="text-xs leading-relaxed text-zinc-300">
              আমরা প্রতিশ্রুতিবদ্ধ আপনাদের কাছে প্রাকৃতিক, ভেজালমুক্ত এবং পুষ্টিকর খাদ্যপণ্য সুলভ মূল্যে পৌঁছে দিতে। প্রতিটি পণ্য নিজস্ব তত্ত্বাবধানে পরীক্ষা করে সরবরাহ করা হয়।
            </p>

            {showSocial && (
              <div className="flex items-center gap-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[var(--store-primary,#e05a00)] text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[var(--store-primary,#e05a00)] text-white flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[var(--store-primary,#e05a00)] text-white flex items-center justify-center transition-colors" aria-label="Youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Dynamic Popular Categories */}
          <div>
            <div
              onClick={() => toggleMobileCol("cats")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--store-accent,#f97316)] mb-3 md:mb-4">
                জনপ্রিয় ক্যাটাগরি
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
                "space-y-2.5 text-xs text-zinc-300",
                mobileExpandedCol !== "cats" && "hidden md:block"
              )}
            >
              {rootCategories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white hover:underline transition-colors">
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                </li>
              ))}
              {rootCategories.length === 0 && (
                <li>
                  <Link href="/shop" className="hover:text-white hover:underline transition-colors">
                    View All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <div
              onClick={() => toggleMobileCol("service")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--store-accent,#f97316)] mb-3 md:mb-4">
                প্রয়োজনীয় লিংক
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
                "space-y-2.5 text-xs text-zinc-300",
                mobileExpandedCol !== "service" && "hidden md:block"
              )}
            >
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-white hover:underline transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white hover:underline transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white hover:underline transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Hotline & Address */}
          <div>
            <div
              onClick={() => toggleMobileCol("contact")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--store-accent,#f97316)] mb-3 md:mb-4">
                Contact Info
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "contact" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-3 text-xs text-zinc-300",
                mobileExpandedCol !== "contact" && "hidden md:block"
              )}
            >
              <li className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--store-secondary,#055c3a)]/50 text-[var(--store-accent,#f97316)] flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">Hotline:</span>
                  <a href={`tel:${storePhone}`} className="font-bold text-white hover:text-[var(--store-accent,#f97316)] transition-colors">
                    {storePhone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--store-secondary,#055c3a)]/50 text-[var(--store-accent,#f97316)] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">Email:</span>
                  <a href={`mailto:${storeEmail}`} className="font-medium text-white hover:underline">
                    {storeEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--store-secondary,#055c3a)]/50 text-[var(--store-accent,#f97316)] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">Outlet & Office:</span>
                  <span className="leading-snug block text-zinc-200">{storeAddress}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Payment Gateways & Copyright ── */}
        <div className="mt-12 pt-6 border-t border-[var(--store-border,#1d3d32)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-400 mr-2">Secure Payment Methods:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">bKash</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">Nagad</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">Rocket</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">Visa</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
