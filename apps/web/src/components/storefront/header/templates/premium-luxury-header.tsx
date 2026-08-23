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

export interface PremiumLuxuryHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 4 — Premium spacing, centered navigation, elegant layout. */
export function PremiumLuxuryHeader({ headerSettings = {} }: PremiumLuxuryHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-200/80 bg-white text-zinc-900">
      <HeaderAnnouncement
        state={state}
        className="border-b border-zinc-100 bg-zinc-50 text-zinc-600"
      />
      <HeaderContainer className="min-h-[80px] gap-6 py-4">
        <HeaderLogo state={state} className="hidden lg:flex" />
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <GlobalStoreNav
            {...state.navProps}
            showPrimaryLinks
            themeVariant="fashion"
            className="text-[13px] font-medium tracking-[0.12em] uppercase"
          />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:flex-none lg:justify-end">
          <HeaderLogo state={state} className="lg:hidden" />
          <HeaderSearch state={state} variant="compact" className="lg:hidden" />
          <HeaderSearch state={state} variant="inline" className="hidden max-w-xs lg:flex" />
          <HeaderActions state={state} compact />
          <HeaderMobileToggle state={state} className="lg:hidden" />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="fashion"
        rowClassName="border-zinc-100 bg-white"
        showPrimaryLinks={false}
      />
      <HeaderMobileNav state={state} themeVariant="fashion" />
    </HeaderShell>
  );
}

/** @deprecated Use PremiumLuxuryHeader */
export const ModernGeneralHeader = PremiumLuxuryHeader;
