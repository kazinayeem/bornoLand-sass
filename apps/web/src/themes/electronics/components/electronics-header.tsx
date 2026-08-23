"use client";

import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
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

export interface ElectronicsHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ElectronicsHeader({ headerSettings = {} }: ElectronicsHeaderProps) {
  const dispatch = useDispatch();
  const pathname = usePathname() || "";
  const isBuilder = useIsBuilder();
  const { store, categories = [], brands = [], settings, contact } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "en";
  const announcementText =
    (headerSettings.announcementText as string) ||
    "⚡ Mega Tech Deals: Up to ৳15,000 Cashback on Selected Gaming Laptops & GPUs | All BD Express Delivery";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Tech";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const maxVisibleItems = Number(headerSettings.maxVisibleNavigationItems || headerSettings.maxVisibleItems || 6);
  const showMoreMenu = headerSettings.showMore !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    const q = searchQuery.trim();
    window.location.href = `/shop?q=${encodeURIComponent(q)}`;
  };

  const storePhone = contact?.phone || store.phone || "16789";

  return (
    <header className="w-full bg-[#081621] text-white border-b border-[#172b3c] shadow-md select-none sticky top-0 z-40">
      {/* ── Top Announcement Strip ── */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-[#e2136e] to-[#ef4444] text-white text-[11px] font-semibold py-1.5 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 shrink-0 fill-current animate-pulse" />
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 shrink-0 text-white/90 text-[10px]">
              <span>Official Warranty Guaranteed</span>
              <span>•</span>
              <span>0% EMI Available</span>
              <span>•</span>
              <span>Helpline: {storePhone}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Header Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 min-h-[72px] max-h-[90px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
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
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#0071dc] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
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
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
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

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => dispatch(openCart())}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0071dc] hover:bg-[#005bb5] text-white transition-all shadow-md active:scale-95"
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

      {/* ── Shared global navigation ── */}
      <div className="hidden md:block bg-[#050e15] border-t border-[#172b3c]">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-0.5">
          <GlobalStoreNav
            maxVisibleItems={maxVisibleItems}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            showAllCategoriesButton={false}
            showPrimaryLinks
            themeVariant="electronics"
            lang={storeLang}
            className="w-full min-w-0 py-1"
            itemClassName="px-3 py-2 rounded-lg"
          />
        </div>
      </div>

      <GlobalMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} storeName={storeName} dark>
        <GlobalStoreNav
          layout="mobile"
          maxVisibleItems={maxVisibleItems}
          showMoreMenu={showMoreMenu}
          themeVariant="electronics"
          lang={storeLang}
          onItemClick={() => setMobileMenuOpen(false)}
        />
        <div className="pt-4 border-t border-[#172b3c] text-xs text-zinc-400 mt-4">
          <p className="font-semibold text-white">Helpline / Support:</p>
          <p className="text-[#0071dc] font-bold text-sm mt-0.5">{storePhone}</p>
        </div>
      </GlobalMobileDrawer>
    </header>
  );
}
