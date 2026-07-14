import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SectionProps = Record<string, string>;

export type BuilderSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  favorite?: boolean;
  collapsed?: boolean;
  props: SectionProps;
};

export type LeftTab = "layers" | "pages" | "components" | "templates" | "media" | "navigator" | "history" | "theme" | "assets";
export type RightTab = "content" | "style" | "layout" | "responsive" | "animation" | "advanced" | "seo" | "visibility";

type BuilderState = {
  sections: BuilderSection[];
  selectedSectionId: string | null;
  hoveredSectionId: string | null;
  editingSectionId: string | null;
  activeTab: LeftTab;
  activeRightTab: RightTab;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelPinned: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  fullscreen: boolean;
  presentationMode: boolean;
  isDirty: boolean;
  lastSaved: string | null;
  lastSaveError: string | null;
  saving: boolean;
  publishing: boolean;
  pageId: string | null;
  clipboardSection: BuilderSection | null;
  past: BuilderSection[][];
  future: BuilderSection[][];
};

const initialState: BuilderState = {
  sections: [],
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
  pageId: null,
  clipboardSection: null,
  past: [],
  future: [],
};

function pushHistory(state: BuilderState) {
  state.past.push(state.sections.map((section) => ({ ...section, props: { ...section.props } })));
  if (state.past.length > 50) state.past.shift();
  state.future = [];
}

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setSections(state, action: PayloadAction<BuilderSection[]>) {
      pushHistory(state);
      state.sections = action.payload;
      state.isDirty = true;
    },
    addSection(state, action: PayloadAction<BuilderSection>) {
      pushHistory(state);
      state.sections.push(action.payload);
      state.isDirty = true;
    },
    removeSection(state, action: PayloadAction<string>) {
      pushHistory(state);
      state.sections = state.sections.filter((s) => s.id !== action.payload);
      state.isDirty = true;
    },
    toggleSection(state, action: PayloadAction<string>) {
      pushHistory(state);
      const s = state.sections.find((s) => s.id === action.payload);
      if (s) { s.visible = !s.visible; state.isDirty = true; }
    },
    updateSectionProps(state, action: PayloadAction<{ id: string; props: SectionProps }>) {
      pushHistory(state);
      const s = state.sections.find((s) => s.id === action.payload.id);
      if (s) { s.props = action.payload.props; state.isDirty = true; }
    },
    updateSectionMeta(state, action: PayloadAction<{ id: string; label?: string; visible?: boolean }>) {
      pushHistory(state);
      const s = state.sections.find((sec) => sec.id === action.payload.id);
      if (s) {
        if (typeof action.payload.label === "string") s.label = action.payload.label;
        if (typeof action.payload.visible === "boolean") s.visible = action.payload.visible;
        state.isDirty = true;
      }
    },
    moveSection(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.sections.length) return;
      pushHistory(state);
      const copy = [...state.sections];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      state.sections = copy;
      state.isDirty = true;
    },
    duplicateSection(state, action: PayloadAction<string>) {
      const idx = state.sections.findIndex((s) => s.id === action.payload);
      if (idx < 0) return;
      pushHistory(state);
      const original = state.sections[idx];
      const dup: BuilderSection = {
        ...original,
        id: `${original.type}-${Date.now()}`,
        label: `${original.label} ${original.label.match(/\(\d+\)$/) ? `(${parseInt((original.label.match(/\((\d+)\)$/)?.[1] || "0")) + 1})` : "(Copy)"}`,
      };
      state.sections.splice(idx + 1, 0, dup);
      state.isDirty = true;
    },
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
    setActiveTab(state, action: PayloadAction<LeftTab>) {
      state.activeTab = action.payload;
      if (!state.leftPanelOpen) state.leftPanelOpen = true;
    },
    setActiveRightTab(state, action: PayloadAction<RightTab>) {
      state.activeRightTab = action.payload;
    },
    toggleLeftPanel(state) {
      state.leftPanelOpen = !state.leftPanelOpen;
    },
    toggleRightPanel(state) {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    setRightPanelPinned(state, action: PayloadAction<boolean>) {
      state.rightPanelPinned = action.payload;
    },
    setLeftPanelWidth(state, action: PayloadAction<number>) {
      state.leftPanelWidth = Math.max(44, Math.min(400, action.payload));
    },
    setRightPanelWidth(state, action: PayloadAction<number>) {
      state.rightPanelWidth = Math.max(300, Math.min(500, action.payload));
    },
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
    toggleSectionLock(state, action: PayloadAction<string>) {
      pushHistory(state);
      const s = state.sections.find((sec) => sec.id === action.payload);
      if (s) {
        s.locked = !s.locked;
        state.isDirty = true;
      }
    },
    toggleSectionFavorite(state, action: PayloadAction<string>) {
      const s = state.sections.find((sec) => sec.id === action.payload);
      if (s) {
        s.favorite = !s.favorite;
      }
    },
    copySection(state, action: PayloadAction<string>) {
      const s = state.sections.find((sec) => sec.id === action.payload);
      state.clipboardSection = s ? { ...s, props: { ...s.props } } : null;
    },
    pasteSection(state, action: PayloadAction<string | null | undefined>) {
      if (!state.clipboardSection) return;
      pushHistory(state);
      const base = state.clipboardSection;
      const pasted: BuilderSection = {
        ...base,
        id: `${base.type}-${Date.now()}`,
        label: `${base.label} (Copy)`,
        props: { ...base.props },
      };
      if (!action.payload) {
        state.sections.push(pasted);
      } else {
        const idx = state.sections.findIndex((sec) => sec.id === action.payload);
        if (idx === -1) state.sections.push(pasted);
        else state.sections.splice(idx + 1, 0, pasted);
      }
      state.selectedSectionId = pasted.id;
      state.isDirty = true;
    },
    restoreHistorySnapshot(state, action: PayloadAction<BuilderSection[]>) {
      pushHistory(state);
      state.sections = action.payload.map((section) => ({ ...section, props: { ...section.props } }));
      state.isDirty = true;
      state.selectedSectionId = action.payload[0]?.id ?? null;
    },
    undoBuilder(state) {
      const previous = state.past.pop();
      if (!previous) return;
      state.future.unshift(state.sections.map((section) => ({ ...section, props: { ...section.props } })));
      state.sections = previous;
      state.isDirty = true;
    },
    redoBuilder(state) {
      const next = state.future.shift();
      if (!next) return;
      state.past.push(state.sections.map((section) => ({ ...section, props: { ...section.props } })));
      state.sections = next;
      state.isDirty = true;
    },
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
    setPublishing(state, action: PayloadAction<boolean>) {
      state.publishing = action.payload;
    },
    loadSections(state, action: PayloadAction<BuilderSection[]>) {
      state.sections = action.payload;
      state.isDirty = false;
      state.past = [];
      state.future = [];
    },
    setPageId(state, action: PayloadAction<string>) {
      state.pageId = action.payload;
    },
  },
});

export const {
  setSections, addSection, removeSection, toggleSection,
  updateSectionProps, moveSection, duplicateSection,
  updateSectionMeta, setSelectedSection, setHoveredSection, setEditingSection, setActiveTab, setActiveRightTab,
  toggleLeftPanel, toggleRightPanel, setRightPanelPinned,
  setLeftPanelWidth, setRightPanelWidth, setFullscreen, setPresentationMode,
  toggleSectionLock, toggleSectionFavorite, copySection, pasteSection,
  restoreHistorySnapshot, undoBuilder, redoBuilder,
  markSaved, setSaving, setSaveError, setPublishing, loadSections, setPageId,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
