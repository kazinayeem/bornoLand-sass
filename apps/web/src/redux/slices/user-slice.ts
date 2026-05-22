import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/redux/api/auth-api";

type UserState = {
  profile: SessionUser | null;
};

const initialState: UserState = {
  profile: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<SessionUser>) {
      state.profile = action.payload;
    },
    clearUserProfile(state) {
      state.profile = null;
    }
  }
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export const userReducer = userSlice.reducer;
