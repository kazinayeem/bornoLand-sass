import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { Badge, Card, EmptyState, ErrorState, Icon, Screen, SearchBox, SectionHeader, Skeleton } from "../components/ui";
import { radius, useTheme, useThemedStyles, type AppTheme } from "../theme";
import { formatMoney, initials } from "../lib/format";
import { apiRequest } from "../lib/api";
import type { ApiEnvelope } from "../types/domain";

export function CategoriesScreen() {
  const styles = useThemedStyles(createStyles);
  const { categories, products, refreshing, refresh } = useApp();
  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <View style={styles.heading}><View><Text style={styles.title}>Product categories</Text><Text style={styles.subtitle}>Organize your storefront catalog.</Text></View></View>
    {categories.length ? categories.map((category) => { const count = products.filter((item) => item.category?.toLowerCase() === category.name.toLowerCase()).length; return <Card key={category._id} style={styles.category}><View style={styles.categoryIcon}><Text style={styles.categoryIconText}>{category.name[0]}</Text></View><View style={{ flex: 1 }}><Text style={styles.categoryName}>{category.name}</Text><Text style={styles.meta}>/{category.slug} · {count} products</Text></View><View style={styles.trailing}><Badge label={category.active ? "Active" : "Hidden"} tone={category.active ? "success" : "neutral"} />{category.featured ? <Text style={styles.featured}>Featured</Text> : null}</View></Card>; }) : <Card><EmptyState title="No categories yet" message="Create a category to help shoppers browse your catalog." /></Card>}
  </Screen>;
}

export function InventoryScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { products, navigate, refreshing, refresh } = useApp();
  const [query, setQuery] = useState("");
  const filtered = products.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(query.toLowerCase()));
  const low = products.filter((item) => (item.totalStock ?? item.stock) > 0 && (item.totalStock ?? item.stock) <= 5).length;
  const out = products.filter((item) => (item.totalStock ?? item.stock) <= 0).length;
  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <View><Text style={styles.title}>Inventory</Text><Text style={styles.subtitle}>Monitor stock levels and availability.</Text></View>
    <View style={styles.stats}><MiniStat label="Units in stock" value={String(products.reduce((sum, item) => sum + (item.totalStock ?? item.stock), 0))} tone="primary" /><MiniStat label="Low stock" value={String(low)} tone="warning" /><MiniStat label="Out of stock" value={String(out)} tone="danger" /></View>
    <SearchBox value={query} onChangeText={setQuery} placeholder="Search products or SKU" />
    <Card style={styles.table}>{filtered.map((product, index) => { const stock = product.totalStock ?? product.stock; return <Pressable key={product._id} onPress={() => navigate("product-form", { productId: product._id })} style={[styles.inventoryRow, index > 0 && styles.borderTop]}><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.rowTitle}>{product.name}</Text><Text style={styles.meta}>{product.sku || "No SKU"}</Text></View><View style={styles.stockCol}><Text style={[styles.stockNumber, stock <= 0 && { color: theme.colors.danger }, stock > 0 && stock <= 5 && { color: theme.colors.warning }]}>{stock}</Text><Text style={styles.stockLabel}>available</Text></View><Icon name="chevron" color={theme.colors.iconMuted} /></Pressable>; })}</Card>
  </Screen>;
}

export function CustomersScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { orders } = useApp(); const [query, setQuery] = useState("");
  const customers = useMemo(() => Array.from(new Map(orders.filter((order) => order.customerId).map((order) => [order.customerId!._id, order.customerId!])).values()).map((customer) => ({ ...customer, orders: orders.filter((order) => order.customerId?._id === customer._id), total: orders.filter((order) => order.customerId?._id === customer._id).reduce((sum, order) => sum + order.total, 0) })), [orders]);
  const filtered = customers.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(query.toLowerCase()));
  return <Screen>
    <View><Text style={styles.title}>Customers</Text><Text style={styles.subtitle}>{customers.length} people have ordered from this store.</Text></View><SearchBox value={query} onChangeText={setQuery} placeholder="Search customer name or email" />
    {filtered.length ? filtered.map((customer) => <Card key={customer._id} style={styles.customer}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(customer.name)}</Text></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{customer.name}</Text><Text numberOfLines={1} style={styles.meta}>{customer.email}</Text><Text style={styles.customerStats}>{customer.orders.length} order{customer.orders.length === 1 ? "" : "s"} · {formatMoney(customer.total)}</Text></View><Icon name="chevron" color={theme.colors.iconMuted} /></Card>) : <Card><EmptyState title="No customers found" message="Customer profiles are created when shoppers place orders." /></Card>}
  </Screen>;
}

