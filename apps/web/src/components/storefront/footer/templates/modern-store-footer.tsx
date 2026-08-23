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
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface ModernStoreFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function ModernStoreFooter({ footerSettings = {} }: ModernStoreFooterProps) {
  const { store, brands = [], contact } = useTenant();
  const { categories } = useStoreCategories();
  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const storeName = store.name || "BornoLand Modern";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  const storePhone = contact?.phone || store.phone || "09613-800800";
  const storeEmail = contact?.email || store.email || "hello@bornoland.store";
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
    toast.success("Thank you for subscribing to our newsletter!");
  };

  const showNewsletter = footerSettings.showNewsletter !== false;
  const showSocial = footerSettings.showSocial !== false;
  const copyrightText =
    (footerSettings.copyrightText as string) ||
    `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 border-t border-zinc-900 select-none">
      {/* ── Top Newsletter Banner ── */}
      {showNewsletter && (
        <div className="border-b border-zinc-900 py-10 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Stay in Touch
              </span>
              <h3 className="font-extrabold text-xl sm:text-2xl text-white">Join Our Exclusive Member Circle</h3>
              <p className="text-xs text-zinc-400 mt-1">Get early access to private sales, new arrivals, and special promotions.</p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex items-center w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email..."
                className="h-11 px-4 rounded-full border border-zinc-800 bg-zinc-900 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white w-full md:w-72"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-full bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-bold shrink-0 transition-colors shadow-md active:scale-95"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Main Multi-Column Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Store Bio */}
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
                <span className="text-xl font-black tracking-tight text-white uppercase">
                  {storeName}
                </span>
              )}
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Engineered for seamless shopping and refined lifestyle products. Experience state-of-the-art e-commerce.
            </p>

            {showSocial && (
              <div className="flex items-center gap-2 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div
              onClick={() => toggleMobileCol("explore")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Explore
              </h4>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-zinc-400 md:hidden transition-transform mb-3",
                  mobileExpandedCol === "explore" && "rotate-180"
                )}
              />
            </div>
            <ul
              className={cn(
                "space-y-2 text-xs text-zinc-400",
                mobileExpandedCol !== "explore" && "hidden md:block"
              )}
            >
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/offers" className="hover:text-white transition-colors">Flash Offers</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Dynamic Categories */}
          <div>
            <div
              onClick={() => toggleMobileCol("cats")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Categories
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
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <div
              onClick={() => toggleMobileCol("contact")}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 md:mb-4">
                Contact
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
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
