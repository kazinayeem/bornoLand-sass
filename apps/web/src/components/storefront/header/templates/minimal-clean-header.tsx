"use client";

import {
  HeaderActions,
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

export interface MinimalCleanHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 1 — Logo left, nav center, actions right. Single row only. */
export function MinimalCleanHeader({ headerSettings = {} }: MinimalCleanHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-100 bg-white text-zinc-900 shadow-xs">
      <HeaderContainer className="grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:grid-cols-[minmax(0,180px)_1fr_auto]">
        <HeaderLogo state={state} />

        <div className="hidden min-w-0 justify-center overflow-visible lg:flex">
          <GlobalStoreNav
            {...state.navProps}
            showAllCategoriesButton={false}
            showPrimaryLinks
            themeVariant="minimal"
            className="min-w-0 text-[13px] font-medium uppercase tracking-wide"
          />
        </div>

        <div className="col-span-2 flex min-w-0 items-center justify-end gap-2 sm:col-span-1 sm:gap-3">
          <div className="hidden min-w-0 sm:block md:hidden">
            <HeaderSearch state={state} variant="compact" />
          </div>
          <div className="hidden md:block">
            <HeaderSearch state={state} variant="inline" className="max-w-xs" />
          </div>
          <HeaderActions state={state} compact />
          <HeaderMobileToggle state={state} />
        </div>
      </HeaderContainer>

      <HeaderMobileNav state={state} themeVariant="minimal" />
    </HeaderShell>
  );
}

/** @deprecated Use MinimalCleanHeader */
export const MinimalFashionHeader = MinimalCleanHeader;
