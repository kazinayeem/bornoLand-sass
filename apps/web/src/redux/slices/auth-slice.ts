import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionPayload, SessionUser } from "@/redux/api/auth-api";

type AuthState = {
  isAuthenticated: boolean;
  session: SessionPayload | null;
  user: SessionUser | null;
  memberPermissions: string[];
  isStoreOwner: boolean;
  memberRole: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  session: null,
  user: null,
  memberPermissions: [],
  isStoreOwner: false,
  memberRole: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<{ session: SessionPayload; user: SessionUser }>) {
      state.isAuthenticated = true;
      state.session = action.payload.session;
      state.user = action.payload.user;
    },
    setStorePermissions(
      state,
      action: PayloadAction<{
        permissions: string[];
        isOwner: boolean;
        role: string;
      }>
    ) {
      state.memberPermissions = action.payload.permissions;
      state.isStoreOwner = action.payload.isOwner;
      state.memberRole = action.payload.role;
    },
    clearAuthState(state) {
      state.isAuthenticated = false;
      state.session = null;
      state.user = null;
      state.memberPermissions = [];
      state.isStoreOwner = false;
      state.memberRole = null;
    },
  },
});

export const { setAuthState, setStorePermissions, clearAuthState } = authSlice.actions;
export const authReducer = authSlice.reducer;