export function AnalyticsScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { currentStore, orderAnalytics, orders, products } = useApp();
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [chart, setChart] = useState<Array<{ date: string; visitors: number; pageViews: number }>>([]);
  const [sources, setSources] = useState<Array<{ source: string; visits: number }>>([]);
  const [devices, setDevices] = useState<Array<{ name: string; count: number; percentage: number }>>([]);
  const [conversion, setConversion] = useState<Record<string, number>>({});
  const load = async () => {
    if (!currentStore) return;
    setLoading(true); setError("");
    try {
      const [statsResult, chartResult, sourceResult, deviceResult, conversionResult] = await Promise.all([
        apiRequest<ApiEnvelope<Record<string, number>>>(`/analytics/${currentStore._id}/stats`),
        apiRequest<ApiEnvelope<{ visitorsByDay: Array<{ date: string; visitors: number; pageViews: number }> }>>(`/analytics/${currentStore._id}/charts`),
        apiRequest<ApiEnvelope<Array<{ source: string; visits: number }>>>(`/analytics/${currentStore._id}/traffic-sources`),
        apiRequest<ApiEnvelope<{ devices: Array<{ name: string; count: number; percentage: number }> }>>(`/analytics/${currentStore._id}/devices`),
        apiRequest<ApiEnvelope<Record<string, number>>>(`/analytics/${currentStore._id}/conversion`),
      ]);
      setStats(statsResult.data ?? {}); setChart(chartResult.data?.visitorsByDay ?? []); setSources(sourceResult.data ?? []); setDevices(deviceResult.data?.devices ?? []); setConversion(conversionResult.data ?? {});
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load analytics."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [currentStore?._id]);
  const revenue = orderAnalytics?.totalRevenue ?? orders.reduce((sum, order) => sum + order.total, 0);
  const days = chart.slice(-12); const maxViews = Math.max(1, ...days.map((item) => item.pageViews));
  const totalVisits = Math.max(1, sources.reduce((sum, item) => sum + item.visits, 0));
  const channelColors = [theme.colors.chart1, theme.colors.chart2, theme.colors.chart4, theme.colors.chart5, theme.colors.danger];
  if (loading) return <Screen><Card style={{ gap: 14 }}><Skeleton height={24} width="52%" /><Skeleton height={110} /><Skeleton height={180} /></Card></Screen>;
  if (error && !Object.keys(stats).length) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  return <Screen>
    <View><Text style={styles.title}>Analytics overview</Text><Text style={styles.subtitle}>Store performance for the last 30 days.</Text></View>
    {error ? <ErrorState message={error} onRetry={load} /> : null}
    <View style={styles.analyticsGrid}><Metric label="Revenue" value={formatMoney(revenue)} /><Metric label="Orders" value={String(orderAnalytics?.totalOrders ?? orders.length)} /><Metric label="Visitors" value={String(stats.monthUnique ?? stats.uniqueVisitors ?? 0)} /><Metric label="Conversion" value={`${Number(conversion.conversionRate ?? 0).toFixed(1)}%`} /></View>
    <SectionHeader title="Visitor trend" />
    <Card>{days.length ? <View style={styles.bigChart}>{days.map((item, index) => <View key={`${item.date}-${index}`} style={[styles.bigBar, { height: Math.max(3, (item.pageViews / maxViews) * 120), backgroundColor: index === days.length - 1 ? theme.colors.chart1 : theme.colors.infoBorder }]} />)}</View> : <EmptyState title="No visitor history" message="Visitor activity will appear after storefront traffic is recorded." />}</Card>
    <SectionHeader title="Traffic sources" />
    <Card style={{ gap: 14 }}>{sources.length ? sources.slice(0, 8).map((source, index) => { const value = Math.round((source.visits / totalVisits) * 100); const color = channelColors[index % channelColors.length]; return <View key={`${source.source}-${index}`} style={styles.channel}><View style={[styles.channelDot, { backgroundColor: color }]} /><Text style={styles.channelLabel}>{source.source || "Direct"}</Text><View style={styles.progress}><View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} /></View><Text style={styles.channelValue}>{value}%</Text></View>; }) : <EmptyState title="No traffic sources" message="Traffic attribution will appear after visits are recorded." />}</Card>
    <SectionHeader title="Devices" />
    <Card style={{ gap: 12 }}>{devices.length ? devices.map((device) => <View key={device.name} style={styles.infoLine}><Text style={styles.channelLabel}>{device.name}</Text><Text style={styles.infoValue}>{device.count} · {device.percentage.toFixed(1)}%</Text></View>) : <EmptyState title="No device data" message="Device analytics will appear after visits are recorded." />}</Card>
    <SectionHeader title="Catalog health" />
    <Card style={styles.health}><View><Text style={styles.healthValue}>{products.filter((item) => item.status === "active").length}</Text><Text style={styles.healthLabel}>Active products</Text></View><View><Text style={styles.healthValue}>{products.filter((item) => (item.totalStock ?? item.stock) <= 5).length}</Text><Text style={styles.healthLabel}>Need attention</Text></View></Card>
  </Screen>;
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "primary" | "warning" | "danger" }) { const { theme } = useTheme(); const styles = useThemedStyles(createStyles); const color = tone === "primary" ? theme.colors.primary : tone === "warning" ? theme.colors.warning : theme.colors.danger; return <View style={styles.miniStat}><Text style={[styles.miniValue, { color }]}>{value}</Text><Text style={styles.miniLabel}>{label}</Text></View>; }
function Metric({ label, value }: { label: string; value: string }) { const styles = useThemedStyles(createStyles); return <Card style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text></Card>; }

