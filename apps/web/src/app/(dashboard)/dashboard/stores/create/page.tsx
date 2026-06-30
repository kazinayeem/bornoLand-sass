"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { toast } from "sonner";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Store,
  Globe,
  Palette,
  Loader2,
  Lock,
  ShoppingBag,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { STORE_TYPES, STORE_TRIAL_DAYS, type StoreTypeId } from "@/lib/store-types";
import { Badge } from "@/components/ui/badge";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ecommerce: ShoppingBag,
  portfolio: Briefcase,
  lms: GraduationCap,
  agency: Briefcase,
  restaurant: Store,
  booking: Store,
  digital_products: Store,
  real_estate: Store,
  blog: Store,
  hospital: Store,
  school: GraduationCap,
  marketplace: ShoppingBag,
};

type Step = 1 | 2 | 3 | 4;

export default function CreateStorePage() {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();
  const { data: templatesData, isLoading: templatesLoading } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    storeType: "ecommerce" as StoreTypeId,
    name: "",
    slug: "",
    description: "",
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

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.slug || form.slug.length < 2) errs.slug = "Slug must be at least 2 characters";
    if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Slug must be lowercase alphanumeric with hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      const selected = STORE_TYPES.find((t) => t.id === form.storeType);
      if (!selected?.enabled) {
        toast.error("This store type is not available yet");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2 && !validateStep2()) return;
    if (step === 2) setStep(3);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.storeType,
        storeType: form.storeType,
        plan: "free",
        ...(form.selectedTemplateId ? { selectedTemplateId: form.selectedTemplateId } : {}),
      };

      const result = await createStore(payload).unwrap();
      const storeId = result?.data?.store?._id;
      if (storeId) setCreatedStoreId(storeId);
      toast.success("Store created with 3-day trial!");
      setStep(4);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to create store");
    }
  };

  const steps = [
    { num: 1, label: "Type" },
    { num: 2, label: "Details" },
    { num: 3, label: "Confirm" },
    { num: 4, label: "Done" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Create Store"
        description={`Choose a store type, configure details, and launch with a ${STORE_TRIAL_DAYS}-day trial.`}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                step === s.num
                  ? "bg-zinc-900 text-white shadow-sm"
                  : step > s.num
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-px w-6 sm:w-10 ${step > s.num ? "bg-emerald-400" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Choose Store Type</h3>
              <p className="mt-1 text-sm text-zinc-500">Only Ecommerce is available today. More builders are coming soon.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STORE_TYPES.map((type) => {
                const Icon = typeIcons[type.id] ?? Store;
                const selected = form.storeType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={!type.enabled}
                    onClick={() => type.enabled && setForm((f) => ({ ...f, storeType: type.id }))}
                    className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                      !type.enabled
                        ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-70"
                        : selected
                          ? "border-zinc-900 bg-zinc-50 shadow-sm"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                    }`}
                  >
                    {!type.enabled && (
                      <Badge variant="default" className="absolute right-3 top-3">
                        Coming Soon
                      </Badge>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                      {type.enabled ? <Icon className="h-5 w-5 text-zinc-700" /> : <Lock className="h-5 w-5 text-zinc-400" />}
                    </div>
                    <h4 className="mt-3 font-semibold text-zinc-900">{type.label}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{type.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Store Information</h3>
              <p className="mt-1 text-sm text-zinc-500">Name your store and choose a subdomain.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateSlug(e.target.value)}
                    placeholder="My Shop"
                    className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Subdomain</label>
                  <div className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-500/20">
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="myshop"
                      className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
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
                    rows={3}
                    placeholder="What does your store sell?"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">Theme Template</h3>
              <p className="mt-1 text-sm text-zinc-500">Optional starting template for your storefront.</p>
              {templatesLoading ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-100" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, selectedTemplateId: "" }))}
                    className={`rounded-xl border-2 p-4 text-left ${
                      !form.selectedTemplateId ? "border-zinc-900" : "border-zinc-200"
                    }`}
                  >
                    <Palette className="h-6 w-6 text-zinc-400" />
                    <p className="mt-2 font-medium text-zinc-900">Blank Store</p>
                  </button>
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl._id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, selectedTemplateId: tmpl._id }))}
                      className={`rounded-xl border-2 p-4 text-left ${
                        form.selectedTemplateId === tmpl._id ? "border-zinc-900" : "border-zinc-200"
                      }`}
                    >
                      <p className="font-medium text-zinc-900">{tmpl.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-sm text-zinc-600">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-zinc-900">Confirm & Create</h3>
            <p className="mt-1 text-sm text-zinc-500">Review your store details before launching.</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
                <dt className="text-zinc-500">Store Type</dt>
                <dd className="font-medium text-zinc-900">
                  {STORE_TYPES.find((t) => t.id === form.storeType)?.label}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium text-zinc-900">{form.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
                <dt className="text-zinc-500">Subdomain</dt>
                <dd className="font-medium text-zinc-900">{form.slug}.{rootDomain}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Trial</dt>
                <dd className="font-medium text-emerald-700">{STORE_TRIAL_DAYS}-day free trial</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-sm text-zinc-600">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
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

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-zinc-900">Store Created</h3>
            <p className="mt-2 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">{form.name}</span> is active with a {STORE_TRIAL_DAYS}-day trial.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
              <Globe className="h-4 w-4" /> {previewUrl}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/stores")}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                All Stores
              </button>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/stores/${createdStoreId}`)}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Open Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
