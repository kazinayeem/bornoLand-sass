"use client";

import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  Zap,
  PhoneCall,
  ChevronDown,
  ChevronRight,
  Flame,
  Layers,
  Cpu,
  Gift,
  Clock,
  Award,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { DynamicCategoryNav } from "@/components/storefront/header/dynamic-category-nav";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface TechMegaHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function TechMegaHeader({ headerSettings = {} }: TechMegaHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const isBuilder = useIsBuilder();
  const { store, categories = [], brands = [], settings, contact } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const announcementText =
    (headerSettings.announcementText as string) ||
    "⚡ Tech Mega Deals: Up to ৳15,000 Cashback on Selected Gaming Laptops & GPUs | All Bangladesh Express Delivery";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Tech";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  // Dynamic root categories & subcategories from store data
  const rootCategories = (categories as Category[]).filter((c) => !c.parentId);
  const subcategoriesByParent = (categories as Category[]).reduce<Record<string, Category[]>>((acc, cat) => {
    if (cat.parentId) {
      const pId = String(cat.parentId);
      if (!acc[pId]) acc[pId] = [];
      acc[pId].push(cat);
    }
    return acc;
  }, {});

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const storePhone = contact?.phone || store.phone || "16789";
  const maxVisibleCategories = Math.max(1, Number(headerSettings.maxVisibleCategories) || 6);
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header className="w-full max-w-full min-w-0 bg-[#081621] text-white border-b border-[#172b3c] shadow-md select-none overflow-x-clip">
      {/* ── Top Announcement Strip ── */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-[#e2136e] via-[#ef4444] to-[#f97316] text-white text-[11px] font-semibold py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 shrink-0 fill-current animate-pulse" />
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 shrink-0 text-white/90 text-[10px]">
              <span className="hover:text-white cursor-pointer">Official Brand Warranty</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">0% EMI Facility</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Helpline: {storePhone}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Tech Header Bar (Constrained 72-90px desktop) ── */}
      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-3 min-h-[72px] max-h-[90px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo (Constrained max-h 48px, max-w 180px) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {logoUrl ? (
            <div className="relative max-h-[48px] max-w-[180px] flex items-center">
              <SmartImage
                src={logoUrl}
                alt={storeName}
                width={180}
                height={48}
                className="max-h-[48px] max-w-[180px] w-auto h-auto object-contain transition-transform group-hover:scale-102"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#0071dc] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                {storeName.charAt(0) || "T"}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
                  {storeName}
                </span>
                <span className="text-[10px] font-semibold text-[#0071dc] -mt-1 tracking-wider uppercase">
                  Tech & Electronics
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Global Search Bar */}
        {headerSettings.showSearch !== false && (
          <div className="flex-1 min-w-0 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-0">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search", storeLang)}
                className="w-full h-11 pl-4 pr-24 rounded-xl border border-[#172b3c] bg-[#050e15] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0071dc] focus:ring-1 focus:ring-[#0071dc] transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-5 rounded-lg bg-[#0071dc] hover:bg-[#005bb5] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t("searchButton", storeLang)}</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/offers"
            className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Flame className="w-4 h-4 text-[#ef4444]" />
            <span>Offers</span>
          </Link>

          {headerSettings.showProfile !== false && (
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-zinc-400">{t("account", storeLang)}</span>
                <span className="font-bold text-white mt-0.5">{t("login", storeLang)}</span>
              </div>
            </Link>
          )}

          {headerSettings.showWishlist !== false && (
            <Link
              href="/account/wishlist"
              className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#e2136e] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Trigger */}
          {headerSettings.showCart !== false && (
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0071dc] hover:bg-[#005bb5] text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#081621]">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-blue-200">{t("myCart", storeLang)}</span>
                <span className="font-bold text-white mt-0.5">
                  {formatCurrency(cartTotal, settings)}
                </span>
              </div>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:bg-white/5"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Category Navigation Bar — capped by maxVisibleCategories, overflow → More ── */}
      <div className="hidden md:block bg-[#050e15] border-t border-[#172b3c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 min-w-0 w-full max-w-full">
          <Link
            href="/shop"
            className={cn(
              "shrink-0 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors",
              pathname === "/shop" && "text-[#0071dc] bg-white/5",
            )}
          >
            {t("shop", storeLang)}
          </Link>

          <DynamicCategoryNav
            categories={categories as any}
            maxVisibleCategories={maxVisibleCategories}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            themeVariant="electronics"
            lang={storeLang}
            className="flex-1 min-w-0 py-1"
            itemClassName="px-3 py-2 rounded-lg"
          />

          <Link
            href="/pc-builder"
            className="shrink-0 px-3 py-2 rounded-lg text-[#0071dc] text-xs font-bold hover:bg-[#0071dc]/10 transition-colors flex items-center gap-1"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PC Builder</span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer with Accordion ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-[#081621] text-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 border-r border-[#172b3c]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#172b3c]">
                <span className="font-bold text-base text-[#0071dc]">{storeName}</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Accordion */}
              <div className="py-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-2">
                  {t("categories", storeLang)}
                </p>
                {rootCategories.map((cat) => {
                  const isExpanded = mobileExpandedCatId === cat._id;
                  const subs = subcategoriesByParent[cat._id] || [];

                  return (
                    <div key={cat._id} className="border-b border-white/5 pb-1">
                      <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-semibold text-xs text-zinc-200 hover:text-[#0071dc] flex-1 truncate"
                        >
                          {getLocalizedName(cat, storeLang)}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setMobileExpandedCatId(isExpanded ? null : cat._id)
                            }
                            className="p-1 rounded-md text-zinc-400 hover:text-white"
                          >
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {isExpanded && subs.length > 0 && (
                        <div className="pl-4 pr-2 py-1.5 space-y-1 bg-[#050e15] rounded-lg">
                          {subs.map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/category/${cat.slug}/${sub.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between py-1 px-2 text-xs text-zinc-400 hover:text-white"
                            >
                              <span>{getLocalizedName(sub, storeLang)}</span>
                              <ChevronRight className="w-3 h-3 text-zinc-600" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Links */}
              <div className="py-2 border-t border-[#172b3c] space-y-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-zinc-300">
                  {t("home", storeLang)}
                </Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-zinc-300">
                  {t("shop", storeLang)}
                </Link>
                <Link href="/pc-builder" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-[#0071dc]">
                  PC Builder
                </Link>
                <Link href="/offers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-rose-400">
                  {t("offers", storeLang)}
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-[#172b3c] text-xs text-zinc-400">
              <p className="font-semibold text-white">Helpline / Support:</p>
              <p className="text-[#0071dc] font-bold text-sm mt-0.5">{storePhone}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
