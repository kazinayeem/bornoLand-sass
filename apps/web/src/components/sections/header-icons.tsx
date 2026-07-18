"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderIconButton } from "./builder-link";
import { Search, ShoppingCart, Heart, User } from "lucide-react";

export function HeaderIcons({ section }: { section: SectionData }) {
  const p = section.props;
  const showSearch = p.showSearch !== "false";
  const showWishlist = p.showWishlist !== "false";
  const showCart = p.showCart !== "false";
  const showAccount = p.showAccount !== "false";
  const iconColor = p.iconColor || "#71717a";
  const iconSize = parseInt(p.iconSize || "20");
  const gap = p.gap || "8";

  return (
    <SectionWrapper section={section}>
      <div className={`flex items-center gap-${gap}`} style={{ fontFamily: p.font || "Inter" }}>
        {showSearch && (
          <BuilderIconButton href="/search" aria-label="Search">
            <Search style={{ color: iconColor, width: iconSize, height: iconSize }} />
          </BuilderIconButton>
        )}
        {showWishlist && (
          <BuilderIconButton href="/wishlist" aria-label="Wishlist">
            <Heart style={{ color: iconColor, width: iconSize, height: iconSize }} />
          </BuilderIconButton>
        )}
        {showCart && (
          <BuilderIconButton href="/cart" aria-label="Cart">
            <ShoppingCart style={{ color: iconColor, width: iconSize, height: iconSize }} />
          </BuilderIconButton>
        )}
        {showAccount && (
          <BuilderIconButton href="/account" aria-label="Account">
            <User style={{ color: iconColor, width: iconSize, height: iconSize }} />
          </BuilderIconButton>
        )}
      </div>
    </SectionWrapper>
  );
}
