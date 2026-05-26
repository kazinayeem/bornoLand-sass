"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetFaqsQuery, useCreateFaqMutation, useUpdateFaqMutation, useDeleteFaqMutation, useReorderFaqsMutation } from "@/redux/api/cms-api";
import type { FaqItem } from "@/redux/api/cms-api";
import RichTextEditor from "@/components/cms/rich-text-editor";
import { Store, Plus, Loader2, GripVertical, Pencil, Trash2, X, Check, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function FaqsPage() {
  const { currentStoreId, stores, selectStore, clearStore } = useCurrentStore();

  const { data: faqsData, isLoading: faqsLoading } = useGetFaqsQuery(currentStoreId, { skip: !currentStoreId });
  const faqs = faqsData?.data?.faqs ?? [];
  const [createFaq, { isLoading: creating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: updating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: deleting }] = useDeleteFaqMutation();
  const [reorderFaqs, { isLoading: reordering }] = useReorderFaqsMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setCategory("");
    setEditId(null);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      await createFaq({ storeId: currentStoreId, data: { question, answer, category: category || undefined } }).unwrap();
      toast.success("FAQ created");
      resetForm();
    } catch {
      toast.error("Failed to create FAQ");
    }
  };

  const handleUpdate = async () => {
    if (!editId || !question.trim() || !answer.trim()) return;
    try {
      await updateFaq({ storeId: currentStoreId, faqId: editId, data: { question, answer, category: category || undefined } }).unwrap();
      toast.success("FAQ updated");
      resetForm();
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  const handleEdit = (faq: FaqItem) => {
    setEditId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category ?? "");
    setShowForm(true);
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await deleteFaq({ storeId: currentStoreId, faqId }).unwrap();
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      await updateFaq({ storeId: currentStoreId, faqId: faq._id, data: { active: !faq.active } }).unwrap();
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...faqs];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    try {
      await reorderFaqs({ storeId: currentStoreId, orderedIds: reordered.map((f) => f._id) }).unwrap();
      toast.success("FAQs reordered");
    } catch {
      toast.error("Failed to reorder FAQs");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;
    const reordered = [...faqs];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    try {
      await reorderFaqs({ storeId: currentStoreId, orderedIds: reordered.map((f) => f._id) }).unwrap();
      toast.success("FAQs reordered");
    } catch {
      toast.error("Failed to reorder FAQs");
    }
  };

  if (!currentStoreId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">FAQ Items</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage individual Q&A entries for your store's FAQ page.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s, i) => (
            <motion.button
              key={s._id}
              onClick={() => selectStore(s)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-lg font-bold text-white shadow-sm">
                {s.name[0]}
              </div>
              <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
              <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.bornoland.com</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">FAQ Items</h2>
              <p className="text-sm text-zinc-500">Manage Q&A entries for your store.</p>
            </div>
            <span className="rounded-lg bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
              {stores.find((s) => s._id === currentStoreId)?.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => clearStore()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <Store className="h-4 w-4" /> Change Store
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900">{editId ? "Edit FAQ" : "New FAQ"}</h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Enter the question"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Answer</label>
              <RichTextEditor
                key={editId ?? "new"}
                content={answer}
                onChange={setAnswer}
                placeholder="Enter the answer..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Category (optional)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g. Shipping, Orders"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={editId ? handleUpdate : handleCreate}
                disabled={creating || updating}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {(creating || updating) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {faqsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 p-5" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-16 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <MessageSquare className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-zinc-900">No FAQs yet</h3>
          <p className="mt-2 text-sm text-zinc-500">Create your first FAQ entry.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || reordering}
                    className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <GripVertical className="h-4 w-4 text-zinc-300" />
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === faqs.length - 1 || reordering}
                    className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900">{faq.question}</h4>
                    {faq.category && (
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">{faq.category}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{faq.answer.replace(/<[^>]*>/g, "")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(faq)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      faq.active
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {faq.active ? "Active" : "Draft"}
                  </button>
                  <button
                    onClick={() => handleEdit(faq)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    disabled={deleting}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
