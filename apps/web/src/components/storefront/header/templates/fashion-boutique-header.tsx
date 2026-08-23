"use client";

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

export interface FashionBoutiqueHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 6 — Centered logo, nav underneath, fashion spacing. */
export function FashionBoutiqueHeader({ headerSettings = {} }: FashionBoutiqueHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="relative border-zinc-100 bg-white text-zinc-900">
      <HeaderAnnouncement state={state} className="bg-zinc-50 text-zinc-600" />
      <HeaderContainer className="flex-col gap-3 py-4 lg:flex-row lg:justify-between">
        <div className="flex w-full items-center justify-between lg:hidden">
          <HeaderMobileToggle state={state} className="!flex" />
          <HeaderLogo state={state} centered />
          <HeaderActions state={state} compact />
        </div>
        <div className="hidden w-full flex-col items-center gap-3 lg:flex">
          <HeaderLogo state={state} centered />
          <GlobalStoreNav
            {...state.navProps}
            showPrimaryLinks
            themeVariant="fashion"
            className="justify-center text-[12px] font-semibold uppercase tracking-[0.14em]"
          />
        </div>
        <div className="hidden items-center gap-3 lg:flex lg:absolute lg:right-4 lg:top-1/2 lg:-translate-y-1/2 xl:right-8">
          <HeaderSearch state={state} variant="compact" />
          <HeaderActions state={state} compact />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="fashion"
        rowClassName="border-zinc-100 lg:hidden"
        showPrimaryLinks={false}
      />
      <HeaderMobileNav state={state} themeVariant="fashion" />
    </HeaderShell>
  );
}
