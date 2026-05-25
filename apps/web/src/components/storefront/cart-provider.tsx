"use client";

import { useEffect, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/redux/slices/cart-slice";
import { useGetCartQuery } from "@/redux/api/cart-api";

function CartInitializer() {
  const dispatch = useDispatch();
  const { data } = useGetCartQuery();

  useEffect(() => {
    if (data?.data?.cart?.items) {
      dispatch(setCartItems(data.data.cart.items.map((item) => ({
        productId: typeof item.productId === "object" ? (item.productId as any)._id ?? item.productId : item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))));
    }
  }, [data, dispatch]);

  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const existing = localStorage.getItem("session_id");
    if (!existing) {
      localStorage.setItem("session_id", `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }
  }, []);

  return (
    <>
      <CartInitializer />
      {children}
    </>
  );
}
