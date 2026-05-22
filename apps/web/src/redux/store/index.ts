import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/redux/api/base-api";
import { authReducer } from "@/redux/slices/auth-slice";
import { userReducer } from "@/redux/slices/user-slice";
import { tenantReducer } from "@/redux/slices/tenant-slice";
import { dashboardReducer } from "@/redux/slices/dashboard-slice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    user: userReducer,
    tenant: tenantReducer,
    dashboard: dashboardReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
