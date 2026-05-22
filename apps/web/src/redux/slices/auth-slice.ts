import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionPayload, SessionUser } from "@/redux/api/auth-api";

type AuthState = {
  isAuthenticated: boolean;
  session: SessionPayload | null;
  user: SessionUser | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  session: null,
  user: null
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
    clearAuthState(state) {
      state.isAuthenticated = false;
      state.session = null;
      state.user = null;
    }
  }
});

export const { setAuthState, clearAuthState } = authSlice.actions;
export const authReducer = authSlice.reducer;
