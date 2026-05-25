"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setEditingSection } from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function SectionEditor() {
  const dispatch = useDispatch();
  const editingId = useSelector((s: RootState) => s.builder.editingSectionId);
  const section = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === editingId)
  );

  if (!section) return null;

  const handleChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const labels: Record<string, string> = {
    headline: "Headline", subheadline: "Subheadline", buttonText: "Button Text",
    title: "Section Title", description: "Description", copyright: "Copyright Text",
  };

  return (
    <AnimatePresence>
      {editingId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) dispatch(setEditingSection(null)); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900">Edit {section.label}</h3>
              <button onClick={() => dispatch(setEditingSection(null))}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {Object.entries(section.props).map(([key, value]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    {labels[key] ?? key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input type="text" value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => dispatch(setEditingSection(null))}
                className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:opacity-90">
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
