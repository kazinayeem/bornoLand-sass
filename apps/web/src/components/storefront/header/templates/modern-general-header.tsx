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
  ChevronDown,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Award,
  PhoneCall,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { StorefrontMegaMenu } from "@/components/storefront/navigation/storefront-mega-menu";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface ModernGeneralHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ModernGeneralHeader({ headerSettings = {} }: ModernGeneralHeaderProps) {
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
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const storeName = store.name || "BornoLand Store";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";
  const storePhone = contact?.phone || store.phone || "09613-800800";

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

  return (
    <header className="w-full bg-white text-zinc-900 border-b border-zinc-200 shadow-xs select-none relative z-40">
      {/* ── Top Main Navbar Row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 min-h-[72px] max-h-[90px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          {logoUrl ? (
            <div className="relative max-h-[48px] max-w-[180px] flex items-center">
              <SmartImage
                src={logoUrl}
                alt={storeName}
                width={180}
                height={48}
                className="max-h-[48px] max-w-[180px] w-auto h-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xl">
                {storeName.charAt(0) || "B"}
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900">
                {storeName}
              </span>
            </div>
          )}
        </Link>

        {/* Global Search */}
        {headerSettings.showSearch !== false && (
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search", storeLang)}
                className="w-full h-10 pl-4 pr-24 rounded-full border border-zinc-300 bg-zinc-50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t("searchButton", storeLang)}</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Actions: Phone Hotline, Account, Wishlist, Cart */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-zinc-600 border-r pr-4 border-zinc-200">
            <PhoneCall className="w-4 h-4 text-zinc-400" />
            <span>{storePhone}</span>
          </div>

          {headerSettings.showProfile !== false && (
            <Link href="/account" className="hidden sm:flex items-center gap-1.5 p-2 rounded-lg text-zinc-700 hover:text-black">
              <User className="w-4 h-4" />
              <span className="text-xs font-semibold">{t("account", storeLang)}</span>
            </Link>
          )}

          {headerSettings.showWishlist !== false && (
            <Link href="/account/wishlist" className="relative p-2 rounded-lg text-zinc-700 hover:text-black" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart */}
          {headerSettings.showCart !== false && (
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white transition-all shadow-md active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">
                {formatCurrency(cartTotal, settings)}
              </span>
            </button>
          )}

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Second Navigation Row with Categories Dropdown & Mega Menu ── */}
      <div className="hidden md:block bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* All Categories Dropdown Trigger */}
            <div className="relative" onMouseLeave={() => setAllCategoriesOpen(false)}>
              <button
                type="button"
                onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white font-semibold text-xs rounded-t-lg hover:bg-black transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>{t("allCategories", storeLang)}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", allCategoriesOpen && "rotate-180")} />
              </button>

              {allCategoriesOpen && rootCategories.length > 0 && (
                <StorefrontMegaMenu
                  category={rootCategories[0]}
                  subcategories={subcategoriesByParent[rootCategories[0]._id] || []}
                  brands={brands}
                  lang={storeLang}
                  themeVariant="default"
                  onItemClick={() => setAllCategoriesOpen(false)}
                />
              )}
            </div>

            {/* Quick Links */}
            <nav className="flex items-center gap-6 text-xs font-semibold text-zinc-700">
              <Link href="/" className={cn("py-2.5 hover:text-black transition-colors", pathname === "/" && "text-black font-bold")}>
                {t("home", storeLang)}
              </Link>
              <Link href="/shop" className={cn("py-2.5 hover:text-black transition-colors", pathname === "/shop" && "text-black font-bold")}>
                {t("shop", storeLang)}
              </Link>

              {/* Dynamic Categories */}
              {rootCategories.slice(0, 4).map((cat) => {
                const subs = subcategoriesByParent[cat._id] || [];
                const hasSubs = subs.length > 0;
                const isHovered = activeMegaCategory === cat._id;

                return (
                  <div
                    key={cat._id}
                    className="relative"
                    onMouseEnter={() => hasSubs && setActiveMegaCategory(cat._id)}
                    onMouseLeave={() => setActiveMegaCategory(null)}
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className={cn("inline-flex items-center gap-1 py-2.5 hover:text-black transition-colors", isHovered && "text-black font-bold")}
                    >
                      <span>{getLocalizedName(cat, storeLang)}</span>
                      {hasSubs && <ChevronDown className="w-3 h-3 opacity-60" />}
                    </Link>

                    {isHovered && hasSubs && (
                      <StorefrontMegaMenu
                        category={cat}
                        subcategories={subs}
                        brands={brands}
                        lang={storeLang}
                        themeVariant="default"
                        onItemClick={() => setActiveMegaCategory(null)}
                      />
                    )}
                  </div>
                );
              })}

              <Link href="/offers" className="flex items-center gap-1 py-2.5 text-rose-600 hover:text-rose-700 font-bold transition-colors">
                <Flame className="w-3.5 h-3.5" />
                <span>{t("offers", storeLang)}</span>
              </Link>
            </nav>
          </div>

          <Link href="/contact" className="text-xs font-semibold text-zinc-600 hover:text-black transition-colors">
            {t("contact", storeLang)}
          </Link>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-extrabold text-base text-zinc-900">{storeName}</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Accordion */}
              <div className="py-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                  {t("categories", storeLang)}
                </p>
                {rootCategories.map((cat) => {
                  const isExpanded = mobileExpandedCatId === cat._id;
                  const subs = subcategoriesByParent[cat._id] || [];

                  return (
                    <div key={cat._id} className="border-b border-zinc-50 pb-1">
                      <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-zinc-50">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-semibold text-xs text-zinc-800 hover:text-black flex-1 truncate"
                        >
                          {getLocalizedName(cat, storeLang)}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMobileExpandedCatId(isExpanded ? null : cat._id)}
                            className="p-1 text-zinc-400"
                          >
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                          </button>
                        )}
                      </div>

                      {isExpanded && subs.length > 0 && (
                        <div className="pl-4 pr-2 py-1.5 space-y-1 bg-zinc-50 rounded-lg">
                          {subs.map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/category/${cat.slug}/${sub.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between py-1 px-2 text-xs text-zinc-600 hover:text-black"
                            >
                              <span>{getLocalizedName(sub, storeLang)}</span>
                              <ChevronRight className="w-3 h-3 text-zinc-400" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-800">{t("hotline", storeLang)}: {storePhone}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