const createStyles = (theme: AppTheme) => StyleSheet.create({
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, title: { color: theme.colors.text, fontSize: 20, fontWeight: "900" }, subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }, category: { flexDirection: "row", alignItems: "center", gap: 12 }, categoryIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, categoryIconText: { color: theme.colors.primary, fontSize: 18, fontWeight: "900" }, categoryName: { color: theme.colors.text, fontWeight: "800", fontSize: 13 }, meta: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 }, trailing: { alignItems: "flex-end", gap: 5 }, featured: { color: theme.colors.violet, fontSize: 9, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 8 }, miniStat: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.md, backgroundColor: theme.colors.surface, padding: 11 }, miniValue: { fontSize: 18, fontWeight: "900" }, miniLabel: { color: theme.colors.textMuted, fontSize: 8, marginTop: 4 }, table: { paddingVertical: 2 }, inventoryRow: { minHeight: 67, flexDirection: "row", alignItems: "center", gap: 10 }, borderTop: { borderTopWidth: 1, borderTopColor: theme.colors.border }, rowTitle: { color: theme.colors.text, fontSize: 12, fontWeight: "800" }, stockCol: { alignItems: "flex-end" }, stockNumber: { color: theme.colors.success, fontWeight: "900", fontSize: 15 }, stockLabel: { color: theme.colors.textSoft, fontSize: 8 },
  customer: { flexDirection: "row", alignItems: "center", gap: 12 }, avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.hero, alignItems: "center", justifyContent: "center" }, avatarText: { color: theme.colors.heroText, fontSize: 11, fontWeight: "900" }, customerStats: { color: theme.colors.primary, fontSize: 9, fontWeight: "700", marginTop: 6 },
  analyticsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }, metric: { width: "48%", minHeight: 96 }, metricLabel: { color: theme.colors.textMuted, fontSize: 10 }, metricValue: { color: theme.colors.text, fontSize: 19, fontWeight: "900", marginTop: 8 }, bigChart: { height: 132, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: theme.colors.border }, bigBar: { width: "5.2%", borderTopLeftRadius: 4, borderTopRightRadius: 4 }, channel: { flexDirection: "row", alignItems: "center", gap: 9 }, channelDot: { width: 8, height: 8, borderRadius: 4 }, channelLabel: { minWidth: 52, color: theme.colors.text, fontSize: 10, fontWeight: "600" }, progress: { flex: 1, height: 7, backgroundColor: theme.colors.progressTrack, borderRadius: 5, overflow: "hidden" }, progressFill: { height: 7, borderRadius: 5 }, channelValue: { width: 30, textAlign: "right", color: theme.colors.textMuted, fontSize: 10, fontWeight: "700" }, infoLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, infoValue: { color: theme.colors.textMuted, fontSize: 10, fontWeight: "700" }, health: { flexDirection: "row", justifyContent: "space-around" }, healthValue: { textAlign: "center", color: theme.colors.text, fontSize: 23, fontWeight: "900" }, healthLabel: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 },
});
