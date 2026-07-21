import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { apiRequest } from "../lib/api";
import { AppButton, Badge, Card, Divider, EmptyState, Field, Icon, Screen } from "../components/ui";
import { colors, radius } from "../theme";
import { initials } from "../lib/format";
import type { ApiEnvelope, Store } from "../types/domain";

export function StoresScreen() {
  const { stores, currentStore, selectStore, createStore } = useApp();
  const [creating, setCreating] = useState(false); const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [category, setCategory] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (name.trim().length < 2 || slug.trim().length < 2) return Alert.alert("Check store details", "Enter a store name and URL slug.");
    setSaving(true); try { await createStore({ name: name.trim(), slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""), category: category.trim(), plan: "Starter" }); Alert.alert("Store created", "Your new store is ready."); } catch (caught) { Alert.alert("Could not create store", caught instanceof Error ? caught.message : "Try again."); } finally { setSaving(false); }
  };
  if (creating) return <Screen><Card style={styles.form}><Text style={styles.formTitle}>Create a new store</Text><Text style={styles.formHint}>A Starter workspace will be created using this identity.</Text><Field label="Store name" value={name} onChangeText={(value) => { setName(value); if (!slug) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} placeholder="My online store" /><Field label="Store URL" value={slug} onChangeText={setSlug} placeholder="my-store" autoCapitalize="none" /><Text style={styles.urlPreview}>{slug || "my-store"}.bornoland.com</Text><Field label="Category" value={category} onChangeText={setCategory} placeholder="Fashion, electronics, lifestyle…" /><View style={styles.actions}><AppButton style={{ flex: 1 }} variant="secondary" title="Cancel" onPress={() => setCreating(false)} /><AppButton style={{ flex: 1 }} loading={saving} title="Create store" onPress={submit} /></View></Card></Screen>;
  return <Screen>
    <View style={styles.heading}><View><Text style={styles.title}>Your stores</Text><Text style={styles.subtitle}>Switch between stores and workspaces.</Text></View><AppButton compact title="New" icon={<Icon name="add" color="#fff" />} onPress={() => setCreating(true)} /></View>
    {stores.length ? stores.map((store) => { const active = store._id === currentStore?._id; return <Pressable key={store._id} onPress={() => selectStore(store)} style={[styles.store, active && styles.storeActive]}><View style={[styles.storeLogo, { backgroundColor: store.brandColor || colors.primary }]}><Text style={styles.storeLogoText}>{initials(store.shortName || store.name)}</Text></View><View style={{ flex: 1 }}><Text style={styles.storeName}>{store.name}</Text><Text style={styles.storeUrl}>{store.subdomain}.bornoland.com</Text><View style={styles.storeBadges}><Badge tone={store.status === "active" ? "success" : "warning"} label={store.status} /><Badge tone="primary" label={store.plan} /></View></View>{active ? <View style={styles.check}><Text style={styles.checkText}>✓</Text></View> : <Icon name="chevron" color={colors.textSoft} />}</Pressable>; }) : <Card><EmptyState title="No stores yet" message="Create your first store to begin selling online." action="Create store" onAction={() => setCreating(true)} /></Card>}
  </Screen>;
}

