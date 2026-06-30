"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { rehydrateCurrentStore } from "@/redux/slices/current-store-slice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(rehydrateCurrentStore());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
