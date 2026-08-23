"use client";

import {
  HeaderActions,
  HeaderContainer,
  HeaderLogo,
  HeaderMobileNav,
  HeaderMobileToggle,
  HeaderSearch,
  HeaderShell,
} from "../header-template-primitives";
import { useHeaderTemplateState } from "../use-header-template-state";

export interface MobileFirstHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 10 — Mobile-first, compact desktop, drawer navigation. */
export function MobileFirstHeader({ headerSettings = {} }: MobileFirstHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
      <HeaderContainer tight className="gap-2 sm:gap-3">
        <HeaderMobileToggle state={state} className="!flex lg:hidden" />
        <HeaderLogo state={state} className="min-w-0 flex-1 justify-center sm:flex-none sm:justify-start" />
        <HeaderSearch state={state} variant="compact" className="hidden min-w-0 flex-1 sm:flex lg:max-w-md" />
        <HeaderSearch state={state} variant="large" className="hidden flex-1 lg:flex" />
        <HeaderActions state={state} compact />
      </HeaderContainer>
      <HeaderMobileNav state={state} themeVariant="default" />
    </HeaderShell>
  );
}
