import { baseApi } from "@/redux/api/base-api";

type CustomerData = {
  _id: string;
  name: string;
  email: string;
  storeId: string;
};

type AuthResponse = {
  customer: CustomerData;
  token: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

/** Storefront customer auth — endpoint names must not collide with auth-api (platform register/login). */
export const customerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    customerRegister: builder.mutation<ApiResponse<AuthResponse>, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/customer/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    customerLogin: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (body) => ({
        url: "/customer/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    customerForgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (body) => ({
        url: "/customer/forgot-password",
        method: "POST",
        body,
      }),
    }),
    getCustomerMe: builder.query<ApiResponse<{ customer: CustomerData }>, string>({
      query: (token) => ({
        url: "/customer/me",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Customer"],
    }),
  }),
});

export const {
  useCustomerRegisterMutation,
  useCustomerLoginMutation,
  useCustomerForgotPasswordMutation,
  useGetCustomerMeQuery,
} = customerApi;
