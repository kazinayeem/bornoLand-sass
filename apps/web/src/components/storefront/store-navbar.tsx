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
import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";
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
  const { classes, primaryColor } = useStorefrontSurface();
  const itemCount = useSelector((state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const customer = useSelector((state: RootState) => state.customer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { font, navbarStyle } = theme;

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

  const hs = _headerSettings as Record<string, unknown> | undefined;
  const sticky = (hs?.sticky as boolean | undefined) ?? (navbarStyle === "fixed" || navbarStyle === "sticky");
  const transparent = (hs?.transparent as boolean | undefined) ?? false;
  const navHeight = (hs?.height as string | undefined) ?? "52";
  const navBg = (hs?.background as string | undefined) ?? "";
  const navPadding = (hs?.padding as string | undefined) ?? "";
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

  const iconBtn = cn("flex h-11 w-11 items-center justify-center", classes.iconBtn);

  return (
    <>
      <nav
        className={cn(
          stickyClass,
          "top-0 z-40 w-full transition-all",
          !transparent && !navBg && "frosted-bar border-b",
          classes.divider
        )}
        style={{
          fontFamily: font,
          backgroundColor: navBg || (transparent ? "transparent" : undefined),
          backdropFilter: transparent ? "none" : undefined,
        }}
      >
        <div
          className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8"
          style={{ height: `${navHeight}px`, padding: navPadding }}
        >
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {store.logoUrl ? (
                <SmartImage
                  src={store.logoUrl}
                  alt={store.name}
                  width={32}
                  height={32}
                  sizes="32px"
                  className="rounded-apple-sm"
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-sm font-semibold text-apple-on-primary"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name[0]}
                </div>
              )}
              <span className="text-tagline text-apple-ink">{store.name}</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-nav-link text-apple-ink-muted-48 transition-colors hover:text-apple-ink"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(iconBtn, "hidden sm:flex")}
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            {showWishlist && (
              <Link href="/account" aria-label="Wishlist" className={cn(iconBtn, "hidden sm:flex")}>
                <Heart className="h-5 w-5" />
              </Link>
            )}
            {showCart && (
              <button
                type="button"
                onClick={() => dispatch(openCart())}
                aria-label="View cart"
                className={cn(iconBtn, "relative")}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-apple-on-primary"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            )}
            {showProfile && customer.isAuthenticated ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 rounded-apple-sm px-3 py-2 text-caption text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className={iconBtn}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : showProfile ? (
              <Link
                href="/account/login"
                className="btn-press hidden items-center gap-1.5 rounded-apple-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark transition-opacity hover:opacity-90 sm:flex"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="store-mobile-menu"
              className={cn(iconBtn, "md:hidden")}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-apple-surface-black/60 px-4 pt-24 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl overflow-hidden rounded-apple-lg border border-apple-hairline bg-apple-canvas"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className={cn("flex items-center gap-3 border-b px-4 py-3", classes.divider)}>
                <Search className="h-5 w-5 shrink-0 text-apple-ink-muted-48" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-body text-apple-ink outline-none placeholder:text-apple-ink-muted-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-apple-sm border border-apple-hairline bg-apple-canvas-parchment px-2 py-1 text-fine-print text-apple-ink-muted-48"
                >
                  ESC
                </button>
              </form>
              <div className="p-4">
                <p className="text-caption text-apple-ink-muted-48">Search across all products in this store</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="mt-3 inline-flex items-center gap-1.5 text-body text-apple-primary"
                  >
                    Search for &ldquo;{searchQuery}&rdquo; <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="store-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-apple-surface-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm border-l border-apple-hairline bg-apple-canvas"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn("flex items-center justify-between border-b px-5 py-4", classes.divider)}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-sm font-semibold text-apple-on-primary"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {store.name[0]}
                  </div>
                  <span className="text-tagline text-apple-ink">{store.name}</span>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className={iconBtn}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex h-[calc(100%-4rem)] flex-col overflow-y-auto">
                <div className="space-y-1 p-4">
                  <p className="px-3 pb-2 text-fine-print font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                    Navigation
                  </p>
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.name}
                      type="button"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNavClick(link.href)}
                      className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                    >
                      <link.icon className="h-4 w-4 text-apple-ink-muted-48" />
                      {link.name}
                    </motion.button>
                  ))}
                </div>

                <div className={cn("space-y-1 border-t p-4", classes.divider)}>
                  <p className="px-3 pb-2 text-fine-print font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                    Account
                  </p>
                  {customer.isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <User className="h-4 w-4 text-apple-ink-muted-48" /> My Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/orders")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <Package className="h-4 w-4 text-apple-ink-muted-48" /> Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/login")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <LogIn className="h-4 w-4 text-apple-ink-muted-48" /> Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/register")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <User className="h-4 w-4 text-apple-ink-muted-48" /> Register
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleNavClick("/account")}
                    className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                  >
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
