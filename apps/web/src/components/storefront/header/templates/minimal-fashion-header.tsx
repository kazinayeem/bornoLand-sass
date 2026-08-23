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
  Sparkles,
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

export interface MinimalFashionHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function MinimalFashionHeader({ headerSettings = {} }: MinimalFashionHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const isBuilder = useIsBuilder();
  const { store, categories = [], brands = [], settings } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategoryMenuId, setActiveCategoryMenuId] = useState<string | null>(null);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const storeName = store.name || "BornoLand Studio";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";
  const isTransparent = headerSettings.transparent === true || headerSettings.transparent === "true";

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
    <header
      className={cn(
        "w-full transition-all select-none border-b",
        isTransparent
          ? "bg-white/80 backdrop-blur-md border-zinc-200/50 text-zinc-900"
          : "bg-white border-zinc-100 text-zinc-900 shadow-xs"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-[76px] flex items-center justify-between gap-6">
        {/* Left Navigation / Categories */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] tracking-wider uppercase font-medium text-zinc-600">
          <Link
            href="/"
            className={cn("hover:text-black transition-colors", pathname === "/" && "text-black font-bold")}
          >
            {t("home", storeLang)}
          </Link>
          <Link
            href="/shop"
            className={cn("hover:text-black transition-colors", pathname === "/shop" && "text-black font-bold")}
          >
            {t("shop", storeLang)}
          </Link>

          {/* Dynamic Category Hover Menu */}
          {rootCategories.slice(0, 3).map((cat) => {
            const subs = subcategoriesByParent[cat._id] || [];
            const hasSubs = subs.length > 0;
            const isHovered = activeCategoryMenuId === cat._id;

            return (
              <div
                key={cat._id}
                className="relative"
                onMouseEnter={() => hasSubs && setActiveCategoryMenuId(cat._id)}
                onMouseLeave={() => setActiveCategoryMenuId(null)}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn("inline-flex items-center gap-1 hover:text-black transition-colors", isHovered && "text-black")}
                >
                  <span>{getLocalizedName(cat, storeLang)}</span>
                  {hasSubs && <ChevronDown className="w-3 h-3 opacity-50" />}
                </Link>

                {isHovered && hasSubs && (
                  <StorefrontMegaMenu
                    category={cat}
                    subcategories={subs}
                    brands={brands}
                    lang={storeLang}
                    themeVariant="fashion"
                    onItemClick={() => setActiveCategoryMenuId(null)}
                  />
                )}
              </div>
            );
          })}

          <Link href="/sale" className="text-rose-600 hover:text-rose-700 transition-colors font-semibold">
            Sale
          </Link>
        </nav>

        {/* Center / Left Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
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
            <span className="font-serif text-2xl tracking-widest uppercase font-bold text-zinc-900 group-hover:opacity-80 transition-opacity">
              {storeName}
            </span>
          )}
        </Link>

        {/* Right Action Icons: Search, Wishlist, Account, Cart */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0 text-zinc-700">
          {/* Search Trigger */}
          {headerSettings.showSearch !== false && (
            searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in-50 duration-150">
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fashion..."
                  className="w-48 sm:w-64 h-9 pl-3 pr-8 rounded-full border border-zinc-300 bg-zinc-50 text-xs focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )
          )}

          {headerSettings.showProfile !== false && (
            <Link href="/account" className="hidden sm:block p-1.5 hover:text-black transition-colors" aria-label="Account">
              <User className="w-4 h-4" />
            </Link>
          )}

          {headerSettings.showWishlist !== false && (
            <Link href="/account/wishlist" className="relative p-1.5 hover:text-black transition-colors" aria-label="Wishlist">
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-zinc-900 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Minimalist Cart */}
          {headerSettings.showCart !== false && (
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-300 hover:border-black text-xs font-semibold transition-all active:scale-95"
              aria-label="Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{itemCount}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-serif font-bold text-lg tracking-wider uppercase">{storeName}</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1 text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4 text-xs font-semibold tracking-wider uppercase">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-800 hover:text-black">
                  {t("home", storeLang)}
                </Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-800 hover:text-black">
                  {t("shop", storeLang)}
                </Link>
                {rootCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-zinc-600 hover:text-black"
                  >
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                ))}
                <Link href="/sale" onClick={() => setMobileMenuOpen(false)} className="block text-rose-600">
                  Sale
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-800 hover:text-black">
                  {t("contact", storeLang)}
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-400">
              <p>© {new Date().getFullYear()} {storeName}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
