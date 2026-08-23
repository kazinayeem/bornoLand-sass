"use client";

import { useState } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { useStoreCategories } from "@/hooks/use-store-categories";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  PhoneCall,
  Mail,
  MapPin,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface MinimalCommerceFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function MinimalCommerceFooter({ footerSettings = {} }: MinimalCommerceFooterProps) {
  const { store, brands = [], contact } = useTenant();
  const { categories } = useStoreCategories();
  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const storeName = store.name || "BornoLand Store";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  const storePhone = contact?.phone || store.phone || "09613-800800";
  const storeEmail = contact?.email || store.email || "support@bornoland.com";
  const storeAddress = contact?.address || (store as any).address || "Dhaka, Bangladesh";

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
    <footer className="w-full bg-zinc-900 text-zinc-300 border-t border-zinc-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand / Logo & Bio */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={storeName}
                  width={140}
                  height={40}
                  className="max-h-10 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <span className="font-serif text-xl font-bold tracking-wider text-white uppercase">
                  {storeName}
                </span>
              )}
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Discover a curated selection of premium products designed for everyday excellence and reliability.
            </p>

            {/* Social Icons */}
            {showSocial && (
              <div className="flex items-center gap-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <div
              onClick={() => toggleMobileCol("quick")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                {t("shop", storeLang)}
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "quick" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-400",
                mobileExpandedCol !== "quick" && "hidden md:block"
              )}
            >
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("home", storeLang)}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  {t("allCategories", storeLang)}
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  {t("offers", storeLang)}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("contact", storeLang)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories (Dynamic from DB) */}
          <div>
            <div
              onClick={() => toggleMobileCol("cats")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                {t("categories", storeLang)}
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
              {rootCategories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                </li>
              ))}
              {rootCategories.length === 0 && (
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors">
                    Browse All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Customer Support & Contact */}
          <div>
            <div
              onClick={() => toggleMobileCol("contact")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                {t("contact", storeLang)}
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
                "space-y-3 text-xs text-zinc-400",
                mobileExpandedCol !== "contact" && "hidden md:block"
              )}
            >
              <li className="flex items-start gap-2.5">
                <PhoneCall className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>{storeEmail}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>{storeAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/returns" className="hover:text-zinc-300 transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
