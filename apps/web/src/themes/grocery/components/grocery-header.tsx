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
  ShieldCheck,
  Clock,
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

export interface GroceryHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function GroceryHeader({ headerSettings = {} }: GroceryHeaderProps) {
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
  const announcementText =
    (headerSettings.announcementText as string) ||
    "🌿 ১০০% খাঁটি ও নির্ভেজাল পণ্যের বিশ্বস্ত প্রতিষ্ঠান | সারাদেশে ক্যাশ অন ডেলিভারি";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Grocery";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const storePhone = contact?.phone || store.phone || "09613-800800";
  const maxVisibleItems = Math.max(
    1,
    Number(headerSettings.maxVisibleNavigationItems ?? headerSettings.maxVisibleCategories) || 6,
  );
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header className="w-full max-w-full min-w-0 bg-white text-[var(--store-text,#1c2826)] border-b border-[var(--store-border,#ede7df)] shadow-xs select-none relative z-40 overflow-x-clip">
      {/* ── Top Announcement Bar ── */}
      {showAnnouncement && (
        <div className="bg-[var(--store-secondary,#055c3a)] text-white text-xs font-medium py-1.5 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-full p-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-[11px] shrink-0 text-emerald-100">
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <PhoneCall className="w-3 h-3 text-[var(--store-accent,#f97316)]" />
                <span>{t("hotline", storeLang)}: {storePhone}</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Clock className="w-3 h-3 text-[var(--store-accent,#f97316)]" />
                <span>{t("workingHours", storeLang)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Header Navbar (Constrained 72-90px desktop) ── */}
      <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-3 min-h-[72px] max-h-[90px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo & Brand (Constrained max-h 48px, max-w 180px) */}
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
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[var(--store-primary,#e05a00)] to-[var(--store-accent,#f97316)] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-orange-500/20">
                {storeName.charAt(0) || "B"}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-[var(--store-secondary,#055c3a)]">
                  {storeName}
                </span>
                <span className="text-[10px] font-semibold text-[var(--store-primary,#e05a00)] -mt-1 tracking-wider uppercase">
                  100% Pure & Organic
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Dynamic Global Search Bar */}
        {headerSettings.showSearch !== false && (
          <div className="flex-1 min-w-0 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search", storeLang)}
                className="w-full h-11 pl-4 pr-24 rounded-full border-2 border-[var(--store-secondary,#055c3a)]/20 bg-[#faf8f5] text-xs text-[var(--store-text,#1c2826)] placeholder:text-zinc-400 focus:outline-none focus:border-[var(--store-secondary,#055c3a)] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-5 rounded-full bg-[var(--store-secondary,#055c3a)] hover:bg-[var(--store-secondary,#04482d)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t("searchButton", storeLang)}</span>
              </button>
            </form>
          </div>
        )}

        {/* Right Utility Icons: Account, Wishlist, Cart */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {headerSettings.showProfile !== false && (
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 p-2 rounded-xl text-zinc-700 hover:text-[var(--store-secondary,#055c3a)] hover:bg-zinc-50 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-zinc-400">{t("account", storeLang)}</span>
                <span className="font-bold text-zinc-800 mt-0.5">{t("login", storeLang)}</span>
              </div>
            </Link>
          )}

          {headerSettings.showWishlist !== false && (
            <Link
              href="/account/wishlist"
              className="relative p-2 rounded-xl text-zinc-700 hover:text-[var(--store-secondary,#055c3a)] hover:bg-zinc-50 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--store-primary,#e05a00)] text-white text-[10px] font-bold flex items-center justify-center">
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
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--store-secondary,#055c3a)] hover:bg-[var(--store-secondary,#04482d)] text-white transition-all shadow-md active:scale-95"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[var(--store-primary,#e05a00)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-emerald-200">{t("myCart", storeLang)}</span>
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
            className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Shared global navigation ── */}
      <div className="hidden md:block bg-[#faf8f5] border-t border-[var(--store-border,#ede7df)]">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-0.5">
          <GlobalStoreNav
            maxVisibleItems={maxVisibleItems}
            showMoreMenu={showMoreMenu}
            enableCategoryHover={enableCategoryHover}
            showAllCategoriesButton
            showPrimaryLinks
            themeVariant="grocery"
            lang={storeLang}
            className="w-full min-w-0"
          />
        </div>
      </div>

      <GlobalMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} storeName={storeName}>
        <GlobalStoreNav
          layout="mobile"
          maxVisibleItems={maxVisibleItems}
          showMoreMenu={showMoreMenu}
          themeVariant="grocery"
          lang={storeLang}
          onItemClick={() => setMobileMenuOpen(false)}
        />
        <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 mt-4">
          <p className="font-semibold text-zinc-800">{t("hotline", storeLang)}:</p>
          <p className="text-[var(--store-primary,#e05a00)] font-bold text-sm mt-0.5">{storePhone}</p>
        </div>
      </GlobalMobileDrawer>
    </header>
  );
}
