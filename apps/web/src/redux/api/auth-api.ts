import { baseApi } from "@/redux/api/base-api";
import { setAccessToken } from "@/lib/access-token";
import { rememberRedirectAfterLogin } from "@/lib/auth-redirect-client";
import { broadcastAuthEvent } from "@/lib/auth-tab-sync";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { authLog, maskToken } from "@/lib/auth-debug";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  avatarUrl?: string;
  stores?: Array<{ id: string; slug: string; name: string }>;
  defaultStoreSlug?: string | null;
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

type VerifyEmailRequest = {
  token: string;
};

type LoginResponse = {
  user: SessionUser;
  session: SessionPayload;
  accessToken: string;
};

type MeResponse = {
  session: SessionPayload | null;
  accessToken?: string;
};

type RefreshResponse = {
  session: SessionPayload;
  accessToken: string;
};

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
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
      transformResponse: (response: ApiEnvelope<LoginResponse>) => {
        authLog("info", "login response", {
          success: response.success,
          hasAccessToken: Boolean(response.data?.accessToken),
          accessToken: maskToken(response.data?.accessToken),
          userId: response.data?.user?.id,
          email: response.data?.user?.email,
          note: "Set-Cookie is HttpOnly — verify in Application > Cookies (bornoland.session)",
        });
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
        }
        return response;
      },
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
    verifyEmail: builder.mutation<ApiEnvelope<never>, VerifyEmailRequest>({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body
      })
    }),
    me: builder.query<ApiEnvelope<MeResponse>, void>({
      query: () => ({ url: "/auth/me" }),
      transformResponse: (response: ApiEnvelope<MeResponse>) => {
        authLog("info", "current user fetch (/auth/me)", {
          hasSession: Boolean(response.data?.session),
          hasAccessToken: Boolean(response.data?.accessToken),
          accessToken: maskToken(response.data?.accessToken),
          userId: response.data?.session?.userId,
        });
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
        }
        return response;
      },
      providesTags: ["Auth"]
    }),
    refresh: builder.mutation<ApiEnvelope<RefreshResponse>, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<RefreshResponse>) => {
        authLog("info", "refresh mutation response", {
          hasAccessToken: Boolean(response.data?.accessToken),
          accessToken: maskToken(response.data?.accessToken),
        });
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
        }
        return response;
      },
    }),
    logout: builder.mutation<ApiEnvelope<never>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      transformResponse: (response: ApiEnvelope<never>) => {
        authLog("warn", "logout trigger: logout mutation");
        setAccessToken(null);
        broadcastAuthEvent("logout");
        return response;
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        rememberRedirectAfterLogin();
        try {
          await queryFulfilled;
          dispatch(clearAuthState());
        } catch {
          // Keep the existing session state when a logout request fails.
        }
      },
      invalidatesTags: ["Auth", "User", "Tenant", "Dashboard"]
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useMeQuery,
  useRefreshMutation,
  useLogoutMutation
} = authApi;
