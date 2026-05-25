"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateCart } from "@/redux/slices/cart-slice";

export function CartInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  return null;
}
