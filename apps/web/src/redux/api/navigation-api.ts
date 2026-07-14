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

export type HeaderSettings = {
  sticky?: boolean;
  transparent?: boolean;
  height?: string;
  background?: string;
  borderColor?: string;
  shadow?: string;
  padding?: string;
  desktopLayout?: string;
  mobileLayout?: string;
  showSearch?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  showLanguageSwitcher?: boolean;
  showCurrencySwitcher?: boolean;
  announcementBar?: string;
  topBar?: string;
};

export type FooterSettings = {
  columns?: number;
  showNewsletter?: boolean;
  showSocial?: boolean;
  showPaymentIcons?: boolean;
  showCopyright?: boolean;
  copyright?: string;
  background?: string;
  textColor?: string;
  padding?: string;
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

    // ─── Available pages for navigation linking ───────────────────────────────
    getAvailableNavPages: builder.query<
      ApiEnvelope<{ pages: Array<{ _id: string; title: string; slug: string; pageType: string; isSystem: boolean }> }>,
      string
    >({
      query: (storeId) => ({ url: `/navigation/stores/${storeId}/available-pages` }),
      providesTags: (_r, _e, storeId) => [{ type: "StorePages", id: `nav-available-${storeId}` }],
    }),

    // ─── Check page usage in navigation ───────────────────────────────────────
    checkPageNavigationUsage: builder.query<
      ApiEnvelope<{ usedIn: Array<{ navigationId: string; navigationLabel: string; menuItemLabel: string }> }>,
      { storeId: string; pageSlug: string }
    >({
      query: ({ storeId, pageSlug }) => ({
        url: `/navigation/pages/${storeId}/usage?slug=${encodeURIComponent(pageSlug)}`,
      }),
    }),

    // ─── Header Settings ─────────────────────────────────────────────────────
    getHeaderSettings: builder.query<
      ApiEnvelope<{ settings: HeaderSettings }>,
      string
    >({
      query: (storeId) => ({ url: `/navigation/header-settings/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Navigation", id: `header-${storeId}` }],
    }),

    updateHeaderSettings: builder.mutation<
      ApiEnvelope<{ settings: HeaderSettings }>,
      { storeId: string; data: HeaderSettings }
    >({
      query: ({ storeId, data }) => ({
        url: `/navigation/header-settings/${storeId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Navigation", id: `header-${storeId}` }],
    }),

    // ─── Footer Settings ─────────────────────────────────────────────────────
    getFooterSettings: builder.query<
      ApiEnvelope<{ settings: FooterSettings }>,
      string
    >({
      query: (storeId) => ({ url: `/navigation/footer-settings/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Navigation", id: `footer-${storeId}` }],
    }),

    updateFooterSettings: builder.mutation<
      ApiEnvelope<{ settings: FooterSettings }>,
      { storeId: string; data: FooterSettings }
    >({
      query: ({ storeId, data }) => ({
        url: `/navigation/footer-settings/${storeId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Navigation", id: `footer-${storeId}` }],
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
  useGetAvailableNavPagesQuery,
  useCheckPageNavigationUsageQuery,
  useGetHeaderSettingsQuery,
  useUpdateHeaderSettingsMutation,
  useGetFooterSettingsQuery,
  useUpdateFooterSettingsMutation,
} = navigationApi;
