"use client";

import { Zap } from "lucide-react";
import { StoreLink as Link } from "@/components/storefront/store-link";
import {
  HeaderActions,
  HeaderAnnouncement,
  HeaderCategoryRow,
  HeaderContainer,
  HeaderLogo,
  HeaderMobileNav,
  HeaderMobileToggle,
  HeaderSearch,
  HeaderShell,
} from "../header-template-primitives";
import { useHeaderTemplateState } from "../use-header-template-state";

export interface MarketplaceHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 3 — Marketplace with mega-menu and large search. */
export function MarketplaceHeader({ headerSettings = {} }: MarketplaceHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
      <HeaderAnnouncement
        state={state}
        className="bg-[var(--store-primary,#f85606)] text-white"
      >
        <div className="hidden items-center gap-3 text-[10px] md:flex">
          <Link href="/help" className="hover:underline">
            Help
          </Link>
          <Link href="/orders" className="hover:underline">
            Track Order
          </Link>
        </div>
      </HeaderAnnouncement>
      <HeaderContainer>
        <HeaderLogo state={state} />
        <HeaderSearch state={state} variant="large" className="hidden flex-1 md:flex" />
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <HeaderSearch state={state} variant="compact" />
          </div>
          <HeaderActions state={state} />
          <HeaderMobileToggle state={state} />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="marketplace"
        rowClassName="border-zinc-100 bg-white"
        showAllCategoriesButton
      />
      <HeaderMobileNav state={state} themeVariant="marketplace" />
    </HeaderShell>
  );
}
