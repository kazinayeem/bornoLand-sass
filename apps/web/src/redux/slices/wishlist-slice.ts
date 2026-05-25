import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
};

type WishlistState = {
  items: WishlistItem[];
};

const initialState: WishlistState = {
  items: []
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.find((i) => i.productId === action.payload.productId);
      if (!exists) state.items.push(action.payload);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.find((i) => i.productId === action.payload.productId);
      if (exists) {
        state.items = state.items.filter((i) => i.productId !== action.payload.productId);
      } else {
        state.items.push(action.payload);
      }
    },
    clearWishlist(state) {
      state.items = [];
    }
  }
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
