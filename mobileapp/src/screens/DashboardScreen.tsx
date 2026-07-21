import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useApp } from "../context/AppContext";
import { AppButton, Badge, Card, EmptyState, Icon, Screen, SectionHeader, Skeleton } from "../components/ui";
import { radius, useTheme, useThemedStyles, type AppTheme } from "../theme";
import { formatMoney, sentence } from "../lib/format";
import { apiRequest } from "../lib/api";
import type { ApiEnvelope, ScreenName, Store } from "../types/domain";

export function DashboardScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { currentStore, products, orders, orderAnalytics, refreshing, refresh, navigate } = useApp();
  const { width } = useWindowDimensions();
  if (!currentStore) return <WorkspaceDashboard />;
  const compact = width < 380;
  const quickActions: Array<{ label: string; screen: ScreenName; icon: keyof typeof import("../components/ui").glyphs; color: string }> = [
    { label: "Add product", screen: "product-form", icon: "add", color: theme.colors.primary }, { label: "View orders", screen: "orders", icon: "orders", color: theme.colors.violet },
    { label: "Inventory", screen: "inventory", icon: "inventory", color: theme.colors.warning }, { label: "Store theme", screen: "theme", icon: "theme", color: theme.colors.success },
  ];
  const revenue = orderAnalytics?.totalRevenue ?? currentStore?.revenueBDT ?? 0;
  const stats = [
    { label: "Revenue", value: formatMoney(revenue), icon: "↗", color: theme.colors.primary },
    { label: "Orders", value: String(orderAnalytics?.totalOrders ?? currentStore?.orderCount ?? orders.length), icon: "▤", color: theme.colors.violet },
    { label: "Products", value: String(currentStore?.productCount ?? products.length), icon: "▣", color: theme.colors.warning },
    { label: "Conversion", value: `${currentStore?.productCount ? (((currentStore.orderCount ?? 0) / currentStore.productCount) * 100).toFixed(1) : "0"}%`, icon: "◎", color: theme.colors.success },
  ];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.hero}>
        <View style={styles.heroTop}><View style={{ flex: 1 }}><Text style={styles.kicker}>GOOD {new Date().getHours() < 12 ? "MORNING" : "AFTERNOON"}</Text><Text style={styles.heroTitle}>{currentStore?.shortName || currentStore?.name || "Your store"}</Text><Text style={styles.heroSubtitle}>Here’s what’s happening with your store today.</Text></View><Pressable onPress={() => navigate("stores")} style={styles.storeMark}><Text style={styles.storeMarkText}>{(currentStore?.shortName || currentStore?.name || "B").slice(0, 2).toUpperCase()}</Text></Pressable></View>
        <View style={styles.trialRow}><View style={styles.liveDot} /><Text style={styles.trialText}>{currentStore?.published ? "Store is live" : "Store is not published"}</Text><Badge tone="primary" label={currentStore?.plan || "Starter"} /></View>
      </View>

      <View style={styles.statGrid}>{stats.map((stat) => <Card key={stat.label} style={[styles.statCard, { width: compact ? "100%" : "48%" }]}><View style={[styles.statIcon, { backgroundColor: `${stat.color}14` }]}><Text style={{ color: stat.color, fontWeight: "900", fontSize: 18 }}>{stat.icon}</Text></View><Text style={styles.statLabel}>{stat.label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{stat.value}</Text></Card>)}</View>

      <SectionHeader title="Quick actions" />
      <View style={styles.quickGrid}>{quickActions.map((item) => <Pressable key={item.label} onPress={() => navigate(item.screen)} style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.65 }]}><View style={[styles.quickIcon, { backgroundColor: `${item.color}12` }]}><Icon name={item.icon} color={item.color} size={22} /></View><Text style={styles.quickLabel}>{item.label}</Text><Icon name="chevron" color={theme.colors.textSoft} size={19} /></Pressable>)}</View>

      <SectionHeader title="Recent orders" action="See all" onAction={() => navigate("orders")} />
      <Card style={styles.listCard}>{orders.slice(0, 3).map((order, index) => <Pressable key={order._id} onPress={() => navigate("order-detail", { orderId: order._id })} style={[styles.orderRow, index > 0 && styles.rowBorder]}><View style={styles.orderIcon}><Text style={styles.orderIconText}>▤</Text></View><View style={{ flex: 1 }}><Text style={styles.orderNumber}>#{order.orderNumber}</Text><Text numberOfLines={1} style={styles.orderCustomer}>{order.customerId?.name || "Guest customer"} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</Text></View><View style={styles.orderEnd}><Text style={styles.orderTotal}>{formatMoney(order.total, order.currencyCode || "BDT")}</Text><Text style={[styles.orderStatus, { color: order.status === "delivered" ? theme.colors.success : order.status === "pending" ? theme.colors.warning : theme.colors.primary }]}>{sentence(order.status)}</Text></View></Pressable>)}</Card>
    </Screen>
  );
}

