"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGetCmsPageQuery, useSaveCmsPageMutation } from "@/redux/api/cms-api";
import { Store, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { HelpCircle, Truck, RotateCcw, Ruler, Mail, Shield, FileText, Info } from "lucide-react";
import RichTextEditor from "@/components/cms/rich-text-editor";
import { useCurrentStore } from "@/hooks/use-current-store";

const pageMeta: Record<string, { label: string; icon: typeof HelpCircle; description: string }> = {
  faq: { label: "FAQ", icon: HelpCircle, description: "Frequently asked questions about your store." },
  "shipping-info": { label: "Shipping Info", icon: Truck, description: "Shipping options, delivery times, and costs." },
  returns: { label: "Returns Policy", icon: RotateCcw, description: "Return and exchange policy information." },
  "size-guide": { label: "Size Guide", icon: Ruler, description: "Size measurements and fit information." },
  "contact-us": { label: "Contact Us", icon: Mail, description: "Contact information and customer support." },
  "privacy-policy": { label: "Privacy Policy", icon: Shield, description: "Data collection, usage, and protection." },
  "terms-conditions": { label: "Terms & Conditions", icon: FileText, description: "Store terms of service." },
  "about-us": { label: "About Us", icon: Info, description: "Your store story, mission, and values." },
};

function CmsPageEditor() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const params = useParams();
  const slug = params.slug as string;
  const meta = pageMeta[slug] ?? { label: slug, icon: FileText, description: "Edit page content." };
  const Icon = meta.icon;

  const { currentStoreId, stores, selectStore, clearStore } = useCurrentStore();

  const { data: pageData, isLoading: pageLoading } = useGetCmsPageQuery(
    { storeId: currentStoreId, slug },
    { skip: !currentStoreId }
  );
  const [savePage, { isLoading: saving }] = useSaveCmsPageMutation();

  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title ?? "");
      setHtmlContent(pageData.html ?? "");
      setSeoTitle(pageData.seoTitle ?? "");
      setSeoDescription(pageData.seoDescription ?? "");
      setOgImage(pageData.ogImage ?? "");
      setPublished(pageData.published ?? false);
    }
  }, [pageData]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
      </div>
    );
  }

  if (!currentStoreId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{meta.label}</h2>
          <p className="mt-1 text-sm text-zinc-500">{meta.description}</p>
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
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
                {s.name[0]}
              </div>
              <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
              <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await savePage({
        storeId: currentStoreId,
        slug,
        data: { title, html: htmlContent, seoTitle, seoDescription, ogImage, published },
      }).unwrap();
      toast.success("Page saved successfully");
    } catch (err) {
      console.error("Failed to save CMS page:", err);
      const msg = (err as any)?.data?.message || (err as any)?.message || "Failed to save page";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{meta.label}</h2>
            <p className="text-sm text-zinc-500">{meta.description}</p>
          </div>
          <span className="rounded-lg bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
            {stores.find((s) => s._id === currentStoreId)?.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearStore}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <Store className="h-4 w-4" /> Change Store
          </button>
          <button
            onClick={handleSave}
            disabled={saving || pageLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {pageLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
          ))}
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Content</h3>
                <p className="text-sm text-zinc-500">Edit the page title and body content.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter page title"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Content</label>
              <RichTextEditor
                key={slug}
                content={htmlContent}
                onChange={setHtmlContent}
                placeholder="Start writing..."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Publishing</h3>
                <p className="text-sm text-zinc-500">Control page visibility.</p>
              </div>
            </div>

            <button
              onClick={() => setPublished(!published)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                published
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {published ? "Published" : "Draft"}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">SEO Settings</h3>
                <p className="text-sm text-zinc-500">Optimize this page for search engines.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder={title}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">OG Image URL</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Brief description for search results..."
              />
            </div>
          </motion.div>
          </>
        )}
    </div>
  );
}

export default function CmsPageEditorWrapper() {
  return (
    <Suspense fallback={null}>
      <CmsPageEditor />
    </Suspense>
  );
}
