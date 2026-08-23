"use client";

import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import {
  GlobalMobileDrawer,
  GlobalStoreNav,
  type GlobalStoreNavVariant,
} from "@/components/storefront/header/global-store-nav";
import { cn } from "@/lib/utils";
import type { HeaderTemplateState } from "./use-header-template-state";

export function HeaderShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 overflow-x-clip select-none border-b",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeaderContainer({
  children,
  className,
  tight,
}: {
  children: React.ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8",
        tight ? "min-h-[64px] py-2" : "min-h-[72px] py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeaderAnnouncement({
  state,
  className,
  children,
}: {
  state: HeaderTemplateState;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!state.showAnnouncement) return null;
  return (
    <div className={cn("px-4 py-1.5 text-xs font-medium", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <span className="truncate">{state.announcementText}</span>
        {children}
      </div>
    </div>
  );
}

export function HeaderLogo({
  state,
  className,
  centered,
}: {
  state: HeaderTemplateState;
  className?: string;
  centered?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex shrink-0 items-center",
        centered && "justify-center",
        className,
      )}
    >
      {state.logoUrl ? (
        <div className="relative flex max-h-[48px] max-w-[180px] items-center">
          <SmartImage
            src={state.logoUrl}
            alt={state.storeName}
            width={180}
            height={48}
            className="max-h-[48px] max-w-[180px] h-auto w-auto object-contain"
          />
        </div>
      ) : (
        <span className="text-lg font-bold tracking-tight text-inherit sm:text-xl">
          {state.storeName}
        </span>
      )}
    </Link>
  );
}

export function HeaderSearch({
  state,
  variant = "inline",
  className,
}: {
  state: HeaderTemplateState;
  variant?: "inline" | "compact" | "large";
  className?: string;
}) {
  if (!state.showSearch) return null;

  if (variant === "compact") {
    if (state.searchOpen) {
      return (
        <form
          onSubmit={state.handleSearchSubmit}
          className={cn("relative flex min-w-0 flex-1 items-center", className)}
        >
          <input
            ref={state.searchInputRef}
            type="search"
            autoFocus
            value={state.searchQuery}
            onChange={(e) => state.setSearchQuery(e.target.value)}
            placeholder={state.t("search", state.storeLang)}
            className="h-9 w-full min-w-0 rounded-full border border-zinc-300 bg-zinc-50 pl-3 pr-8 text-xs focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => state.setSearchOpen(false)}
            className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-700"
            aria-label="Close search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      );
    }
    return (
      <button
        type="button"
        onClick={() => state.setSearchOpen(true)}
        className={cn("shrink-0 p-1.5 transition-colors hover:opacity-80", className)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form
      onSubmit={state.handleSearchSubmit}
      className={cn(
        "relative flex min-w-0 flex-1 items-center",
        variant === "large" ? "max-w-2xl" : "max-w-md",
        className,
      )}
    >
      <input
        ref={state.searchInputRef}
        type="search"
        value={state.searchQuery}
        onChange={(e) => state.setSearchQuery(e.target.value)}
        placeholder={state.t("search", state.storeLang)}
        className={cn(
          "h-10 w-full min-w-0 rounded-full border bg-zinc-50 pl-4 pr-12 text-xs focus:bg-white focus:outline-none",
          variant === "large" ? "border-zinc-300" : "border-zinc-200",
        )}
      />
      <button
        type="submit"
        className="absolute right-1 top-1 bottom-1 flex items-center gap-1 rounded-full bg-zinc-900 px-3 text-[11px] font-semibold text-white"
        aria-label="Search"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{state.t("searchButton", state.storeLang)}</span>
      </button>
    </form>
  );
}

export function HeaderActions({
  state,
  className,
  compact,
}: {
  state: HeaderTemplateState;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2 sm:gap-3", className)}>
      {state.showProfile && (
        <Link
          href="/account"
          className="hidden p-1.5 transition-colors hover:opacity-80 sm:block"
          aria-label="Account"
        >
          <User className="h-4 w-4" />
        </Link>
      )}
      {state.showWishlist && (
        <Link
          href="/account/wishlist"
          className="relative p-1.5 transition-colors hover:opacity-80"
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
          {state.wishlistCount > 0 && (
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">
              {state.wishlistCount}
            </span>
          )}
        </Link>
      )}
      {state.showCart && (
        <button
          type="button"
          onClick={state.openCartDrawer}
          className={cn(
            "flex items-center gap-1.5 rounded-full font-semibold transition-all active:scale-95",
            compact
              ? "border border-zinc-300 px-2.5 py-1.5 text-xs"
              : "bg-zinc-900 px-3 py-2 text-xs text-white",
          )}
          aria-label="Cart"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{state.itemCount}</span>
        </button>
      )}
    </div>
  );
}

export function HeaderMobileToggle({
  state,
  className,
}: {
  state: HeaderTemplateState;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={state.toggleMobileMenu}
      className={cn("shrink-0 p-1.5 lg:hidden", className)}
      aria-label="Toggle menu"
    >
      {state.mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

export function HeaderCategoryRow({
  state,
  themeVariant,
  className,
  rowClassName,
  showPrimaryLinks = true,
  showAllCategoriesButton,
}: {
  state: HeaderTemplateState;
  themeVariant: GlobalStoreNavVariant;
  className?: string;
  rowClassName?: string;
  showPrimaryLinks?: boolean;
  showAllCategoriesButton?: boolean;
}) {
  return (
    <div className={cn("hidden border-t md:block", rowClassName)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
        <GlobalStoreNav
          {...state.navProps}
          showAllCategoriesButton={showAllCategoriesButton ?? state.navProps.showAllCategoriesButton}
          showPrimaryLinks={showPrimaryLinks}
          themeVariant={themeVariant}
          className="w-full min-w-0 py-0.5"
        />
      </div>
    </div>
  );
}

export function HeaderMobileNav({
  state,
  themeVariant,
  footer,
}: {
  state: HeaderTemplateState;
  themeVariant: GlobalStoreNavVariant;
  footer?: React.ReactNode;
}) {
  return (
    <GlobalMobileDrawer
      open={state.mobileMenuOpen}
      onClose={state.closeMobileMenu}
      storeName={state.storeName}
    >
      <GlobalStoreNav
        layout="mobile"
        {...state.navProps}
        themeVariant={themeVariant}
        onItemClick={state.closeMobileMenu}
      />
      {footer}
    </GlobalMobileDrawer>
  );
}
