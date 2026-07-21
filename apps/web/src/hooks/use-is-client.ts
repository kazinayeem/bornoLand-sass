"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False during SSR and the client's first hydration paint; true afterwards.
 * Use to avoid Redux/localStorage-driven trees that diverge from server HTML.
 */
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
