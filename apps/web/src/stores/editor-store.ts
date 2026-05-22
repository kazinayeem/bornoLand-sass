import { create } from "zustand";

export type EditorBlock = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

export type EditorState = {
  pageId: string | null;
  selectedBlockId: string | null;
  blocks: EditorBlock[];
  setPageId: (pageId: string | null) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  setBlocks: (blocks: EditorBlock[]) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  pageId: null,
  selectedBlockId: null,
  blocks: [],
  setPageId: (pageId) => set({ pageId }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
  setBlocks: (blocks) => set({ blocks })
}));