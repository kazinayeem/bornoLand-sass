import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PageType, HeaderSettings, FooterSettings } from "@/redux/api/store-page-api";

export type SectionProps = Record<string, string>;

// ─── Per-breakpoint device style overrides ──────────────────────────

export type DeviceStyle = {
  paddingTop?: string; paddingBottom?: string; paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string;
  borderRadius?: string; width?: string; maxWidth?: string; minHeight?: string;
  fontSize?: string; lineHeight?: string; textAlign?: string;
  hidden?: boolean;
  height?: string; maxHeight?: string; minWidth?: string;
  gap?: string; flexDirection?: string; alignItems?: string; justifyContent?: string;
  top?: string; right?: string; bottom?: string; left?: string;
};

export const BREAKPOINTS = ["desktop", "laptop", "tablet", "mobile"] as const;

// ─── Slide data for slider sections ────────────────────────────────

export type SlideData = {
  id: string;
  image?: string;
  imageMediaId?: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  overlayColor?: string;
  overlayOpacity?: string;
  textPosition?: string;
};

// ─── Dynamic repeater item types ──────────────────────────────────

export type FaqItemData = {
  id: string;
  question: string;
  answer: string;
};

export type AccordionItemData = {
  id: string;
  title: string;
  content: string;
};

export type TeamMemberData = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  imageMediaId: string;
  twitter: string;
  linkedin: string;
  instagram: string;
};

export type TrustBadgeData = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type TestimonialItemData = {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: string;
  avatar: string;
  avatarMediaId: string;
  badge: string;
};

export type GalleryItemData = {
  id: string;
  image: string;
  imageMediaId: string;
  title: string;
  alt: string;
  link: string;
};

// ─── Section style with responsive overrides ───────────────────────

export type SectionStyle = {
  paddingTop?: string; paddingBottom?: string; paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string;
  backgroundColor?: string; backgroundGradient?: string;
  backgroundImage?: string;
  backgroundImageMediaId?: string;
  backgroundSize?: string; backgroundPosition?: string; backgroundRepeat?: string; backgroundAttachment?: string;
  overlayColor?: string; overlayOpacity?: string; blur?: string; backdropBlur?: string;
  borderColor?: string; borderWidth?: string; borderRadius?: string; borderStyle?: string;
  shadow?: string; opacity?: string;
  width?: string; maxWidth?: string; minHeight?: string;
  height?: string; maxHeight?: string; minWidth?: string;
  hideOnDesktop?: boolean; hideOnTablet?: boolean; hideOnMobile?: boolean;
  customCss?: string;
  animation?: string; animationDuration?: string; animationDelay?: string; animationTrigger?: string;
  parallaxSpeed?: string; sticky?: boolean;

  // Typography
  fontFamily?: string; fontSize?: string; fontWeight?: string; letterSpacing?: string;
  textTransform?: string; textDecoration?: string; color?: string; textAlign?: string;

  // Flex
  display?: string; flexDirection?: string; alignItems?: string; justifyContent?: string;
  flexWrap?: string; gap?: string; order?: string;

  // Position
  position?: string; top?: string; right?: string; bottom?: string; left?: string;
  zIndex?: string;

  // Transform
  transform?: string; transformOrigin?: string;

  // Video background
  backgroundVideoUrl?: string;
  backgroundVideoPoster?: string;
  backgroundVideoMuted?: string;
  backgroundVideoLoop?: string;

  // Dynamic repeater items
  faqItems?: FaqItemData[];
  accordionItems?: AccordionItemData[];
  teamMembers?: TeamMemberData[];
  trustBadgeItems?: TrustBadgeData[];
  testimonialItems?: TestimonialItemData[];
  galleryItems?: GalleryItemData[];

  // Slider
  slides?: SlideData[];
  sliderAutoplay?: string; sliderLoop?: string; sliderDelay?: string;
  sliderTransitionSpeed?: string; sliderTransition?: string;
  sliderShowArrows?: string; sliderShowDots?: string;

  // Responsive overrides per breakpoint (overrides flat values for specific devices)
  responsive?: Partial<Record<"desktop" | "laptop" | "tablet" | "mobile", DeviceStyle>>;
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
    targetZone: "header" | "body" | "footer" | null; // Which zone the modal was opened from
  };

  // Undo/redo (global snapshots across all three zones)
  past: GlobalSnapshot[];
  future: GlobalSnapshot[];
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
  // Advanced inspector is opt-in; selecting a canvas section should not shrink the editing surface.
  rightPanelOpen: false,
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
    targetZone: null,
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

// ─── Global snapshot: captures all three zones for undo/redo ──────────────

export type GlobalSnapshot = {
  sections: BuilderSection[];
  headerSections: BuilderSection[];
  footerSections: BuilderSection[];
};

function cloneSections(list: BuilderSection[]): BuilderSection[] {
  return JSON.parse(JSON.stringify(list));
}

function takeSnapshot(state: BuilderState): GlobalSnapshot {
  return {
    sections: cloneSections(state.sections),
    headerSections: cloneSections(state.headerSections),
    footerSections: cloneSections(state.footerSections),
  };
}

function applySnapshot(state: BuilderState, snapshot: GlobalSnapshot): void {
  state.sections = snapshot.sections;
  state.headerSections = snapshot.headerSections;
  state.footerSections = snapshot.footerSections;
}

