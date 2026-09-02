"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectCurrentPlan,
  selectCurrentStore,
  selectCurrentSubscription,
  selectIsAuthenticated,
  selectIsStoreOwner,
  selectMemberRole,
  selectPermissions,
  selectUser,
  selectWorkspace,
} from "@/store/selectors";

export function useCurrentUser() {
  return useAppSelector(selectUser);
}

export function useCurrentWorkspace() {
  return useAppSelector(selectWorkspace);
}

export function useCurrentStore() {
  return useAppSelector(selectCurrentStore);
}

export function useCurrentPlan() {
  return useAppSelector(selectCurrentPlan);
}

export function useCurrentSubscription() {
  return useAppSelector(selectCurrentSubscription);
}

export function useIsStoreOwner() {
  const isOwnerFromAuth = useAppSelector(selectIsStoreOwner);
  const user = useCurrentUser();
  const currentStore = useCurrentStore();
  if (isOwnerFromAuth) return true;
  if (user && currentStore) {
    const currentUserId = (user as { id?: string; _id?: string; userId?: string }).id ||
      (user as { id?: string; _id?: string; userId?: string })._id ||
      (user as { id?: string; _id?: string; userId?: string }).userId;
    const storeUserId = (currentStore as { userId?: string }).userId;
    if (currentUserId && storeUserId && String(currentUserId) === String(storeUserId)) {
      return true;
    }
  }
  return false;
}

export function useMemberRole() {
  return useAppSelector(selectMemberRole);
}

export function usePermissions() {
  const permissions = useAppSelector(selectPermissions);
  return useMemo(() => new Set(permissions), [permissions]);
}

/**
 * Check if the current user has the required permission in the active store.
 * Handles wildcards: `*`, `module:*`, and exact match `module:action`.
 */
export function checkPermission(permissionSet: Set<string>, required: string): boolean {
  if (permissionSet.has("*")) return true;
  if (permissionSet.has(required)) return true;

  const [module] = required.split(":");
  if (module && permissionSet.has(`${module}:*`)) return true;

  return false;
}

export function useHasPermission(permission: string) {
  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();
  if (isOwner) return true;
  return checkPermission(permissionSet, permission);
}

export function useIsAuthenticated() {
  return useAppSelector(selectIsAuthenticated);
}
