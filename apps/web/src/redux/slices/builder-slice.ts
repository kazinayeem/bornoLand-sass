import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PageType, HeaderSettings, FooterSettings } from "@/redux/api/store-page-api";

export type SectionProps = Record<string, string>;

export type SectionStyle = {
  paddingTop?: string; paddingBottom?: string; paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string;
  backgroundColor?: string; backgroundGradient?: string;
  borderColor?: string; borderWidth?: string; borderRadius?: string; borderStyle?: string;
  shadow?: string; opacity?: string;
  width?: string; maxWidth?: string; minHeight?: string;
  hideOnDesktop?: boolean; hideOnTablet?: boolean; hideOnMobile?: boolean;
  customCss?: string;
  animation?: string; animationDuration?: string; animationDelay?: string;
};

export type BuilderSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  favorite?: boolean;
  collapsed?: boolean;
  props: SectionProps;
  style?: SectionStyle;
};

export type LeftTab = "layers" | "pages" | "components" | "templates" | "media" | "navigator" | "history" | "theme" | "assets";
export type RightTab = "content" | "style" | "layout" | "responsive" | "animation" | "advanced" | "seo" | "visibility";

// ─── Page metadata ───────────────────────────────────────────────────────────

export type PageMetadata = {
  id: string | null;
  title: string;
  slug: string;
  pageType: PageType;
  isSystem: boolean;
  description: string;
  status: "draft" | "published" | "scheduled" | "archived";
};

type BuilderState = {
  // Page info
  page: PageMetadata;

  // Backward-compatible — will be removed once all components migrate to `page.id`
  pageId: string | null;

  // Main sections (page body)
  sections: BuilderSection[];

  // Header sections (independent section list for header)
  headerSections: BuilderSection[];
  // Footer sections (independent section list for footer)
  footerSections: BuilderSection[];

  // Global section references
  globalSectionIds: string[];

  // Header/Footer settings
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;

  // Selection
  editingZone: "body" | "header" | "footer";
  selectedSectionId: string | null;
  hoveredSectionId: string | null;
  editingSectionId: string | null;

  // UI panels
  activeTab: LeftTab;
  activeRightTab: RightTab;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelPinned: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;

  // Display modes
  fullscreen: boolean;
  presentationMode: boolean;

  // Save state
  isDirty: boolean;
  lastSaved: string | null;
  lastSaveError: string | null;
  saving: boolean;
  publishing: boolean;

  // Clipboard
  clipboardSection: BuilderSection | null;

  // Section Library Modal
  sectionLibrary: {
    isOpen: boolean;
    searchTerm: string;
    activeCategory: string | "all";
    favoriteSections: string[];
    recentlyUsed: string[];
    insertPosition: number | null; // null = end, number = insert after index
    anchorPosition: { top: number; left: number } | null; // Position for popover
  };

  // Undo/redo
  past: BuilderSection[][];
  future: BuilderSection[][];
};

const initialState: BuilderState = {
  page: {
    id: null,
    title: "Home",
    slug: "/",
    pageType: "home",
    isSystem: true,
    description: "",
    status: "draft",
  },
  pageId: null,
  sections: [],
  headerSections: [],
  footerSections: [],
  globalSectionIds: [],
  headerSettings: {},
  footerSettings: {},
  editingZone: "body",
  selectedSectionId: null,
  hoveredSectionId: null,
  editingSectionId: null,
  activeTab: "layers",
  activeRightTab: "content",
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelPinned: true,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  fullscreen: false,
  presentationMode: false,
  isDirty: false,
  lastSaved: null,
  lastSaveError: null,
  saving: false,
  publishing: false,
  clipboardSection: null,
  sectionLibrary: {
    isOpen: false,
    searchTerm: "",
    activeCategory: "all",
    favoriteSections: [],
    recentlyUsed: [],
    insertPosition: null,
    anchorPosition: null,
  },
  past: [],
  future: [],
};

// ─── Helper: get active sections based on editingZone ────────────────────────

function getSections(state: BuilderState): BuilderSection[] {
  if (state.editingZone === "header") return state.headerSections;
  if (state.editingZone === "footer") return state.footerSections;
  return state.sections;
}

function setSectionsForZone(state: BuilderState, sections: BuilderSection[]): void {
  if (state.editingZone === "header") state.headerSections = sections;
  else if (state.editingZone === "footer") state.footerSections = sections;
  else state.sections = sections;
}

