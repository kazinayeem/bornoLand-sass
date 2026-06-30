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

type BuilderState = {
  sections: BuilderSection[];
  selectedSectionId: string | null;
  hoveredSectionId: string | null;
  editingSectionId: string | null;
  activeTab: "layers" | "components" | "pages" | "templates" | "media";
  leftPanelWidth: number;
  rightPanelWidth: number;
  isDirty: boolean;
  lastSaved: string | null;
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
  leftPanelWidth: 300,
  rightPanelWidth: 340,
  isDirty: false,
  lastSaved: null,
  saving: false,
  publishing: false,
  pageId: null,
  clipboardSection: null,
  past: [],
  future: [],
};

function pushHistory(state: BuilderState) {
  state.past.push(state.sections.map((section) => ({ ...section, props: { ...section.props } })));
  if (state.past.length > 40) state.past.shift();
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
        label: `${original.label} (Copy)`,
      };
      state.sections.splice(idx + 1, 0, dup);
      state.isDirty = true;
    },
    setSelectedSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
    },
    setHoveredSection(state, action: PayloadAction<string | null>) {
      state.hoveredSectionId = action.payload;
    },
    setEditingSection(state, action: PayloadAction<string | null>) {
      state.editingSectionId = action.payload;
    },
    setActiveTab(state, action: PayloadAction<BuilderState["activeTab"]>) {
      state.activeTab = action.payload;
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
    setLeftPanelWidth(state, action: PayloadAction<number>) {
      state.leftPanelWidth = Math.max(220, Math.min(420, action.payload));
    },
    setRightPanelWidth(state, action: PayloadAction<number>) {
      state.rightPanelWidth = Math.max(300, Math.min(460, action.payload));
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
      state.saving = false;
      state.publishing = false;
    },
    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
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
  updateSectionMeta, setSelectedSection, setHoveredSection, setEditingSection, setActiveTab,
  toggleSectionLock, toggleSectionFavorite, copySection, pasteSection,
  setLeftPanelWidth, setRightPanelWidth, restoreHistorySnapshot, undoBuilder, redoBuilder,
  markSaved, setSaving, setPublishing, loadSections, setPageId,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
