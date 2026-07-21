import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { AppButton, Badge, Card, Divider, EmptyState, Icon, Screen, SearchBox } from "../components/ui";
import { radius, useThemedStyles, type AppTheme } from "../theme";
import { formatDate, formatMoney, sentence } from "../lib/format";
import type { Order } from "../types/domain";

const statusTone = (status: string): "success" | "warning" | "danger" | "primary" | "neutral" => status === "delivered" || status === "paid" ? "success" : status === "pending" || status === "unpaid" ? "warning" : status === "cancelled" || status === "refunded" ? "danger" : status === "processing" || status === "shipped" ? "primary" : "neutral";

export function OrdersScreen() {
  const styles = useThemedStyles(createStyles);
  const { orders, orderAnalytics, navigate, refreshing, refresh } = useApp();
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("all");
  const filtered = useMemo(() => orders.filter((order) => `${order.orderNumber} ${order.customerId?.name} ${order.customerId?.email}`.toLowerCase().includes(query.toLowerCase()) && (status === "all" || order.status === status)), [orders, query, status]);
  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <View><Text style={styles.title}>Order management</Text><Text style={styles.subtitle}>Track, fulfil and update customer orders.</Text></View>
    <View style={styles.summary}><Summary value={String(orderAnalytics?.totalOrders ?? orders.length)} label="Total" /><Summary value={String(orderAnalytics?.pendingOrders ?? orders.filter((item) => item.status === "pending").length)} label="Pending" /><Summary value={formatMoney(orderAnalytics?.totalRevenue ?? orders.reduce((sum, item) => sum + item.total, 0))} label="Revenue" wide /></View>
    <SearchBox value={query} onChangeText={setQuery} placeholder="Order number or customer" />
    <View style={styles.filters}>{["all", "pending", "processing", "shipped", "delivered"].map((item) => <Pressable key={item} onPress={() => setStatus(item)} style={[styles.filter, status === item && styles.filterActive]}><Text style={[styles.filterText, status === item && styles.filterTextActive]}>{sentence(item)}</Text></Pressable>)}</View>
    {filtered.length ? <View style={styles.list}>{filtered.map((order) => <Pressable key={order._id} onPress={() => navigate("order-detail", { orderId: order._id })} style={styles.order}><View style={styles.orderTop}><View style={styles.orderGlyph}><Text style={styles.orderGlyphText}>▤</Text></View><View style={{ flex: 1 }}><Text style={styles.number}>#{order.orderNumber}</Text><Text style={styles.date}>{formatDate(order.createdAt)}</Text></View><Text style={styles.total}>{formatMoney(order.total, order.currencyCode || "BDT")}</Text></View><Divider /><View style={styles.orderBottom}><View><Text style={styles.customer}>{order.customerId?.name || "Guest customer"}</Text><Text style={styles.items}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {order.paymentMethod || "Payment pending"}</Text></View><View style={styles.badges}><Badge label={order.paymentStatus} tone={statusTone(order.paymentStatus)} /><Badge label={order.status} tone={statusTone(order.status)} /></View></View></Pressable>)}</View> : <Card><EmptyState title="No orders found" message="Orders matching your search and status will appear here." /></Card>}
  </Screen>;
}

function Summary({ value, label, wide }: { value: string; label: string; wide?: boolean }) { const styles = useThemedStyles(createStyles); return <View style={[styles.summaryItem, wide && { flex: 1.5 }]}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }

export function OrderDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const { navigation, orders, currentStore, mutate, replaceOrder } = useApp();
  const order = orders.find((item) => item._id === navigation.params?.orderId);
  const [updating, setUpdating] = useState(false);
  if (!order) return <Screen><Card><EmptyState title="Order not found" message="Refresh the order list and try again." /></Card></Screen>;
  const updateStatus = async (next: string) => {
    if (!currentStore) return;
    setUpdating(true);
    try {
      const result = await mutate<{ data: { order: Order } }>(`/stores/${currentStore._id}/orders/${order._id}/status`, "PUT", { status: next });
      if (result.data.order) replaceOrder(result.data.order);
      Alert.alert("Order updated", `Status changed to ${sentence(next)}.`);
    } catch (caught) { Alert.alert("Update failed", caught instanceof Error ? caught.message : "Please try again."); }
    finally { setUpdating(false); }
  };
  return <Screen>
    <Card style={styles.detailHero}><View style={styles.detailTitleRow}><View><Text style={styles.detailKicker}>ORDER</Text><Text style={styles.detailTitle}>#{order.orderNumber}</Text></View><Badge label={order.status} tone={statusTone(order.status)} /></View><Text style={styles.detailDate}>Placed {formatDate(order.createdAt)}</Text><Divider /><View style={styles.moneyRow}><Text style={styles.moneyLabel}>Order total</Text><Text style={styles.moneyValue}>{formatMoney(order.total, order.currencyCode || "BDT")}</Text></View></Card>
    <Card style={styles.detailCard}><Text style={styles.sectionTitle}>Items</Text>{order.items.map((item, index) => <View key={`${item.productId}-${index}`} style={styles.itemRow}><View style={styles.itemImage}><Text style={styles.itemImageText}>{item.name[0]}</Text></View><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemQty}>Qty {item.quantity} × {formatMoney(item.price)}</Text></View><Text style={styles.itemTotal}>{formatMoney(item.price * item.quantity)}</Text></View>)}</Card>
    <Card style={styles.detailCard}><Text style={styles.sectionTitle}>Customer</Text><Text style={styles.customerName}>{order.customerId?.name || order.shippingAddress?.fullName || "Guest"}</Text><Text style={styles.detailMuted}>{order.customerId?.email}</Text><Text style={styles.detailMuted}>{order.customerId?.phone || order.shippingAddress?.phone}</Text>{order.shippingAddress ? <><Divider /><Text style={styles.detailLabel}>Shipping address</Text><Text style={styles.address}>{[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(", ")}</Text></> : null}</Card>
    <Card style={styles.detailCard}><Text style={styles.sectionTitle}>Payment</Text><View style={styles.infoRow}><Text style={styles.detailMuted}>Method</Text><Text style={styles.detailValue}>{order.paymentMethod || "—"}</Text></View><View style={styles.infoRow}><Text style={styles.detailMuted}>Status</Text><Badge label={order.paymentStatus} tone={statusTone(order.paymentStatus)} /></View></Card>
    <Card style={styles.detailCard}><Text style={styles.sectionTitle}>Update fulfilment</Text><View style={styles.actionGrid}>{["processing", "shipped", "delivered", "cancelled"].map((next) => <AppButton key={next} compact loading={updating && order.status !== next} disabled={updating || order.status === next} variant={next === "cancelled" ? "danger" : next === order.status ? "secondary" : "secondary"} title={sentence(next)} onPress={() => updateStatus(next)} />)}</View></Card>
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 20, fontWeight: "900" }, subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }, summary: { flexDirection: "row", gap: 9 }, summaryItem: { flex: 1, minHeight: 74, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.md, padding: 12, justifyContent: "center" }, summaryValue: { color: theme.colors.text, fontWeight: "900", fontSize: 16 }, summaryLabel: { color: theme.colors.textMuted, fontSize: 9, marginTop: 4 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, filterActive: { backgroundColor: theme.colors.controlActive, borderColor: theme.colors.controlActive }, filterText: { color: theme.colors.textMuted, fontSize: 10, fontWeight: "700" }, filterTextActive: { color: theme.colors.onControlActive }, list: { gap: 11 },
  order: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.lg, padding: 15, gap: 13 }, orderTop: { flexDirection: "row", alignItems: "center", gap: 10 }, orderGlyph: { width: 39, height: 39, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, orderGlyphText: { color: theme.colors.primary, fontSize: 17, fontWeight: "800" }, number: { color: theme.colors.text, fontSize: 13, fontWeight: "900" }, date: { color: theme.colors.textSoft, fontSize: 10, marginTop: 3 }, total: { color: theme.colors.text, fontSize: 15, fontWeight: "900" }, orderBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }, customer: { color: theme.colors.text, fontSize: 12, fontWeight: "700" }, items: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 }, badges: { alignItems: "flex-end", gap: 5 },
  detailHero: { backgroundColor: theme.colors.hero, borderColor: theme.colors.hero }, detailTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, detailKicker: { color: theme.colors.heroMuted, fontSize: 9, letterSpacing: 1, fontWeight: "800" }, detailTitle: { color: theme.colors.heroText, fontSize: 24, fontWeight: "900", marginTop: 4 }, detailDate: { color: theme.colors.heroMuted, fontSize: 11, marginTop: 5, marginBottom: 16 }, moneyRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, alignItems: "center" }, moneyLabel: { color: theme.colors.heroMuted, fontSize: 12 }, moneyValue: { color: theme.colors.heroText, fontSize: 20, fontWeight: "900" },
  detailCard: { gap: 13 }, sectionTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" }, itemRow: { flexDirection: "row", alignItems: "center", gap: 11 }, itemImage: { width: 46, height: 46, borderRadius: 11, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, itemImageText: { color: theme.colors.primary, fontSize: 18, fontWeight: "900" }, itemName: { color: theme.colors.text, fontSize: 12, fontWeight: "700" }, itemQty: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 }, itemTotal: { color: theme.colors.text, fontSize: 12, fontWeight: "800" }, customerName: { color: theme.colors.text, fontWeight: "800", fontSize: 13 }, detailMuted: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 17 }, detailLabel: { color: theme.colors.text, fontSize: 11, fontWeight: "800" }, address: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 18 }, infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, detailValue: { color: theme.colors.text, fontSize: 12, fontWeight: "700" }, actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
});
