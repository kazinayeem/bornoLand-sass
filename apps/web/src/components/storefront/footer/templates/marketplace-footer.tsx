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
  Twitter,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface MarketplaceFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function MarketplaceFooter({ footerSettings = {} }: MarketplaceFooterProps) {
  const { store, brands = [], contact } = useTenant();
  const { categories } = useStoreCategories();
  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const storeName = store.name || "BornoLand Marketplace";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  const storePhone = contact?.phone || store.phone || "09613-800800";
  const storeEmail = contact?.email || store.email || "support@marketplace.local";
  const storeAddress = contact?.address || (store as any).address || "Dhaka, Bangladesh";

  const rootCategories = (categories as Category[]).filter((c) => !c.parentId);
  const [mobileExpandedCol, setMobileExpandedCol] = useState<string | null>(null);

  const toggleMobileCol = (colId: string) => {
    setMobileExpandedCol((prev) => (prev === colId ? null : colId));
  };

  const showSocial = footerSettings.showSocial !== false;
  const copyrightText =
    (footerSettings.copyrightText as string) ||
    `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="w-full bg-zinc-100 text-zinc-700 border-t border-zinc-200 select-none">
      {/* ── Value Propositions Strip ── */}
      <div className="bg-white border-b border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">100% Authentic</h4>
              <p className="text-[11px] text-zinc-500">Genuine verified products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Fast Delivery</h4>
              <p className="text-[11px] text-zinc-500">Nationwide doorstep shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Easy Returns</h4>
              <p className="text-[11px] text-zinc-500">7 days return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#f85606] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">24/7 Support</h4>
              <p className="text-[11px] text-zinc-500">Dedicated customer care</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Multi-Column Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Customer Care */}
          <div>
            <div
              onClick={() => toggleMobileCol("care")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 md:mb-4">
                Customer Care
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "care" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-600",
                mobileExpandedCol !== "care" && "hidden md:block"
              )}
            >
              <li><Link href="/faq" className="hover:text-[#f85606] transition-colors">Help Center</Link></li>
              <li><Link href="/order-tracking" className="hover:text-[#f85606] transition-colors">Order Tracking</Link></li>
              <li><Link href="/contact" className="hover:text-[#f85606] transition-colors">How to Buy</Link></li>
              <li><Link href="/returns" className="hover:text-[#f85606] transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-[#f85606] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 2: About Store */}
          <div>
            <div
              onClick={() => toggleMobileCol("about")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 md:mb-4">
                About {storeName}
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "about" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-600",
                mobileExpandedCol !== "about" && "hidden md:block"
              )}
            >
              <li><Link href="/about" className="hover:text-[#f85606] transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-[#f85606] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#f85606] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-[#f85606] transition-colors">Shipping & Delivery</Link></li>
            </ul>
          </div>

          {/* Col 3: Top Categories */}
          <div>
            <div
              onClick={() => toggleMobileCol("cats")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 md:mb-4">
                Top Categories
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
                "space-y-2 text-xs text-zinc-600",
                mobileExpandedCol !== "cats" && "hidden md:block"
              )}
            >
              {rootCategories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-[#f85606] transition-colors">
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Partner Brands */}
          <div>
            <div
              onClick={() => toggleMobileCol("brands")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 md:mb-4">
                Popular Brands
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
                "space-y-2 text-xs text-zinc-600",
                mobileExpandedCol !== "brands" && "hidden md:block"
              )}
            >
              {brands.slice(0, 5).map((brand) => (
                <li key={brand._id}>
                  <Link href={`/brand/${brand.slug}`} className="hover:text-[#f85606] transition-colors">
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: App Download & Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Payment & Social
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700">bKash</span>
              <span className="px-2 py-1 rounded bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700">Nagad</span>
              <span className="px-2 py-1 rounded bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700">Visa</span>
              <span className="px-2 py-1 rounded bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700">Mastercard</span>
              <span className="px-2 py-1 rounded bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700">COD</span>
            </div>

            {showSocial && (
              <div className="flex items-center gap-2 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-[#f85606] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-[#f85606] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-[#f85606] transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            <span>Official Multi-Vendor Marketplace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
