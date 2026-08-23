"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { useIsBuilder } from "@/lib/device-context";
import { HEADER_TEMPLATE_UI_LANG, t } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/format-currency";
import { resolveHeaderLogoUrl } from "@/lib/storefront/global-navigation";

export type HeaderTemplateState = ReturnType<typeof useHeaderTemplateState>;

export function useHeaderTemplateState(headerSettings: Record<string, unknown>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isBuilder = useIsBuilder();
  const { store, settings, contact } = useTenant();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const storeLang = HEADER_TEMPLATE_UI_LANG;
  const storeName = store.name?.trim() || "Store";
  const storeTagline = store.tagline?.trim() || "";
  const logoUrl = resolveHeaderLogoUrl(headerSettings, store);
  const storePhone = (contact?.phone || store.phone || "").trim();

  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const announcementText = String(headerSettings.announcementText ?? "").trim();
  const showSearch = headerSettings.showSearch !== false;
  const showWishlist = headerSettings.showWishlist !== false;
  const showCart = headerSettings.showCart !== false;
  const showProfile = headerSettings.showProfile !== false;

  const maxVisibleItems = Math.max(
    1,
    Number(headerSettings.maxVisibleNavigationItems ?? headerSettings.maxVisibleCategories) || 6,
  );
  const showMoreMenu = headerSettings.showMoreMenu !== false;
  const enableCategoryHover = headerSettings.enableCategoryHover !== false;
  const showAllCategoriesButton = headerSettings.showAllCategoriesButton === true;

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim() || isBuilder) return;
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    },
    [isBuilder, router, searchQuery],
  );

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const openCartDrawer = useCallback(() => dispatch(openCart()), [dispatch]);

  const navProps = useMemo(
    () => ({
      maxVisibleItems,
      showMoreMenu,
      enableCategoryHover,
      showAllCategoriesButton,
      lang: storeLang,
    }),
    [maxVisibleItems, showMoreMenu, enableCategoryHover, showAllCategoriesButton, storeLang],
  );

  return {
    isBuilder,
    storeLang,
    storeName,
    storeTagline,
    logoUrl,
    storePhone,
    settings,
    showAnnouncement: showAnnouncement && Boolean(announcementText),
    announcementText,
    showSearch,
    showWishlist,
    showCart,
    showProfile,
    itemCount,
    cartTotal,
    wishlistCount,
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchInputRef,
    handleSearchSubmit,
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
    openCartDrawer,
    navProps,
    t,
    formatCurrency,
  };
}
