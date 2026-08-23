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
  PhoneCall,
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

export interface ModernGeneralHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ModernGeneralHeader({ headerSettings = {} }: ModernGeneralHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isBuilder = useIsBuilder();
  const { store, settings, contact } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const storeName = store.name || "BornoLand Store";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";
  const storePhone = contact?.phone || store.phone || "09613-800800";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const maxVisibleItems = Math.max(1, Number(headerSettings.maxVisibleNavigationItems ?? headerSettings.maxVisibleCategories) || 6);
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header className="w-full max-w-full min-w-0 bg-white text-zinc-900 border-b border-zinc-200 shadow-xs select-none relative z-40 overflow-x-clip">
      {/* ── Top Main Navbar Row ── */}
      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-3 min-h-[72px] max-h-[90px] flex items-center justify-between gap-4 md:gap-8">
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
          <div className="flex-1 min-w-0 max-w-xl hidden md:block">
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

      {/* ── Shared global navigation ── */}
      <div className="hidden md:block bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-0.5">
          <GlobalStoreNav
            maxVisibleItems={maxVisibleItems}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            showAllCategoriesButton
            showPrimaryLinks
            themeVariant="default"
            lang={storeLang}
            className="w-full min-w-0"
            allCategoriesButtonClassName="bg-zinc-900 hover:bg-black"
          />
        </div>
      </div>

      <GlobalMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} storeName={storeName}>
        <GlobalStoreNav
          layout="mobile"
          maxVisibleItems={maxVisibleItems}
          showMoreMenu={showMoreMenu}
          themeVariant="default"
          lang={storeLang}
          onItemClick={() => setMobileMenuOpen(false)}
        />
        <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 mt-4">
          <p className="font-semibold text-zinc-800">{t("hotline", storeLang)}: {storePhone}</p>
        </div>
      </GlobalMobileDrawer>
    </header>
  );
}
