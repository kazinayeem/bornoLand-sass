"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  sku?: string;
  stock?: number;
  maxQuantity?: number;
};

export type AppliedCoupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  coupon: AppliedCoupon | null;
  shippingMethod: string;
  shippingCost: number;
  taxRate: number;
  notes: string;
};

const CART_STORAGE_KEY = "bornoland_cart";

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  hydrated: false,
  coupon: null,
  shippingMethod: "standard",
  shippingCost: 0,
  taxRate: 0,
  notes: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state) {
      state.items = loadCartFromStorage();
      state.hydrated = true;
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      saveCartToStorage(state.items);
    },
    mergeServerCart(state, action: PayloadAction<CartItem[]>) {
      const serverItems = action.payload;
      if (serverItems.length === 0) return;
      const localItems = loadCartFromStorage();
      if (localItems.length >= serverItems.length) return;
      state.items = serverItems;
      saveCartToStorage(state.items);
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.variant === action.payload.variant
      );
      const maxQty = action.payload.maxQuantity ?? 99;
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, maxQty);
      } else {
        state.items.push({ ...action.payload, quantity: Math.min(action.payload.quantity, maxQty) });
      }
      saveCartToStorage(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number; variant?: string }>) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.variant === action.payload.variant
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.productId === action.payload.productId && i.variant === action.payload.variant)
          );
        } else {
          item.quantity = Math.min(action.payload.quantity, item.maxQuantity ?? 99);
        }
      }
      saveCartToStorage(state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      saveCartToStorage(state.items);
    },
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
    toggleCart(state) { state.isOpen = !state.isOpen; },
    applyCoupon(state, action: PayloadAction<AppliedCoupon>) {
      state.coupon = action.payload;
    },
    removeCoupon(state) { state.coupon = null; },
    setShippingMethod(state, action: PayloadAction<{ method: string; cost: number }>) {
      state.shippingMethod = action.payload.method;
      state.shippingCost = action.payload.cost;
    },
    setTaxRate(state, action: PayloadAction<number>) { state.taxRate = action.payload; },
    setCartNotes(state, action: PayloadAction<string>) { state.notes = action.payload; },
  },
});

export const {
  hydrateCart, setCartItems, mergeServerCart, addToCart, updateQuantity, removeFromCart,
  clearCart, openCart, closeCart, toggleCart,
  applyCoupon, removeCoupon, setShippingMethod, setTaxRate, setCartNotes,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartDiscount = (state: CartState) => {
  if (!state.coupon) return 0;
  const subtotal = selectCartSubtotal(state);
  if (state.coupon.minAmount && subtotal < state.coupon.minAmount) return 0;
  return state.coupon.type === "percentage" ? subtotal * (state.coupon.value / 100) : state.coupon.value;
};

export const selectCartTax = (state: CartState) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  return (subtotal - discount) * (state.taxRate / 100);
};

export const selectCartTotal = (state: CartState) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  const tax = selectCartTax(state);
  return subtotal - discount + tax + state.shippingCost;
};

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
