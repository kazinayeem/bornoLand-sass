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

export interface ElectronicsTechHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 8 — Search-first electronics / tech layout. */
export function ElectronicsTechHeader({ headerSettings = {} }: ElectronicsTechHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-zinc-800 bg-zinc-950 text-white">
      <HeaderAnnouncement state={state} className="bg-[#0071dc] text-white text-[11px]" />
      <HeaderContainer className="gap-4">
        <HeaderLogo state={state} className="shrink-0" />
        <HeaderSearch
          state={state}
          variant="large"
          className="order-last w-full flex-1 md:order-none [&_input]:border-zinc-700 [&_input]:bg-zinc-900 [&_input]:text-white [&_button]:bg-[#0071dc]"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/offers"
            className="hidden items-center gap-1 text-[11px] font-bold text-[#0071dc] lg:flex"
          >
            <Zap className="h-3.5 w-3.5" />
            Flash Sale
          </Link>
          <HeaderActions state={state} />
          <HeaderMobileToggle state={state} className="md:hidden" />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="electronics"
        rowClassName="border-zinc-800 bg-zinc-900"
        showAllCategoriesButton
      />
      <HeaderMobileNav state={state} themeVariant="electronics" />
    </HeaderShell>
  );
}
