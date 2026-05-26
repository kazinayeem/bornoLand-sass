import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SectionProps = Record<string, string>;

export type BuilderSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: SectionProps;
};

export type SectionCategory = "hero" | "promotion" | "content" | "products" | "social";

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
  favoriteSectionTypes: string[];
  isDraft: boolean;
  past: BuilderSection[][];
  future: BuilderSection[][];
};

const initialState: BuilderState = {
  sections: [
    {
      id: "hero-1",
      type: "hero",
      label: "Hero Banner",
      visible: true,
      props: { title: "Welcome to your store", subtitle: "Start selling with a beautiful storefront.", ctaText: "Shop Now", ctaHref: "/shop" },
    },
    {
      id: "announcement-1",
      type: "announcement",
      label: "Top Announcement",
      visible: true,
      props: { text: "Free shipping on orders over $50! Use code FREESHIP" },
    },
    {
      id: "featured-products-1",
      type: "products",
      label: "Featured Products",
      visible: true,
      props: { title: "Featured Products", layout: "carousel" },
    },
    {
      id: "testimonials-1",
      type: "content",
      label: "Testimonials",
      visible: true,
      props: { title: "What customers say", variant: "cards" },
    },
    {
      id: "footer-1",
      type: "footer",
      label: "Store Footer",
      visible: true,
      props: { copyright: `© ${new Date().getFullYear()} Your Store` },
    },
  ],
  selectedSectionId: null,
  editingSectionId: null,
  activeTab: "sections",
  isDirty: false,
  lastSaved: null,
  saving: false,
  publishing: false,
  pageId: null,
  favoriteSectionTypes: [],
  isDraft: true,
  past: [],
  future: [],
};

const MAX_HISTORY = 50;

function pushHistory(state: BuilderState) {
  state.past.push(JSON.parse(JSON.stringify(state.sections)));
  if (state.past.length > MAX_HISTORY) state.past.shift();
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
      state.past = [];
      state.future = [];
    },
    setPageId(state, action: PayloadAction<string>) {
      state.pageId = action.payload;
    },
    renameSection(state, action: PayloadAction<{ id: string; label: string }>) {
      pushHistory(state);
      const s = state.sections.find((s) => s.id === action.payload.id);
      if (s) { s.label = action.payload.label; state.isDirty = true; }
    },
    toggleFavoriteSection(state, action: PayloadAction<string>) {
      const type = action.payload;
      const idx = state.favoriteSectionTypes.indexOf(type);
      if (idx >= 0) {
        state.favoriteSectionTypes.splice(idx, 1);
      } else {
        state.favoriteSectionTypes.push(type);
      }
    },
    undo(state) {
      if (state.past.length === 0) return;
      state.future.push(JSON.parse(JSON.stringify(state.sections)));
      state.sections = state.past.pop()!;
      state.isDirty = true;
    },
    redo(state) {
      if (state.future.length === 0) return;
      state.past.push(JSON.parse(JSON.stringify(state.sections)));
      state.sections = state.future.pop()!;
      state.isDirty = true;
    },
    setDraft(state, action: PayloadAction<boolean>) {
      state.isDraft = action.payload;
    },
    batchUpdateSections(state, action: PayloadAction<{ oldSections: BuilderSection[]; newSections: BuilderSection[] }>) {
      pushHistory(state);
      state.sections = action.payload.newSections;
      state.isDirty = true;
    },
  },
});

export const {
  setSections, addSection, removeSection, toggleSection,
  updateSectionProps, moveSection, duplicateSection,
  setSelectedSection, setEditingSection, setActiveTab,
  markSaved, setSaving, setPublishing, loadSections, setPageId,
  renameSection, toggleFavoriteSection,
  undo, redo, setDraft, batchUpdateSections,
} = builderSlice.actions;
export const builderReducer = builderSlice.reducer;
