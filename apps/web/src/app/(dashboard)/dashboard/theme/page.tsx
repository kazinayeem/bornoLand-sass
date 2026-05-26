"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import type { Store } from "@/redux/api/store-api";
import { toast } from "sonner";
import { Palette, Check, Loader2, X } from "lucide-react";

const fonts = ["Inter", "Roboto", "Open Sans", "Poppins", "Playfair Display", "Space Grotesk"];
const buttonStyles = [
  { value: "rounded-sm", label: "Sharp" },
  { value: "rounded-lg", label: "Rounded" },
  { value: "rounded-2xl", label: "Pill" }
];
const navbarStyles = ["fixed", "static", "sticky"];
const layoutWidths = ["960px", "1140px", "1200px", "1320px", "100%"];

export default function ThemePage() {
  const { currentStoreId, currentStore, stores, selectStore, clearStore } = useCurrentStore();

  const [changeTheme, { isLoading }] = useChangeStoreThemeMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];

  const [theme, setTheme] = useState<Store["theme"]>({ primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (currentStoreId) {
      const s = stores.find((st) => st._id === currentStoreId);
      if (s) {
        setTheme(s.theme);
        setSelectedTemplate(typeof s.selectedTemplateId === "object" ? s.selectedTemplateId._id : "");
        setSaved(true);
      }
    }
  }, [currentStoreId, stores]);

  const handleSave = async () => {
    if (!currentStoreId || !theme) return;
    try {
      await changeTheme({
        id: currentStoreId,
        data: {
          templateId: selectedTemplate || undefined,
          theme
        }
      }).unwrap();
      toast.success("Theme saved");
      setSaved(true);
    } catch {
      toast.error("Failed to save theme");
    }
  };

  if (!currentStoreId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Theme</h2>
            <p className="mt-1 text-sm text-zinc-500">Customize the look and feel of your store.</p>
          </div>
        </div>
        {stores.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Palette className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store first to customize its theme.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <button key={s._id} onClick={() => { selectStore(s); }}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.bornoland.com</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Theme</h2>
            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{currentStore?.name}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Customize your store appearance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => clearStore()} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50">Change Store</button>
          <button onClick={handleSave} disabled={isLoading || saved}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {theme && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Template</h3>
              <select value={selectedTemplate} onChange={(e) => { setSelectedTemplate(e.target.value); setSaved(false); }}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                <option value="">Current template</option>
                {templates.filter((t) => t._id !== selectedTemplate).map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Colors</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.primaryColor}
                      onChange={(e) => { setTheme((t) => ({ ...t, primaryColor: e.target.value })); setSaved(false); }}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5" />
                    <input type="text" value={theme.primaryColor}
                      onChange={(e) => { setTheme((t) => ({ ...t, primaryColor: e.target.value })); setSaved(false); }}
                      className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.secondaryColor}
                      onChange={(e) => { setTheme((t) => ({ ...t, secondaryColor: e.target.value })); setSaved(false); }}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5" />
                    <input type="text" value={theme.secondaryColor}
                      onChange={(e) => { setTheme((t) => ({ ...t, secondaryColor: e.target.value })); setSaved(false); }}
                      className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Typography</h3>
              <select value={theme.font} onChange={(e) => { setTheme((t) => ({ ...t, font: e.target.value })); setSaved(false); }}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Button Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {buttonStyles.map((s) => (
                  <button key={s.value} onClick={() => { setTheme((t) => ({ ...t, buttonStyle: s.value })); setSaved(false); }}
                    className={`rounded-xl border-2 py-2 text-xs font-medium transition-all ${theme.buttonStyle === s.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Navbar Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {navbarStyles.map((s) => (
                  <button key={s} onClick={() => { setTheme((t) => ({ ...t, navbarStyle: s })); setSaved(false); }}
                    className={`rounded-xl border-2 py-2 text-xs font-medium capitalize transition-all ${theme.navbarStyle === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Layout</h3>
              <select value={theme.layoutWidth} onChange={(e) => { setTheme((t) => ({ ...t, layoutWidth: e.target.value })); setSaved(false); }}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                {layoutWidths.map((w) => <option key={w} value={w}>{w === "100%" ? "Full Width" : w}</option>)}
              </select>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Dark Mode</h3>
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Enable Dark Mode</p>
                  <p className="text-xs text-zinc-400">Switch between light and dark theme</p>
                </div>
                <button onClick={() => { setTheme((t) => ({ ...t, darkMode: !t.darkMode })); setSaved(false); }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${theme.darkMode ? "bg-blue-600" : "bg-zinc-200"}`}>
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${theme.darkMode ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-zinc-900">Preview</h3>
              <div className="overflow-hidden rounded-xl border border-zinc-200" style={{ backgroundColor: theme.darkMode ? "#09090b" : "#ffffff" }}>
                <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: theme.darkMode ? "#18181b" : "#f4f4f5", borderBottom: "1px solid", borderColor: theme.darkMode ? "#27272a" : "#e4e4e7" }}>
                  <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>Store Name</span>
                  <div className="flex items-center gap-4 text-xs" style={{ color: theme.darkMode ? "#a1a1aa" : "#71717a" }}>
                    <span>Home</span>
                    <span>Shop</span>
                    <span>About</span>
                    <span className="rounded-lg px-2 py-1 text-white text-xs" style={{ backgroundColor: theme.primaryColor }}>Cart</span>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <h2 className="text-xl font-bold" style={{ color: theme.darkMode ? "#fafafa" : "#18181b" }}>Welcome to Your Store</h2>
                  <p className="mt-2 text-sm" style={{ color: theme.darkMode ? "#a1a1aa" : "#71717a" }}>Your products will appear here</p>
                  <button className="mt-4 px-6 py-2 text-sm font-medium text-white" style={{ borderRadius: theme.buttonStyle, backgroundColor: theme.primaryColor }}>
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
