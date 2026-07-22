"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useIsBuilderMode } from "@/lib/builder-mode";
import { useDispatch, useSelector } from "react-redux";
import { hydrateCart, setCartItems, type CartItem } from "@/redux/slices/cart-slice";
import {
  useGetCartQuery,
  useMergeCartMutation,
  useSyncCartMutation,
} from "@/redux/api/cart-api";
import type { RootState } from "@/store/store";
import {
  cartIdentityDebug,
  getOrCreateCartSessionId,
  logCartDebug,
  summarizeCartItems,
} from "@/lib/cart-session";

function mapServerItems(
  items: Array<{
    productId: string | { _id?: string };
    variantId?: string;
    variantTitle?: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>,
): CartItem[] {
  return items.map((item) => ({
    productId:
      typeof item.productId === "object"
        ? String((item.productId as { _id?: string })._id ?? item.productId)
        : String(item.productId),
    variantId: item.variantId,
    variantTitle: item.variantTitle,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));
}

function cartFingerprint(items: CartItem[]) {
  return items
    .map((item) => `${item.productId}:${item.variantId ?? ""}:${item.quantity}:${item.price}`)
    .sort()
    .join("|");
}

function CartInitializer() {
  const isBuilderMode = useIsBuilderMode();
  const dispatch = useDispatch();
  const customerAuthenticated = useSelector((state: RootState) => state.customer.isAuthenticated);
  const localItems = useSelector((state: RootState) => state.cart.items);
  const hydrated = useSelector((state: RootState) => state.cart.hydrated);
  const { data, refetch, isSuccess } = useGetCartQuery(undefined, { skip: isBuilderMode });
  const [mergeCart] = useMergeCartMutation();
  const [syncCart] = useSyncCartMutation();
  const mergeAttempted = useRef(false);
  const syncAttempted = useRef(false);
  const lastAppliedFingerprint = useRef("");

  useEffect(() => {
    if (isBuilderMode) return;
    getOrCreateCartSessionId();
    dispatch(hydrateCart());
  }, [dispatch, isBuilderMode]);

  useEffect(() => {
    if (isBuilderMode || !customerAuthenticated || mergeAttempted.current) return;
    mergeAttempted.current = true;
    void (async () => {
      try {
        logCartDebug("merge after login", cartIdentityDebug());
        const result = await mergeCart().unwrap();
        const cart = result.data?.cart;
        if (cart?.items) {
          const mapped = mapServerItems(cart.items);
          lastAppliedFingerprint.current = cartFingerprint(mapped);
          dispatch(setCartItems(mapped));
        }
        await refetch();
      } catch (error) {
        logCartDebug("merge after login failed", { error: String(error) });
        mergeAttempted.current = false;
      }
    })();
  }, [customerAuthenticated, isBuilderMode, mergeCart, refetch, dispatch]);

  useEffect(() => {
    if (!customerAuthenticated) {
      mergeAttempted.current = false;
      syncAttempted.current = false;
    }
  }, [customerAuthenticated]);

  useEffect(() => {
    if (isBuilderMode || !isSuccess || !data?.data?.cart || !hydrated) return;

    const serverItems = mapServerItems(data.data.cart.items ?? []);
    const serverFp = cartFingerprint(serverItems);
    const localFp = cartFingerprint(localItems);

    logCartDebug("cart reconcile", {
      cartId: data.data.cart._id ?? null,
      storeId: data.data.cart.storeId ?? null,
      customerId: data.data.cart.customerId ?? null,
      backend: summarizeCartItems(serverItems),
      frontend: summarizeCartItems(localItems),
      ...cartIdentityDebug(),
    });

    if (customerAuthenticated) {
      if (serverItems.length > 0) {
        if (serverFp !== lastAppliedFingerprint.current) {
          lastAppliedFingerprint.current = serverFp;
          dispatch(setCartItems(serverItems));
        }
        return;
      }

      if (localItems.length > 0 && !syncAttempted.current) {
        syncAttempted.current = true;
        void (async () => {
          try {
            logCartDebug("syncing local → backend (backend empty)", {
              ...summarizeCartItems(localItems),
              ...cartIdentityDebug(),
            });
            const result = await syncCart({
              items: localItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            }).unwrap();
            const synced = mapServerItems(result.data?.cart?.items ?? []);
            lastAppliedFingerprint.current = cartFingerprint(synced);
            dispatch(setCartItems(synced));
            await refetch();
          } catch (error) {
            logCartDebug("local → backend sync failed", { error: String(error) });
            syncAttempted.current = false;
          }
        })();
      }
      return;
    }

    // Guest: adopt server cart only when it has more content.
    if (serverItems.length > localItems.length && serverFp !== localFp) {
      lastAppliedFingerprint.current = serverFp;
      dispatch(setCartItems(serverItems));
    }
  }, [
    customerAuthenticated,
    data,
    dispatch,
    hydrated,
    isBuilderMode,
    isSuccess,
    localItems,
    refetch,
    syncCart,
  ]);

  useEffect(() => {
    if (isBuilderMode) return;
    const onAuthChange = () => {
      if (!localStorage.getItem("customer_token")) return;
      mergeAttempted.current = false;
      syncAttempted.current = false;
      void refetch();
    };
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, [isBuilderMode, refetch]);

  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    getOrCreateCartSessionId();
  }, []);

  return (
    <>
      <CartInitializer />
      {children}
    </>
  );
}
