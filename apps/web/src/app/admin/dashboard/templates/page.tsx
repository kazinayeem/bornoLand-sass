"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAdminTemplatesQuery, useCreateTemplateMutation, useUpdateTemplateMutation, useDeleteTemplateMutation } from "@/redux/api/template-api";
import type { Template } from "@/redux/api/template-api";
import { toast } from "sonner";
import { LayoutTemplate, Plus, Eye, Edit, Copy, Trash2, X, Check, Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const { data, isLoading } = useGetAdminTemplatesQuery();
  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const templates = data?.data?.templates ?? [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", category: "", description: "", status: "published" as const });

  const resetForm = () => setForm({ name: "", slug: "", category: "", description: "", status: "published" });
  const closeForm = () => { setShowForm(false); setEditing(null); resetForm(); };

  const handleEdit = (tmpl: Template) => {
    setEditing(tmpl);
    setForm({ name: tmpl.name, slug: tmpl.slug, category: tmpl.category, description: tmpl.description, status: tmpl.status });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateTemplate({ id: editing._id, data: form }).unwrap();
        toast.success("Template updated");
      } else {
        await createTemplate(form).unwrap();
        toast.success("Template created");
      }
      closeForm();
    } catch {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id).unwrap();
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const toggleStatus = async (tmpl: Template) => {
    try {
      await updateTemplate({ id: tmpl._id, data: { status: tmpl.status === "published" ? "draft" : "published" } }).unwrap();
      toast.success(`Template ${tmpl.status === "published" ? "unpublished" : "published"}`);
    } catch {
      toast.error("Failed to update template");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Templates</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage landing page templates available to tenants.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-100" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
          <LayoutTemplate className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-700">No templates yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Create your first template to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl, i) => (
            <motion.div key={tmpl._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex aspect-[16/9] items-center justify-center rounded-t-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
                <span className="text-4xl font-bold text-white/80">
                  {tmpl.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900">{tmpl.name}</h3>
                    <p className="text-xs text-zinc-500">{tmpl.category}</p>
                  </div>
                  <button onClick={() => toggleStatus(tmpl)}
                    className={["rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                      tmpl.status === "published" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    ].join(" ")}>
                    {tmpl.status}
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{tmpl.description || "No description"}</p>
                {tmpl.theme && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: tmpl.theme.primaryColor }} />
                    <span className="text-[10px] text-zinc-400">{tmpl.theme.font}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-[10px] text-zinc-400">{new Date(tmpl.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(tmpl)} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(tmpl._id)} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">{editing ? "Edit Template" : "New Template"}</h3>
                <button onClick={closeForm} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Modern SaaS" className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="modern-saas" className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                    <option value="">Select category</option>
                    {["Landing Page", "Sales Page", "Portfolio", "Lead Gen", "Launch", "SaaS", "E-Commerce"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Status</label>
                  <div className="flex gap-2">
                    {(["published", "draft"] as const).map((s) => (
                      <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))}
                        className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all ${
                          form.status === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500"
                        }`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={closeForm} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button onClick={handleSubmit} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Check className="h-4 w-4" /> {editing ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
