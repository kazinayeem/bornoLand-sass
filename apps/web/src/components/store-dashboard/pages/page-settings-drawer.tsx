"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Search, Settings, Globe, Code, Lock, Eye, EyeOff, Image, Link } from "lucide-react";
import { useUpdateStorePageMutation } from "@/redux/api/store-page-api";
import type { StorePage, StorePageSeo, StorePageSettings } from "@/redux/api/store-page-api";
import { cn } from "@/lib/utils";

type Props = {
  page: StorePage;
  storeId: string;
  onClose: () => void;
};

type SettingsTab = "seo" | "og" | "custom-code" | "visibility" | "advanced";

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof Search }> = [
  { id: "seo", label: "SEO", icon: Search },
  { id: "og", label: "Social", icon: Image },
  { id: "custom-code", label: "Custom Code", icon: Code },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "advanced", label: "Advanced", icon: Settings },
];

export function PageSettingsDrawer({ page, storeId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("seo");
  const [updatePage, { isLoading }] = useUpdateStorePageMutation();

  const [seo, setSeo] = useState<StorePageSeo>(page.seo ?? {});
  const [settings, setSettings] = useState<StorePageSettings>(page.settings ?? {});
  const [visibility, setVisibility] = useState(page.visibility);
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description ?? "");

  useEffect(() => {
    setSeo(page.seo ?? {});
    setSettings(page.settings ?? {});
    setVisibility(page.visibility);
    setTitle(page.title);
    setDescription(page.description ?? "");
  }, [page]);

  const handleSave = async () => {
    await updatePage({
      id: page._id,
      storeId,
      data: {
        title,
        description,
        visibility,
        seo,
        settings,
      },
    }).unwrap();
    onClose();
  };

  const inputClass = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400";
  const labelClass = "block text-xs font-medium text-zinc-500 mb-1";
  const sectionClass = "space-y-4";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white shadow-2xl border-l border-zinc-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Page Settings</h2>
            <p className="text-xs text-zinc-400">{page.title} — /{page.slug}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-100 px-6">
          <nav className="-mb-px flex gap-4 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "whitespace-nowrap border-b-2 px-1 pb-3 pt-4 text-xs font-medium transition-colors inline-flex items-center gap-1.5",
                    activeTab === tab.id
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* General (always visible) */}
          <div className={sectionClass}>
            <div>
              <label className={labelClass}>Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className={sectionClass}>
              <div>
                <label className={labelClass}>SEO Title</label>
                <input
                  type="text"
                  value={seo.title ?? ""}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  className={inputClass}
                  placeholder={title}
                />
              </div>
              <div>
                <label className={labelClass}>SEO Description</label>
                <textarea
                  value={seo.description ?? ""}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  rows={3}
                  className={inputClass}
                  placeholder="Brief description for search results"
                />
              </div>
              <div>
                <label className={labelClass}>Canonical URL</label>
                <input
                  type="url"
                  value={seo.canonicalUrl ?? ""}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://example.com/page"
                />
              </div>
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={seo.noIndex ?? false}
                  onChange={(e) => setSeo({ ...seo, noIndex: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-sm text-zinc-700">No Index — hide from search engines</span>
              </label>
            </div>
          )}

          {/* OG Tab */}
          {activeTab === "og" && (
            <div className={sectionClass}>
              <div>
                <label className={labelClass}>Open Graph Title</label>
                <input
                  type="text"
                  value={seo.ogTitle ?? ""}
                  onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                  className={inputClass}
                  placeholder={title}
                />
              </div>
              <div>
                <label className={labelClass}>Open Graph Description</label>
                <textarea
                  value={seo.ogDescription ?? ""}
                  onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Social Image (OG Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seo.ogImage ?? ""}
                    onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>OG Type</label>
                <select
                  value={seo.ogType ?? "website"}
                  onChange={(e) => setSeo({ ...seo, ogType: e.target.value })}
                  className={inputClass}
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Twitter Card</label>
                <select
                  value={seo.twitterCard ?? "summary_large_image"}
                  onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}
                  className={inputClass}
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
          )}

          {/* Custom Code Tab */}
          {activeTab === "custom-code" && (
            <div className={sectionClass}>
              <div>
                <label className={labelClass}>Custom CSS</label>
                <textarea
                  value={settings.customCss ?? ""}
                  onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="/* Add custom CSS for this page */"
                />
              </div>
              <div>
                <label className={labelClass}>Custom JavaScript</label>
                <textarea
                  value={settings.customJs ?? ""}
                  onChange={(e) => setSettings({ ...settings, customJs: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="// Add custom JavaScript for this page"
                />
              </div>
            </div>
          )}

          {/* Visibility Tab */}
          {activeTab === "visibility" && (
            <div className={sectionClass}>
              <div>
                <label className={labelClass}>Page Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "visible", label: "Visible", desc: "Anyone can view", icon: Globe },
                    { value: "hidden", label: "Hidden", desc: "Only with direct link", icon: EyeOff },
                    { value: "password", label: "Password", desc: "Requires password", icon: Lock },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isActive = visibility === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setVisibility(opt.value as StorePage["visibility"])}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all",
                          isActive
                            ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-[10px] text-zinc-400">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {visibility === "password" && (
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="text"
                    value={settings.password ?? ""}
                    onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                    className={inputClass}
                    placeholder="Enter page password"
                  />
                </div>
              )}
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className={sectionClass}>
              <div>
                <label className={labelClass}>Redirect URL</label>
                <input
                  type="url"
                  value={settings.redirectUrl ?? ""}
                  onChange={(e) => setSettings({ ...settings, redirectUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://example.com/redirect"
                />
              </div>
              <div>
                <label className={labelClass}>Redirect Type</label>
                <select
                  value={settings.redirectType ?? "none"}
                  onChange={(e) => setSettings({ ...settings, redirectType: e.target.value as "301" | "302" | "none" })}
                  className={inputClass}
                >
                  <option value="none">No Redirect</option>
                  <option value="301">301 — Permanent</option>
                  <option value="302">302 — Temporary</option>
                </select>
              </div>
              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={settings.showHeader !== false}
                    onChange={(e) => setSettings({ ...settings, showHeader: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Show Header</span>
                </label>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={settings.showFooter !== false}
                    onChange={(e) => setSettings({ ...settings, showFooter: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Show Footer</span>
                </label>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={settings.transparentHeader ?? false}
                    onChange={(e) => setSettings({ ...settings, transparentHeader: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Transparent Header</span>
                </label>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={settings.stickyHeader ?? false}
                    onChange={(e) => setSettings({ ...settings, stickyHeader: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Sticky Header</span>
                </label>
              </div>
              <div>
                <label className={labelClass}>Layout Style</label>
                <select
                  value={settings.layoutStyle ?? "default"}
                  onChange={(e) => setSettings({ ...settings, layoutStyle: e.target.value as StorePageSettings["layoutStyle"] })}
                  className={inputClass}
                >
                  <option value="default">Default</option>
                  <option value="full-width">Full Width</option>
                  <option value="sidebar">With Sidebar</option>
                  <option value="landing">Landing Page</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-100 bg-white px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
