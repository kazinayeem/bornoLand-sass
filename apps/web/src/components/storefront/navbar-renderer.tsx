"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  LogIn,
  Package,
  LogOut,
  Heart,
  Home,
  ChevronRight,
  MapPin,
  Bell,
  Settings,
  Shield,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { useStoreCategories } from "@/hooks/use-store-categories";
import { normalizeCategoryParentId } from "@/lib/storefront/global-navigation";
import { getCategoryEnglishName } from "@/lib/storefront/category-label";
import { SmartImage } from "@/components/ui/smart-image";
import { BuilderLink, BuilderIconButton } from "@/components/sections/builder-link";
import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { resolveStoreHref } from "@/lib/store-href";
import { CustomerNotificationBell } from "./customer-notification-bell";
import { useDevice } from "@/lib/device-context";
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";
import type { NavigationItemData } from "@/providers/tenant-provider";
import { resolveNavigationItemHref } from "@/lib/storefront/navigation-href";
import { resolveHeaderConfig } from "@/lib/storefront/header-config";
import { useStorefrontHeader } from "@/hooks/use-storefront-header";
import {
  useRegisterStorefrontHeaderOffset,
  useStorefrontHeaderSettings,
} from "@/components/storefront/storefront-header-offset";

export type NavbarRendererProps = {
  headerSettings?: Record<string, unknown>;
  sectionProps?: Record<string, string>;
  navLinksOverride?: Array<{ name: string; href: string }>;
};

