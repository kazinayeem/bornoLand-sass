"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderLink, BuilderIconButton } from "./builder-link";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";

export function HeaderBar({ section }: { section: SectionData }) {
  const p = section.props;
  const logoUrl = p.logoUrl || "";
  const storeName = p.storeName || "Store";
  const showName = p.showName !== "false";
  const showSearch = p.showSearch !== "false";
  const showWishlist = p.showWishlist !== "false";
  const showCart = p.showCart !== "false";
  const showAccount = p.showAccount !== "false";
  const headerBg = p.headerBg || "#ffffff";
  const sticky = p.sticky === "true";
  const iconColor = p.iconColor || "#71717a";

  const navLinks = [
    { text: p.link1Text || "Home", url: p.link1Url || "/" },
    { text: p.link2Text || "Shop", url: p.link2Url || "/shop" },
    { text: p.link3Text || "About", url: p.link3Url || "/about" },
    { text: p.link4Text || "Contact", url: p.link4Url || "/contact" },
  ].filter((l) => l.text);

  return (
    <SectionWrapper section={section} className="w-full">
      <nav
        className={`w-full top-0 z-40 ${sticky ? "sticky" : ""}`}
        style={{ backgroundColor: headerBg, fontFamily: p.font || "Inter" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BuilderLink href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: p.primaryColor || "#2563eb" }}>
                  {storeName[0]}
                </div>
              )}
              {showName && <span className="text-lg font-bold text-apple-ink">{storeName}</span>}
            </BuilderLink>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <BuilderLink
                key={link.text}
                href={link.url}
                className="text-sm font-medium text-apple-ink-muted-48 transition-colors hover:text-apple-ink"
              >
                {link.text}
              </BuilderLink>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {showSearch && (
              <BuilderIconButton href="/search" aria-label="Search">
                <Search className="h-5 w-5 p-1" style={{ color: iconColor }} />
              </BuilderIconButton>
            )}
            {showWishlist && (
              <BuilderIconButton href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5 p-1" style={{ color: iconColor }} />
              </BuilderIconButton>
            )}
            {showCart && (
              <BuilderIconButton href="/cart" aria-label="Cart">
                <ShoppingCart className="h-5 w-5 p-1" style={{ color: iconColor }} />
              </BuilderIconButton>
            )}
            {showAccount && (
              <BuilderIconButton href="/account" aria-label="Account">
                <User className="h-5 w-5 p-1" style={{ color: iconColor }} />
              </BuilderIconButton>
            )}
            <span className="cursor-default md:hidden">
              <Menu className="h-5 w-5 p-1" style={{ color: iconColor }} />
            </span>
          </div>
        </div>
      </nav>
    </SectionWrapper>
  );
}
