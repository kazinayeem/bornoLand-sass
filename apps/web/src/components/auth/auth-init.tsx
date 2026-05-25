"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCustomerFromToken } from "@/redux/slices/customer-slice";

export function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      dispatch(setCustomerFromToken(token));
    }
  }, [dispatch]);

  return null;
}
