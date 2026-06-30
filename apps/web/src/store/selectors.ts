import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.user.profile ?? state.auth.user;
export const selectTenant = (state: RootState) => state.tenant;
export const selectCurrentStore = (state: RootState) => state.currentStore;
export const selectPlanState = (state: RootState) => state.plan;
export const selectBillingState = (state: RootState) => state.billing;
export const selectTheme = (state: RootState) => state.theme;
export const selectUi = (state: RootState) => state.ui;
export const selectCart = (state: RootState) => state.cart;
export const selectWishlist = (state: RootState) => state.wishlist;

export const selectIsAuthenticated = createSelector(selectAuth, (auth) => auth.isAuthenticated);
export const selectWorkspace = createSelector(selectTenant, (tenant) => ({
  id: tenant.tenantId,
  slug: tenant.tenantSlug,
}));
export const selectPermissions = createSelector(selectAuth, (auth) => auth.session?.permissions ?? []);
export const selectCurrentStoreId = createSelector(selectCurrentStore, (store) => store.storeId);
export const selectCurrentStoreSlug = createSelector(selectCurrentStore, (store) => store.storeSlug);
export const selectCurrentSubscription = createSelector(selectBillingState, (billing) => ({
  isOpen: billing.isOpen,
  mode: billing.mode,
  storeId: billing.storeId,
}));
export const selectCurrentPlan = createSelector(selectPlanState, (plan) => plan.selectedPlan);
