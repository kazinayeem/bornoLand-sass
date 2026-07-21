import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { radius, spacing, useTheme } from "../theme";
import { AppButton, Badge, Card, EmptyState, Screen, Skeleton } from "../components/ui";
import { BuilderLivePreview } from "./BuilderLivePreview";
import { config } from "../config";
import { getHomePage, savePage, publishPage } from "../features/builder/builder-api";
import type { BuilderPage, BuilderSection } from "../features/builder/builder-types";
import { getAccessToken } from "../lib/api";

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

type SectionDef = {
  type: string;
  label: string;
  icon: string;
  category: string;
  props: Record<string, { label: string; type: "text" | "textarea" | "color" | "image" | "select"; options?: string[]; default?: string }>;
};

const sectionRegistry: Record<string, SectionDef> = {
  "hero-banner": {
    type: "hero-banner", label: "Hero Banner", icon: "image-outline", category: "Hero",
    props: {
      kicker: { label: "Kicker", type: "text", default: "NEW ARRIVAL" },
      headline: { label: "Headline", type: "text", default: "Biggest Sale of the Year" },
      subheadline: { label: "Subheadline", type: "textarea", default: "Limited time offer" },
      buttonText: { label: "Button Text", type: "text", default: "Shop Now" },
      buttonLink: { label: "Button Link", type: "text" },
      secondaryButtonText: { label: "Secondary Button Text", type: "text" },
      imageUrl: { label: "Image URL", type: "text" },
      heroHeight: { label: "Hero Height (px)", type: "text", default: "500" },
      overlayColor: { label: "Overlay Color", type: "text", default: "rgba(0,0,0,0.3)" },
    },
  },
  "featured-products": {
    type: "featured-products", label: "Featured Products", icon: "cube-outline", category: "Products",
    props: {
      title: { label: "Title", type: "text", default: "Featured Products" },
      subtitle: { label: "Subtitle", type: "text" },
      productIds: { label: "Product IDs (comma-separated)", type: "textarea" },
      gridColumns: { label: "Grid Columns", type: "text", default: "4" },
      showBadges: { label: "Show Badges", type: "text", default: "true" },
    },
  },
  "category-grid": {
    type: "category-grid", label: "Category Grid", icon: "grid-outline", category: "Category",
    props: {
      title: { label: "Title", type: "text", default: "Shop by Category" },
      subtitle: { label: "Subtitle", type: "text" },
      columns: { label: "Columns", type: "text", default: "3" },
    },
  },
  "rich-text": {
    type: "rich-text", label: "Rich Text", icon: "document-text-outline", category: "Content",
    props: {
      content: { label: "Content (HTML)", type: "textarea", default: "<p>Your content here</p>" },
      maxWidth: { label: "Max Width (px)", type: "text", default: "720" },
    },
  },
  testimonials: {
    type: "testimonials", label: "Testimonials", icon: "chatbubble-ellipses-outline", category: "Trust",
    props: {
      title: { label: "Title", type: "text", default: "What Our Customers Say" },
      subtitle: { label: "Subtitle", type: "text" },
      backgroundColor: { label: "Background Color", type: "text", default: "#f5f5f7" },
    },
  },
  newsletter: {
    type: "newsletter", label: "Newsletter", icon: "mail-outline", category: "Marketing",
    props: {
      title: { label: "Title", type: "text", default: "Stay in the Loop" },
      subtitle: { label: "Subtitle", type: "text", default: "Get exclusive offers and updates" },
      buttonText: { label: "Button Text", type: "text", default: "Subscribe" },
      placeholder: { label: "Placeholder", type: "text", default: "your@email.com" },
    },
  },
  footer: {
    type: "ecommerce-footer", label: "Footer", icon: "chevron-down-outline", category: "Footer",
    props: {
      description: { label: "Description", type: "textarea", default: "Your store description" },
      email: { label: "Email", type: "text" },
      phone: { label: "Phone", type: "text" },
    },
  },
};

