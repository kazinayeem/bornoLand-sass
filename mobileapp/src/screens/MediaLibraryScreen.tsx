import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { ApiError, clearApiCache } from "../lib/api";
import { AppButton, Badge, Card, EmptyState, ErrorState, Field, Icon, Screen, SearchBox, Skeleton } from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { mediaApi, uploadMediaAsset } from "../features/media/media-api";
import { MEDIA_FILTERS, MEDIA_FOLDERS, formatBytes, isImage, mediaCopyUrl, mediaDownloadUrl, mediaFilterQuery, mediaPreviewUrl, normalizedFolder } from "../features/media/media-helpers";
import { useMediaUploadQueue } from "../features/media/use-media-upload-queue";
import type { LocalUploadAsset, MediaFile, MediaFilter, MediaListData, MediaSort, MediaUsageSummary } from "../features/media/media-types";

const PAGE_SIZE = 24;
const SORTS: Array<{ value: MediaSort; label: string }> = [
  { value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" }, { value: "name-asc", label: "Name" }, { value: "name-desc", label: "Name Z–A" },
];

function asUploadAsset(asset: { uri: string; name?: string | null; fileName?: string | null; mimeType?: string | null; size?: number; fileSize?: number }): LocalUploadAsset {
  return { uri: asset.uri, name: asset.name || asset.fileName || `upload-${Date.now()}`, mimeType: asset.mimeType || "application/octet-stream", size: asset.size ?? asset.fileSize };
}

export function MediaLibraryScreen() {
  const { currentStore, getFeature, navigate } = useApp();
  const [data, setData] = useState<MediaListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [sort, setSort] = useState<MediaSort>("newest");
  const [folder, setFolder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [grid, setGrid] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null);
  const [detailUsage, setDetailUsage] = useState<MediaUsageSummary | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [renameFile, setRenameFile] = useState<MediaFile | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [mutating, setMutating] = useState(false);

  const feature = getFeature("media");
  const storeId = currentStore?._id;
  const load = useCallback(async (refresh = false) => {
    if (!storeId) { setLoading(false); return; }
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      if (refresh) clearApiCache();
      const result = await mediaApi.list(storeId, { search: debouncedSearch || undefined, folder: folder || undefined, sort, page, limit: PAGE_SIZE, ...mediaFilterQuery(filter) });
      if (!result.data) throw new Error(result.message || "Media response was empty.");
      setData(result.data);
      setSelected(new Set());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load media.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [debouncedSearch, filter, folder, page, sort, storeId]);

  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filter, folder, sort, storeId]);
  useEffect(() => { void load(); }, [load]);
  const onUploaded = useCallback(() => { setNotice("Upload complete"); void load(true); }, [load]);
  const queue = useMediaUploadQueue(storeId, normalizedFolder(folder), onUploaded);

  const stats = data?.globalStats ?? data?.stats;
  const uploadBlockReason = useMemo(() => {
    if (feature?.locked || feature?.enabled === false) return feature.lockReason || "Media library is not included in this plan.";
    if (stats?.uploadsSuspended) return "Uploads are currently suspended for this store.";
    if (stats && !stats.unlimited && stats.limitBytes <= 0) return "Storage is not included in your current plan.";
    if (stats && !stats.unlimited && stats.usedBytes >= stats.limitBytes) return `Storage limit reached (${formatBytes(stats.usedBytes)} / ${formatBytes(stats.limitBytes)}).`;
    return "";
  }, [feature, stats]);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const pickDocuments = async (replaceTarget?: MediaFile) => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "video/*", "audio/*"], multiple: !replaceTarget, copyToCacheDirectory: true });
    if (result.canceled) return;
    const assets = result.assets.map(asUploadAsset);
    if (replaceTarget && assets[0]) await uploadReplacement(replaceTarget, assets[0]);
    else queue.enqueue(assets);
  };
  const pickPhotos = async (replaceTarget?: MediaFile) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission required", "Allow photo library access to select images and videos."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], allowsMultipleSelection: !replaceTarget, quality: 1 });
    if (result.canceled) return;
    const assets = result.assets.map(asUploadAsset);
    if (replaceTarget && assets[0]) await uploadReplacement(replaceTarget, assets[0]);
    else queue.enqueue(assets);
  };
  const chooseUpload = (replaceTarget?: MediaFile) => {
    if (uploadBlockReason) { Alert.alert("Upload unavailable", uploadBlockReason, [{ text: "Cancel", style: "cancel" }, { text: "Upgrade plan", onPress: () => navigate("billing") }]); return; }
    Alert.alert(replaceTarget ? "Choose replacement" : "Upload media", "Select a source", [
      { text: "Photos & videos", onPress: () => void pickPhotos(replaceTarget) },
      { text: "Files", onPress: () => void pickDocuments(replaceTarget) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadReplacement = async (target: MediaFile, asset: LocalUploadAsset) => {
    if (!storeId) return;
    setMutating(true);
    try {
      const uploaded = await uploadMediaAsset(storeId, asset, normalizedFolder(target.folder), () => undefined);
      await mediaApi.replace(storeId, target._id, uploaded._id);
      setDetailFile(null); setNotice("File replaced across all references"); await load(true);
    } catch (caught) { Alert.alert("Replace failed", caught instanceof Error ? caught.message : "Could not replace file."); }
    finally { setMutating(false); }
  };

  const openDetail = async (file: MediaFile) => {
    setDetailFile(file); setDetailUsage(null); setDetailLoading(true);
    if (!storeId) return;
    try { const result = await mediaApi.detail(storeId, file._id); setDetailFile(result.data?.file ?? file); setDetailUsage(result.data?.usage ?? null); }
    catch (caught) { setNotice(caught instanceof Error ? caught.message : "Could not load media details."); }
    finally { setDetailLoading(false); }
  };
  const copyUrl = async (file: MediaFile) => { await Clipboard.setStringAsync(mediaCopyUrl(file)); setNotice("URL copied"); };
  const submitRename = async () => {
    if (!storeId || !renameFile || !renameValue.trim()) return;
    setMutating(true);
    try { await mediaApi.rename(storeId, renameFile._id, renameValue.trim()); setRenameFile(null); setDetailFile(null); setNotice("File renamed"); await load(true); }
    catch (caught) { Alert.alert("Rename failed", caught instanceof Error ? caught.message : "Could not rename file."); }
    finally { setMutating(false); }
  };
  const requestDelete = async (file: MediaFile) => {
    if (!storeId) return;
    let usage = detailFile?._id === file._id ? detailUsage : null;
    try { if (!usage) usage = (await mediaApi.usage(storeId, file._id)).data?.usage ?? null; }
    catch { /* Backend still performs the authoritative reference check. */ }
    const used = (usage?.total ?? file.referenceCount ?? 0) > 0;
    const usedBy = usage ? Object.entries(usage.byEntityType).map(([type, count]) => `${type}: ${count}`).join(", ") : `${file.referenceCount ?? 0} place(s)`;
    Alert.alert("Delete file", used ? `This file is used in ${usedBy}. Delete anyway?` : `Delete “${file.displayName || file.originalName}”? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: used ? "Delete anyway" : "Delete", style: "destructive", onPress: () => void deleteFile(file, used) },
    ]);
  };
  const deleteFile = async (file: MediaFile, force: boolean) => {
    if (!storeId) return;
    setMutating(true);
    try { await mediaApi.remove(storeId, file._id, force); setDetailFile(null); setNotice(force ? "File force deleted" : "File deleted"); await load(true); }
    catch (caught) { Alert.alert("Delete failed", caught instanceof Error ? caught.message : "Could not delete file."); }
    finally { setMutating(false); }
  };
  const bulkDelete = () => {
    if (!storeId || selected.size === 0) return;
    Alert.alert("Delete selected files", `Delete ${selected.size} selected file${selected.size === 1 ? "" : "s"}? Files in use will be reported by the server.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setMutating(true);
        try {
          const result = await mediaApi.bulkRemove(storeId, [...selected]);
          const failed = result.data?.failed ?? 0;
          setNotice(failed ? `${result.data?.deleted ?? 0} deleted; ${failed} could not be deleted` : `${result.data?.deleted ?? selected.size} files deleted`);
          await load(true);
        } catch (caught) { Alert.alert("Bulk delete failed", caught instanceof Error ? caught.message : "Could not delete selected files."); }
        finally { setMutating(false); }
      } },
    ]);
  };
  const submitImport = async () => {
    if (!storeId) return;
    const value = importUrl.trim();
    if (!/^https?:\/\//i.test(value)) { Alert.alert("Invalid URL", "URL must start with http:// or https://"); return; }
    try { new URL(value); } catch { Alert.alert("Invalid URL", "Enter a valid URL."); return; }
    setMutating(true);
    try { await mediaApi.importUrl(storeId, value, normalizedFolder(folder)); setImportOpen(false); setImportUrl(""); setNotice("Image imported from URL"); await load(true); }
    catch (caught) { Alert.alert("Import failed", caught instanceof Error ? caught.message : "Could not import this URL."); }
    finally { setMutating(false); }
  };

  if (!currentStore) return <Screen><EmptyState title="Select a store" message="Choose a store before opening its media library." action="Choose store" onAction={() => navigate("stores")} /></Screen>;
  if (feature?.locked || feature?.enabled === false) return <Screen><ErrorState message={feature.lockReason || "Media library is not included in this plan."} /><AppButton title="View plans" onPress={() => navigate("billing")} /></Screen>;

  return <Screen refreshing={refreshing} onRefresh={() => void load(true)}>
    <View style={styles.headingRow}><View style={{ flex: 1 }}><Text style={styles.title}>Media Library</Text><Text style={styles.subtitle}>{data?.total ?? 0} files</Text></View><View style={styles.viewToggle}><Pressable onPress={() => setGrid(true)} style={[styles.viewButton, grid && styles.viewActive]}><Text style={[styles.viewText, grid && styles.viewTextActive]}>Grid</Text></Pressable><Pressable onPress={() => setGrid(false)} style={[styles.viewButton, !grid && styles.viewActive]}><Text style={[styles.viewText, !grid && styles.viewTextActive]}>List</Text></Pressable></View></View>
    {stats ? <StorageCard stats={stats} onUpgrade={() => navigate("billing")} /> : null}
    {notice ? <Pressable onPress={() => setNotice("")}><Card style={styles.notice}><Text style={styles.noticeText}>{notice}</Text><Text style={styles.noticeClose}>×</Text></Card></Pressable> : null}
    <SearchBox value={search} onChangeText={setSearch} placeholder="Search filename, extension, mime type…" />
    <ChipScroller items={[{ value: "", label: "All Media" }, ...MEDIA_FOLDERS.map((value) => ({ value, label: value }))]} value={folder ?? ""} onChange={(value) => setFolder(value || null)} />
    <ChipScroller items={MEDIA_FILTERS} value={filter} onChange={(value) => setFilter(value as MediaFilter)} />
    <ChipScroller items={SORTS} value={sort} onChange={(value) => setSort(value as MediaSort)} />
    <View style={styles.actionRow}><AppButton compact title="Upload" disabled={Boolean(uploadBlockReason)} onPress={() => chooseUpload()} icon={<Icon name="add" color="#fff" />} style={{ flex: 1 }} /><AppButton compact variant="secondary" title="Import URL" disabled={Boolean(uploadBlockReason)} onPress={() => setImportOpen(true)} style={{ flex: 1 }} /></View>
    {uploadBlockReason ? <Pressable onPress={() => navigate("billing")}><Text style={styles.blockReason}>{uploadBlockReason} Upgrade plan</Text></Pressable> : null}
    {queue.uploads.length ? <UploadQueue queue={queue} /> : null}
    {selected.size ? <Card style={styles.selectionBar}><Text style={styles.selectionText}>{selected.size} selected</Text><AppButton compact variant="danger" title="Delete selected" loading={mutating} onPress={bulkDelete} /><AppButton compact variant="ghost" title="Clear" onPress={() => setSelected(new Set())} /></Card> : null}
    {loading ? <Card style={{ gap: 14 }}><Skeleton height={130} /><Skeleton /><Skeleton width="70%" /></Card> : error ? <ErrorState message={error} onRetry={() => void load()} /> : !data?.files.length ? <Card><EmptyState title="No media yet" message="Upload files or import an image URL. Files are stored using your current plan limits." action={uploadBlockReason ? undefined : "Upload files"} onAction={() => chooseUpload()} /></Card> : <View style={grid ? styles.grid : styles.list}>{data.files.map((file) => <MediaCard key={file._id} file={file} grid={grid} selected={selected.has(file._id)} onSelect={() => setSelected((previous) => { const next = new Set(previous); next.has(file._id) ? next.delete(file._id) : next.add(file._id); return next; })} onOpen={() => void openDetail(file)} onCopy={() => void copyUrl(file)} />)}</View>}
    {data?.files.length ? <View style={styles.pagination}><AppButton compact variant="secondary" title="Previous" disabled={page <= 1 || loading} onPress={() => setPage((value) => Math.max(1, value - 1))} /><Text style={styles.pageText}>Page {page} of {totalPages}</Text><AppButton compact variant="secondary" title="Next" disabled={page >= totalPages || loading} onPress={() => setPage((value) => Math.min(totalPages, value + 1))} /></View> : null}
    <MediaDetailModal file={detailFile} usage={detailUsage} loading={detailLoading} mutating={mutating} onClose={() => setDetailFile(null)} onCopy={() => detailFile && void copyUrl(detailFile)} onDownload={() => detailFile && void Linking.openURL(mediaDownloadUrl(detailFile))} onRename={() => { if (!detailFile) return; setRenameFile(detailFile); setRenameValue(detailFile.displayName || detailFile.originalName); }} onReplace={() => detailFile && chooseUpload(detailFile)} onDelete={() => detailFile && void requestDelete(detailFile)} />
    <FormModal open={Boolean(renameFile)} title="Rename file" onClose={() => setRenameFile(null)}><Field label="Display name" value={renameValue} onChangeText={setRenameValue} autoFocus /><View style={styles.modalActions}><AppButton compact variant="secondary" title="Cancel" onPress={() => setRenameFile(null)} /><AppButton compact title="Save" loading={mutating} disabled={!renameValue.trim()} onPress={() => void submitRename()} /></View></FormModal>
    <FormModal open={importOpen} title="Import from URL" onClose={() => setImportOpen(false)}><Field label="File URL" value={importUrl} onChangeText={setImportUrl} autoCapitalize="none" keyboardType="url" placeholder="https://example.com/image.jpg" /><View style={styles.modalActions}><AppButton compact variant="secondary" title="Cancel" onPress={() => setImportOpen(false)} /><AppButton compact title="Import" loading={mutating} disabled={!importUrl.trim()} onPress={() => void submitImport()} /></View></FormModal>
  </Screen>;
}

function ChipScroller({ items, value, onChange }: { items: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{items.map((item) => <Pressable key={item.value || "all"} onPress={() => onChange(item.value)} style={[styles.chip, value === item.value && styles.chipActive]}><Text style={[styles.chipText, value === item.value && styles.chipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>;
}

function StorageCard({ stats, onUpgrade }: { stats: NonNullable<MediaListData["globalStats"]>; onUpgrade: () => void }) {
  const percent = stats.unlimited ? 0 : Math.min(100, Math.max(0, stats.percentUsed || 0));
  return <Card style={styles.storage}><View style={styles.storageTop}><View><Text style={styles.storageTitle}>Storage usage</Text><Text style={styles.storageValue}>{formatBytes(stats.usedBytes)}{stats.unlimited ? " used · Unlimited" : ` of ${formatBytes(stats.limitBytes)}`}</Text></View>{!stats.unlimited && percent >= 80 ? <Pressable onPress={onUpgrade}><Badge label="Upgrade" tone={percent >= 100 ? "danger" : "warning"} /></Pressable> : <Badge label={`${stats.fileCount} files`} tone="primary" />}</View>{!stats.unlimited ? <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View> : null}<View style={styles.storageCounts}><Text style={styles.count}>Images {stats.imageCount}</Text><Text style={styles.count}>Documents {stats.documentCount}</Text><Text style={styles.count}>Videos {stats.videoCount}</Text></View></Card>;
}

function MediaCard({ file, grid, selected, onSelect, onOpen, onCopy }: { file: MediaFile; grid: boolean; selected: boolean; onSelect: () => void; onOpen: () => void; onCopy: () => void }) {
  return <Pressable onPress={onOpen} style={[styles.mediaCard, grid && styles.mediaCardGrid, selected && styles.mediaSelected]}><Pressable onPress={onSelect} hitSlop={8} style={[styles.check, selected && styles.checkActive]}><Text style={styles.checkText}>{selected ? "✓" : ""}</Text></Pressable>{isImage(file) && mediaPreviewUrl(file) ? <Image source={{ uri: mediaPreviewUrl(file) }} style={[styles.preview, !grid && styles.previewList]} resizeMode="cover" /> : <View style={[styles.filePreview, !grid && styles.previewList]}><Text style={styles.extension}>{file.extension || file.fileType}</Text></View>}<View style={styles.fileInfo}><Text numberOfLines={1} style={styles.fileName}>{file.displayName || file.originalName}</Text><Text numberOfLines={1} style={styles.fileMeta}>{file.extension.toUpperCase()} · {formatBytes(file.size)}{file.referenceCount ? ` · Used ${file.referenceCount}` : ""}</Text></View><Pressable onPress={onCopy} hitSlop={8} style={styles.copyButton}><Text style={styles.copyText}>Copy</Text></Pressable></Pressable>;
}

function UploadQueue({ queue }: { queue: ReturnType<typeof useMediaUploadQueue> }) {
  return <Card style={{ gap: 12 }}><View style={styles.queueHeader}><Text style={styles.queueTitle}>Uploads</Text><View style={styles.queueControls}><Pressable onPress={queue.paused ? queue.resume : queue.pause}><Text style={styles.queueAction}>{queue.paused ? "Resume" : "Pause"}</Text></Pressable><Pressable onPress={queue.clearCompleted}><Text style={styles.queueAction}>Clear finished</Text></Pressable></View></View>{queue.uploads.map((item) => <View key={item.id} style={styles.uploadItem}><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.uploadName}>{item.name}</Text><Text style={styles.uploadMeta}>{item.status} · {item.progress}%{item.speed > 0 ? ` · ${formatBytes(item.speed)}/s` : ""}{item.eta != null && item.status === "uploading" ? ` · ${Math.ceil(item.eta)}s` : ""}</Text><View style={styles.uploadTrack}><View style={[styles.uploadFill, { width: `${item.progress}%` }]} /></View>{item.error ? <Text style={styles.uploadError}>{item.error}</Text> : null}</View>{item.status === "uploading" || item.status === "waiting" ? <Pressable onPress={() => queue.cancel(item.id)}><Text style={styles.cancelText}>Cancel</Text></Pressable> : item.status === "error" || item.status === "cancelled" ? <Pressable onPress={() => queue.retry(item.id)}><Text style={styles.queueAction}>Retry</Text></Pressable> : null}</View>)}</Card>;
}

function MediaDetailModal({ file, usage, loading, mutating, onClose, onCopy, onDownload, onRename, onReplace, onDelete }: { file: MediaFile | null; usage: MediaUsageSummary | null; loading: boolean; mutating: boolean; onClose: () => void; onCopy: () => void; onDownload: () => void; onRename: () => void; onReplace: () => void; onDelete: () => void }) {
  return <FormModal open={Boolean(file)} title="Media details" onClose={onClose}>{file ? <ScrollView showsVerticalScrollIndicator={false}>{isImage(file) && mediaPreviewUrl(file) ? <Image source={{ uri: mediaPreviewUrl(file) }} style={styles.detailImage} resizeMode="contain" /> : <View style={styles.detailPlaceholder}><Text style={styles.extension}>{file.extension}</Text></View>}{loading ? <Skeleton /> : null}<DetailRow label="Name" value={file.displayName || file.originalName} /><DetailRow label="Extension" value={file.extension.toUpperCase()} /><DetailRow label="File type" value={file.fileType} /><DetailRow label="Dimensions" value={file.width && file.height ? `${file.width} × ${file.height}` : "—"} /><DetailRow label="File size" value={formatBytes(file.size)} /><DetailRow label="Upload date" value={file.createdAt ? new Date(file.createdAt).toLocaleString() : "—"} /><DetailRow label="Usage count" value={String(usage?.total ?? file.referenceCount ?? 0)} /><DetailRow label="Folder" value={file.folder || "—"} />{usage && Object.keys(usage.byEntityType).length ? <Card style={styles.usedBy}><Text style={styles.usedByTitle}>Used by</Text>{Object.entries(usage.byEntityType).map(([type, count]) => <DetailRow key={type} label={type} value={String(count)} />)}</Card> : null}<View style={styles.detailActions}><AppButton compact variant="secondary" title="Copy URL" onPress={onCopy} /><AppButton compact variant="secondary" title="Download" onPress={onDownload} /><AppButton compact variant="secondary" title="Rename" onPress={onRename} /><AppButton compact variant="secondary" title="Replace" loading={mutating} onPress={onReplace} /><AppButton compact variant="danger" title="Delete" loading={mutating} onPress={onDelete} /></View></ScrollView> : null}</FormModal>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text selectable style={styles.detailValue}>{value}</Text></View>; }

function FormModal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}><KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}><Pressable style={styles.backdrop} onPress={onClose} /><View style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{title}</Text><Pressable onPress={onClose} hitSlop={10}><Text style={styles.sheetClose}>×</Text></Pressable></View>{children}</View></KeyboardAvoidingView></Modal>;
}

const styles = StyleSheet.create({
  headingRow: { flexDirection: "row", alignItems: "center", gap: 12 }, title: { color: colors.text, fontSize: 22, fontWeight: "900" }, subtitle: { color: colors.textMuted, marginTop: 3, fontSize: 12 },
  viewToggle: { flexDirection: "row", padding: 3, backgroundColor: "#ECEEF4", borderRadius: radius.md }, viewButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 }, viewActive: { backgroundColor: colors.surface }, viewText: { color: colors.textMuted, fontSize: 11, fontWeight: "700" }, viewTextActive: { color: colors.text },
  storage: { gap: 12 }, storageTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, storageTitle: { color: colors.text, fontSize: 14, fontWeight: "800" }, storageValue: { color: colors.textMuted, fontSize: 11, marginTop: 4 }, progressTrack: { height: 8, backgroundColor: "#ECEEF4", borderRadius: 4, overflow: "hidden" }, progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary }, storageCounts: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, count: { color: colors.textMuted, fontSize: 10 },
  notice: { flexDirection: "row", backgroundColor: colors.successSoft, borderColor: "#CDEFE0", paddingVertical: 12 }, noticeText: { flex: 1, color: colors.success, fontSize: 12, fontWeight: "700" }, noticeClose: { color: colors.success, fontSize: 17 }, chips: { gap: 8, paddingRight: 8 }, chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.black, borderColor: colors.black }, chipText: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "capitalize" }, chipTextActive: { color: "#fff" },
  actionRow: { flexDirection: "row", gap: 10 }, blockReason: { color: colors.warning, fontSize: 11, textAlign: "center", lineHeight: 17 }, selectionBar: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, backgroundColor: colors.dangerSoft, borderColor: "#FFD5D9" }, selectionText: { flex: 1, minWidth: 90, color: colors.text, fontWeight: "800", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, list: { gap: 10 }, mediaCard: { minHeight: 84, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }, mediaCardGrid: { width: "48.4%", minHeight: 180, flexDirection: "column", alignItems: "stretch" }, mediaSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, check: { position: "absolute", zIndex: 2, top: 8, left: 8, width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: "#CBD0DA", backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" }, checkActive: { backgroundColor: colors.primary, borderColor: colors.primary }, checkText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  preview: { width: "100%", height: 108, borderRadius: radius.md, backgroundColor: "#EEF0F4" }, previewList: { width: 62, height: 62 }, filePreview: { height: 108, borderRadius: radius.md, backgroundColor: "#EEF0F4", alignItems: "center", justifyContent: "center" }, extension: { color: colors.textMuted, fontSize: 16, fontWeight: "900", textTransform: "uppercase" }, fileInfo: { flex: 1, minWidth: 0 }, fileName: { color: colors.text, fontSize: 12, fontWeight: "800" }, fileMeta: { color: colors.textMuted, fontSize: 9, marginTop: 4 }, copyButton: { alignSelf: "flex-end", padding: 5 }, copyText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, pageText: { color: colors.textMuted, fontSize: 11, fontWeight: "700" }, queueHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, queueTitle: { color: colors.text, fontWeight: "900" }, queueControls: { flexDirection: "row", gap: 14 }, queueAction: { color: colors.primary, fontSize: 11, fontWeight: "800" }, uploadItem: { flexDirection: "row", alignItems: "center", gap: 12 }, uploadName: { color: colors.text, fontSize: 11, fontWeight: "700" }, uploadMeta: { color: colors.textMuted, fontSize: 9, marginTop: 3 }, uploadTrack: { height: 5, backgroundColor: "#ECEEF4", borderRadius: 3, overflow: "hidden", marginTop: 7 }, uploadFill: { height: 5, backgroundColor: colors.primary }, uploadError: { color: colors.danger, fontSize: 9, marginTop: 4 }, cancelText: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  overlay: { flex: 1, justifyContent: "flex-end" }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(12,15,23,0.48)" }, sheet: { maxHeight: "88%", backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.lg }, sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sheetTitle: { color: colors.text, fontSize: 18, fontWeight: "900" }, sheetClose: { color: colors.textMuted, fontSize: 27, lineHeight: 27 }, modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 }, detailImage: { width: "100%", height: 260, borderRadius: radius.lg, backgroundColor: "#F2F3F6", marginBottom: 12 }, detailPlaceholder: { height: 200, alignItems: "center", justifyContent: "center", backgroundColor: "#F2F3F6", borderRadius: radius.lg, marginBottom: 12 }, detailRow: { minHeight: 42, flexDirection: "row", justifyContent: "space-between", gap: 18, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 }, detailLabel: { color: colors.textMuted, fontSize: 11 }, detailValue: { flex: 1, color: colors.text, textAlign: "right", fontSize: 11, fontWeight: "700" }, usedBy: { marginTop: 14, shadowOpacity: 0 }, usedByTitle: { color: colors.text, fontSize: 12, fontWeight: "900", marginBottom: 3 }, detailActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 16 },
});