type Settings = { currencyCode?: string; locale?: string; taxRate?: number; decimalPlaces?: number; allowGuestCheckout?: boolean; lowStockThreshold?: number; orderPrefix?: string };
export function SettingsScreen() {
  const { currentStore, mutate } = useApp(); const [settings, setSettings] = useState<Settings>({ currencyCode: "BDT", locale: "en-BD", taxRate: 0, decimalPlaces: 0, allowGuestCheckout: true, lowStockThreshold: 5, orderPrefix: "BN" }); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!currentStore) return; apiRequest<ApiEnvelope<{ settings: Settings }>>(`/stores/${currentStore._id}/settings`).then((result) => result.data?.settings && setSettings(result.data.settings)).catch(() => undefined); }, [currentStore?._id]);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async () => { if (!currentStore) return; setSaving(true); try { await mutate(`/stores/${currentStore._id}/settings`, "PUT", settings); Alert.alert("Settings saved", "Store configuration has been updated."); } catch (caught) { Alert.alert("Save failed", caught instanceof Error ? caught.message : "Please try again."); } finally { setSaving(false); } };
  return <Screen>
    <Card style={styles.form}><Text style={styles.formTitle}>Regional settings</Text><Text style={styles.formHint}>Currency and number formatting used across the storefront.</Text><Field label="Currency code" value={settings.currencyCode} onChangeText={(value) => update("currencyCode", value.toUpperCase())} placeholder="BDT" autoCapitalize="characters" /><Field label="Locale" value={settings.locale} onChangeText={(value) => update("locale", value)} placeholder="en-BD" /><Field label="Tax rate (%)" value={String(settings.taxRate ?? 0)} onChangeText={(value) => update("taxRate", Number(value || 0))} keyboardType="decimal-pad" /></Card>
    <Card style={styles.form}><Text style={styles.formTitle}>Orders & inventory</Text><Field label="Order number prefix" value={settings.orderPrefix} onChangeText={(value) => update("orderPrefix", value.toUpperCase())} placeholder="BN" /><Field label="Low-stock threshold" value={String(settings.lowStockThreshold ?? 5)} onChangeText={(value) => update("lowStockThreshold", Number(value || 0))} keyboardType="number-pad" /><View style={styles.switchRow}><View style={{ flex: 1 }}><Text style={styles.switchTitle}>Guest checkout</Text><Text style={styles.formHint}>Allow checkout without an account.</Text></View><Switch value={settings.allowGuestCheckout} onValueChange={(value) => update("allowGuestCheckout", value)} trackColor={{ true: colors.primary }} /></View></Card>
    <AppButton loading={saving} title="Save settings" onPress={save} />
  </Screen>;
}

