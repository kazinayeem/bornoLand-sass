"use client";

import { PhoneCall, ShoppingCart } from "lucide-react";
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
import { formatCurrency } from "@/lib/format-currency";

export interface GroceryNaturalHeaderProps {
  headerSettings?: Record<string, unknown>;
}

/** Template 7 — Grocery / natural products layout. */
export function GroceryNaturalHeader({ headerSettings = {} }: GroceryNaturalHeaderProps) {
  const state = useHeaderTemplateState(headerSettings);

  return (
    <HeaderShell className="border-[var(--store-border,#ede7df)] bg-white text-[var(--store-text,#1c2826)]">
      <HeaderAnnouncement
        state={state}
        className="bg-[var(--store-secondary,#055c3a)] text-white"
      >
        {state.storePhone ? (
          <div className="hidden items-center gap-1.5 text-[11px] md:flex">
            <PhoneCall className="h-3 w-3" />
            <span>
              {state.t("hotline", state.storeLang)}: {state.storePhone}
            </span>
          </div>
        ) : null}
      </HeaderAnnouncement>
      <HeaderContainer>
        <LinkRowLogo state={state} />
        <HeaderSearch
          state={state}
          variant="large"
          className="hidden flex-1 md:flex [&_button]:bg-[var(--store-secondary,#055c3a)] [&_input]:border-[var(--store-secondary,#055c3a)]/25"
        />
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <HeaderSearch state={state} variant="compact" />
          </div>
          <GroceryCartButton state={state} />
          <HeaderMobileToggle state={state} className="md:hidden" />
        </div>
      </HeaderContainer>
      <HeaderCategoryRow
        state={state}
        themeVariant="grocery"
        rowClassName="border-[var(--store-border,#ede7df)] bg-[#faf8f5]"
        showAllCategoriesButton
      />
      <HeaderMobileNav
        state={state}
        themeVariant="grocery"
        footer={
          state.storePhone ? (
            <div className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-800">{state.t("hotline", state.storeLang)}</p>
              <p className="mt-0.5 font-bold text-[var(--store-primary,#e05a00)]">{state.storePhone}</p>
            </div>
          ) : null
        }
      />
    </HeaderShell>
  );
}

function LinkRowLogo({ state }: { state: ReturnType<typeof useHeaderTemplateState> }) {
  return <HeaderLogo state={state} />;
}

function GroceryCartButton({ state }: { state: ReturnType<typeof useHeaderTemplateState> }) {
  if (!state.showCart) return null;
  return (
    <button
      type="button"
      onClick={state.openCartDrawer}
      className="flex items-center gap-2 rounded-full bg-[var(--store-secondary,#055c3a)] px-3 py-2 text-xs font-bold text-white"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>{state.itemCount}</span>
      <span className="hidden sm:inline">{formatCurrency(state.cartTotal, state.settings)}</span>
    </button>
  );
}

/** @deprecated Use GroceryNaturalHeader */
export const GroceryHeader = GroceryNaturalHeader;
