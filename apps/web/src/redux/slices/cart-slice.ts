"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  tenantSlug: string;
};

export function getCartStorageKey(tenantSlug?: string): string {
  const clean = tenantSlug?.trim()?.toLowerCase();
  if (clean) return `cart:${clean}`;
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    const parts = host.split(".");
    if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
      return `cart:${parts[0]}`;
    }
    const match = window.location.pathname.match(/^\/site\/([^/]+)/);
    if (match?.[1]) {
      return `cart:${match[1].toLowerCase()}`;
    }
  }
  return "cart:default";
}

function sanitizeCartItems(items: any[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i && typeof i === "object" && (i.productId || i._id))
    .map((i) => ({
      productId: String(i.productId || i._id),
      variantId: i.variantId ? String(i.variantId) : undefined,
      variantTitle: i.variantTitle ? String(i.variantTitle) : undefined,
      name: String(i.name || ""),
      price: Number(i.price) || 0,
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
      image: String(i.image || ""),
    }));
}

function loadCartFromStorage(tenantSlug?: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCartStorageKey(tenantSlug);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return sanitizeCartItems(parsed);
    }
    // Backward compatibility: migrate from old global key if exists
    if (key !== "bornoland_cart") {
      const legacy = localStorage.getItem("bornoland_cart");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeCartItems(parsed);
          localStorage.setItem(key, JSON.stringify(sanitized));
          return sanitized;
        }
      }
    }
  } catch {}
  return [];
}

function saveCartToStorage(items: CartItem[], tenantSlug?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = getCartStorageKey(tenantSlug);
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  hydrated: false,
  tenantSlug: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<{ tenantSlug?: string } | undefined>) {
      const slug = action.payload?.tenantSlug ?? state.tenantSlug;
      state.tenantSlug = slug;
      state.items = loadCartFromStorage(slug);
      state.hydrated = true;
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = sanitizeCartItems(action.payload);
      saveCartToStorage(state.items, state.tenantSlug);
    },
    syncFromStorage(state, action: PayloadAction<{ items: CartItem[]; tenantSlug?: string }>) {
      const incomingSlug = action.payload.tenantSlug ?? state.tenantSlug;
      if (!incomingSlug || incomingSlug === state.tenantSlug) {
        state.items = sanitizeCartItems(action.payload.items);
      }
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const cleanItem: CartItem = {
        productId: String(action.payload.productId),
        variantId: action.payload.variantId ? String(action.payload.variantId) : undefined,
        variantTitle: action.payload.variantTitle ? String(action.payload.variantTitle) : undefined,
        name: String(action.payload.name || ""),
        price: Number(action.payload.price) || 0,
        quantity: Math.max(1, Math.floor(Number(action.payload.quantity) || 1)),
        image: String(action.payload.image || ""),
      };

      const existing = state.items.find(
        (i) => i.productId === cleanItem.productId && (i.variantId ?? "") === (cleanItem.variantId ?? "")
      );
      if (existing) {
        existing.quantity += cleanItem.quantity;
      } else {
        state.items.push(cleanItem);
      }
      saveCartToStorage(state.items, state.tenantSlug);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>) {
      const { productId, variantId, quantity } = action.payload;
      const targetId = String(productId);
      const targetVariantId = variantId ?? "";

      const itemIndex = state.items.findIndex(
        (i) => i.productId === targetId && (i.variantId ?? "") === targetVariantId
      );
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = Math.floor(quantity);
        }
      }
      saveCartToStorage(state.items, state.tenantSlug);
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; variantId?: string } | string>) {
      const payload = action.payload;
      if (typeof payload === "string") {
        const targetId = String(payload);
        state.items = state.items.filter((i) => i.productId !== targetId);
      } else {
        const targetId = String(payload.productId);
        const targetVariantId = payload.variantId ?? "";
        state.items = state.items.filter(
          (i) => i.productId !== targetId || (i.variantId ?? "") !== targetVariantId
        );
      }
      saveCartToStorage(state.items, state.tenantSlug);
    },
    clearCart(state, action: PayloadAction<{ tenantSlug?: string } | undefined>) {
      const slug = action.payload?.tenantSlug ?? state.tenantSlug;
      state.items = [];
      saveCartToStorage([], slug);
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
  hydrateCart,
  setCartItems,
  syncFromStorage,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
