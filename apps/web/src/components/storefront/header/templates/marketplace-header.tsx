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
  Zap,
  TrendingUp,
  Tag,
  Package,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { StorefrontMegaMenu } from "@/components/storefront/navigation/storefront-mega-menu";
import { DynamicCategoryNav } from "@/components/storefront/header/dynamic-category-nav";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { Category } from "@/redux/api/category-api";

export interface MarketplaceHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function MarketplaceHeader({ headerSettings = {} }: MarketplaceHeaderProps) {
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
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const storeLang: StoreLanguage = (store?.defaultLanguage as StoreLanguage) || "bn";
  const announcementText =
    (headerSettings.announcementText as string) ||
    "🛒 Mega Marketplace Deals | Flash Sale Active: Save Up to 60% with Fast Home Delivery!";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Marketplace";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const rootCategories = (categories as Category[]).filter((c) => !c.parentId);
  const subcategoriesByParent = (categories as Category[]).reduce<Record<string, Category[]>>((acc, cat) => {
    if (cat.parentId) {
      const pId = String(cat.parentId);
      if (!acc[pId]) acc[pId] = [];
      acc[pId].push(cat);
    }
    return acc;
  }, {});

  const currentMegaCat = rootCategories.find((c) => c._id === selectedCatId) || rootCategories[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const maxVisibleCategories = Math.max(1, Number(headerSettings.maxVisibleCategories) || 6);
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;

  return (
    <header className="w-full max-w-full min-w-0 bg-white text-zinc-900 border-b border-zinc-200 shadow-sm select-none relative z-40 overflow-x-clip">
      {/* ── Top Announcement Banner ── */}
      {showAnnouncement && (
        <div className="bg-[#f85606] text-white text-[11px] font-semibold py-1.5 px-4">
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

      {/* ── Second Navigation Row — maxVisibleCategories + More ── */}
      <div className="hidden md:block bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 flex items-center gap-3 min-w-0">
          <div
            className="relative shrink-0"
            onMouseLeave={() => setAllCategoriesOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setAllCategoriesOpen(!allCategoriesOpen);
                if (!selectedCatId && rootCategories[0]) setSelectedCatId(rootCategories[0]._id);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f85606] text-white font-bold text-xs rounded-t-md hover:bg-[#e04800] transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", allCategoriesOpen && "rotate-180")} />
            </button>

            {allCategoriesOpen && currentMegaCat && (
              <StorefrontMegaMenu
                category={currentMegaCat}
                subcategories={subcategoriesByParent[currentMegaCat._id] || []}
                brands={brands}
                lang={storeLang}
                themeVariant="default"
                onItemClick={() => setAllCategoriesOpen(false)}
              />
            )}
          </div>

          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <Link
              href="/shop"
              className={cn(
                "shrink-0 py-2.5 text-xs font-semibold text-zinc-700 hover:text-[#f85606] transition-colors",
                pathname === "/shop" && "text-[#f85606]",
              )}
            >
              {t("shop", storeLang)}
            </Link>

            <DynamicCategoryNav
              categories={categories as any}
              maxVisibleCategories={maxVisibleCategories}
              showMoreMenu={showMoreMenu}
              enableCategoryHover={enableCategoryHover}
              themeVariant="marketplace"
              lang={storeLang}
              className="flex-1 min-w-0"
            />

            <Link
              href="/offers"
              className="shrink-0 flex items-center gap-1 py-2.5 text-xs font-semibold text-[#f85606] hover:text-[#e04800] transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Flash Sale</span>
            </Link>
          </div>

          <Link
            href="/track-order"
            className="shrink-0 text-xs font-semibold text-zinc-600 hover:text-[#f85606] transition-colors"
          >
            Track Order
          </Link>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-extrabold text-base text-[#f85606]">{storeName}</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Accordion Categories */}
              <div className="py-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                  All Categories
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
                          className="font-semibold text-xs text-zinc-800 hover:text-[#f85606] flex-1 truncate"
                        >
                          {getLocalizedName(cat, storeLang)}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMobileExpandedCatId(isExpanded ? null : cat._id)}
                            className="p-1 rounded-md text-zinc-400"
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
                              className="flex items-center justify-between py-1 px-2 text-xs text-zinc-600 hover:text-[#f85606]"
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
              <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-semibold text-zinc-800">
                Help & Customer Support
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
