"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
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
    { text: p.link1Text || "Home", url: "/" },
    { text: p.link2Text || "Shop", url: "/shop" },
    { text: p.link3Text || "About", url: "/about" },
    { text: p.link4Text || "Contact", url: "/contact" },
  ].filter((l) => l.text);

  return (
    <SectionWrapper section={section} className="w-full">
      <nav
        className={`w-full top-0 z-40 ${sticky ? "sticky" : ""}`}
        style={{ backgroundColor: headerBg, fontFamily: p.font || "Inter" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: p.primaryColor || "#2563eb" }}>
                {storeName[0]}
              </div>
            )}
            {showName && <span className="text-lg font-bold text-zinc-900">{storeName}</span>}
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <span key={link.text} className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 cursor-pointer">
                {link.text}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {showSearch && <Search className="h-5 w-5 p-1" style={{ color: iconColor }} />}
            {showWishlist && <Heart className="h-5 w-5 p-1" style={{ color: iconColor }} />}
            {showCart && <ShoppingCart className="h-5 w-5 p-1" style={{ color: iconColor }} />}
            {showAccount && <User className="h-5 w-5 p-1" style={{ color: iconColor }} />}
            <Menu className="h-5 w-5 p-1 md:hidden" style={{ color: iconColor }} />
          </div>
        </div>
      </nav>
    </SectionWrapper>
  );
}
