import { baseApi } from "@/redux/api/base-api";
import { setAccessToken } from "@/lib/access-token";

export type UserPreferences = {
  theme: "light" | "dark" | "system";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  emailNotifications: boolean;
  browserNotifications: boolean;
  marketingEmails: boolean;
};

export type UserProfile = {
  id: string; name: string; username: string; email: string; phone: string; company: string;
  storeName: string; country: string; timezone: string; language: string; bio: string; avatarUrl: string;
  role: string; tenantId: string; lastLoginAt: string | null; passwordChangedAt: string | null; createdAt: string;
  preferences: UserPreferences;
};

export type LoginSession = {
  id: string; browser: string; device: string; userAgent: string; ipAddress: string; location: string;
  createdAt: string; expiresAt: string; current: boolean;
};

export type ProfileActivity = {
  id: string; action: string; description: string; module: string; browser: string; device: string;
  ipAddress: string; location: string; createdAt: string; status: string;
};

type Envelope<T> = { success: boolean; data?: T; message?: string };
type Pagination = { page: number; limit: number; total: number; pages: number };

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Envelope<{ profile: UserProfile }>, void>({
      query: () => ({ url: "/profile" }),
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<Envelope<{ profile: UserProfile }>, Omit<UserProfile, "id" | "avatarUrl" | "role" | "tenantId" | "lastLoginAt" | "passwordChangedAt" | "createdAt">>({
      query: (body) => ({ url: "/profile", method: "PATCH", body }),
      invalidatesTags: ["User", "Auth"],
    }),
    uploadAvatar: builder.mutation<Envelope<{ profile: UserProfile }>, FormData>({
      query: (body) => ({ url: "/profile/avatar", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    removeAvatar: builder.mutation<Envelope<{ profile: UserProfile }>, void>({
      query: () => ({ url: "/profile/avatar", method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<Envelope<{ accessToken: string }>, { currentPassword: string; newPassword: string; confirmPassword: string }>({
      query: (body) => ({ url: "/profile/change-password", method: "POST", body }),
      transformResponse: (response: Envelope<{ accessToken: string }>) => {
        if (response.data?.accessToken) setAccessToken(response.data.accessToken);
        return response;
      },
      invalidatesTags: ["User", "Auth"],
    }),
    getSessions: builder.query<Envelope<{ sessions: LoginSession[] }>, void>({
      query: () => ({ url: "/profile/sessions" }),
      providesTags: ["Auth"],
    }),
    logoutCurrentSession: builder.mutation<Envelope<never>, void>({
      query: () => ({ url: "/profile/sessions/current", method: "DELETE" }),
      transformResponse: (response: Envelope<never>) => { setAccessToken(null); return response; },
      invalidatesTags: ["Auth"],
    }),
    logoutAllSessions: builder.mutation<Envelope<never>, void>({
      query: () => ({ url: "/profile/sessions", method: "DELETE" }),
      transformResponse: (response: Envelope<never>) => { setAccessToken(null); return response; },
      invalidatesTags: ["Auth"],
    }),
    getProfileActivity: builder.query<Envelope<{ activities: ProfileActivity[]; pagination: Pagination }>, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/profile/activity", params }),
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation, useRemoveAvatarMutation,
  useChangePasswordMutation, useGetSessionsQuery, useLogoutCurrentSessionMutation, useLogoutAllSessionsMutation,
  useGetProfileActivityQuery } = profileApi;