const categoryOrder = ["Hero", "Products", "Category", "Content", "Trust", "Marketing", "Footer"];

const loadedPages = new Map<string, BuilderPage>();
function getCachedPage(storeId: string): BuilderPage | undefined { return loadedPages.get(storeId); }
function setCachedPage(storeId: string, page: BuilderPage) { loadedPages.set(storeId, page); }

function SectionCard({
  section,
  index,
  total,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: BuilderSection;
  index: number;
  total: number;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { theme } = useTheme();
  const def = sectionRegistry[section.type];
  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => [
        localStyles.sectionCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        !section.visible && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={localStyles.sectionHeader}>
        <View style={[localStyles.sectionIcon, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name={(def?.icon || "cube-outline") as keyof typeof Ionicons.glyphMap} size={18} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[localStyles.sectionLabel, { color: theme.colors.text }]}>{section.label || def?.label || section.type}</Text>
          <Text style={[localStyles.sectionType, { color: theme.colors.textMuted }]}>{section.type}</Text>
        </View>
        <Pressable onPress={onToggleVisibility} hitSlop={8} style={localStyles.iconBtn}>
          <Ionicons
            name={section.visible ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={section.visible ? theme.colors.text : theme.colors.textMuted}
          />
        </Pressable>
      </View>
      <View style={localStyles.sectionActions}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Pressable onPress={onMoveUp} disabled={index === 0} hitSlop={6} style={[localStyles.smallBtn, index === 0 && { opacity: 0.3 }]}>
            <Ionicons name="chevron-up-outline" size={16} color={theme.colors.text} />
          </Pressable>
          <Pressable onPress={onMoveDown} disabled={index === total - 1} hitSlop={6} style={[localStyles.smallBtn, index === total - 1 && { opacity: 0.3 }]}>
            <Ionicons name="chevron-down-outline" size={16} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Pressable onPress={onDuplicate} hitSlop={6} style={localStyles.smallBtn}>
            <Ionicons name="copy-outline" size={16} color={theme.colors.textMuted} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={6} style={localStyles.smallBtn}>
            <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function SectionEditor({
  section,
  visible,
  onSave,
  onClose,
}: {
  section: BuilderSection | null;
  visible: boolean;
  onSave: (updated: BuilderSection) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const [label, setLabel] = useState("");
  const [visible_, setVisible_] = useState(true);
  const [props, setProps] = useState<Record<string, string>>({});
  useEffect(() => {
    if (section) {
      setLabel(section.label || "");
      setVisible_(section.visible);
      setProps({ ...section.props });
    }
  }, [section]);
  if (!section || !visible) return null;
  const def = sectionRegistry[section.type];
  const propKeys = def ? Object.keys(def.props) : Object.keys(props);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[localStyles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[localStyles.modalHeader, { borderBottomColor: theme.colors.divider }]}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[localStyles.modalCancel, { color: theme.colors.primary }]}>Cancel</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[localStyles.modalTitle, { color: theme.colors.text }]}>
              {def?.label || section.type}
            </Text>
          </View>
          <Pressable
            onPress={() => { onSave({ ...section, label, visible: visible_, props }); onClose(); }}
            hitSlop={8}
          >
            <Text style={[localStyles.modalDone, { color: theme.colors.primary }]}>Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={[localStyles.fieldLabel, { color: theme.colors.text }]}>Label</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Section label"
            placeholderTextColor={theme.colors.placeholder}
            style={[localStyles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text }]}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text style={[localStyles.fieldLabel, { color: theme.colors.text, flex: 1 }]}>Visible</Text>
            <Pressable
              onPress={() => setVisible_(!visible_)}
              style={[localStyles.toggle, { backgroundColor: visible_ ? theme.colors.primary : theme.colors.control }]}
            >
              <View style={[localStyles.toggleDot, visible_ && { alignSelf: "flex-end" }]} />
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: spacing.sm }} />
          {propKeys.map((key) => {
            const propDef = def?.props[key];
            return (
              <View key={key}>
                <Text style={[localStyles.fieldLabel, { color: theme.colors.text }]}>{propDef?.label || key}</Text>
                <TextInput
                  value={props[key] ?? propDef?.default ?? ""}
                  onChangeText={(value) => setProps((prev) => ({ ...prev, [key]: value }))}
                  placeholder={propDef?.default || `Enter ${key}`}
                  placeholderTextColor={theme.colors.placeholder}
                  multiline={propDef?.type === "textarea"}
                  numberOfLines={propDef?.type === "textarea" ? 4 : 1}
                  style={[
                    localStyles.textInput,
                    { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text },
                    propDef?.type === "textarea" && { minHeight: 90, textAlignVertical: "top", paddingTop: 12 },
                  ]}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddSectionSheet({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (def: SectionDef) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const grouped = useMemo(() => {
    const groups: Record<string, SectionDef[]> = {};
    for (const def of Object.values(sectionRegistry)) {
      (groups[def.category] ||= []).push(def);
    }
    return categoryOrder.filter((cat) => groups[cat]).map((cat) => ({ category: cat, items: groups[cat] }));
  }, []);
  if (!visible) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={localStyles.addSheetOverlay}>
        <View style={[localStyles.addSheet, { backgroundColor: theme.colors.background }]}>
          <View style={[localStyles.addSheetHeader, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[localStyles.addSheetTitle, { color: theme.colors.text }]}>Add Section</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            {grouped.map((group) => (
              <View key={group.category}>
                <Text style={[localStyles.categoryLabel, { color: theme.colors.textSoft }]}>{group.category}</Text>
                {group.items.map((def) => (
                  <Pressable
                    key={def.type}
                    onPress={() => onSelect(def)}
                    style={({ pressed }) => [
                      localStyles.addItem,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[localStyles.addItemIcon, { backgroundColor: theme.colors.primarySoft }]}>
                      <Ionicons name={def.icon as keyof typeof Ionicons.glyphMap} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[localStyles.addItemLabel, { color: theme.colors.text }]}>{def.label}</Text>
                      <Text style={[localStyles.addItemDesc, { color: theme.colors.textMuted }]}>{def.category} section</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const loadingMessages = [
  "Loading your page builder…",
  "Preparing sections…",
  "Almost there…",
];

export function BuilderScreen() {
  const { currentStore, navigate } = useApp();
  const { theme } = useTheme();
  const [page, setPage] = useState<BuilderPage | null>(null);
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingSection, setEditingSection] = useState<BuilderSection | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const loadingMsgIndex = useRef(0);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      loadingMsgIndex.current = (loadingMsgIndex.current + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[loadingMsgIndex.current]);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const loadPage = useCallback(async (autoRetried = false, retryDelay = 1500) => {
    if (!currentStore) return;
    if (fetchingRef.current) return;

    const token = getAccessToken();
    if (!token) {
      if (!autoRetried) {
        setTimeout(() => loadPage(true, 3000), 1000);
        return;
      }
      setError("Please sign in again to use the Page Builder.");
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError("");

    const cached = getCachedPage(currentStore._id);
    if (cached) {
      setPage(cached);
      setSections(cached.sections || []);
      setLoading(false);
    }

    try {
      const homePage = await getHomePage(currentStore._id);
      const existingIds = new Map<string, true>();
      const deduped = (homePage.sections || []).filter((s) => {
        if (existingIds.get(s.id)) {
          console.warn(`Duplicate section ID detected and removed: ${s.id}`);
          return false;
        }
        existingIds.set(s.id, true);
        return true;
      });
      homePage.sections = deduped;
      setPage(homePage);
      setSections(deduped);
      if (!cached) setLoading(false);
      setCachedPage(currentStore._id, homePage);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load the page builder.";
      console.error("[Builder] load failed:", message);

      const isAuth = message.includes("Unauthorized") || message.includes("401") || message.includes("Session expired");
      const isTimeout = message.includes("408") || message.includes("timed out") || message.includes("timeout");
      const isNetwork = message.includes("Cannot reach") || message.includes("fetch") || message.includes("Network");

      if (!autoRetried) {
        const delay = isNetwork ? 3000 : retryDelay;
        setTimeout(() => loadPage(true, delay + 1000), delay);
        fetchingRef.current = false;
        return;
      }

      if (!cached) {
        if (isAuth) {
          setError("Your session has expired. Please sign in again.");
        } else if (isTimeout) {
          setError("The server is taking too long. Please try again.");
        } else if (isNetwork) {
          setError("Could not reach the server. Check your connection.");
        } else {
          setError("Could not load the page builder. Please try again.");
        }
      }
      setLoading(false);
    } finally {
      fetchingRef.current = false;
      if (!cached) setLoading(false);
    }
  }, [currentStore]);

  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => loadPage(), 300);
    return () => { if (loadTimerRef.current) clearTimeout(loadTimerRef.current); };
  }, [loadPage]);

  const handleSave = useCallback(async () => {
    if (!page) return;
    setSaving(true);
    try {
      await savePage(page._id, { sections });
    } catch (caught) {
      Alert.alert("Save failed", caught instanceof Error ? caught.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }, [page, sections]);

  const handlePublish = useCallback(async () => {
    if (!page) return;
    Alert.alert("Publish", "Make these changes live on your storefront?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Publish", style: "default",
        onPress: async () => {
          try {
            await handleSave();
            await publishPage(page._id);
            Alert.alert("Published", "Your storefront has been updated");
            loadPage();
          } catch (caught) {
            Alert.alert("Publish failed", caught instanceof Error ? caught.message : "Could not publish");
          }
        },
      },
    ]);
  }, [page, handleSave, loadPage]);

  const handleSaveSection = useCallback((updated: BuilderSection) => {
    setSections((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  }, []);

  const addSection = useCallback((def: SectionDef) => {
    const newSection: BuilderSection = {
      id: generateId(),
      type: def.type,
      label: def.label,
      visible: true,
      props: Object.fromEntries(
        Object.entries(def.props).map(([key, propDef]) => [key, propDef.default ?? ""])
      ),
    };
    setSections((prev) => {
      const exists = prev.some((s) => s.id === newSection.id);
      if (exists) return prev;
      return [...prev, newSection];
    });
    setShowAddSheet(false);
  }, []);

  const duplicateSection = useCallback((index: number) => {
    setSections((prev) => {
      const original = prev[index];
      const copy: BuilderSection = {
        ...original,
        id: generateId(),
        label: `${original.label} (Copy)`,
      };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }, []);

  const deleteSection = useCallback((index: number) => {
    Alert.alert("Delete section", "Remove this section from the page?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setSections((prev) => prev.filter((_, i) => i !== index)) },
    ]);
  }, []);

  const moveSection = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, [sections.length]);

  if (!currentStore) {
    return (
      <Screen>
        <Card>
          <EmptyState icon="construct-outline" title="No Store Selected" message="Select a store to open the Page Builder." action="Go to Stores" onAction={() => navigate("stores")} />
        </Card>
      </Screen>
    );
  }

  if (loading && !page) {
    return (
      <Screen>
        <View style={[localStyles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="construct-outline" size={40} color={theme.colors.primary} />
          <Text style={[localStyles.loadingText, { color: theme.colors.text }]}>{loadingMessage}</Text>
          <View style={{ width: "80%", gap: spacing.sm }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={72} radiusValue={14} />
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (error && !page) {
    return (
      <Screen>
        <Card>
          <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.section }}>
            <Ionicons name="warning-outline" size={48} color={theme.colors.danger} />
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700" }}>Could not load builder</Text>
            <Text style={{ color: theme.colors.textMuted, textAlign: "center", maxWidth: 280, lineHeight: 20 }}>{error}</Text>
            <AppButton compact title="Retry" onPress={() => { setRetryCount((r) => r + 1); loadPage(); }} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={[localStyles.pageTitle, { color: theme.colors.text }]}>{page?.title || "Home Page"}</Text>
          <Text style={[localStyles.pageStatus, { color: theme.colors.textMuted }]}>
            {sections.length} section{sections.length === 1 ? "" : "s"}
            {page?.status === "published" ? " · Published" : page?.status === "draft" ? " · Draft" : ""}
          </Text>
        </View>
        <Badge tone={page?.status === "published" ? "success" : "neutral"} label={page?.status || "draft"} />
      </Card>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <AppButton compact variant="secondary" title="Preview" icon={<Ionicons name="eye-outline" size={16} color={theme.colors.primary} />}
          onPress={() => {
            const previewUrl_ = currentStore
              ? `${config.webUrl}/site/${currentStore.subdomain}?preview=1`
              : config.webUrl;
            setPreviewUrl(previewUrl_);
            setShowPreview(true);
          }}
          style={{ flex: 1 }}
        />
        <AppButton compact variant="secondary" title="Save" loading={saving} icon={<Ionicons name="cloud-upload-outline" size={16} color={theme.colors.primary} />}
          onPress={handleSave}
          style={{ flex: 1 }}
        />
        <AppButton compact title="Publish" icon={<Ionicons name="checkmark-outline" size={16} color="#fff" />}
          onPress={handlePublish}
          style={{ flex: 1 }}
        />
      </View>

      {sections.length === 0 ? (
        <Card>
          <EmptyState icon="construct-outline" title="No Sections Yet" message="Start building your page by adding sections." action="Add Section" onAction={() => setShowAddSheet(true)} />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              onEdit={() => { setEditingSection(section); setShowEditor(true); }}
              onToggleVisibility={() => setSections((prev) => prev.map((s, i) => i === index ? { ...s, visible: !s.visible } : s))}
              onDuplicate={() => duplicateSection(index)}
              onDelete={() => deleteSection(index)}
              onMoveUp={() => moveSection(index, -1)}
              onMoveDown={() => moveSection(index, 1)}
            />
          ))}
        </View>
      )}

      <AppButton title="Add Section" variant="secondary" icon={<Ionicons name="add-outline" size={18} color={theme.colors.primary} />}
        onPress={() => setShowAddSheet(true)}
      />

      <SectionEditor section={editingSection} visible={showEditor} onSave={handleSaveSection} onClose={() => setShowEditor(false)} />
      <AddSectionSheet visible={showAddSheet} onSelect={addSection} onClose={() => setShowAddSheet(false)} />
      <BuilderLivePreview visible={showPreview} url={previewUrl} onClose={() => setShowPreview(false)} title={page?.title || "Store Preview"} />
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
  sectionCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontSize: 15, fontWeight: "600", letterSpacing: -0.2 },
  sectionType: { fontSize: 11, marginTop: 1 },
  sectionActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 36 + spacing.sm },
  smallBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  modalCancel: { fontSize: 16, fontWeight: "400" },
  modalDone: { fontSize: 16, fontWeight: "600" },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4, letterSpacing: -0.1 },
  textInput: { minHeight: 46, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 16, fontSize: 16 },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: "center" },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },
  pageTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  pageStatus: { fontSize: 12, marginTop: 2 },
  addSheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  addSheet: { maxHeight: "80%", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  addSheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  addSheetTitle: { fontSize: 18, fontWeight: "700" },
  categoryLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  addItem: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.xs,
  },
  addItemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  addItemLabel: { fontSize: 15, fontWeight: "600" },
  addItemDesc: { fontSize: 11, marginTop: 1 },
});
