"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectCurrentPlan,
  selectCurrentStore,
  selectCurrentSubscription,
  selectIsAuthenticated,
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

export function usePermissions() {
  const permissions = useAppSelector(selectPermissions);
  return useMemo(() => new Set(permissions), [permissions]);
}

export function useHasPermission(permission: string) {
  const permissionSet = usePermissions();
  return permissionSet.has(permission);
}

export function useIsAuthenticated() {
  return useAppSelector(selectIsAuthenticated);
}