function pushHistory(state: BuilderState) {
  const current = getSections(state);
  state.past.push(current.map((section) => ({ ...section, props: { ...section.props } })));
  if (state.past.length > 50) state.past.shift();
  state.future = [];
}

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    // ─── Page management ────────────────────────────────────────────────────
    setPageMetadata(state, action: PayloadAction<Partial<PageMetadata>>) {
      state.page = { ...state.page, ...action.payload };
      if (action.payload.id !== undefined) state.pageId = action.payload.id;
    },

    loadPage(state, action: PayloadAction<{
      page: PageMetadata;
      sections: BuilderSection[];
      headerSections?: BuilderSection[];
      footerSections?: BuilderSection[];
      globalSectionIds?: string[];
      headerSettings?: HeaderSettings;
      footerSettings?: FooterSettings;
    }>) {
      state.page = action.payload.page;
      state.pageId = action.payload.page.id;
      state.sections = action.payload.sections;
      state.headerSections = action.payload.headerSections ?? [];
      state.footerSections = action.payload.footerSections ?? [];
      state.globalSectionIds = action.payload.globalSectionIds ?? [];
      state.headerSettings = action.payload.headerSettings ?? {};
      state.footerSettings = action.payload.footerSettings ?? {};
      state.isDirty = false;
      state.past = [];
      state.future = [];
      state.selectedSectionId = null;
      state.editingZone = "body";
    },

    setEditingZone(state, action: PayloadAction<"body" | "header" | "footer">) {
      state.editingZone = action.payload;
      state.selectedSectionId = null;
    },

    // ─── Header/Footer settings ────────────────────────────────────────────
    setHeaderSettings(state, action: PayloadAction<HeaderSettings>) {
      state.headerSettings = action.payload;
      state.isDirty = true;
    },

    setFooterSettings(state, action: PayloadAction<FooterSettings>) {
      state.footerSettings = action.payload;
      state.isDirty = true;
    },

    // ─── Global sections ────────────────────────────────────────────────────
    setGlobalSectionIds(state, action: PayloadAction<string[]>) {
      state.globalSectionIds = action.payload;
      state.isDirty = true;
    },

    addGlobalSectionId(state, action: PayloadAction<string>) {
      if (!state.globalSectionIds.includes(action.payload)) {
        state.globalSectionIds.push(action.payload);
        state.isDirty = true;
      }
    },

    removeGlobalSectionId(state, action: PayloadAction<string>) {
      state.globalSectionIds = state.globalSectionIds.filter((id) => id !== action.payload);
      state.isDirty = true;
    },

    // ─── Section CRUD ──────────────────────────────────────────────────────
    setSections(state, action: PayloadAction<BuilderSection[]>) {
      pushHistory(state);
      setSectionsForZone(state, action.payload);
      state.isDirty = true;
    },

    addSection(state, action: PayloadAction<BuilderSection & { index?: number }>) {
      pushHistory(state);
      const sections = getSections(state);
      const { index, ...section } = action.payload;
      if (index != null && index >= 0 && index <= sections.length) {
        sections.splice(index, 0, section);
      } else {
        sections.push(section);
      }
      setSectionsForZone(state, sections);
      state.isDirty = true;
    },

    removeSection(state, action: PayloadAction<string>) {
      pushHistory(state);
      const sections = getSections(state).filter((s) => s.id !== action.payload);
      setSectionsForZone(state, sections);
      state.isDirty = true;
    },

    toggleSection(state, action: PayloadAction<string>) {
      pushHistory(state);
      const s = getSections(state).find((s) => s.id === action.payload);
      if (s) { s.visible = !s.visible; state.isDirty = true; }
    },

    updateSectionProps(state, action: PayloadAction<{ id: string; props: SectionProps }>) {
      pushHistory(state);
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) { s.props = action.payload.props; state.isDirty = true; }
    },

    updateSectionStyle(state, action: PayloadAction<{ id: string; style: SectionStyle }>) {
      pushHistory(state);
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) { s.style = { ...s.style, ...action.payload.style }; state.isDirty = true; }
    },

    updateSectionResponsive(state, action: PayloadAction<{ id: string; device: "desktop" | "tablet" | "mobile"; hide: boolean }>) {
      pushHistory(state);
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) {
        if (action.payload.device === "desktop") s.style = { ...s.style, hideOnDesktop: action.payload.hide };
        if (action.payload.device === "tablet") s.style = { ...s.style, hideOnTablet: action.payload.hide };
        if (action.payload.device === "mobile") s.style = { ...s.style, hideOnMobile: action.payload.hide };
        state.isDirty = true;
      }
    },

    updateSectionMeta(state, action: PayloadAction<{ id: string; label?: string; visible?: boolean }>) {
      pushHistory(state);
      const s = getSections(state).find((sec) => sec.id === action.payload.id);
      if (s) {
        if (typeof action.payload.label === "string") s.label = action.payload.label;
        if (typeof action.payload.visible === "boolean") s.visible = action.payload.visible;
        state.isDirty = true;
      }
    },

    moveSection(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const sections = getSections(state);
      if (to < 0 || to >= sections.length) return;
      pushHistory(state);
      const copy = [...sections];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      setSectionsForZone(state, copy);
      state.isDirty = true;
    },

    duplicateSection(state, action: PayloadAction<string>) {
      const sections = getSections(state);
      const idx = sections.findIndex((s) => s.id === action.payload);
      if (idx < 0) return;
      pushHistory(state);
      const original = sections[idx];
      const dup: BuilderSection = {
        ...original,
        id: `${original.type}-${Date.now()}`,
        label: `${original.label} ${original.label.match(/\(\d+\)$/) ? `(${parseInt((original.label.match(/\((\d+)\)$/)?.[1] || "0")) + 1})` : "(Copy)"}`,
      };
      const copy = [...sections];
      copy.splice(idx + 1, 0, dup);
      setSectionsForZone(state, copy);
      state.isDirty = true;
    },

    // ─── Selection ──────────────────────────────────────────────────────────
    setSelectedSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
      if (action.payload && !state.rightPanelOpen) {
        state.rightPanelOpen = true;
      }
    },

    setHoveredSection(state, action: PayloadAction<string | null>) {
      state.hoveredSectionId = action.payload;
    },

    setEditingSection(state, action: PayloadAction<string | null>) {
      state.editingSectionId = action.payload;
    },

    // ─── Panel management ──────────────────────────────────────────────────
    setActiveTab(state, action: PayloadAction<LeftTab>) {
      state.activeTab = action.payload;
      if (!state.leftPanelOpen) state.leftPanelOpen = true;
    },

    setActiveRightTab(state, action: PayloadAction<RightTab>) {
      state.activeRightTab = action.payload;
    },

    toggleLeftPanel(state) { state.leftPanelOpen = !state.leftPanelOpen; },
    toggleRightPanel(state) { state.rightPanelOpen = !state.rightPanelOpen; },
    setRightPanelPinned(state, action: PayloadAction<boolean>) { state.rightPanelPinned = action.payload; },
    setLeftPanelWidth(state, action: PayloadAction<number>) { state.leftPanelWidth = Math.max(44, Math.min(400, action.payload)); },
    setRightPanelWidth(state, action: PayloadAction<number>) { state.rightPanelWidth = Math.max(300, Math.min(500, action.payload)); },

    // ─── Display modes ─────────────────────────────────────────────────────
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.fullscreen = action.payload;
      if (action.payload) state.presentationMode = false;
    },
    setPresentationMode(state, action: PayloadAction<boolean>) {
      state.presentationMode = action.payload;
      if (action.payload) {
        state.fullscreen = false;
        state.leftPanelOpen = false;
        state.rightPanelOpen = false;
      }
    },

    // ─── Section utilities ─────────────────────────────────────────────────
    toggleSectionLock(state, action: PayloadAction<string>) {
      pushHistory(state);
      const s = getSections(state).find((sec) => sec.id === action.payload);
      if (s) { s.locked = !s.locked; state.isDirty = true; }
    },

    toggleSectionFavorite(state, action: PayloadAction<string>) {
      const s = getSections(state).find((sec) => sec.id === action.payload);
      if (s) { s.favorite = !s.favorite; }
    },

    copySection(state, action: PayloadAction<string>) {
      const s = getSections(state).find((sec) => sec.id === action.payload);
      state.clipboardSection = s ? { ...s, props: { ...s.props } } : null;
    },

    pasteSection(state, action: PayloadAction<string | null | undefined>) {
      if (!state.clipboardSection) return;
      pushHistory(state);
      const sections = getSections(state);
      const base = state.clipboardSection;
      const pasted: BuilderSection = {
        ...base,
        id: `${base.type}-${Date.now()}`,
        label: `${base.label} (Copy)`,
        props: { ...base.props },
      };
      if (!action.payload) {
        sections.push(pasted);
      } else {
        const idx = sections.findIndex((sec) => sec.id === action.payload);
        if (idx === -1) sections.push(pasted);
        else sections.splice(idx + 1, 0, pasted);
      }
      setSectionsForZone(state, sections);
      state.selectedSectionId = pasted.id;
      state.isDirty = true;
    },

    restoreHistorySnapshot(state, action: PayloadAction<BuilderSection[]>) {
      pushHistory(state);
      state.sections = action.payload.map((section) => ({ ...section, props: { ...section.props } }));
      state.isDirty = true;
      state.selectedSectionId = action.payload[0]?.id ?? null;
    },

    // ─── Section Library Modal ─────────────────────────────────────────────
    openSectionLibrary(state, action: PayloadAction<{ insertPosition?: number | null; anchorPosition?: { top: number; left: number } | null } | undefined>) {
      state.sectionLibrary.isOpen = true;
      state.sectionLibrary.insertPosition = action.payload?.insertPosition ?? null;
      state.sectionLibrary.anchorPosition = action.payload?.anchorPosition ?? null;
    },

    closeSectionLibrary(state) {
      state.sectionLibrary.isOpen = false;
      state.sectionLibrary.searchTerm = "";
      state.sectionLibrary.activeCategory = "all";
      state.sectionLibrary.insertPosition = null;
      state.sectionLibrary.anchorPosition = null;
    },

    setSectionLibrarySearch(state, action: PayloadAction<string>) {
      state.sectionLibrary.searchTerm = action.payload;
    },

    setSectionLibraryCategory(state, action: PayloadAction<string | "all">) {
      state.sectionLibrary.activeCategory = action.payload;
    },

    toggleFavoriteSection(state, action: PayloadAction<string>) {
      const idx = state.sectionLibrary.favoriteSections.indexOf(action.payload);
      if (idx === -1) {
        state.sectionLibrary.favoriteSections.push(action.payload);
      } else {
        state.sectionLibrary.favoriteSections.splice(idx, 1);
      }
    },

    addToRecentlyUsed(state, action: PayloadAction<string>) {
      const filtered = state.sectionLibrary.recentlyUsed.filter((type) => type !== action.payload);
      state.sectionLibrary.recentlyUsed = [action.payload, ...filtered].slice(0, 10);
    },

    clearRecentlyUsed(state) {
      state.sectionLibrary.recentlyUsed = [];
    },

    // ─── Undo/redo ─────────────────────────────────────────────────────────
    undoBuilder(state) {
      const previous = state.past.pop();
      if (!previous) return;
      const current = getSections(state);
      state.future.unshift(current.map((section) => ({ ...section, props: { ...section.props } })));
      setSectionsForZone(state, previous);
      state.isDirty = true;
    },

    redoBuilder(state) {
      const next = state.future.shift();
      if (!next) return;
      const current = getSections(state);
      state.past.push(current.map((section) => ({ ...section, props: { ...section.props } })));
      setSectionsForZone(state, next);
      state.isDirty = true;
    },

    // ─── Save state ────────────────────────────────────────────────────────
    markSaved(state, action: PayloadAction<string>) {
      state.isDirty = false;
      state.lastSaved = action.payload;
      state.lastSaveError = null;
      state.saving = false;
      state.publishing = false;
    },

    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
      if (action.payload) state.lastSaveError = null;
    },

    setSaveError(state, action: PayloadAction<string>) {
      state.lastSaveError = action.payload;
      state.saving = false;
    },

    setPublishing(state, action: PayloadAction<boolean>) { state.publishing = action.payload; },

    loadSections(state, action: PayloadAction<BuilderSection[]>) {
      state.sections = action.payload;
      state.isDirty = false;
      state.past = [];
      state.future = [];
    },

    // Backward-compatible — delegates to setPageMetadata
    setOldPageId(state, action: PayloadAction<string>) {
      state.pageId = action.payload;
      state.page.id = action.payload;
    },
  },
});

export const {
  setPageMetadata,
  loadPage,
  setEditingZone,
  setHeaderSettings,
  setFooterSettings,
  setGlobalSectionIds,
  addGlobalSectionId,
  removeGlobalSectionId,
  setSections, addSection, removeSection, toggleSection,
  updateSectionProps, updateSectionStyle, updateSectionResponsive,
  moveSection, duplicateSection,
  updateSectionMeta, setSelectedSection, setHoveredSection, setEditingSection,
  setActiveTab, setActiveRightTab,
  toggleLeftPanel, toggleRightPanel, setRightPanelPinned,
  setLeftPanelWidth, setRightPanelWidth, setFullscreen, setPresentationMode,
  toggleSectionLock, toggleSectionFavorite, copySection, pasteSection,
  restoreHistorySnapshot, undoBuilder, redoBuilder,
  markSaved, setSaving, setSaveError, setPublishing, loadSections,
  openSectionLibrary, closeSectionLibrary,
  setSectionLibrarySearch, setSectionLibraryCategory,
  toggleFavoriteSection, addToRecentlyUsed, clearRecentlyUsed,
} = builderSlice.actions;

export const builderReducer = builderSlice.reducer;

