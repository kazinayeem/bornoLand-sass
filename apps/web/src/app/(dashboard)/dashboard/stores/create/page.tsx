"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/redux/api/store-api";
import { toast } from "sonner";
import { Loader2, Store } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { STORE_TRIAL_DAYS } from "@/lib/store-types";
import { getRootDomain } from "@/lib/urls";

export default function CreateStorePage() {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSlug = (val: string) => {
    setName(val);
    const s = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setSlug(s);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name || name.length < 2) errs.name = "Name must be at least 2 characters";
    if (!slug || slug.length < 2) errs.slug = "Slug must be at least 2 characters";
    if (!/^[a-z0-9-]+$/.test(slug)) errs.slug = "Slug must be lowercase alphanumeric with hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createStore({
        name,
        slug,
        description,
        category: "ecommerce",
        storeType: "ecommerce",
        plan: "free",
      }).unwrap();
      const storeSlug = result?.data?.store?.slug ?? slug;
      toast.success(`"${name}" created with a ${STORE_TRIAL_DAYS}-day trial!`);
      router.push(`/store/${storeSlug}/dashboard`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Failed to create store");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Create Store"
        description={`Launch your store with a ${STORE_TRIAL_DAYS}-day free trial.`}
      />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Store Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => updateSlug(e.target.value)}
              placeholder="My Shop"
              className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Subdomain</label>
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-500/20">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="myshop"
                className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
              />
              <span className="text-xs text-apple-ink-muted-48">.{getRootDomain()}</span>
            </div>
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-apple-ink-muted-80">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does your store sell?"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/stores")}
            className="text-sm text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              <><Store className="h-4 w-4" /> Create Store</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
