"use client";

import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { GlobalStoreNav, GlobalMobileDrawer } from "@/components/storefront/header/global-store-nav";
import { t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export interface MinimalFashionHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function MinimalFashionHeader({ headerSettings = {} }: MinimalFashionHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isBuilder = useIsBuilder();
  const { store, settings } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const storeName = store.name || "BornoLand Studio";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";
  const isTransparent = headerSettings.transparent === true || headerSettings.transparent === "true";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const maxVisibleItems = Math.max(1, Number(headerSettings.maxVisibleNavigationItems ?? headerSettings.maxVisibleCategories) || 6);
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header
      className={cn(
        "w-full max-w-full min-w-0 transition-all select-none border-b overflow-x-clip",
        isTransparent
          ? "bg-white/80 backdrop-blur-md border-zinc-200/50 text-zinc-900"
          : "bg-white border-zinc-100 text-zinc-900 shadow-xs"
      )}
    >
      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 min-h-[76px] flex items-center justify-between gap-6">
        {/* Shared global navigation */}
        <div className="hidden lg:flex items-center min-w-0 flex-1 overflow-visible">
          <GlobalStoreNav
            maxVisibleItems={maxVisibleItems}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            showAllCategoriesButton={false}
            showPrimaryLinks
            themeVariant="fashion"
            lang={storeLang}
            className="w-full min-w-0 text-[13px] tracking-wider uppercase font-medium"
          />
        </div>

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

      <GlobalMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} storeName={storeName}>
        <GlobalStoreNav
          layout="mobile"
          maxVisibleItems={maxVisibleItems}
          showMoreMenu={showMoreMenu}
          themeVariant="fashion"
          lang={storeLang}
          onItemClick={() => setMobileMenuOpen(false)}
        />
      </GlobalMobileDrawer>
    </header>
  );
}
