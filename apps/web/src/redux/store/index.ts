import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/redux/api/base-api";
import { authReducer } from "@/redux/slices/auth-slice";
import { userReducer } from "@/redux/slices/user-slice";
import { tenantReducer } from "@/redux/slices/tenant-slice";
import { dashboardReducer } from "@/redux/slices/dashboard-slice";
import { storesReducer } from "@/redux/slices/stores-slice";
import { cartReducer } from "@/redux/slices/cart-slice";
import { customerReducer } from "@/redux/slices/customer-slice";
import { wishlistReducer } from "@/redux/slices/wishlist-slice";
import { orderReducer } from "@/redux/slices/order-slice";
import { builderReducer } from "@/redux/slices/builder-slice";
import { themeReducer } from "@/redux/slices/theme-slice";
import { previewReducer } from "@/redux/slices/preview-slice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    user: userReducer,
    tenant: tenantReducer,
    dashboard: dashboardReducer,
    stores: storesReducer,
    cart: cartReducer,
    customer: customerReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    builder: builderReducer,
    theme: themeReducer,
    preview: previewReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
