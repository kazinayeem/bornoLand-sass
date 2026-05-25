"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} from "@/redux/api/store-api";
import type { Plan } from "@/redux/api/store-api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";

export default function PlansPage() {
  const { data, isLoading } = useGetPlansQuery();
  const [createPlan] = useCreatePlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();
  const plans = data?.data?.plans ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    priceBDT: 0,
    trialDays: 0,
    features: "",
    limits: { stores: 0, products: 0, staff: 0, bandwidthGB: 0 },
    isRecommended: false,
    isActive: true,
  });

  const resetForm = () =>
    setForm({
      name: "",
      slug: "",
      priceBDT: 0,
      trialDays: 0,
      features: "",
      limits: { stores: 0, products: 0, staff: 0, bandwidthGB: 0 },
      isRecommended: false,
      isActive: true,
    });

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    resetForm();
  };

  const handleEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      trialDays: plan.trialDays,
      features: plan.features.join(", "),
      limits: { ...plan.limits },
      isRecommended: plan.isRecommended,
      isActive: plan.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        features: form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };
      if (editing) {
        await updatePlan({ id: editing._id, data: payload }).unwrap();
        toast.success("Plan updated");
      } else {
        await createPlan(payload).unwrap();
        toast.success("Plan created");
      }
      closeForm();
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan permanently?")) return;
    try {
      await deletePlan(id).unwrap();
      toast.success("Plan deleted");
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      await updatePlan({
        id: plan._id,
        data: { isActive: !plan.isActive },
      }).unwrap();
      toast.success(`Plan ${plan.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update plan");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Subscription Plans
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage platform subscription plans and pricing tiers.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            resetForm();
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-700">No plans yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first subscription plan to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`group relative rounded-2xl border bg-white transition-all hover:shadow-lg hover:-translate-y-1 ${
                plan.isRecommended
                  ? "border-blue-200 ring-1 ring-blue-400"
                  : plan.isActive
                    ? "border-zinc-200"
                    : "border-zinc-100 opacity-60"
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                    <Star className="h-3 w-3" /> Recommended
                  </span>
                </div>
              )}
              <div className="p-5 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                    <p className="text-xs text-zinc-400">/{plan.slug}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(plan)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                      plan.isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-zinc-900">
                    {formatCurrency(plan.priceBDT, {
                      currencySymbol: "৳",
                      currencyPosition: "before",
                      decimalPlaces: 0,
                    })}
                  </span>
                  <span className="ml-1 text-sm text-zinc-400">/mo</span>
                </div>

                {plan.trialDays > 0 && (
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    {plan.trialDays}-day free trial
                  </p>
                )}

                <div className="mt-4 space-y-1.5">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                      <span className="text-xs text-zinc-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-800">
                      {plan.limits.stores}
                    </p>
                    <p className="text-[10px] text-zinc-400">Stores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-800">
                      {plan.limits.products}
                    </p>
                    <p className="text-[10px] text-zinc-400">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-800">
                      {plan.limits.staff}
                    </p>
                    <p className="text-[10px] text-zinc-400">Staff</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-800">
                      {plan.limits.bandwidthGB}GB
                    </p>
                    <p className="text-[10px] text-zinc-400">Bandwidth</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-[10px] text-zinc-400">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {editing ? "Edit Plan" : "New Plan"}
                </h3>
                <button
                  onClick={closeForm}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Starter"
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="starter"
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Price (BDT)
                    </label>
                    <input
                      type="number"
                      value={form.priceBDT}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, priceBDT: Number(e.target.value) }))
                      }
                      min={0}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Trial Days
                    </label>
                    <input
                      type="number"
                      value={form.trialDays}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, trialDays: Number(e.target.value) }))
                      }
                      min={0}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Features (comma-separated)
                  </label>
                  <textarea
                    value={form.features}
                    onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                    rows={3}
                    placeholder="Up to 3 stores, Unlimited products, Email support"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Limits
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Stores</label>
                      <input
                        type="number"
                        value={form.limits.stores}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            limits: { ...f.limits, stores: Number(e.target.value) },
                          }))
                        }
                        min={0}
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Products</label>
                      <input
                        type="number"
                        value={form.limits.products}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            limits: { ...f.limits, products: Number(e.target.value) },
                          }))
                        }
                        min={0}
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Staff</label>
                      <input
                        type="number"
                        value={form.limits.staff}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            limits: { ...f.limits, staff: Number(e.target.value) },
                          }))
                        }
                        min={0}
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Bandwidth (GB)</label>
                      <input
                        type="number"
                        value={form.limits.bandwidthGB}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            limits: { ...f.limits, bandwidthGB: Number(e.target.value) },
                          }))
                        }
                        min={0}
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Flags</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isRecommended: !f.isRecommended }))}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all ${
                        form.isRecommended
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      {form.isRecommended ? "★ Recommended" : "Recommended"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all ${
                        form.isActive
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      {form.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