export function ProfileScreen() {
  const { user, currentStore, isAdmin, isDemo, signOut, navigate } = useApp(); const [loading, setLoading] = useState(false);
  const logout = () => Alert.alert("Sign out?", "You’ll need to sign in again to access Bornoland.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: async () => { setLoading(true); await signOut(); setLoading(false); } }]);
  return <Screen>
    <Card style={styles.profileHero}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{initials(user?.name)}</Text></View><Text style={styles.profileName}>{user?.name}</Text><Text style={styles.profileEmail}>{user?.email}</Text><View style={styles.storeBadges}><Badge label={user?.role || "Owner"} tone="primary" />{isDemo ? <Badge label="Demo" tone="warning" /> : null}</View></Card>
    <Card style={styles.menu}><Menu label="Account details" icon="profile" onPress={() => navigate("account")} /><Menu label="Security & sessions" icon="settings" onPress={() => navigate("security")} border /><Menu label="Notifications" icon="notifications" onPress={() => navigate("notifications")} border /><Menu label="Help & support" icon="help" onPress={() => navigate("help")} border /></Card>
    <Card style={styles.planCard}><Text style={styles.planKicker}>{isAdmin ? "PLATFORM ACCESS" : currentStore ? "CURRENT STORE" : "WORKSPACE"}</Text><Text style={styles.planName}>{isAdmin ? "Bornoland Administration" : currentStore?.name || "All stores"}</Text><Text style={styles.formHint}>{isAdmin ? "Super admin · Platform operator" : currentStore ? `${currentStore.plan} plan · ${currentStore.status}` : "Choose a store to enter its management dashboard."}</Text></Card>
    <AppButton loading={loading} variant="danger" title="Sign out" onPress={logout} />
  </Screen>;
}

type UserPreferences = { theme: "light" | "dark" | "system"; dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"; emailNotifications: boolean; browserNotifications: boolean; marketingEmails: boolean };
type UserProfile = { id: string; name: string; username: string; email: string; phone: string; company: string; storeName: string; country: string; timezone: string; language: string; bio: string; avatarUrl: string; role: string; tenantId: string; preferences: UserPreferences };

const emptyProfile: UserProfile = { id: "", name: "", username: "", email: "", phone: "", company: "", storeName: "", country: "", timezone: "Asia/Dhaka", language: "en", bio: "", avatarUrl: "", role: "", tenantId: "", preferences: { theme: "system", dateFormat: "DD/MM/YYYY", emailNotifications: true, browserNotifications: true, marketingEmails: false } };

export function AccountDetailsScreen() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => { apiRequest<ApiEnvelope<{ profile: UserProfile }>>("/profile").then((result) => result.data?.profile && setProfile(result.data.profile)).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load profile.")).finally(() => setLoading(false)); }, []);
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, [key]: value } }));
  const save = async () => {
    setError("");
    if (profile.name.trim().length < 2) return setError("Name must contain at least 2 characters.");
    if (profile.username.length < 3 || !/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(profile.username)) return setError("Use 3–30 lowercase letters, numbers, dots, hyphens, or underscores for username.");
    if (!profile.email.includes("@")) return setError("Enter a valid email address.");
    if (profile.phone && !/^\+?[0-9][0-9\s()-]{6,20}$/.test(profile.phone)) return setError("Enter a valid phone number.");
    if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(profile.language)) return setError("Use a language code such as en or en-US.");
    setSaving(true);
    try {
      const { id: _id, avatarUrl: _avatar, role: _role, tenantId: _tenant, ...body } = profile;
      const result = await apiRequest<ApiEnvelope<{ profile: UserProfile }>>("/profile", { method: "PATCH", body });
      if (result.data?.profile) setProfile(result.data.profile);
      Alert.alert("Profile updated", result.message || "Your account details have been saved.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update profile."); }
    finally { setSaving(false); }
  };
  if (loading) return <Screen><Card style={styles.form}><Text style={styles.formHint}>Loading profile…</Text></Card></Screen>;
  return <Screen>
    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
    <Card style={styles.form}><Text style={styles.formTitle}>Personal information</Text><Field label="Full name" value={profile.name} onChangeText={(value) => update("name", value)} /><Field label="Username" value={profile.username} onChangeText={(value) => update("username", value.toLowerCase())} autoCapitalize="none" /><Field label="Email" value={profile.email} onChangeText={(value) => update("email", value.toLowerCase())} keyboardType="email-address" autoCapitalize="none" /><Field label="Phone" value={profile.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" /><Field label="Bio" value={profile.bio} onChangeText={(value) => update("bio", value)} multiline maxLength={500} /></Card>
    <Card style={styles.form}><Text style={styles.formTitle}>Business & locale</Text><Field label="Company" value={profile.company} onChangeText={(value) => update("company", value)} /><Field label="Store name" value={profile.storeName} onChangeText={(value) => update("storeName", value)} /><Field label="Country" value={profile.country} onChangeText={(value) => update("country", value)} /><Field label="Timezone" value={profile.timezone} onChangeText={(value) => update("timezone", value)} autoCapitalize="none" /><Field label="Language" value={profile.language} onChangeText={(value) => update("language", value)} autoCapitalize="none" /></Card>
    <Card style={styles.form}><Text style={styles.formTitle}>Preferences</Text><PreferenceSwitch label="Email notifications" value={profile.preferences.emailNotifications} onChange={(value) => updatePreference("emailNotifications", value)} /><PreferenceSwitch label="Browser notifications" value={profile.preferences.browserNotifications} onChange={(value) => updatePreference("browserNotifications", value)} /><PreferenceSwitch label="Marketing emails" value={profile.preferences.marketingEmails} onChange={(value) => updatePreference("marketingEmails", value)} /></Card>
    <AppButton loading={saving} title="Save profile" onPress={save} />
  </Screen>;
}

type LoginSession = { id: string; browser: string; device: string; ipAddress: string; location: string; createdAt: string; expiresAt: string; current: boolean };