/** Single source of truth for storefront + builder header rendering. */
export function NavbarRenderer({
  headerSettings: headerSettingsProp,
  sectionProps,
  navLinksOverride,
}: NavbarRendererProps = {}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const device = useDevice();
  const { store, theme, navigations } = useTenant();
  const { categories: storeCategories } = useStoreCategories();
  const { classes, primaryColor } = useStorefrontSurface();
  const { trackSearch } = useStorefrontTracking();
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
    const handleExpired = () => {
      // Backend rejected the customer session — mirror that in the navbar immediately.
      if (customer.isAuthenticated) dispatch(clearCustomer());
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    window.addEventListener("auth-change", handleExpired);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
      window.removeEventListener("auth-change", handleExpired);
    };
  }, [dispatch, customer.isAuthenticated]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const primaryNavigation = navigations.find((navigation) => navigation.key === "primary" && navigation.isActive);
  const mobileNavigation = navigations.find((navigation) => navigation.key === "mobile" && navigation.isActive) ?? primaryNavigation;
  const navigationLinks = (items?: NavigationItemData[]) =>
    (items ?? [])
      .filter((item) => item.isVisible !== false)
      .filter((item) => !(item.authRequired && !customer.isAuthenticated))
      .filter((item) => !(item.hideOnDesktop && device !== "mobile"))
      .filter((item) => !(item.hideOnMobile && device === "mobile"))
      .map((item) => ({
        name: item.title,
        href: resolveNavigationItemHref(item),
        openInNewTab: item.openInNewTab || item.target === "_blank",
        icon: Home,
        children: item.children ?? [],
      }));
  const navLinks = navLinksOverride
    ? navLinksOverride.map((l) => ({ ...l, icon: Home, children: [], openInNewTab: false }))
    : primaryNavigation?.items?.length
      ? navigationLinks(primaryNavigation.items)
      : storeCategories
          .filter((cat) => normalizeCategoryParentId(cat.parentId) === null)
          .slice(0, 6)
          .map((cat) => ({
            name: getCategoryEnglishName(cat),
            href: `/category/${cat.slug}`,
            icon: Home,
            children: [],
            openInNewTab: false,
          }));
  const mobileLinks = mobileNavigation?.items?.length
    ? navigationLinks(mobileNavigation.items)
    : navLinks;

  const p = sectionProps ?? {};
  const contextHeaderSettings = useStorefrontHeaderSettings();
  const mergedHeaderSettings = {
    ...contextHeaderSettings,
    ...(headerSettingsProp ?? {}),
  };

  const displayName = p.storeName || store.shortName || store.name;
  const showName = p.showName !== "false";
  const logoUrl = p.logoUrl || store.logoUrl || "";
  const brandColor = p.primaryColor || primaryColor;

  const hs = mergedHeaderSettings as Record<string, unknown>;
  const headerConfig = resolveHeaderConfig(hs, device, {
    sectionProps: p,
    navbarStyle: theme.navbarStyle,
  });
  const {
    navRef,
    navClassName,
    navStyle,
    contentOffset,
    needsContentOffset,
  } = useStorefrontHeader(headerConfig);
  const registerContentOffset = useRegisterStorefrontHeaderOffset();

  useEffect(() => {
    const height = contentOffset || 0;
    registerContentOffset(height, needsContentOffset ? height : 0);
  }, [registerContentOffset, needsContentOffset, contentOffset]);

  const navHeight = headerConfig.height;
  const navPadding = headerConfig.padding;
  const navContainerWidth = headerConfig.containerWidth;
  const menuGap = headerConfig.menuGap;
  const navFontSize = headerConfig.navFontSize;
  const iconSize = headerConfig.iconSize;
  const logoWidth = headerConfig.logoWidth;
  const logoHeight = headerConfig.logoHeight;
  const textColor = headerConfig.textColor || p.textColor || undefined;
  const hoverColor = headerConfig.hoverColor || p.hoverColor || undefined;
  const buttonRadius = headerConfig.buttonRadius;
  const showSearch = headerConfig.showSearch;
  const showWishlist = headerConfig.showWishlist;
  const showCart = headerConfig.showCart;
  const showProfile = headerConfig.showProfile;
  const iconTapSize = 44;

  const getStorefrontLink = (href: string) => resolveStoreHref(href, pathname);

  const isActiveHref = (href: string) => {
    const target = getStorefrontLink(href);
    if (!target || target === "#") return false;
    return pathname === target || (target !== "/" && pathname.startsWith(`${target}/`));
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.push(getStorefrontLink("/"));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      trackSearch(query);
      router.push(getStorefrontLink(`/search?q=${encodeURIComponent(query)}`));
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleNavClick = (href: string) => {
    if (!href || href === "#") return;
    setMobileOpen(false);
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
      window.location.href = href;
      return;
    }
    router.push(getStorefrontLink(href));
  };

  const iconBtn = cn("flex items-center justify-center", classes.iconBtn);

  return (
    <>
      <nav
        ref={navRef}
        className={navClassName}
        style={{ ...navStyle, fontFamily: p.font || font }}
      >
        <div
          className="mx-auto flex w-full items-center justify-between"
          style={{ height: `${navHeight}px`, padding: navPadding, maxWidth: navContainerWidth }}
        >
          <div className="flex items-center gap-8">
            <BuilderLink href="/" className="flex items-center" style={{ gap: headerConfig.logoTextGap }}>
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={displayName}
                  width={logoWidth}
                  height={logoHeight}
                  sizes={`${logoWidth}px`}
                  className="rounded-apple-sm"
                  style={{ width: logoWidth, height: logoHeight, objectFit: "contain" }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-apple-sm text-sm font-semibold text-apple-on-primary"
                  style={{ width: logoWidth, height: logoHeight, backgroundColor: brandColor }}
                >
                  {displayName[0]}
                </div>
              )}
              {showName ? (
                <span className="text-tagline font-semibold" style={{ color: textColor, fontSize: headerConfig.storeNameFontSize }}>
                  {displayName}
                </span>
              ) : null}
            </BuilderLink>
            <div className="hidden items-center md:flex" style={{ gap: `${menuGap}px` }}>
              {navLinks.map((link) => {
                const active = isActiveHref(link.href);
                return (
                <BuilderLink
                  key={link.name}
                  href={link.href}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noreferrer" : undefined}
                  className={cn(
                    "relative font-medium transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-current after:transition-all after:duration-200",
                    active ? "after:w-full opacity-100" : "after:w-0 opacity-80 hover:opacity-100",
                  )}
                  style={{ color: textColor || undefined, fontSize: `${navFontSize}px` }}
                  onMouseEnter={(event) => {
                    if (hoverColor) event.currentTarget.style.color = hoverColor;
                  }}
                  onMouseLeave={(event) => {
                    if (textColor) event.currentTarget.style.color = textColor;
                  }}
                >
                  {link.name}
                </BuilderLink>
              );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(iconBtn, "hidden sm:flex")}
                style={{ width: iconTapSize, height: iconTapSize, minWidth: 44, minHeight: 44 }}
              >
                <Search style={{ width: iconSize, height: iconSize }} />
              </button>
            )}
            {showWishlist && (
              <BuilderLink href="/account/wishlist" aria-label="Wishlist" className={cn(iconBtn, "hidden sm:flex")} style={{ width: iconTapSize, height: iconTapSize, minWidth: 44, minHeight: 44 }}>
                <Heart style={{ width: iconSize, height: iconSize }} />
              </BuilderLink>
            )}
            {showCart && (
              <button
                type="button"
                onClick={() => dispatch(openCart())}
                aria-label="View cart"
                className={cn(iconBtn, "relative")}
                style={{ width: iconTapSize, height: iconTapSize, minWidth: 44, minHeight: 44 }}
              >
                <ShoppingCart style={{ width: iconSize, height: iconSize }} />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-apple-on-primary"
                    style={{ backgroundColor: brandColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            )}
            {showProfile ? (
              customer.isAuthenticated ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <CustomerNotificationBell iconSize={iconSize} />
                  <DropdownMenu
                    placement="bottom-end"
                    minWidth={240}
                    trigger={
                      <button
                        type="button"
                        className={cn(
                          iconBtn,
                          "h-10 w-auto gap-2 rounded-full border border-apple-hairline bg-apple-canvas-parchment px-2.5",
                        )}
                        style={{ borderRadius: buttonRadius }}
                        aria-label="Open account menu"
                      >
                        <span className="flex items-center gap-2">
                          {customer.customer?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={customer.customer?.avatar ?? ""}
                              alt={customer.customer?.name ?? "Customer"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-semibold text-apple-on-primary"
                              style={{ backgroundColor: brandColor }}
                            >
                              {(customer.customer?.name ?? "")
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((p: string) => p[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                          <span className="hidden text-[16px] font-medium text-apple-ink-muted-80 md:inline">
                            {(customer.customer?.name ?? "").split(" ")[0]}
                          </span>
                        </span>
                      </button>
                    }
                    items={[
                      { label: "My Account", icon: User, onClick: () => handleNavClick("/account/profile") },
                      { label: "Orders", icon: Package, onClick: () => handleNavClick("/account/orders") },
                      { label: "Wishlist", icon: Heart, onClick: () => handleNavClick("/account/wishlist") },
                      { label: "Saved Addresses", icon: MapPin, onClick: () => handleNavClick("/account/addresses") },
                      { label: "Notifications", icon: Bell, onClick: () => handleNavClick("/account/notifications") },
                      { label: "Settings", icon: Settings, onClick: () => handleNavClick("/account/security") },
                      { divider: true },
                      { label: "Logout", icon: LogOut, onClick: () => handleLogout(), danger: true },
                    ]}
                  />
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <BuilderLink
                    href="/account/login"
                    className="btn-press inline-flex items-center gap-1.5 rounded-apple-sm bg-apple-ink px-[15px] py-2 text-[16px] font-medium text-apple-on-dark transition-opacity hover:opacity-90"
                    style={{ borderRadius: buttonRadius }}
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </BuilderLink>
                  <BuilderLink
                    href="/account/register"
                    className="btn-press inline-flex items-center gap-1.5 rounded-apple-sm border border-apple-hairline bg-apple-canvas px-[15px] py-2 text-[16px] font-medium text-apple-ink-muted-80 transition-opacity hover:bg-apple-canvas-parchment"
                    style={{ borderRadius: buttonRadius }}
                  >
                    <User className="h-4 w-4" /> Register
                  </BuilderLink>
                </div>
              )
            ) : null}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="store-mobile-menu"
              className={cn(iconBtn, "md:hidden")}
              style={{ width: iconTapSize, height: iconTapSize, minWidth: 44, minHeight: 44 }}
            >
              <Menu style={{ width: iconSize, height: iconSize }} />
            </button>
          </div>
        </div>
      </nav>
      {needsContentOffset ? <div aria-hidden className="w-full shrink-0" style={{ height: contentOffset }} /> : null}

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
                  {logoUrl ? (
                    <SmartImage
                      src={logoUrl}
                      alt={displayName}
                      width={32}
                      height={32}
                      sizes="32px"
                      className="rounded-apple-sm"
                      style={{ width: 32, height: 32, objectFit: "contain" }}
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-sm font-semibold text-apple-on-primary"
                      style={{ backgroundColor: brandColor }}
                    >
                      {displayName[0]}
                    </div>
                  )}
                  <span className="text-tagline text-apple-ink">{displayName}</span>
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
                  {mobileLinks.map((link, i) => (
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
                        onClick={() => handleNavClick("/account/profile")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <User className="h-4 w-4 text-apple-ink-muted-48" /> Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/addresses")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <MapPin className="h-4 w-4 text-apple-ink-muted-48" /> Saved Addresses
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/orders")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <Package className="h-4 w-4 text-apple-ink-muted-48" /> Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/wishlist")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <Heart className="h-4 w-4 text-apple-ink-muted-48" /> Wishlist
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/notifications")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <Bell className="h-4 w-4 text-apple-ink-muted-48" /> Notifications
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavClick("/account/security")}
                        className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-body text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                      >
                        <Shield className="h-4 w-4 text-apple-ink-muted-48" /> Security
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
