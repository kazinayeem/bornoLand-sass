"use client";

import { StoreProvider } from "@/store/providers";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
