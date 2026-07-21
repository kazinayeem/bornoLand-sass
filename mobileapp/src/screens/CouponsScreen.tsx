import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { apiRequest, clearApiCache } from "../lib/api";
import type { ApiEnvelope } from "../types/domain";
import { AppButton, Badge, Card, EmptyState, ErrorState, Field, Icon, Screen, Skeleton } from "../components/ui";
import { radius, spacing, useTheme, useThemedStyles, type AppTheme } from "../theme";

type CouponType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
type CouponStatus = "draft" | "active" | "expired";
type Coupon = {
  _id: string; code: string; name: string; description?: string; type: CouponType; value: number; buyQuantity: number; getQuantity: number;
  minimumOrderAmount: number; maximumDiscount: number; firstOrderOnly: boolean; usageLimit: number; usagePerCustomer: number; usageCount: number;
  startsAt?: string; expiresAt?: string; autoApply: boolean; status: CouponStatus;
};
type Form = Omit<Coupon, "_id" | "usageCount">;

const emptyForm: Form = { code: "", name: "", description: "", type: "percentage", value: 10, buyQuantity: 0, getQuantity: 0, minimumOrderAmount: 0, maximumDiscount: 0, firstOrderOnly: false, usageLimit: 0, usagePerCustomer: 0, startsAt: "", expiresAt: "", autoApply: false, status: "draft" };
const types: Array<{ value: CouponType; label: string }> = [{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }, { value: "free_shipping", label: "Free shipping" }, { value: "buy_x_get_y", label: "Buy X Get Y" }];
const statuses: CouponStatus[] = ["draft", "active", "expired"];

