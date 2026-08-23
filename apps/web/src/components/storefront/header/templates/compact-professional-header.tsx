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
import { useHeaderTemplateState } from "../use-header-template-state";

export interface CompactProfessionalHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 5 — Compact utility bar + dense category row (tech/professional). */
export function CompactProfessionalHeader({ headerSettings = {} }: CompactProfessionalHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-[#172b3c] bg-[#081621] text-white">
      {state.storePhone ? (
        <div className="border-b border-white/10 px-4 py-1 text-[10px] text-zinc-300">
          <div className="mx-auto flex max-w-7xl justify-between">
            <span>{state.t("hotline", state.storeLang)}: {state.storePhone}</span>
            <span className="hidden sm:inline">{state.storeTagline}</span>
          </div>
        </div>
      ) : null}
      <HeaderAnnouncement
        state={state}
        className="bg-gradient-to-r from-[#e2136e] to-[#f97316] text-white"
      />
      <HeaderContainer tight>
        <HeaderLogo state={state} />
        <HeaderSearch state={state} variant="large" className="hidden flex-1 md:flex [&_input]:border-zinc-600 [&_input]:bg-[#0f2433] [&_input]:text-white" />
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
        themeVariant="electronics"
        rowClassName="border-white/10 bg-[#0a1c28]"
        showAllCategoriesButton
      />
      <HeaderMobileNav state={state} themeVariant="electronics" />
    </HeaderShell>
  );
}

/** @deprecated Use CompactProfessionalHeader */
export const TechMegaHeader = CompactProfessionalHeader;
