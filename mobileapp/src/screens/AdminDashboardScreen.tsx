import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../lib/api";
import { Badge, Card, ErrorState, Screen, SectionHeader, Skeleton } from "../components/ui";
import { colors } from "../theme";
import { formatMoney, sentence } from "../lib/format";
import type { ApiEnvelope } from "../types/domain";

type AdminData = Record<string, unknown>;

function nested(value: unknown, key: string) {
  return value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
}

function displayMetric(value: unknown, fallback = "0") {
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.formattedAmount ?? record.total ?? record.count ?? fallback);
  }
  return fallback;
}

export function AdminDashboardScreen() {
  const [overview, setOverview] = useState<AdminData | null>(null);
  const [analytics, setAnalytics] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [platform, legacy] = await Promise.all([
        apiRequest<ApiEnvelope<AdminData>>("/admin/platform/overview"),
        apiRequest<ApiEnvelope<AdminData>>("/admin/analytics"),
      ]);
      setOverview(platform.data ?? {});
      setAnalytics(legacy.data ?? {});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the admin dashboard.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <Screen><Card style={styles.skeleton}><Skeleton height={24} width="55%" /><Skeleton height={72} /><Skeleton height={72} /><Skeleton height={160} /></Card></Screen>;
  if (error && !overview) return <Screen><ErrorState message={error} onRetry={() => load()} /></Screen>;

  const revenue = overview?.revenue as AdminData | undefined;
  const stores = overview?.stores as AdminData | undefined;
  const users = overview?.users as AdminData | undefined;
  const orders = overview?.orders as AdminData | undefined;
  const products = overview?.products as AdminData | undefined;
  const counts = analytics?.counts as AdminData | undefined;
  const recentOrders = (analytics?.recentOrders as AdminData[] | undefined) ?? [];
  const revenueHistory = ((analytics?.revenue as AdminData | undefined)?.monthly as AdminData[] | undefined) ?? [];
  const maxRevenue = Math.max(1, ...revenueHistory.map((item) => Number(item.revenue ?? 0)));
  const metrics = [
    { label: "Total revenue", value: displayMetric(revenue?.total), tone: colors.success },
    { label: "Monthly revenue", value: displayMetric(revenue?.monthly), tone: colors.primary },
    { label: "Total stores", value: displayMetric(stores?.total ?? counts?.stores), tone: colors.violet },
    { label: "Active stores", value: displayMetric(stores?.active), tone: colors.success },
    { label: "Total users", value: displayMetric(users?.total ?? counts?.users), tone: colors.primary },
    { label: "Total orders", value: displayMetric(orders?.total ?? counts?.orders), tone: colors.warning },
    { label: "Products", value: displayMetric(products?.total ?? counts?.products), tone: colors.violet },
    { label: "Pending payments", value: displayMetric(counts?.pendingPayments), tone: colors.danger },
  ];

  return <Screen refreshing={refreshing} onRefresh={() => load(true)}>
    <View style={styles.hero}><View><Text style={styles.kicker}>SUPER ADMIN</Text><Text style={styles.title}>Platform Dashboard</Text><Text style={styles.subtitle}>Complete Bornoland SaaS overview.</Text></View><Badge label="Operational" tone="success" /></View>
    {error ? <ErrorState message={error} onRetry={() => load()} /> : null}
    <View style={styles.grid}>{metrics.map((metric) => <Card key={metric.label} style={styles.metric}><View style={[styles.metricDot, { backgroundColor: metric.tone }]} /><Text style={styles.metricLabel}>{metric.label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{metric.value}</Text></Card>)}</View>
    <SectionHeader title="Revenue trend" />
    <Card>{revenueHistory.length ? <View style={styles.chart}>{revenueHistory.slice(-12).map((item, index, values) => <View key={String(item.month ?? index)} style={[styles.bar, { height: Math.max(3, (Number(item.revenue ?? 0) / maxRevenue) * 121), backgroundColor: index === values.length - 1 ? colors.primary : "#C9D8FF" }]} />)}</View> : <Text style={styles.empty}>No revenue history yet</Text>}</Card>
    <SectionHeader title="Recent orders" />
    <Card style={styles.orders}>{recentOrders.length ? recentOrders.slice(0, 5).map((order, index) => <View key={String(order._id ?? index)} style={[styles.order, index > 0 && styles.border]}><View style={{ flex: 1 }}><Text style={styles.orderNumber}>#{String(order.orderNumber ?? "—")}</Text><Text style={styles.orderMeta}>{String(nested(order.storeId, "name") ?? "Unknown store")} · {String(nested(order.customerId, "name") ?? "Guest")}</Text></View><View style={styles.orderEnd}><Text style={styles.orderTotal}>{formatMoney(Number(order.total ?? 0))}</Text><Text style={styles.orderStatus}>{sentence(String(order.status ?? "pending"))}</Text></View></View>) : <Text style={styles.empty}>No orders yet</Text>}</Card>
  </Screen>;
}

const styles = StyleSheet.create({
  skeleton: { gap: 16 }, hero: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }, kicker: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 }, title: { color: colors.text, fontSize: 23, fontWeight: "900", marginTop: 4 }, subtitle: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }, metric: { width: "48%", minHeight: 112 }, metricDot: { width: 9, height: 9, borderRadius: 5 }, metricLabel: { color: colors.textMuted, fontSize: 10, marginTop: 10 }, metricValue: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 5 },
  chart: { height: 138, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: colors.border }, bar: { width: "5.2%", borderTopLeftRadius: 4, borderTopRightRadius: 4 }, orders: { paddingVertical: 2 }, order: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 10 }, border: { borderTopWidth: 1, borderTopColor: colors.border }, orderNumber: { color: colors.text, fontSize: 12, fontWeight: "800" }, orderMeta: { color: colors.textMuted, fontSize: 9, marginTop: 4 }, orderEnd: { alignItems: "flex-end" }, orderTotal: { color: colors.text, fontSize: 11, fontWeight: "800" }, orderStatus: { color: colors.primary, fontSize: 9, fontWeight: "700", marginTop: 4 }, empty: { color: colors.textMuted, textAlign: "center", paddingVertical: 28 },
});
