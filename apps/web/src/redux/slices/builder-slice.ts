import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SectionProps = Record<string, string>;

export type BuilderSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: SectionProps;
};

type BuilderState = {
  sections: BuilderSection[];
  selectedSectionId: string | null;
  editingSectionId: string | null;
  activeTab: "sections" | "theme" | "products" | "pages";
  isDirty: boolean;
  lastSaved: string | null;
  saving: boolean;
  publishing: boolean;
  pageId: string | null;
};

const initialState: BuilderState = {
  sections: [],
  selectedSectionId: null,
  editingSectionId: null,
  activeTab: "sections",
  isDirty: false,
  lastSaved: null,
  saving: false,
  publishing: false,
  pageId: null,
};

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setSections(state, action: PayloadAction<BuilderSection[]>) {
      state.sections = action.payload;
      state.isDirty = true;
    },
    addSection(state, action: PayloadAction<BuilderSection>) {
      state.sections.push(action.payload);
      state.isDirty = true;
    },
    removeSection(state, action: PayloadAction<string>) {
      state.sections = state.sections.filter((s) => s.id !== action.payload);
      state.isDirty = true;
    },
    toggleSection(state, action: PayloadAction<string>) {
      const s = state.sections.find((s) => s.id === action.payload);
      if (s) { s.visible = !s.visible; state.isDirty = true; }
    },
    updateSectionProps(state, action: PayloadAction<{ id: string; props: SectionProps }>) {
      const s = state.sections.find((s) => s.id === action.payload.id);
      if (s) { s.props = action.payload.props; state.isDirty = true; }
    },
    moveSection(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.sections.length) return;
      const copy = [...state.sections];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      state.sections = copy;
      state.isDirty = true;
    },
    duplicateSection(state, action: PayloadAction<string>) {
      const idx = state.sections.findIndex((s) => s.id === action.payload);
      if (idx < 0) return;
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
    setEditingSection(state, action: PayloadAction<string | null>) {
      state.editingSectionId = action.payload;
    },
    setActiveTab(state, action: PayloadAction<BuilderState["activeTab"]>) {
      state.activeTab = action.payload;
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
    },
    setPageId(state, action: PayloadAction<string>) {
      state.pageId = action.payload;
    },
  },
});

export const {
  setSections, addSection, removeSection, toggleSection,
  updateSectionProps, moveSection, duplicateSection,
  setSelectedSection, setEditingSection, setActiveTab,
  markSaved, setSaving, setPublishing, loadSections, setPageId,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