type WorkspaceStatus = "trial" | "pending_payment" | "pending_approval" | "active" | "expired" | "suspended" | "archived" | "draft";

function workspaceStatus(store: Store): WorkspaceStatus {
  if (["archived", "suspended", "expired", "pending_payment", "pending_approval"].includes(store.status)) return store.status as WorkspaceStatus;
  if (store.billingStatus === "trial" || store.subscriptionStatus === "trialing") return store.trialEndsAt && new Date(store.trialEndsAt).getTime() < Date.now() ? "expired" : "trial";
  if (store.billingStatus === "past_due") return "pending_payment";
  if (store.billingStatus === "cancelled" || store.subscriptionStatus === "cancelled") return "expired";
  if (store.billingStatus === "active" || store.subscriptionStatus === "active" || store.status === "active") return "active";
  return "draft";
}

function statusTone(status: WorkspaceStatus): "success" | "warning" | "danger" | "primary" | "neutral" {
  if (status === "active") return "success";
  if (status === "trial") return "primary";
  if (["expired", "suspended"].includes(status)) return "danger";
  if (["pending_payment", "pending_approval"].includes(status)) return "warning";
  return "neutral";
}

function WorkspaceDashboard() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { stores, user, refreshing, refresh, selectStore, navigate } = useApp();
  const [visitors, setVisitors] = useState<Record<string, number> | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const primaryStoreId = stores[0]?._id;
  useEffect(() => {
    if (!primaryStoreId) { setVisitors(null); return; }
    setVisitorLoading(true);
    apiRequest<ApiEnvelope<Record<string, number>>>(`/analytics/${primaryStoreId}/stats`).then((result) => setVisitors(result.data ?? {})).catch(() => setVisitors(null)).finally(() => setVisitorLoading(false));
  }, [primaryStoreId, refreshing]);
  const metrics = useMemo(() => stores.reduce((result, store) => {
    const status = workspaceStatus(store);
    if (status === "active") result.active += 1;
    if (status === "trial") result.trial += 1;
    if (status === "pending_approval") result.pending += 1;
    if (status === "expired" || status === "pending_payment") result.expired += 1;
    result.revenue += store.revenueBDT ?? 0;
    result.orders += store.orderCount ?? 0;
    return result;
  }, { active: 0, trial: 0, pending: 0, expired: 0, revenue: 0, orders: 0 }), [stores]);
  const recentStores = useMemo(() => [...stores].sort((a, b) => +new Date(b.updatedAt || b.createdAt) - +new Date(a.updatedAt || a.createdAt)).slice(0, 5), [stores]);
  const statusStats = [{ label: "Active Stores", value: metrics.active, color: theme.colors.success }, { label: "Trial Stores", value: metrics.trial, color: theme.colors.primary }, { label: "Pending Approval", value: metrics.pending, color: theme.colors.violet }, { label: "Expired Stores", value: metrics.expired, color: theme.colors.danger }];
  const visitorStats = [{ label: "Visitors Today", value: visitors?.today ?? 0 }, { label: "This Week", value: visitors?.week ?? 0 }, { label: "This Month", value: visitors?.month ?? 0 }, { label: "Live Now", value: visitors?.liveVisitors ?? 0 }];
  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <View style={styles.workspaceHero}><View style={{ flex: 1 }}><Text style={styles.kicker}>WORKSPACE DASHBOARD</Text><Text style={styles.workspaceTitle}>Welcome, {user?.name?.split(" ")[0] || "there"}</Text><Text style={styles.workspaceSubtitle}>Overview of your stores, revenue, and workspace activity.</Text></View><AppButton compact title="Stores" onPress={() => navigate("stores")} /></View>
    <View style={styles.statGrid}>{statusStats.map((stat) => <Card key={stat.label} style={[styles.statCard, { width: "48%" }]}><View style={[styles.statIcon, { backgroundColor: `${stat.color}14` }]}><Icon name="store" color={stat.color} /></View><Text style={styles.statLabel}>{stat.label}</Text><Text style={styles.statValue}>{stat.value}</Text></Card>)}</View>
    <View style={styles.statGrid}><Card style={[styles.statCard, { width: "48%" }]}><Text style={styles.statLabel}>Total Revenue</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.workspaceMetric}>{formatMoney(metrics.revenue)}</Text></Card><Card style={[styles.statCard, { width: "48%" }]}><Text style={styles.statLabel}>Total Orders</Text><Text style={styles.workspaceMetric}>{metrics.orders}</Text></Card><Card style={[styles.statCard, { width: "48%" }]}><Text style={styles.statLabel}>Storage Usage</Text><Text style={styles.workspaceMetric}>—</Text><Text style={styles.metricHint}>Coming in Phase 4</Text></Card><Card style={[styles.statCard, { width: "48%" }]}><Text style={styles.statLabel}>Subscription Status</Text><Text style={styles.workspaceMetric}>{stores.length ? `${metrics.active + metrics.trial} active` : "No stores"}</Text></Card></View>
    <SectionHeader title="Visitor analytics" />
    <View style={styles.visitorGrid}>{visitorStats.map((stat) => <Pressable key={stat.label} onPress={() => primaryStoreId && selectStore(stores[0])} style={styles.visitorCard}><Text style={styles.visitorLabel}>{stat.label}</Text>{visitorLoading ? <Skeleton width="45%" height={22} /> : <Text style={styles.visitorValue}>{stat.value}</Text>}</Pressable>)}</View>
    <SectionHeader title="Recent stores" action="View all" onAction={() => navigate("stores")} />
    {recentStores.length ? <Card style={styles.workspaceList}>{recentStores.map((store, index) => { const status = workspaceStatus(store); return <Pressable key={store._id} onPress={() => selectStore(store)} style={[styles.workspaceStore, index > 0 && styles.rowBorder]}><View style={[styles.workspaceStoreIcon, { backgroundColor: store.brandColor || theme.colors.primary }]}><Text style={styles.storeMarkText}>{store.name.slice(0, 2).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.workspaceStoreName}>{store.name}</Text><Text style={styles.workspaceStoreSlug}>{store.slug || store.subdomain}</Text></View><Badge label={sentence(status)} tone={statusTone(status)} /><Icon name="chevron" color={theme.colors.textSoft} /></Pressable>; })}</Card> : <Card><EmptyState title="No stores yet" message="Create your first store to get started." action="Create store" onAction={() => navigate("stores")} /></Card>}
    <SectionHeader title="Recent activity" />
    <Card style={styles.workspaceList}>{recentStores.length ? recentStores.map((store, index) => <View key={store._id} style={[styles.activityRow, index > 0 && styles.rowBorder]}><View style={{ flex: 1 }}><Text style={styles.workspaceStoreName}>{store.name}</Text><Text style={styles.workspaceStoreSlug}>Store updated · {new Date(store.updatedAt || store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text></View><Text style={styles.activityRevenue}>{formatMoney(store.revenueBDT ?? 0)}</Text></View>) : <Text style={styles.emptyActivity}>No activity yet.</Text>}</Card>
    <SectionHeader title="Quick actions" />
    <View style={styles.quickGrid}><Pressable onPress={() => navigate("stores")} style={styles.quickCard}><View style={styles.quickIcon}><Icon name="add" color={theme.colors.primary} /></View><Text style={styles.quickLabel}>Create or manage stores</Text><Icon name="chevron" color={theme.colors.iconMuted} /></Pressable><Pressable onPress={() => navigate("billing")} style={styles.quickCard}><View style={styles.quickIcon}><Icon name="billing" color={theme.colors.primary} /></View><Text style={styles.quickLabel}>Manage billing</Text><Icon name="chevron" color={theme.colors.iconMuted} /></Pressable></View>
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  hero: { borderRadius: radius.xl, backgroundColor: theme.colors.hero, padding: 20, gap: 18, overflow: "hidden" }, heroTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" }, kicker: { color: theme.colors.textSoft, fontSize: 9, letterSpacing: 1.2, fontWeight: "800" }, heroTitle: { color: theme.colors.heroText, fontSize: 25, fontWeight: "900", marginTop: 5 }, heroSubtitle: { color: theme.colors.heroMuted, fontSize: 12, lineHeight: 18, marginTop: 5 }, storeMark: { width: 48, height: 48, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" }, storeMarkText: { color: theme.colors.textInverse, fontWeight: "900", fontSize: 13 }, trialRow: { borderTopWidth: 1, borderTopColor: theme.colors.heroBorder, paddingTop: 15, flexDirection: "row", alignItems: "center", gap: 8 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.success }, trialText: { flex: 1, color: theme.colors.heroMuted, fontSize: 12, fontWeight: "600" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }, statCard: { minHeight: 130, padding: 15 }, statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 12 }, statLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "600" }, statValue: { color: theme.colors.text, fontSize: 21, fontWeight: "900", marginTop: 3 },
  quickGrid: { gap: 10 }, quickCard: { minHeight: 66, borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.md, backgroundColor: theme.colors.surface, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }, quickIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, quickLabel: { flex: 1, color: theme.colors.text, fontWeight: "700", fontSize: 13 },
  listCard: { paddingVertical: 2, paddingHorizontal: 15 }, orderRow: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 11 }, rowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border }, orderIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, orderIconText: { color: theme.colors.primary, fontSize: 17, fontWeight: "800" }, orderNumber: { color: theme.colors.text, fontWeight: "800", fontSize: 12 }, orderCustomer: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 }, orderEnd: { alignItems: "flex-end", gap: 4 }, orderTotal: { color: theme.colors.text, fontSize: 12, fontWeight: "800" }, orderStatus: { fontSize: 9, fontWeight: "700" },
  workspaceHero: { flexDirection: "row", alignItems: "center", gap: 12 }, workspaceTitle: { color: theme.colors.text, fontSize: 24, fontWeight: "900", marginTop: 5 }, workspaceSubtitle: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 }, workspaceMetric: { color: theme.colors.text, fontSize: 20, fontWeight: "900", marginTop: 10 }, metricHint: { color: theme.colors.textSoft, fontSize: 8, marginTop: 3 }, visitorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, visitorCard: { width: "48%", minHeight: 82, padding: 13, borderWidth: 1, borderColor: theme.colors.infoBorder, borderRadius: radius.md, backgroundColor: theme.colors.infoSoft, justifyContent: "space-between" }, visitorLabel: { color: theme.colors.info, fontSize: 9, fontWeight: "800", textTransform: "uppercase" }, visitorValue: { color: theme.colors.primaryDark, fontSize: 21, fontWeight: "900" }, workspaceList: { paddingVertical: 2, paddingHorizontal: 14 }, workspaceStore: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 10 }, workspaceStoreIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }, workspaceStoreName: { color: theme.colors.text, fontSize: 12, fontWeight: "800" }, workspaceStoreSlug: { color: theme.colors.textMuted, fontSize: 9, marginTop: 4 }, activityRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10 }, activityRevenue: { color: theme.colors.text, fontSize: 11, fontWeight: "800" }, emptyActivity: { color: theme.colors.textMuted, textAlign: "center", paddingVertical: 30 },
});
