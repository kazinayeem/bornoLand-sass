import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { AppButton, Badge, Card, EmptyState, Field, Icon, Screen, SearchBox } from "../components/ui";
import { radius, useTheme, useThemedStyles, type AppTheme } from "../theme";
import { formatMoney } from "../lib/format";
import type { ApiEnvelope, Product } from "../types/domain";

type Filter = "all" | "active" | "draft" | "low";

export function ProductsScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { products, navigate, refreshing, refresh } = useApp();
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => products.filter((product) => {
    const matches = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "all" || filter === "low" ? filter !== "low" || (product.totalStock ?? product.stock) <= 5 : product.status === filter);
  }), [filter, products, query]);

  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <View style={styles.topRow}><View><Text style={styles.title}>{products.length} products</Text><Text style={styles.subtitle}>Manage your catalog and stock.</Text></View><AppButton compact title="Add" icon={<Icon name="add" color={theme.colors.textInverse} />} onPress={() => navigate("product-form")} /></View>
    <SearchBox value={query} onChangeText={setQuery} placeholder="Search name, SKU or category" />
    <View style={styles.filters}>{(["all", "active", "draft", "low"] as Filter[]).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item === "low" ? "Low stock" : item[0].toUpperCase() + item.slice(1)}</Text></Pressable>)}</View>
    {filtered.length ? <View style={styles.list}>{filtered.map((product) => <ProductRow key={product._id} product={product} onPress={() => navigate("product-form", { productId: product._id })} />)}</View> : <Card><EmptyState title="No products found" message={query ? "Try a different search or filter." : "Add your first product to start selling."} action={query ? "Clear search" : "Add product"} onAction={() => query ? setQuery("") : navigate("product-form")} /></Card>}
  </Screen>;
}

function ProductRow({ product, onPress }: { product: Product; onPress: () => void }) {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const stock = product.totalStock ?? product.stock;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.product, pressed && { opacity: 0.7 }]}><View style={styles.productImage}><Text style={styles.productImageText}>{product.name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.productInfo}><View style={styles.productNameRow}><Text numberOfLines={1} style={styles.productName}>{product.name}</Text><Badge tone={product.status === "active" ? "success" : product.status === "draft" ? "warning" : "neutral"} label={product.status} /></View><Text style={styles.productMeta}>{product.sku || "No SKU"} · {product.category || "Uncategorized"}</Text><View style={styles.productBottom}><Text style={styles.price}>{formatMoney(product.price)}</Text><Text style={[styles.stock, stock === 0 && { color: theme.colors.danger }, stock > 0 && stock <= 5 && { color: theme.colors.warning }]}>{stock === 0 ? "Out of stock" : `${stock} in stock`}</Text></View></View><Icon name="chevron" color={theme.colors.iconMuted} /></Pressable>;
}