/** Action types that should automatically push history. Keep in sync with builderHistoryMiddleware. */
export const BUILDER_HISTORY_ACTIONS = new Set([
  'builder/setSections',
  'builder/addSection',
  'builder/removeSection',
  'builder/toggleSection',
  'builder/updateSectionProps',
  'builder/updateSectionStyle',
  'builder/updateSectionResponsive',
  'builder/updateSectionStyleResponsive',
  'builder/updateSectionMeta',
  'builder/moveSection',
  'builder/duplicateSection',
  'builder/toggleSectionLock',
  'builder/pasteSection',
  'builder/restoreHistorySnapshot',
]);

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

    // ─── History auto-committed via builderHistoryMiddleware ─────────────

    commitHistory(state, action: PayloadAction<GlobalSnapshot>) {
      state.past.push(action.payload);
      state.future = [];
      if (state.past.length > 100) state.past.shift();
    },

    // ─── Section CRUD ──────────────────────────────────────────────────────
    setSections(state, action: PayloadAction<BuilderSection[]>) {
      setSectionsForZone(state, action.payload);
      state.isDirty = true;
    },

    addSection(state, action: PayloadAction<BuilderSection & { index?: number }>) {
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
      const sections = getSections(state).filter((s) => s.id !== action.payload);
      setSectionsForZone(state, sections);
      state.isDirty = true;
    },

    toggleSection(state, action: PayloadAction<string>) {
      const s = getSections(state).find((s) => s.id === action.payload);
      if (s) { s.visible = !s.visible; state.isDirty = true; }
    },

    updateSectionProps(state, action: PayloadAction<{ id: string; props: SectionProps }>) {
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) { s.props = action.payload.props; state.isDirty = true; }
    },

    updateSectionStyle(state, action: PayloadAction<{ id: string; style: SectionStyle }>) {
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) { s.style = { ...s.style, ...action.payload.style }; state.isDirty = true; }
    },

    updateSectionResponsive(state, action: PayloadAction<{ id: string; device: "desktop" | "laptop" | "tablet" | "mobile"; hide: boolean }>) {
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) {
        if (action.payload.device === "desktop") s.style = { ...s.style, hideOnDesktop: action.payload.hide };
        if (action.payload.device === "tablet") s.style = { ...s.style, hideOnTablet: action.payload.hide };
        if (action.payload.device === "mobile") s.style = { ...s.style, hideOnMobile: action.payload.hide };
        state.isDirty = true;
      }
    },

    updateSectionStyleResponsive(state, action: PayloadAction<{ id: string; device: "desktop" | "laptop" | "tablet" | "mobile"; key: keyof DeviceStyle; value: string }>) {
      const s = getSections(state).find((s) => s.id === action.payload.id);
      if (s) {
        const { device, key, value } = action.payload;
        const currentResponsive = s.style?.responsive ?? {};
        const currentDevice = currentResponsive[device] ?? {};
        s.style = {
          ...s.style,
          responsive: {
            ...currentResponsive,
            [device]: { ...currentDevice, [key]: value },
          },
        };
        state.isDirty = true;
      }
    },

    updateSectionMeta(state, action: PayloadAction<{ id: string; label?: string; visible?: boolean }>) {
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

    restoreHistorySnapshot(state, action: PayloadAction<GlobalSnapshot>) {
      applySnapshot(state, action.payload);
      state.isDirty = true;
      state.selectedSectionId = action.payload.sections[0]?.id ?? action.payload.headerSections[0]?.id ?? action.payload.footerSections[0]?.id ?? null;
      state.editingZone = "body";
    },

    // ─── Section Library Modal ─────────────────────────────────────────────
    openSectionLibrary(state, action: PayloadAction<{ insertPosition?: number | null; anchorPosition?: { top: number; left: number } | null; targetZone?: "header" | "body" | "footer" | null } | undefined>) {
      state.sectionLibrary.isOpen = true;
      state.sectionLibrary.insertPosition = action.payload?.insertPosition ?? null;
      state.sectionLibrary.anchorPosition = action.payload?.anchorPosition ?? null;
      state.sectionLibrary.targetZone = action.payload?.targetZone ?? null;
    },

    closeSectionLibrary(state) {
      state.sectionLibrary.isOpen = false;
      state.sectionLibrary.searchTerm = "";
      state.sectionLibrary.activeCategory = "all";
      state.sectionLibrary.insertPosition = null;
      state.sectionLibrary.anchorPosition = null;
      state.sectionLibrary.targetZone = null;
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
      const previous = state.past.pop() as GlobalSnapshot | undefined;
      if (!previous) return;
      const currentSnapshot = takeSnapshot(state);
      state.future.unshift(currentSnapshot);
      applySnapshot(state, previous);
      state.isDirty = true;
    },

    redoBuilder(state) {
      const next = state.future.shift() as GlobalSnapshot | undefined;
      if (!next) return;
      const currentSnapshot = takeSnapshot(state);
      state.past.push(currentSnapshot);
      applySnapshot(state, next);
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
  commitHistory,
  setSections, addSection, removeSection, toggleSection,
  updateSectionProps, updateSectionStyle, updateSectionResponsive, updateSectionStyleResponsive,
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
export { cloneSections };
