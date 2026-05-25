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

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/customer/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (body) => ({
        url: "/customer/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    getMe: builder.query<ApiResponse<{ customer: CustomerData }>, string>({
      query: (token) => ({
        url: "/customer/me",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Customer"],
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useGetMeQuery } = customerApi;
