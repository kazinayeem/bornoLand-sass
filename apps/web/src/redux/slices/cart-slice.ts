"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
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
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToStorage(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
        } else {
          item.quantity = action.payload.quantity;
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
      saveCartToStorage(state.items);
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  hydrateCart, setCartItems, mergeServerCart, addToCart, updateQuantity, removeFromCart,
  clearCart, openCart, closeCart, toggleCart,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
