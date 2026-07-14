import { baseApi } from "@/redux/api/base-api";

export type Navigation = {
  _id: string;
  storeId: string;
  key: "primary" | "footer" | "mobile" | "top_bar" | "account" | "sidebar";
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  items?: MenuItemTree[];
  createdAt: string;
  updatedAt: string;
};

export type MenuItem = {
  _id: string;
  navigationId: string;
  storeId: string;
  parentId?: string | null;
  title: string;
  link?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  linkType?: "custom" | "page" | "collection" | "category" | "product" | "external";
  referenceId?: string;
  target?: "_self" | "_blank";
  isExternal?: boolean;
  openInNewTab?: boolean;
  authRequired?: boolean;
  isVisible?: boolean;
  sortOrder: number;
  level: number;
  cssClass?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type MenuItemTree = MenuItem & {
  children?: MenuItemTree[];
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const navigationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Navigations ─────────────────────────────────────────────────────────
    getStoreNavigations: builder.query<
      ApiEnvelope<{ navigations: Navigation[] }>,
      string
    >({
      query: (storeId) => ({ url: `/navigation/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Navigations", id: storeId }],
    }),

    getNavigation: builder.query<ApiEnvelope<{ navigation: Navigation }>, string>({
      query: (id) => ({ url: `/navigation/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Navigation", id }],
    }),

    updateNavigation: builder.mutation<
      ApiEnvelope<{ navigation: Navigation }>,
      { id: string; storeId: string; label?: string; isActive?: boolean }
    >({
      query: ({ id, storeId, ...data }) => ({ url: `/navigation/${id}`, method: "PUT", body: { storeId, ...data } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Navigation", id }, { type: "Navigations" }],
    }),

    // ─── Menu Items ──────────────────────────────────────────────────────────
    addMenuItem: builder.mutation<
      ApiEnvelope<{ item: MenuItem }>,
      {
        navigationId: string;
        storeId: string;
        title: string;
        link?: string;
        linkType?: string;
        parentId?: string;
        icon?: string;
        badge?: string;
        target?: string;
        isExternal?: boolean;
        openInNewTab?: boolean;
        authRequired?: boolean;
        referenceId?: string;
      }
    >({
      query: ({ navigationId, ...body }) => ({
        url: `/navigation/${navigationId}/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { navigationId }) => [{ type: "Navigation", id: navigationId }, { type: "Navigations" }],
    }),

    updateMenuItem: builder.mutation<
      ApiEnvelope<{ item: MenuItem }>,
      { itemId: string; storeId: string; data: Record<string, unknown> }
    >({
      query: ({ itemId, storeId, data }) => ({
        url: `/navigation/items/${itemId}`,
        method: "PUT",
        body: { storeId, ...data },
      }),
      invalidatesTags: ["Navigations"],
    }),

    deleteMenuItem: builder.mutation<
      ApiEnvelope<never>,
      { itemId: string; storeId: string }
    >({
      query: ({ itemId, storeId }) => ({
        url: `/navigation/items/${itemId}?storeId=${storeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Navigations"],
    }),

    reorderMenuItems: builder.mutation<
      ApiEnvelope<never>,
      { navigationId: string; storeId: string; orderedIds: string[] }
    >({
      query: ({ navigationId, storeId, orderedIds }) => ({
        url: `/navigation/${navigationId}/items/reorder`,
        method: "PUT",
        body: { storeId, orderedIds },
      }),
      invalidatesTags: (_r, _e, { navigationId }) => [{ type: "Navigation", id: navigationId }, { type: "Navigations" }],
    }),
  }),
});

export const {
  useGetStoreNavigationsQuery,
  useGetNavigationQuery,
  useUpdateNavigationMutation,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useReorderMenuItemsMutation,
} = navigationApi;
