"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import type { Template } from "@/redux/api/template-api";
import { toast } from "sonner";
import { Sparkles, Check, ArrowLeft, ArrowRight, Store, Globe, Palette, Loader2 } from "lucide-react";

const plans = [
  { value: "free", label: "Free", desc: "1 store, basic features", price: "$0" },
  { value: "starter", label: "Starter", desc: "3 stores, advanced features", price: "$29" },
  { value: "growth", label: "Growth", desc: "10 stores, premium features", price: "$99" },
  { value: "enterprise", label: "Enterprise", desc: "Unlimited, everything included", price: "$299" }
];

const categories = ["general", "ecommerce", "saas", "portfolio", "blog"];

type Step = 1 | 2 | 3;

export default function CreateStorePage() {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();
  const { data: templatesData, isLoading: templatesLoading } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", category: "general", plan: "free", selectedTemplateId: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornoland.com";
  const previewUrl = form.slug ? `${form.slug}.localhost:3002` : "...";

  const updateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setForm((f) => ({ ...f, name, slug }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.slug || form.slug.length < 2) errs.slug = "Slug must be at least 2 characters";
    if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Slug must be lowercase alphanumeric with hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((step + 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      const payload: Record<string, unknown> = {
        name: form.name, slug: form.slug, description: form.description,
        category: form.category, plan: form.plan
      };
      if (form.selectedTemplateId) payload.selectedTemplateId = form.selectedTemplateId;

      const result = await createStore(payload as any).unwrap();
      const storeId = result?.data?.store?._id;
      if (storeId) setCreatedStoreId(storeId);
      toast.success("Store created successfully!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to create store");
    }
  };

  const steps = [
    { num: 1, label: "Details", icon: Store },
    { num: 2, label: "Template", icon: Palette },
    { num: 3, label: "Launch", icon: Globe }
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Create Store</h2>
        <p className="mt-1 text-sm text-zinc-500">Set up a new store in just a few steps.</p>
      </motion.div>

      <div className="flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              step === s.num ? "bg-blue-600 text-white shadow-sm" :
              step > s.num ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-400"
            }`}>
              <s.icon className="h-4 w-4" />
              {s.label}
            </div>
            {i < steps.length - 1 && <div className={`mx-2 h-px w-8 ${step > s.num ? "bg-emerald-400" : "bg-zinc-200"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">Store Details</h3>
            <p className="mt-1 text-sm text-zinc-500">Tell us about your store.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Name</label>
                <input type="text" value={form.name} onChange={(e) => updateSlug(e.target.value)}
                  placeholder="My Shop" autoFocus
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Slug / Subdomain</label>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="myshop" className="h-10 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none" />
                  <span className="text-xs text-zinc-400">.{rootDomain}</span>
                </div>
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
                {form.slug && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                    <Globe className="h-3 w-3" /> Dev: <span className="font-medium">{form.slug}.localhost:3002</span>
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell us about your store..." rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                  {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Plan</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <button key={plan.value} type="button" onClick={() => setForm((f) => ({ ...f, plan: plan.value }))}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        form.plan === plan.value ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-zinc-200 hover:border-zinc-300"
                      }`}>
                      {form.plan === plan.value && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <p className="text-lg font-bold text-zinc-900">{plan.price}<span className="text-sm font-normal text-zinc-400">/mo</span></p>
                      <p className="mt-1 font-medium text-zinc-900">{plan.label}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{plan.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleNext} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Choose a Template</h3>
              <p className="mt-1 text-sm text-zinc-500">Pick a starting template for your store. You can change this later.</p>
            </div>

            {templatesLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-100" />)}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, selectedTemplateId: "" }))}
                  className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-6 text-left transition-all hover:shadow-md ${
                    !form.selectedTemplateId ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-200 hover:border-zinc-300"
                  }`}>
                  <div className="flex h-24 items-center justify-center rounded-xl bg-zinc-50">
                    <Palette className="h-10 w-10 text-zinc-300" />
                  </div>
                  <h4 className="mt-4 font-semibold text-zinc-900">Blank Store</h4>
                  <p className="mt-1 text-xs text-zinc-500">Start from scratch with default theme.</p>
                </button>
                {templates.map((tmpl) => {
                  const isSelected = form.selectedTemplateId === tmpl._id;
                  return (
                    <button key={tmpl._id} onClick={() => setForm((f) => ({ ...f, selectedTemplateId: tmpl._id }))}
                      className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all hover:shadow-md ${
                        isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-200 hover:border-zinc-300"
                      }`}>
                      {isSelected && (
                        <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex aspect-video items-center justify-center rounded-t-2xl bg-gradient-to-br from-blue-600 to-indigo-700">
                        <span className="text-3xl font-bold text-white/70">{tmpl.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-zinc-900">{tmpl.name}</h4>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{tmpl.category}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2">{tmpl.description || "No description"}</p>
                        {tmpl.theme && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: tmpl.theme.primaryColor }} />
                            <span className="text-[10px] text-zinc-400">{tmpl.theme.font}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-zinc-600 transition-colors hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={handleSubmit} disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Store"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-zinc-900">Store Created!</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Your store <span className="font-semibold text-zinc-900">{form.name}</span> is ready.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
              <Globe className="h-4 w-4" /> {previewUrl}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => router.push("/dashboard/stores")}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                Go to My Stores
              </button>
              <button onClick={() => router.push(`/dashboard/stores/${createdStoreId}`)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Store Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
