"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn, Package, LogOut, Heart, Home, Grid3X3, Info, Mail, ChevronRight } from "lucide-react";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "./store-link";
import type { StorefrontSectionLike } from "./storefront-types";

const CartDrawer = dynamic(
  () => import("./cart-drawer").then((module) => module.CartDrawer),
  { loading: () => null }
);

type StoreNavbarProps = {
  headerSections?: StorefrontSectionLike[];
  headerSettings?: Record<string, unknown>;
  navLinksOverride?: Array<{ name: string; href: string }>;
};

export function StoreNavbar({ headerSections: _headerSections, headerSettings: _headerSettings, navLinksOverride }: StoreNavbarProps = {}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const { store, theme } = useTenant();
  const itemCount = useSelector((state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const customer = useSelector((state: RootState) => state.customer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { primaryColor, font, navbarStyle } = theme;

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("customer_token");
      if (!token && customer.isAuthenticated) dispatch(clearCustomer());
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, [dispatch, customer.isAuthenticated]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const defaultNavLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Grid3X3 },
    { name: "Categories", href: "/categories", icon: Grid3X3 },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];
  const navLinks = navLinksOverride
    ? navLinksOverride.map((l) => ({ ...l, icon: Home }))
    : defaultNavLinks;

  const hs = _headerSettings as any;
  const sticky = hs?.sticky ?? (navbarStyle === "fixed" || navbarStyle === "sticky");
  const transparent = hs?.transparent ?? false;
  const navHeight = hs?.height ?? "64";
  const navBg = hs?.background ?? "";
  const navPadding = hs?.padding ?? "";
  const showSearch = hs?.showSearch !== false;
  const showWishlist = hs?.showWishlist !== false;
  const showCart = hs?.showCart !== false;
  const showProfile = hs?.showProfile !== false;

  const stickyClass = sticky ? "fixed" : "static";

  const getStorefrontLink = (href: string) => {
    if (href.startsWith("/") && !href.startsWith("//")) {
      if (pathname.startsWith("/store/")) {
        const parts = pathname.split("/");
        const storeSlug = parts[2];
        const prefix = `/store/${storeSlug}`;
        if (!href.startsWith(prefix)) {
          return href === "/" ? prefix : `${prefix}${href}`;
        }
      }
    }
    return href;
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.push(getStorefrontLink("/"));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(getStorefrontLink(`/shop?search=${encodeURIComponent(searchQuery.trim())}`));
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    router.push(getStorefrontLink(href));
  };

  const initials = customer.customer?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <nav className={`${stickyClass} top-0 z-40 w-full transition-all`}
        style={{
          fontFamily: font,
          borderBottom: transparent ? "none" : "1px solid #e4e4e7",
          backgroundColor: navBg || (transparent ? "transparent" : "rgba(255,255,255,0.8)"),
          backdropFilter: transparent ? "none" : "blur(12px)",
        }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          style={{ height: `${navHeight}px`, padding: navPadding }}>
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {store.logoUrl ? (
                <SmartImage
                  src={store.logoUrl}
                  alt={store.name}
                  width={32}
                  height={32}
                  sizes="32px"
                  className="rounded-lg"
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  {store.name[0]}
                </div>
              )}
              <span className="text-lg font-bold text-apple-ink">{store.name}</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}
                  className="text-sm font-medium text-apple-ink-muted-48 transition-colors hover:text-apple-ink">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSearch && (
              <button onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="hidden rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 sm:block">
                <Search className="h-5 w-5" />
              </button>
            )}
            {showWishlist && (
              <Link href="/account" aria-label="Wishlist"
                className="hidden rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 sm:block">
                <Heart className="h-5 w-5" />
              </Link>
            )}
            {showCart && (
              <button onClick={() => dispatch(openCart())}
                aria-label="View cart"
                className="relative rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}
            {showProfile && customer.isAuthenticated ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Link href="/orders"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <button onClick={handleLogout}
                  aria-label="Sign out"
                  className="rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-red-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : showProfile ? (
              <Link href="/account/login"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment sm:flex">
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            ) : null}
            <button onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="store-mobile-menu"
              className="rounded-lg p-2 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-apple-ink-muted-48" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-sm text-apple-ink outline-none placeholder:text-apple-ink-muted-48"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="flex h-7 items-center rounded-md border border-zinc-200 bg-apple-canvas-parchment px-2 text-[10px] font-medium text-apple-ink-muted-48 hover:text-apple-ink-muted-80">
                  ESC
                </button>
              </form>
              <div className="p-4">
                <p className="text-xs text-apple-ink-muted-48">Search across all products in this store</p>
                {searchQuery && (
                  <button type="submit" onClick={handleSearch}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                    Search for &ldquo;{searchQuery}&rdquo; <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div id="store-mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: primaryColor }}>
                    {store.name[0]}
                  </div>
                  <span className="text-lg font-bold text-apple-ink">{store.name}</span>
                </div>
                <button onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
                <div className="p-4 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Navigation</p>
                  {navLinks.map((link, i) => (
                    <motion.button key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNavClick(link.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                      <link.icon className="h-4 w-4 text-apple-ink-muted-48" />
                      {link.name}
                    </motion.button>
                  ))}
                </div>

                <div className="border-t border-zinc-100 p-4 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Account</p>
                  {customer.isAuthenticated ? (
                    <>
                      <button onClick={() => handleNavClick("/account")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                        <User className="h-4 w-4 text-apple-ink-muted-48" /> My Account
                      </button>
                      <button onClick={() => handleNavClick("/orders")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                        <Package className="h-4 w-4 text-apple-ink-muted-48" /> Orders
                      </button>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleNavClick("/account/login")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                        <LogIn className="h-4 w-4 text-apple-ink-muted-48" /> Sign In
                      </button>
                      <button onClick={() => handleNavClick("/account/register")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                        <User className="h-4 w-4 text-apple-ink-muted-48" /> Register
                      </button>
                    </>
                  )}
                  <button onClick={() => handleNavClick("/account")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                    <Heart className="h-4 w-4 text-apple-ink-muted-48" /> Wishlist
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer primaryColor={primaryColor} />
    </>
  );
}