export function CouponsScreen() {
  const { theme } = useTheme(); const styles = useThemedStyles(createStyles);
  const { currentStore, getFeature, navigate } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const feature = getFeature("coupons");
  const storeId = currentStore?._id;

  const load = useCallback(async (refresh = false) => {
    if (!storeId) { setLoading(false); return; }
    refresh ? setRefreshing(true) : setLoading(true); setError("");
    try { if (refresh) clearApiCache(); const result = await apiRequest<ApiEnvelope<{ coupons: Coupon[] }>>(`/stores/${storeId}/coupons`); setCoupons(result.data?.coupons ?? []); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load coupons."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [storeId]);
  useEffect(() => { void load(); }, [load]);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setAdvanced(false); setOpen(true); };
  const startEdit = (coupon: Coupon) => { setEditing(coupon); setForm({ code: coupon.code, name: coupon.name, description: coupon.description ?? "", type: coupon.type, value: coupon.value, buyQuantity: coupon.buyQuantity ?? 0, getQuantity: coupon.getQuantity ?? 0, minimumOrderAmount: coupon.minimumOrderAmount ?? 0, maximumDiscount: coupon.maximumDiscount ?? 0, firstOrderOnly: coupon.firstOrderOnly ?? false, usageLimit: coupon.usageLimit ?? 0, usagePerCustomer: coupon.usagePerCustomer ?? 0, startsAt: coupon.startsAt ?? "", expiresAt: coupon.expiresAt ?? "", autoApply: coupon.autoApply ?? false, status: coupon.status }); setErrors({}); setAdvanced(false); setOpen(true); };
  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const number = (key: keyof Form, value: string, integer = false) => { const parsed = value === "" ? 0 : Number(value); update(key, (integer ? Math.floor(parsed) : parsed) as never); };
  const validate = () => {
    const next: Record<string, string> = {};
    if (!editing && (!/^[A-Za-z0-9_-]{2,50}$/.test(form.code))) next.code = "Use 2–50 letters, numbers, underscores, or hyphens.";
    if (!form.name.trim() || form.name.trim().length > 200) next.name = "Name is required and must be 200 characters or fewer.";
    if ((form.description ?? "").length > 2000) next.description = "Description must be 2,000 characters or fewer.";
    const nonNegative = ["value", "buyQuantity", "getQuantity", "minimumOrderAmount", "maximumDiscount", "usageLimit", "usagePerCustomer"] as const;
    for (const key of nonNegative) if (!Number.isFinite(form[key]) || form[key] < 0) next[key] = "Enter zero or a positive number.";
    for (const key of ["buyQuantity", "getQuantity", "usageLimit", "usagePerCustomer"] as const) if (!Number.isInteger(form[key])) next[key] = "Enter a whole number.";
    for (const key of ["startsAt", "expiresAt"] as const) if (form[key] && Number.isNaN(Date.parse(form[key] as string))) next[key] = "Enter an ISO date and time.";
    setErrors(next); return Object.keys(next).length === 0;
  };
  const save = async () => {
    if (!storeId || !validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description?.trim(), startsAt: form.startsAt || null, expiresAt: form.expiresAt || null };
      if (editing) await apiRequest(`/stores/${storeId}/coupons/${editing._id}`, { method: "PUT", body: payload });
      else await apiRequest(`/stores/${storeId}/coupons`, { method: "POST", body: payload });
      setOpen(false); setNotice(editing ? "Coupon updated" : "Coupon created"); await load(true);
    } catch (caught) { Alert.alert("Failed to save coupon", caught instanceof Error ? caught.message : "Try again."); }
    finally { setSaving(false); }
  };
  const remove = (coupon: Coupon) => Alert.alert("Delete coupon", `Delete “${coupon.name}” (${coupon.code})?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { await apiRequest(`/stores/${storeId}/coupons/${coupon._id}`, { method: "DELETE" }); setNotice("Coupon deleted"); await load(true); } catch (caught) { Alert.alert("Delete failed", caught instanceof Error ? caught.message : "Try again."); } } }]);

  if (!currentStore) return <Screen><EmptyState title="Select a store" message="Choose a store before managing coupons." action="Choose store" onAction={() => navigate("stores")} /></Screen>;
  if (feature?.locked || feature?.enabled === false) return <Screen><ErrorState message={feature.lockReason || "Coupons are not included in this plan."} /><AppButton title="View plans" onPress={() => navigate("billing")} /></Screen>;
  return <Screen refreshing={refreshing} onRefresh={() => void load(true)}>
    <View style={styles.heading}><View><Text style={styles.title}>Coupons & Discounts</Text><Text style={styles.subtitle}>{coupons.length} coupons</Text></View><AppButton compact title="New Coupon" onPress={startCreate} icon={<Icon name="add" color={theme.colors.textInverse} />} /></View>
    {notice ? <Pressable onPress={() => setNotice("")}><Card style={styles.notice}><Text style={styles.noticeText}>{notice}</Text><Text style={styles.noticeText}>×</Text></Card></Pressable> : null}
    {loading ? <Card style={{ gap: 14 }}><Skeleton height={64} /><Skeleton height={64} /><Skeleton height={64} /></Card> : error ? <ErrorState message={error} onRetry={() => void load()} /> : coupons.length ? <View style={{ gap: 10 }}>{coupons.map((coupon) => <Card key={coupon._id} style={styles.coupon}><View style={styles.icon}><Icon name="coupons" color={theme.colors.warning} size={21} /></View><View style={styles.info}><Text style={styles.name}>{coupon.name}</Text><Text style={styles.meta}>{coupon.code} · {coupon.type.replaceAll("_", " ")} · Used {coupon.usageCount}</Text></View><Badge label={coupon.status} tone={coupon.status === "active" ? "success" : coupon.status === "expired" ? "danger" : "neutral"} /><Pressable onPress={() => startEdit(coupon)}><Text style={styles.edit}>Edit</Text></Pressable><Pressable onPress={() => remove(coupon)}><Text style={styles.delete}>Delete</Text></Pressable></Card>)}</View> : <Card><EmptyState title="No coupons yet" message="Create percentage, fixed, free shipping, or buy X get Y discounts." action="New Coupon" onAction={startCreate} /></Card>}
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}><KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}><Pressable style={styles.backdrop} onPress={() => setOpen(false)} /><View style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{editing ? "Edit Coupon" : "Create Coupon"}</Text><Pressable onPress={() => setOpen(false)}><Text style={styles.close}>×</Text></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
      {!editing ? <Field label="Code" value={form.code} onChangeText={(value) => update("code", value.toUpperCase())} autoCapitalize="characters" maxLength={50} error={errors.code} placeholder="SUMMER20" /> : <View><Text style={styles.readLabel}>Code</Text><Text style={styles.readValue}>{form.code}</Text></View>}
      <Field label="Name" value={form.name} onChangeText={(value) => update("name", value)} maxLength={200} error={errors.name} />
      <Text style={styles.label}>Discount type</Text><View style={styles.options}>{types.map((type) => <Pressable key={type.value} onPress={() => update("type", type.value)} style={[styles.option, form.type === type.value && styles.optionActive]}><Text style={[styles.optionText, form.type === type.value && styles.optionTextActive]}>{type.label}</Text></Pressable>)}</View>
      <Field label="Value" value={String(form.value)} onChangeText={(value) => number("value", value)} keyboardType="decimal-pad" error={errors.value} />
      <Text style={styles.label}>Status</Text><View style={styles.options}>{statuses.map((status) => <Pressable key={status} onPress={() => update("status", status)} style={[styles.option, form.status === status && styles.optionActive]}><Text style={[styles.optionText, form.status === status && styles.optionTextActive]}>{status}</Text></Pressable>)}</View>
      <Pressable onPress={() => setAdvanced((value) => !value)} style={styles.advancedToggle}><Text style={styles.advancedText}>{advanced ? "Hide advanced rules" : "Advanced rules"}</Text><Text style={styles.advancedText}>{advanced ? "−" : "+"}</Text></Pressable>
      {advanced ? <View style={styles.advanced}><Field label="Description" value={form.description} onChangeText={(value) => update("description", value)} multiline maxLength={2000} error={errors.description} /><Field label="Minimum order amount" value={String(form.minimumOrderAmount)} onChangeText={(value) => number("minimumOrderAmount", value)} keyboardType="decimal-pad" error={errors.minimumOrderAmount} /><Field label="Maximum discount (0 = no limit)" value={String(form.maximumDiscount)} onChangeText={(value) => number("maximumDiscount", value)} keyboardType="decimal-pad" error={errors.maximumDiscount} />{form.type === "buy_x_get_y" ? <><Field label="Buy quantity" value={String(form.buyQuantity)} onChangeText={(value) => number("buyQuantity", value, true)} keyboardType="number-pad" error={errors.buyQuantity} /><Field label="Get quantity" value={String(form.getQuantity)} onChangeText={(value) => number("getQuantity", value, true)} keyboardType="number-pad" error={errors.getQuantity} /></> : null}<Field label="Total usage limit (0 = unlimited)" value={String(form.usageLimit)} onChangeText={(value) => number("usageLimit", value, true)} keyboardType="number-pad" error={errors.usageLimit} /><Field label="Usage per customer (0 = unlimited)" value={String(form.usagePerCustomer)} onChangeText={(value) => number("usagePerCustomer", value, true)} keyboardType="number-pad" error={errors.usagePerCustomer} /><Field label="Starts at (ISO date-time, optional)" value={form.startsAt} onChangeText={(value) => update("startsAt", value)} autoCapitalize="none" error={errors.startsAt} /><Field label="Expires at (ISO date-time, optional)" value={form.expiresAt} onChangeText={(value) => update("expiresAt", value)} autoCapitalize="none" error={errors.expiresAt} /><ToggleRow label="First order only" value={form.firstOrderOnly} onValueChange={(value) => update("firstOrderOnly", value)} /><ToggleRow label="Apply automatically" value={form.autoApply} onValueChange={(value) => update("autoApply", value)} /></View> : null}
      <AppButton title="Save Coupon" loading={saving} onPress={() => void save()} />
    </ScrollView></View></KeyboardAvoidingView></Modal>
  </Screen>;
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) { const { theme } = useTheme(); const styles = useThemedStyles(createStyles); return <View style={styles.toggle}><Text style={styles.toggleText}>{label}</Text><Switch value={value} onValueChange={onValueChange} trackColor={{ false: theme.colors.control, true: theme.colors.primarySoft }} thumbColor={value ? theme.colors.primary : theme.colors.iconMuted} ios_backgroundColor={theme.colors.control} /></View>; }

const createStyles = (theme: AppTheme) => StyleSheet.create({
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }, title: { color: theme.colors.text, fontSize: 20, fontWeight: "900" }, subtitle: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 }, notice: { flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.colors.successSoft, borderColor: theme.colors.successBorder, paddingVertical: 12 }, noticeText: { color: theme.colors.success, fontSize: 12, fontWeight: "800" }, coupon: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }, icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: theme.colors.warningSoft, alignItems: "center", justifyContent: "center" }, info: { flex: 1, minWidth: 150 }, name: { color: theme.colors.text, fontWeight: "800", fontSize: 13 }, meta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 4, textTransform: "capitalize" }, edit: { color: theme.colors.primary, fontSize: 11, fontWeight: "800" }, delete: { color: theme.colors.danger, fontSize: 11, fontWeight: "800" },
  overlay: { flex: 1, justifyContent: "flex-end" }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.overlay }, sheet: { maxHeight: "92%", backgroundColor: theme.colors.modal, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.lg, ...theme.shadows.modal }, sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sheetTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" }, close: { color: theme.colors.textMuted, fontSize: 27 }, form: { gap: 14, paddingBottom: 30 }, label: { color: theme.colors.text, fontSize: 13, fontWeight: "600" }, options: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, option: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1, borderColor: theme.colors.border }, optionActive: { backgroundColor: theme.colors.controlActive, borderColor: theme.colors.controlActive }, optionText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }, optionTextActive: { color: theme.colors.onControlActive }, advancedToggle: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }, advancedText: { color: theme.colors.primary, fontSize: 12, fontWeight: "800" }, advanced: { gap: 14 }, toggle: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: theme.colors.border, borderRadius: radius.md, paddingHorizontal: 14 }, toggleText: { color: theme.colors.text, fontSize: 13, fontWeight: "600" }, readLabel: { color: theme.colors.textMuted, fontSize: 10 }, readValue: { color: theme.colors.text, fontSize: 14, fontWeight: "800", marginTop: 5 },
});
