import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { Card, Icon, Screen } from "../components/ui";
import { colors, radius } from "../theme";
import type { ScreenName } from "../types/domain";
import { config } from "../config";

type Item = { name: ScreenName; label: string; icon: keyof typeof import("../components/ui").glyphs; badge?: string; featureKey?: string };
const groups: Array<{ title: string; items: Item[] }> = [
  { title: "Commerce", items: [{ name: "categories", label: "Categories", icon: "categories", featureKey: "categories" }, { name: "inventory", label: "Inventory", icon: "inventory", featureKey: "inventory" }, { name: "customers", label: "Customers", icon: "customers", featureKey: "customers" }, { name: "invoices", label: "Invoices", icon: "billing" }, { name: "reviews", label: "Reviews", icon: "theme", badge: "Soon", featureKey: "reviews" }, { name: "coupons", label: "Coupons", icon: "coupons", featureKey: "coupons" }] },
  { title: "Storefront", items: [{ name: "cms", label: "CMS", icon: "cms", featureKey: "cms" }, { name: "pages", label: "Pages", icon: "pages", featureKey: "cms" }, { name: "media", label: "Media", icon: "media", featureKey: "media" }, { name: "builder", label: "Builder", icon: "builder", featureKey: "builder" }, { name: "theme", label: "Theme", icon: "theme", featureKey: "theme_builder" }] },
  { title: "Growth", items: [{ name: "marketing", label: "Marketing", icon: "marketing", badge: "Soon", featureKey: "marketing" }, { name: "apps", label: "Apps", icon: "apps", badge: "Soon", featureKey: "apps" }, { name: "reports", label: "Reports", icon: "reports", featureKey: "reports" }] },
  { title: "Appearance", items: [{ name: "branding", label: "Branding", icon: "branding" }, { name: "domain", label: "Domain", icon: "domain", badge: "Soon", featureKey: "custom_domain" }, { name: "seo", label: "SEO", icon: "seo", badge: "Soon", featureKey: "seo" }] },
  { title: "Operations", items: [{ name: "delivery", label: "Delivery zones", icon: "domain" }, { name: "payments", label: "Payment methods", icon: "billing" }, { name: "navigation", label: "Store navigation", icon: "pages" }] },
  { title: "Workspace", items: [{ name: "settings", label: "Settings", icon: "settings" }, { name: "activity", label: "Activity", icon: "activity" }, { name: "billing", label: "Billing", icon: "billing" }, { name: "help", label: "Help & support", icon: "help" }] },
];
const workspaceItems: Item[] = [
  { name: "stores", label: "My stores", icon: "stores" }, { name: "account", label: "Account details", icon: "profile" },
  { name: "security", label: "Security & sessions", icon: "settings" }, { name: "activity", label: "Activity", icon: "activity" },
  { name: "notifications", label: "Notifications", icon: "notifications" }, { name: "billing", label: "Billing & subscription", icon: "billing" },
  { name: "help", label: "Help & support", icon: "help" },
];

export function MoreScreen() {
  const { navigate, currentStore, getFeature } = useApp();
  return <Screen>
    {currentStore ? <Card style={styles.storeCard}><View style={styles.storeLogo}><Text style={styles.storeLogoText}>{(currentStore.shortName || currentStore.name).slice(0, 2).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.storeName}>{currentStore.name}</Text><Text style={styles.storeUrl}>{currentStore.subdomain}.bornoland.com</Text></View><Pressable onPress={() => Linking.openURL(`${config.webUrl}/site/${currentStore.subdomain}`)} style={styles.preview}><Text style={styles.previewText}>Preview ↗</Text></Pressable></Card> : <Card style={styles.workspaceCard}><View style={styles.storeLogo}><Icon name="stores" color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.storeName}>Your workspace</Text><Text style={styles.storeUrl}>Select a store to open its management tools.</Text></View></Card>}
    {(currentStore ? groups : [{ title: "Workspace", items: workspaceItems }]).map((group) => <View key={group.title} style={styles.group}><Text style={styles.groupTitle}>{group.title}</Text><Card style={styles.menu}>{group.items.map((item, index) => { const feature = item.featureKey ? getFeature(item.featureKey) : undefined; const locked = feature?.locked === true; const badge = feature?.comingSoon ? "Soon" : locked ? feature.requiredPlan?.name || "Locked" : item.badge; return <Pressable key={item.name} onPress={() => navigate(locked ? "billing" : item.name)} style={[styles.row, index > 0 && styles.rowBorder, locked && { opacity: 0.58 }]}><View style={styles.icon}><Icon name={item.icon} size={20} color={locked ? colors.textSoft : colors.primary} /></View><Text style={styles.label}>{item.label}</Text>{badge ? <View style={styles.soon}><Text style={styles.soonText}>{badge}</Text></View> : null}<Icon name="chevron" color={colors.textSoft} /></Pressable>; })}</Card></View>)}
    <Text style={styles.version}>Bornoland Mobile · Expo SDK 57</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  storeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.black, borderColor: colors.black }, workspaceCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.black, borderColor: colors.black }, storeLogo: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, storeLogoText: { color: "#fff", fontWeight: "900", fontSize: 12 }, storeName: { color: "#fff", fontSize: 14, fontWeight: "800" }, storeUrl: { color: "#AEB4C0", fontSize: 10, marginTop: 4 }, preview: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, backgroundColor: "#272A33" }, previewText: { color: "#DCE2F0", fontSize: 10, fontWeight: "700" },
  group: { gap: 8 }, groupTitle: { color: colors.textSoft, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: "800", marginLeft: 4 }, menu: { paddingVertical: 1 }, row: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12 }, rowBorder: { borderTopWidth: 1, borderTopColor: colors.border }, icon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, label: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "700" }, soon: { backgroundColor: "#F1EDFF", paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill }, soonText: { color: colors.violet, fontSize: 8, fontWeight: "800" }, version: { color: colors.textSoft, textAlign: "center", fontSize: 10, marginTop: 3 },
});
