"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/redux/api/store-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Store } from "lucide-react";

const plans = [
  { value: "free", label: "Free", desc: "1 store, basic features", price: "$0" },
  { value: "starter", label: "Starter", desc: "3 stores, advanced features", price: "$29" },
  { value: "growth", label: "Growth", desc: "10 stores, premium features", price: "$99" },
  { value: "enterprise", label: "Enterprise", desc: "Unlimited, everything included", price: "$299" }
];

export default function CreateStorePage() {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "general", plan: "free" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setForm((f) => ({ ...f, name, slug }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.slug || form.slug.length < 2) errs.slug = "Slug must be at least 2 characters";
    if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Slug must be lowercase alphanumeric with hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createStore(form).unwrap();
      toast.success("Store created successfully!");
      router.push("/dashboard/stores");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to create store");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Create Store</h2>
        <p className="mt-1 text-sm text-zinc-500">Set up a new store for your brand.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Store Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Name</label>
              <input type="text" value={form.name} onChange={(e) => updateSlug(e.target.value)}
                placeholder="My Shop" className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store Slug / Subdomain</label>
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20">
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="myshop" className="h-10 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none" />
                <span className="text-sm text-zinc-400">.bornoland.com</span>
              </div>
              {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
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
                <option value="general">General</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="saas">SaaS</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Select Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <button key={plan.value} type="button" onClick={() => setForm((f) => ({ ...f, plan: plan.value }))}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    form.plan === plan.value
                      ? "border-blue-500 bg-blue-50/50 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300"
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
          </CardContent>
        </Card>

        <button type="submit" disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? "Creating..." : "Create Store"}
        </button>
      </form>
    </div>
  );
}
