import { baseApi } from "@/redux/api/base-api";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
};

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  tenantName?: string;
  rememberMe?: boolean;
};

type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
  loginType?: "user" | "admin";
};

type ForgotPasswordRequest = {
  email: string;
};

type ResetPasswordRequest = {
  token: string;
  password: string;
};

type LoginResponse = {
  user: SessionUser;
  session: SessionPayload;
};

type MeResponse = {
  session: SessionPayload | null;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiEnvelope<{ tenantId: string; userId: string }>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body
      })
    }),
    login: builder.mutation<ApiEnvelope<LoginResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body
      }),
      invalidatesTags: ["Auth", "User", "Tenant", "Dashboard"]
    }),
    forgotPassword: builder.mutation<ApiEnvelope<never>, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body
      })
    }),
    resetPassword: builder.mutation<ApiEnvelope<never>, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body
      })
    }),
    me: builder.query<ApiEnvelope<MeResponse>, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"]
    }),
    logout: builder.mutation<ApiEnvelope<never>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["Auth", "User", "Tenant", "Dashboard"]
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useMeQuery,
  useLogoutMutation
} = authApi;
