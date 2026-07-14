import { connectDatabase } from "../../common/database/connection.js";
import { NavigationModel } from "./navigation.model.js";
import { MenuItemModel } from "./menu-item.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { StoreModel } from "../../models/store.model.js";

const NAVIGATION_KEYS = ["primary", "footer", "mobile", "top_bar", "account", "sidebar"] as const;
const NAVIGATION_LABELS: Record<string, string> = {
  primary: "Primary Navigation",
  footer: "Footer Navigation",
  mobile: "Mobile Navigation",
  top_bar: "Top Bar Navigation",
  account: "Account Navigation",
  sidebar: "Sidebar Navigation",
};

// ─── Ensure default navigations for a store ──────────────────────────────────

export async function ensureDefaultNavigations(storeId: string) {
  await connectDatabase();

  const results: Array<Record<string, unknown>> = [];
  for (const key of NAVIGATION_KEYS) {
    const nav = await NavigationModel.findOneAndUpdate(
      { storeId, key },
      {
        $setOnInsert: {
          storeId,
          key,
          label: NAVIGATION_LABELS[key] ?? key,
          isActive: key === "primary" || key === "footer" || key === "mobile",
          sortOrder: NAVIGATION_KEYS.indexOf(key),
        },
      },
      { new: true, upsert: true }
    ).lean();
    results.push(nav as Record<string, unknown>);
  }

  return results;
}

// ─── List all navigations for a store ────────────────────────────────────────

export async function listNavigations(storeId: string) {
  await connectDatabase();
  await ensureDefaultNavigations(storeId);

  const navigations = await NavigationModel.find({ storeId })
    .sort({ sortOrder: 1 })
    .lean();

  const result = await Promise.all(
    navigations.map(async (nav) => {
      const items = await MenuItemModel.find({ navigationId: nav._id })
        .sort({ sortOrder: 1 })
        .lean();
      const tree = buildMenuItemTree(items as any[]);
      return { ...nav, items: tree };
    })
  );

  return { ok: true as const, data: { navigations: result } };
}

