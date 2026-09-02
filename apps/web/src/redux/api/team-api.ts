import { baseApi } from "@/redux/api/base-api";

export type StoreMember = {
  _id: string;
  storeId: string;
  tenantId: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    lastLoginAt?: string;
    status: string;
  } | null;
  email: string;
  name?: string;
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
  permissions: string[];
  status: "active" | "invited" | "suspended" | "revoked";
  invitedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoreMemberPermissions = {
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
  permissions: string[];
  isOwner: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type InviteMemberPayload = {
  storeId: string;
  email: string;
  name?: string;
  role: "admin" | "manager" | "staff" | "viewer";
  permissions?: string[];
};

export type UpdateMemberPayload = {
  storeId: string;
  memberId: string;
  role?: "admin" | "manager" | "staff" | "viewer";
  permissions?: string[];
};

export type UpdateMemberStatusPayload = {
  storeId: string;
  memberId: string;
  status: "active" | "suspended" | "revoked";
};

export const teamApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyStorePermissions: builder.query<ApiEnvelope<StoreMemberPermissions>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/members/me/permissions`,
      }),
      providesTags: (_res, _err, storeId) => [{ type: "Members", id: `me-${storeId}` }],
    }),

    getStoreMembers: builder.query<ApiEnvelope<{ members: StoreMember[] }>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/members`,
      }),
      providesTags: (result, _err, storeId) =>
        result?.data?.members
          ? [
              ...result.data.members.map((m) => ({ type: "Members" as const, id: m._id })),
              { type: "Members", id: `LIST-${storeId}` },
            ]
          : [{ type: "Members", id: `LIST-${storeId}` }],
    }),

    inviteMember: builder.mutation<ApiEnvelope<{ ok: boolean; message: string; status: string }>, InviteMemberPayload>({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Members", id: `LIST-${storeId}` }],
    }),

    updateMember: builder.mutation<ApiEnvelope<{ member: StoreMember }>, UpdateMemberPayload>({
      query: ({ storeId, memberId, ...body }) => ({
        url: `/stores/${storeId}/members/${memberId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { storeId, memberId }) => [
        { type: "Members", id: memberId },
        { type: "Members", id: `LIST-${storeId}` },
        { type: "Members", id: `me-${storeId}` },
      ],
    }),

    updateMemberStatus: builder.mutation<ApiEnvelope<{ member: StoreMember }>, UpdateMemberStatusPayload>({
      query: ({ storeId, memberId, status }) => ({
        url: `/stores/${storeId}/members/${memberId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { storeId, memberId }) => [
        { type: "Members", id: memberId },
        { type: "Members", id: `LIST-${storeId}` },
        { type: "Members", id: `me-${storeId}` },
      ],
    }),

    removeMember: builder.mutation<ApiEnvelope<{ ok: boolean }>, { storeId: string; memberId: string }>({
      query: ({ storeId, memberId }) => ({
        url: `/stores/${storeId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { storeId, memberId }) => [
        { type: "Members", id: memberId },
        { type: "Members", id: `LIST-${storeId}` },
      ],
    }),

    resendInvite: builder.mutation<ApiEnvelope<{ ok: boolean; message: string }>, { storeId: string; memberId: string }>({
      query: ({ storeId, memberId }) => ({
        url: `/stores/${storeId}/members/${memberId}/resend`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Members", id: `LIST-${storeId}` }],
    }),
  }),
});

export const {
  useGetMyStorePermissionsQuery,
  useGetStoreMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useUpdateMemberStatusMutation,
  useRemoveMemberMutation,
  useResendInviteMutation,
} = teamApi;
