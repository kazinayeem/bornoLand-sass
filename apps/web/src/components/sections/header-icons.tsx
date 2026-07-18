"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
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
        {showSearch && <Search style={{ color: iconColor, width: iconSize, height: iconSize }} className="cursor-pointer" />}
        {showWishlist && <Heart style={{ color: iconColor, width: iconSize, height: iconSize }} className="cursor-pointer" />}
        {showCart && <ShoppingCart style={{ color: iconColor, width: iconSize, height: iconSize }} className="cursor-pointer" />}
        {showAccount && <User style={{ color: iconColor, width: iconSize, height: iconSize }} className="cursor-pointer" />}
      </div>
    </SectionWrapper>
  );
}
