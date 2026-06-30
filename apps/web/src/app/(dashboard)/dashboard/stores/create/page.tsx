"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { toast } from "sonner";
import { Sparkles, Check, ArrowLeft, ArrowRight, Store, Globe, Palette, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";

const plans = [
  { value: "free", label: "Free", desc: "1 store, basic features", price: "$0" },
  { value: "starter", label: "Starter", desc: "3 stores, advanced features", price: "$29" },
  { value: "growth", label: "Growth", desc: "10 stores, premium features", price: "$99" },
  { value: "enterprise", label: "Enterprise", desc: "Unlimited, everything included", price: "$299" },
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
    name: "",
    slug: "",
    description: "",
    category: "ecommerce",
    plan: "free",
    selectedTemplateId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornoland.com";
  const previewUrl = form.slug ? `${form.slug}.localhost:3000` : "...";

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
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        plan: form.plan,
      };
      if (form.selectedTemplateId) payload.selectedTemplateId = form.selectedTemplateId;

      const result = await createStore(payload as Parameters<typeof createStore>[0]).unwrap();
      const storeId = result?.data?.store?._id;
      if (storeId) setCreatedStoreId(storeId);
      toast.success("Store created successfully!");
      setStep(3);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to create store");
    }
  };

  const steps = [
    { num: 1, label: "Details", icon: Store },
    { num: 2, label: "Template", icon: Palette },
    { num: 3, label: "Launch", icon: Globe },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Create Store" description="Set up a new store in just a few steps." />

      <div className="flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                step === s.num
                  ? "bg-zinc-900 text-white shadow-sm"
                  : step > s.num
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-400"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-px w-8 ${step > s.num ? "bg-emerald-400" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-zinc-900">Store Details</h3>
            <p className="mt-1 text-sm text-zinc-500">Tell us about your store.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateSlug(e.target.value)}
                  placeholder="My Shop"
                  autoFocus
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Slug / Subdomain</label>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-500/20">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="myshop"
                    className="h-10 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400">.{rootDomain}</span>
                </div>
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell us about your store..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Plan</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, plan: plan.value }))}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        form.plan === plan.value
                          ? "border-zinc-900 bg-zinc-50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <p className="text-lg font-bold text-zinc-900">
                        {plan.price}
                        <span className="text-sm font-normal text-zinc-400">/mo</span>
                      </p>
                      <p className="mt-1 font-medium text-zinc-900">{plan.label}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{plan.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Choose a Template</h3>
              <p className="mt-1 text-sm text-zinc-500">Pick a starting template for your store.</p>
            </div>

            {templatesLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, selectedTemplateId: "" }))}
                  className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-6 text-left transition-all hover:shadow-md ${
                    !form.selectedTemplateId ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex h-24 items-center justify-center rounded-xl bg-zinc-50">
                    <Palette className="h-10 w-10 text-zinc-300" />
                  </div>
                  <h4 className="mt-4 font-semibold text-zinc-900">Blank Store</h4>
                  <p className="mt-1 text-xs text-zinc-500">Start from scratch with default theme.</p>
                </button>
                {templates.map((tmpl) => {
                  const isSelected = form.selectedTemplateId === tmpl._id;
                  return (
                    <button
                      key={tmpl._id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, selectedTemplateId: tmpl._id }))}
                      className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all hover:shadow-md ${
                        isSelected ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex aspect-video items-center justify-center rounded-t-2xl bg-gradient-to-br from-zinc-800 to-zinc-950">
                        <span className="text-3xl font-bold text-white/70">
                          {tmpl.name
                            .split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-zinc-900">{tmpl.name}</h4>
                        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{tmpl.description || "No description"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Store"
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-zinc-900">Store Created!</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Your store <span className="font-semibold text-zinc-900">{form.name}</span> is ready with a 3-day trial.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
              <Globe className="h-4 w-4" /> {previewUrl}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/stores")}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Go to My Stores
              </button>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/stores/${createdStoreId}`)}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Store Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
