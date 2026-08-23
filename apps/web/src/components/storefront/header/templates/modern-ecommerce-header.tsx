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

export interface ModernEcommerceHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 2 — Announcement + logo/search/actions + category row. */
export function ModernEcommerceHeader({ headerSettings = {} }: ModernEcommerceHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-200 bg-white text-zinc-900 shadow-sm">
      <HeaderAnnouncement
        state={state}
        className="bg-zinc-900 text-white"
      />
      <HeaderContainer>
        <HeaderLogo state={state} />
        <HeaderSearch state={state} variant="large" className="hidden flex-1 md:flex" />
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <HeaderSearch state={state} variant="compact" />
          </div>
          <HeaderActions state={state} />
          <HeaderMobileToggle state={state} className="md:hidden" />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="default"
        rowClassName="border-zinc-100 bg-zinc-50"
        showPrimaryLinks
      />
      <HeaderMobileNav state={state} themeVariant="default" />
    </HeaderShell>
  );
}