export function ProductFormScreen() {
  const styles = useThemedStyles(createStyles);
  const { navigation, products, currentStore, mutate, replaceProduct, goBack } = useApp();
  const productId = navigation.params?.productId as string | undefined;
  const existing = products.find((item) => item._id === productId);
  const [name, setName] = useState(existing?.name ?? ""); const [price, setPrice] = useState(existing ? String(existing.price) : ""); const [comparePrice, setComparePrice] = useState(existing?.comparePrice ? String(existing.comparePrice) : "");
  const [stock, setStock] = useState(existing ? String(existing.totalStock ?? existing.stock) : "0"); const [sku, setSku] = useState(existing?.sku ?? ""); const [category, setCategory] = useState(existing?.category ?? ""); const [description, setDescription] = useState(existing?.description ?? ""); const [status, setStatus] = useState<Product["status"]>(existing?.status ?? "draft");
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const save = async () => {
    setError("");
    if (name.trim().length < 2) return setError("Product name must contain at least 2 characters.");
    if (!price || Number(price) < 0) return setError("Enter a valid price.");
    if (!currentStore) return;
    setSaving(true);
    try {
      const slug = existing?.slug || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const body = { name: name.trim(), slug, price: Number(price), comparePrice: comparePrice ? Number(comparePrice) : undefined, stock: Number(stock || 0), sku: sku.trim(), category: category.trim(), description: description.trim(), status };
      const path = existing ? `/products/${currentStore._id}/${existing._id}` : `/products/${currentStore._id}/create`;
      const result = await mutate<ApiEnvelope<{ product: Product }>>(path, existing ? "PUT" : "POST", body);
      if (result.data?.product) replaceProduct(result.data.product);
      Alert.alert(existing ? "Product updated" : "Product created", `${name.trim()} has been saved.`); goBack();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save this product."); }
    finally { setSaving(false); }
  };
  return <Screen>
    <Card style={styles.formCard}><Text style={styles.formTitle}>{existing ? "Edit product" : "New product"}</Text><Text style={styles.formSubtitle}>Basic information shown in your storefront.</Text><Field label="Product name" value={name} onChangeText={setName} placeholder="e.g. Classic Backpack" /><Field label="Description" value={description} onChangeText={setDescription} placeholder="Describe the product…" multiline numberOfLines={4} /><Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Bags" /></Card>
    <Card style={styles.formCard}><Text style={styles.formTitle}>Pricing & inventory</Text><View style={styles.twoFields}><View style={{ flex: 1 }}><Field label="Price (BDT)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0" /></View><View style={{ flex: 1 }}><Field label="Compare price" value={comparePrice} onChangeText={setComparePrice} keyboardType="decimal-pad" placeholder="0" /></View></View><View style={styles.twoFields}><View style={{ flex: 1 }}><Field label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="0" /></View><View style={{ flex: 1 }}><Field label="SKU" value={sku} onChangeText={setSku} placeholder="SKU-001" autoCapitalize="characters" /></View></View></Card>
    <Card style={styles.formCard}><Text style={styles.formTitle}>Product status</Text><View style={styles.statusRow}>{(["active", "draft", "inactive", "archived"] as Product["status"][]).map((item) => <Pressable key={item} onPress={() => setStatus(item)} style={[styles.statusChoice, status === item && styles.statusChoiceActive]}><Text style={[styles.statusChoiceText, status === item && styles.statusChoiceTextActive]}>{item}</Text></Pressable>)}</View></Card>
    {error ? <View style={styles.errorBox}><Text style={styles.errorBoxText}>{error}</Text></View> : null}
    <View style={styles.formActions}><AppButton style={{ flex: 1 }} variant="secondary" title="Cancel" onPress={goBack} /><AppButton style={{ flex: 1 }} loading={saving} title="Save product" onPress={save} /></View>
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, title: { fontSize: 20, fontWeight: "900", color: theme.colors.text }, subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  filters: { flexDirection: "row", gap: 8 }, filter: { minHeight: 35, borderRadius: radius.pill, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }, filterActive: { backgroundColor: theme.colors.controlActive, borderColor: theme.colors.controlActive }, filterText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700" }, filterTextActive: { color: theme.colors.onControlActive }, list: { gap: 10 },
  product: { minHeight: 95, borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.lg, backgroundColor: theme.colors.surface, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }, productImage: { width: 62, height: 68, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: "center", justifyContent: "center" }, productImageText: { color: theme.colors.primary, fontSize: 24, fontWeight: "900" }, productInfo: { flex: 1, gap: 5 }, productNameRow: { flexDirection: "row", alignItems: "center", gap: 6 }, productName: { flex: 1, color: theme.colors.text, fontWeight: "800", fontSize: 13 }, productMeta: { color: theme.colors.textSoft, fontSize: 10 }, productBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, price: { color: theme.colors.text, fontWeight: "900", fontSize: 13 }, stock: { color: theme.colors.success, fontWeight: "700", fontSize: 10 },
  formCard: { gap: 16 }, formTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "900" }, formSubtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: -10 }, twoFields: { flexDirection: "row", gap: 12 }, statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, statusChoice: { borderRadius: radius.pill, backgroundColor: theme.colors.control, paddingVertical: 9, paddingHorizontal: 13 }, statusChoiceActive: { backgroundColor: theme.colors.primary }, statusChoiceText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }, statusChoiceTextActive: { color: theme.colors.textInverse }, errorBox: { backgroundColor: theme.colors.dangerSoft, borderRadius: radius.md, padding: 13 }, errorBoxText: { color: theme.colors.danger, fontSize: 12 }, formActions: { flexDirection: "row", gap: 12 },
});
