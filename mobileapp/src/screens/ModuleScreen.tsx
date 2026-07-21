import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Badge, Card, EmptyState, ErrorState, Icon, Screen, SearchBox, Skeleton } from "../components/ui";
import { colors, radius } from "../theme";
import { sentence } from "../lib/format";
import type { ScreenName } from "../types/domain";

type Definition = { title: string; description: string; endpoint?: (storeId: string) => string; action?: string; icon: keyof typeof import("../components/ui").glyphs; comingSoon?: boolean };
const definitions: Partial<Record<ScreenName, Definition>> = {
  coupons: { title: "Coupons", description: "Discount codes and redemption rules.", endpoint: (id) => `/stores/${id}/coupons`, action: "Create coupon", icon: "coupons" },
  reviews: { title: "Reviews", description: "Customer ratings, moderation and replies.", icon: "theme", comingSoon: true },
  cms: { title: "Content management", description: "Policies, information pages and FAQs.", endpoint: (id) => `/cms/${id}/pages`, action: "Manage FAQ", icon: "cms" },
  pages: { title: "Store pages", description: "Build, publish, schedule and archive pages.", endpoint: (id) => `/store-pages/stores/${id}`, action: "New page", icon: "pages" },
  media: { title: "Media library", description: "Images and files used by your storefront.", endpoint: (id) => `/stores/${id}/media`, action: "Upload", icon: "media" },
  builder: { title: "Page builder", description: "Edit sections, layout and published pages.", endpoint: (id) => `/builder/${id}/pages`, action: "Open builder", icon: "builder" },
  theme: { title: "Theme", description: "Select the visual foundation for your storefront.", endpoint: () => "/templates", action: "Apply theme", icon: "theme" },
  marketing: { title: "Marketing", description: "Campaigns, automation and customer outreach.", icon: "marketing", comingSoon: true },
  apps: { title: "Apps", description: "Connect services that extend your store.", icon: "apps", comingSoon: true },
  reports: { title: "Reports", description: "Revenue, products, orders and customer insights.", endpoint: (id) => `/reports/stores/${id}/dashboard`, icon: "reports" },
  activity: { title: "Activity", description: "Audit trail of important workspace changes.", endpoint: (id) => `/stores/${id}/audit-logs`, icon: "activity" },
  billing: { title: "Billing", description: "Subscription, plan usage and invoices.", endpoint: (id) => `/subscriptions/stores/${id}`, icon: "billing" },
  notifications: { title: "Notifications", description: "Billing and store activity alerts.", endpoint: () => "/notifications", icon: "notifications" },
  delivery: { title: "Delivery zones", description: "Delivery areas, fees and free-delivery thresholds.", endpoint: (id) => `/delivery-zones/store/${id}`, action: "Add zone", icon: "domain" },
  payments: { title: "Payment methods", description: "Methods customers can use during checkout.", endpoint: (id) => `/payment-methods/store/${id}`, action: "Add method", icon: "billing" },
  navigation: { title: "Store navigation", description: "Header, footer and menu links.", endpoint: (id) => `/navigation/stores/${id}`, action: "Edit menus", icon: "pages" },
  branding: { title: "Branding", description: "Logo, colors and store identity.", endpoint: (id) => `/stores/${id}/branding`, action: "Edit branding", icon: "branding" },
  domain: { title: "Custom domain", description: "Connect a memorable domain to your store.", icon: "domain", comingSoon: true },
  seo: { title: "Search optimization", description: "Control search appearance and indexing.", icon: "seo", comingSoon: true },
  help: { title: "Help & support", description: "Guides and assistance for your workspace.", icon: "help" },
};

function firstArray(value: unknown): Array<Record<string, unknown>> | null {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  if (!value || typeof value !== "object") return null;
  for (const nested of Object.values(value as Record<string, unknown>)) { const result = firstArray(nested); if (result) return result; }
  return null;
}