function buildMenuItemTree(items: Array<Record<string, unknown>>) {
  const map = new Map<string, Record<string, unknown> & { children: typeof items }>();
  const roots: typeof items = [];

  items.forEach((item) => {
    map.set(String(item._id), { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = map.get(String(item._id))!;
    const parentId = item.parentId ? String(item.parentId) : null;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// ─── Get single navigation ───────────────────────────────────────────────────

export async function getNavigation(navigationId: string) {
  await connectDatabase();
  const navigation = await NavigationModel.findById(navigationId).lean();
  if (!navigation) return { ok: false as const, message: "Navigation not found" };

  const items = await MenuItemModel.find({ navigationId })
    .sort({ sortOrder: 1 })
    .lean();
  const tree = buildMenuItemTree(items as any[]);

  return { ok: true as const, data: { navigation: { ...navigation, items: tree } } };
}

// ─── Update navigation ───────────────────────────────────────────────────────

export async function updateNavigation(
  navigationId: string,
  storeId: string,
  payload: { label?: string; isActive?: boolean }
) {
  await connectDatabase();
  const navigation = await NavigationModel.findOneAndUpdate(
    { _id: navigationId, storeId },
    { $set: payload },
    { new: true }
  ).lean();
  if (!navigation) return { ok: false as const, message: "Navigation not found" };
  return { ok: true as const, data: { navigation } };
}

// ─── Add menu item ───────────────────────────────────────────────────────────

export async function addMenuItem(
  navigationId: string,
  storeId: string,
  payload: {
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
) {
  await connectDatabase();
  const navigation = await NavigationModel.findOne({ _id: navigationId, storeId });
  if (!navigation) return { ok: false as const, message: "Navigation not found" };

  const count = await MenuItemModel.countDocuments({ navigationId });

  let level = 0;
  if (payload.parentId) {
    const parent = await MenuItemModel.findById(payload.parentId);
    if (parent) {
      level = (parent.level ?? 0) + 1;
    }
  }

  const item = await MenuItemModel.create({
    navigationId,
    storeId,
    title: payload.title,
    link: payload.link ?? "",
    linkType: payload.linkType ?? "custom",
    parentId: payload.parentId ?? null,
    icon: payload.icon ?? "",
    badge: payload.badge ?? "",
    target: payload.target ?? "_self",
    isExternal: payload.isExternal ?? false,
    openInNewTab: payload.openInNewTab ?? false,
    authRequired: payload.authRequired ?? false,
    referenceId: payload.referenceId ?? "",
    sortOrder: count,
    level,
  });

  return { ok: true as const, data: { item: item.toObject() } };
}

// ─── Update menu item ────────────────────────────────────────────────────────

export async function updateMenuItem(
  itemId: string,
  storeId: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const update: Record<string, unknown> = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.link !== undefined) update.link = payload.link;
  if (payload.linkType !== undefined) update.linkType = payload.linkType;
  if (payload.parentId !== undefined) update.parentId = payload.parentId === "" ? null : payload.parentId;
  if (payload.icon !== undefined) update.icon = payload.icon;
  if (payload.badge !== undefined) update.badge = payload.badge;
  if (payload.badgeColor !== undefined) update.badgeColor = payload.badgeColor;
  if (payload.target !== undefined) update.target = payload.target;
  if (payload.isExternal !== undefined) update.isExternal = payload.isExternal;
  if (payload.openInNewTab !== undefined) update.openInNewTab = payload.openInNewTab;
  if (payload.noFollow !== undefined) update.noFollow = payload.noFollow;
  if (payload.authRequired !== undefined) update.authRequired = payload.authRequired;
  if (payload.isVisible !== undefined) update.isVisible = payload.isVisible;
  if (payload.hideOnDesktop !== undefined) update.hideOnDesktop = payload.hideOnDesktop;
  if (payload.hideOnMobile !== undefined) update.hideOnMobile = payload.hideOnMobile;
  if (payload.sortOrder !== undefined) update.sortOrder = payload.sortOrder;
  if (payload.referenceId !== undefined) update.referenceId = payload.referenceId;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.cssClass !== undefined) update.cssClass = payload.cssClass;

  const item = await MenuItemModel.findOneAndUpdate(
    { _id: itemId, storeId },
    { $set: update },
    { new: true }
  ).lean();
  if (!item) return { ok: false as const, message: "Menu item not found" };
  return { ok: true as const, data: { item } };
}

// ─── Delete menu item ────────────────────────────────────────────────────────

export async function deleteMenuItem(itemId: string, storeId: string) {
  await connectDatabase();
  const item = await MenuItemModel.findOneAndDelete({ _id: itemId, storeId }).lean();
  if (!item) return { ok: false as const, message: "Menu item not found" };

  await MenuItemModel.updateMany(
    { parentId: itemId, storeId },
    { $set: { parentId: null } }
  );

  return { ok: true as const, message: "Menu item deleted" };
}

// ─── Reorder menu items ──────────────────────────────────────────────────────

export async function reorderMenuItems(
  navigationId: string,
  storeId: string,
  orderedIds: string[]
) {
  await connectDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await MenuItemModel.updateOne(
      { _id: orderedIds[i], navigationId, storeId },
      { $set: { sortOrder: i } }
    );
  }
  return { ok: true as const, message: "Menu items reordered" };
}

// ─── Get available pages for navigation linking ───────────────────────────────

export async function getAvailableNavPages(storeId: string) {
  await connectDatabase();
  const pages = await StorePageModel.find({ storeId, deletedAt: null })
    .select("title slug pageType isSystem status")
    .sort({ sortOrder: 1 })
    .lean();
  return { ok: true as const, data: { pages } };
}

// ─── Check which navigations reference a given page slug ──────────────────────

export async function checkPageNavigationUsage(storeId: string, pageSlug: string) {
  await connectDatabase();
  const slug = pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`;

  const menuItems = await MenuItemModel.find({ storeId, link: slug })
    .select("navigationId title link")
    .lean();

  if (menuItems.length === 0) {
    return { ok: true as const, data: { usedIn: [] } };
  }

  const navIds = [...new Set(menuItems.map((m) => String(m.navigationId)))];
  const navigations = await NavigationModel.find({ _id: { $in: navIds } })
    .select("label key")
    .lean();
  const navMap = new Map(navigations.map((n) => [String(n._id), n.label || n.key]));

  const usedIn = menuItems.map((item) => ({
    navigationId: String(item.navigationId),
    navigationLabel: navMap.get(String(item.navigationId)) ?? "Unknown",
    menuItemId: String(item._id),
    menuItemLabel: item.title,
  }));

  return { ok: true as const, data: { usedIn } };
}

// ─── Header / Footer Settings ─────────────────────────────────────────────────

type HeaderSettingsPayload = {
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
  pageId?: string;
};

export async function getHeaderSettings(storeId: string, pageId?: string) {
  await connectDatabase();
  const query: Record<string, unknown> = { storeId, key: "header_settings" };
  if (pageId) query.pageId = pageId;

  const store = await StoreModel.findById(storeId).select("headerSettings").lean();
  const settings = (store as any)?.headerSettings ?? {};

  return { ok: true as const, data: { settings } };
}

export async function updateHeaderSettings(storeId: string, payload: HeaderSettingsPayload) {
  await connectDatabase();
  const { pageId, ...settings } = payload;

  await StoreModel.updateOne(
    { _id: storeId },
    { $set: { headerSettings: settings } }
  );

  return { ok: true as const, data: { settings } };
}

type FooterSettingsPayload = {
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

export async function getFooterSettings(storeId: string) {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).select("footerSettings").lean();
  const settings = (store as any)?.footerSettings ?? {};
  return { ok: true as const, data: { settings } };
}

export async function updateFooterSettings(storeId: string, payload: FooterSettingsPayload) {
  await connectDatabase();
  await StoreModel.updateOne(
    { _id: storeId },
    { $set: { footerSettings: payload } }
  );
  return { ok: true as const, data: { settings: payload } };
}
