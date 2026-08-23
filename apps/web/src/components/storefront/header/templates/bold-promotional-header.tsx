"use client";

import { Flame, Zap } from "lucide-react";
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
import { GlobalStoreNav } from "../global-store-nav";
import { useHeaderTemplateState } from "../use-header-template-state";

export interface BoldPromotionalHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 9 — Bold promotional colors + deals navigation. */
export function BoldPromotionalHeader({ headerSettings = {} }: BoldPromotionalHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-orange-200 bg-white text-zinc-900">
      <HeaderAnnouncement
        state={state}
        className="bg-gradient-to-r from-orange-600 via-red-500 to-rose-500 text-sm font-bold text-white"
      />
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
      <div className="hidden border-t border-orange-100 bg-orange-50 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
          <Link href="/offers" className="flex items-center gap-1 text-xs font-bold text-orange-600">
            <Flame className="h-3.5 w-3.5" />
            Deals
          </Link>
          <Link href="/shop" className="flex items-center gap-1 text-xs font-bold text-red-600">
            <Zap className="h-3.5 w-3.5" />
            Flash Sale
          </Link>
          <div className="min-w-0 flex-1">
            <GlobalStoreNav
              {...state.navProps}
              showPrimaryLinks={false}
              themeVariant="marketplace"
              className="min-w-0"
            />
          </div>
        </div>
      </div>
      <HeaderCategoryRow
        state={state}
        themeVariant="marketplace"
        rowClassName="border-orange-100 bg-white md:hidden"
        showPrimaryLinks
      />
      <HeaderMobileNav state={state} themeVariant="marketplace" />
    </HeaderShell>
  );
}
