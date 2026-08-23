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
  Zap,
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

export interface MarketplaceHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function MarketplaceHeader({ headerSettings = {} }: MarketplaceHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isBuilder = useIsBuilder();
  const { store, settings } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const announcementText =
    (headerSettings.announcementText as string) ||
    "🛒 Mega Marketplace Deals | Flash Sale Active: Save Up to 60% with Fast Home Delivery!";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Marketplace";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const maxVisibleItems = Math.max(
    1,
    Number(headerSettings.maxVisibleNavigationItems ?? headerSettings.maxVisibleCategories) || 6,
  );
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header className="w-full max-w-full min-w-0 bg-white text-zinc-900 border-b border-zinc-200 shadow-sm select-none relative z-40 overflow-x-clip">
      {/* ── Top Announcement Banner ── */}
      {showAnnouncement && (
        <div className="bg-[var(--store-primary,#f85606)] text-white text-[11px] font-semibold py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[10px] text-orange-100">
              <Link href="/help" className="hover:underline">Help & Customer Care</Link>
              <span>•</span>
              <Link href="/orders" className="hover:underline">Track My Order</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Marketplace Header (Logo, Large Search, Account, Cart) ── */}
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
              <div className="h-10 w-10 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20">
                {storeName.charAt(0) || "M"}
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#f85606]">
                  {storeName}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest -mt-1">
                  Online Marketplace
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Large Marketplace Search Bar */}
        {headerSettings.showSearch !== false && (
          <div className="flex-1 min-w-0 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-0">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Marketplace for products, brands and categories..."
                className="w-full h-11 pl-4 pr-28 rounded-lg border-2 border-[#f85606] bg-zinc-50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-6 rounded-md bg-[#f85606] hover:bg-[#e04800] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Utilities */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {headerSettings.showProfile !== false && (
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 p-2 rounded-lg text-zinc-700 hover:text-[#f85606] transition-colors"
            >
              <User className="w-5 h-5 text-zinc-600" />
              <div className="hidden lg:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-zinc-400">{t("account", storeLang)}</span>
                <span className="font-bold text-zinc-800 mt-0.5">{t("login", storeLang)}</span>
              </div>
            </Link>
          )}

          {headerSettings.showWishlist !== false && (
            <Link
              href="/account/wishlist"
              className="relative p-2 rounded-lg text-zinc-700 hover:text-[#f85606] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#f85606] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Button */}
          {headerSettings.showCart !== false && (
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#f85606] hover:bg-[#e04800] text-white transition-all shadow-md active:scale-95"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-white text-[#f85606] text-[10px] font-black flex items-center justify-center border-2 border-[#f85606]">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-white/80">{t("myCart", storeLang)}</span>
                <span className="font-bold text-white mt-0.5">
                  {formatCurrency(cartTotal, settings)}
                </span>
              </div>
            </button>
          )}

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Shared global navigation (same data as every template) ── */}
      <div className="hidden md:block bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-0.5">
          <GlobalStoreNav
            maxVisibleItems={maxVisibleItems}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            showAllCategoriesButton
            showPrimaryLinks
            themeVariant="marketplace"
            lang={storeLang}
            className="w-full min-w-0"
            allCategoriesButtonClassName="rounded-t-md font-bold"
          />
        </div>
      </div>

      <GlobalMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} storeName={storeName}>
        <GlobalStoreNav
          layout="mobile"
          maxVisibleItems={maxVisibleItems}
          showMoreMenu={showMoreMenu}
          themeVariant="marketplace"
          lang={storeLang}
          onItemClick={() => setMobileMenuOpen(false)}
        />
      </GlobalMobileDrawer>
    </header>
  );
}