export function SecurityScreen() {
  const { signOut } = useApp(); const [sessions, setSessions] = useState<LoginSession[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [currentPassword, setCurrentPassword] = useState(""); const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [error, setError] = useState("");
  const loadSessions = () => apiRequest<ApiEnvelope<{ sessions: LoginSession[] }>>("/profile/sessions").then((result) => setSessions(result.data?.sessions ?? [])).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load sessions.")).finally(() => setLoading(false));
  useEffect(() => { void loadSessions(); }, []);
  const changePassword = async () => {
    setError("");
    if (!currentPassword) return setError("Enter your current password.");
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) return setError("New password needs 8+ characters with uppercase, lowercase, number, and special character.");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    if (currentPassword === newPassword) return setError("New password must differ from the current password.");
    setSaving(true);
    try { await apiRequest("/profile/change-password", { method: "POST", body: { currentPassword, newPassword, confirmPassword } }); Alert.alert("Password changed", "Other sessions have been signed out. Please sign in again."); await signOut(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not change password."); }
    finally { setSaving(false); }
  };
  const logoutAll = () => Alert.alert("Sign out all devices?", "Every active session, including this device, will be revoked.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out all", style: "destructive", onPress: async () => { setSaving(true); try { await apiRequest("/profile/sessions", { method: "DELETE" }); } finally { await signOut(); setSaving(false); } } }]);
  return <Screen>
    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
    <Card style={styles.form}><Text style={styles.formTitle}>Change password</Text><Text style={styles.formHint}>Changing your password revokes every other session.</Text><Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry /><Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry /><Field label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry /><AppButton loading={saving} title="Change password" onPress={changePassword} /></Card>
    <Card style={styles.form}><View style={styles.heading}><View><Text style={styles.formTitle}>Active sessions</Text><Text style={styles.formHint}>{loading ? "Loading…" : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}</Text></View><AppButton compact variant="danger" title="Sign out all" disabled={loading || saving} onPress={logoutAll} /></View>{sessions.map((session, index) => <View key={session.id} style={[styles.sessionRow, index > 0 && styles.menuBorder]}><View style={{ flex: 1 }}><Text style={styles.sessionTitle}>{session.browser || "Unknown browser"} · {session.device || "Unknown device"}</Text><Text style={styles.formHint}>{session.location || session.ipAddress || "Unknown location"}</Text></View>{session.current ? <Badge label="Current" tone="success" /> : null}</View>)}</Card>
  </Screen>;
}

function PreferenceSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.switchRow}><Text style={styles.switchTitle}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} /></View>; }

function Menu({ label, icon, onPress, border }: { label: string; icon: keyof typeof import("../components/ui").glyphs; onPress: () => void; border?: boolean }) { return <Pressable onPress={onPress} style={[styles.menuRow, border && styles.menuBorder]}><View style={styles.menuIcon}><Icon name={icon} color={colors.primary} /></View><Text style={styles.menuLabel}>{label}</Text><Icon name="chevron" color={colors.textSoft} /></Pressable>; }

const styles = StyleSheet.create({
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, title: { color: colors.text, fontSize: 20, fontWeight: "900" }, subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 4 }, store: { minHeight: 112, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 15, flexDirection: "row", alignItems: "center", gap: 13 }, storeActive: { borderColor: colors.primary, backgroundColor: "#FBFCFF" }, storeLogo: { width: 53, height: 53, borderRadius: 16, alignItems: "center", justifyContent: "center" }, storeLogoText: { color: "#fff", fontSize: 12, fontWeight: "900" }, storeName: { color: colors.text, fontSize: 14, fontWeight: "900" }, storeUrl: { color: colors.textMuted, fontSize: 10, marginTop: 4 }, storeBadges: { flexDirection: "row", gap: 5, marginTop: 8 }, check: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, checkText: { color: "#fff", fontWeight: "900" },
  form: { gap: 15 }, formTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, formHint: { color: colors.textMuted, fontSize: 11, lineHeight: 17 }, urlPreview: { color: colors.primary, fontSize: 10, marginTop: -9 }, actions: { flexDirection: "row", gap: 10 }, switchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 3 }, switchTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  profileHero: { alignItems: "center", paddingVertical: 28 }, profileAvatar: { width: 76, height: 76, borderRadius: 25, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }, profileAvatarText: { color: "#fff", fontSize: 20, fontWeight: "900" }, profileName: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 14 }, profileEmail: { color: colors.textMuted, fontSize: 11, marginTop: 5 }, menu: { paddingVertical: 1 }, menuRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 11 }, menuBorder: { borderTopWidth: 1, borderTopColor: colors.border }, menuIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, menuLabel: { flex: 1, color: colors.text, fontSize: 12, fontWeight: "700" }, planCard: { backgroundColor: colors.primarySoft, borderColor: "#D8E2FF" }, planKicker: { color: colors.primary, fontSize: 9, letterSpacing: 0.8, fontWeight: "800" }, planName: { color: colors.text, fontWeight: "900", fontSize: 15, marginTop: 7 }, errorBox: { borderRadius: radius.md, backgroundColor: colors.dangerSoft, padding: 12 }, errorText: { color: colors.danger, fontSize: 11 }, sessionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 10 }, sessionTitle: { color: colors.text, fontSize: 11, fontWeight: "800" },
});