export function ModuleScreen({ name }: { name: ScreenName }) {
  const definition = definitions[name] ?? { title: sentence(name), description: "Manage this store feature.", icon: "apps" as const };
  const { currentStore } = useApp(); const [loading, setLoading] = useState(Boolean(definition.endpoint)); const [error, setError] = useState(""); const [items, setItems] = useState<Array<Record<string, unknown>>>([]); const [query, setQuery] = useState("");
  const load = () => {
    if (!definition.endpoint || !currentStore) { setItems([]); setLoading(false); return; }
    setLoading(true); setError(""); apiRequest<unknown>(definition.endpoint(currentStore._id)).then((payload) => setItems(firstArray(payload) ?? [payload as Record<string, unknown>])).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this module.")).finally(() => setLoading(false));
  };
  useEffect(load, [currentStore?._id, name]);
  const filtered = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query]);
  return <Screen>
    <View style={styles.hero}><View style={styles.heroIcon}><Icon name={definition.icon} color={colors.primary} size={25} /></View><View style={{ flex: 1 }}><Text style={styles.title}>{definition.title}</Text><Text style={styles.description}>{definition.description}</Text></View></View>
    {definition.comingSoon ? <Card style={styles.soonCard}><View style={styles.soonIcon}><Text style={styles.soonGlyph}>✦</Text></View><Badge label="Coming soon" tone="primary" /><Text style={styles.soonTitle}>{definition.title} is on the way</Text><Text style={styles.soonText}>This module is already feature-gated on the website and will become available here with the same plan access.</Text></Card> : <>
      {items.length > 4 ? <SearchBox value={query} onChangeText={setQuery} placeholder={`Search ${definition.title.toLowerCase()}`} /> : null}
      {loading ? <Card style={{ gap: 14 }}><Skeleton /><Skeleton width="72%" /><Skeleton height={60} /></Card> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length ? <View style={styles.list}>{filtered.map((item, index) => <DataCard key={String(item._id ?? item.id ?? index)} item={item} icon={definition.icon} />)}</View> : <Card><EmptyState title={`No ${definition.title.toLowerCase()} yet`} message={`Items from ${definition.title.toLowerCase()} will appear here.`} /></Card>}
    </>}
  </Screen>;
}

function DataCard({ item, icon }: { item: Record<string, unknown>; icon: Definition["icon"] }) {
  const hidden = new Set(["_id", "id", "storeId", "tenantId", "updatedAt", "__v"]);
  const entries = Object.entries(item).filter(([key, value]) => !hidden.has(key) && value !== undefined && value !== null && typeof value !== "object").slice(0, 4);
  const primary = entries.find(([key]) => ["title", "name", "code", "displayName", "report", "action", "plan", "invoice"].includes(key)) ?? entries[0];
  return <Pressable style={({ pressed }) => [styles.dataCard, pressed && { opacity: 0.72 }]}><View style={styles.dataIcon}><Icon name={icon} color={colors.primary} size={20} /></View><View style={{ flex: 1 }}>{primary ? <Text numberOfLines={1} style={styles.dataTitle}>{String(primary[1])}</Text> : null}<View style={styles.details}>{entries.filter(([key]) => key !== primary?.[0]).slice(0, 2).map(([key, value]) => <Text key={key} numberOfLines={1} style={styles.detail}><Text style={styles.detailKey}>{sentence(key)}: </Text>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</Text>)}</View></View>{entries.some(([key]) => key === "status") ? <Badge label={String(entries.find(([key]) => key === "status")?.[1])} tone={String(entries.find(([key]) => key === "status")?.[1]).includes("active") || String(entries.find(([key]) => key === "status")?.[1]).includes("published") || String(entries.find(([key]) => key === "status")?.[1]) === "paid" ? "success" : "neutral"} /> : <Icon name="chevron" color={colors.textSoft} />}</Pressable>;
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: 12 }, heroIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, title: { color: colors.text, fontSize: 20, fontWeight: "900" }, description: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 }, list: { gap: 10 }, dataCard: { minHeight: 78, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 13, flexDirection: "row", alignItems: "center", gap: 11 }, dataIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, dataTitle: { color: colors.text, fontSize: 13, fontWeight: "800" }, details: { marginTop: 4, gap: 2 }, detail: { color: colors.textMuted, fontSize: 9 }, detailKey: { color: colors.textSoft, fontWeight: "700" }, soonCard: { minHeight: 350, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 28 }, soonIcon: { width: 65, height: 65, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, soonGlyph: { color: colors.primary, fontSize: 27, fontWeight: "900" }, soonTitle: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "center" }, soonText: { color: colors.textMuted, lineHeight: 20, textAlign: "center", fontSize: 12 },
});
