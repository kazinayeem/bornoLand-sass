"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetStoreQuery, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { Palette, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type ThemeTabProps = { storeId: string };

export function ThemeTab({ storeId }: ThemeTabProps) {
  const { data, isLoading } = useGetStoreQuery(storeId);
  const { data: templatesData } = useGetTemplatesQuery();
  const [changeTheme] = useChangeStoreThemeMutation();
  const templates = templatesData?.data?.templates ?? [];
  const store = data?.data?.store;

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [font, setFont] = useState("Inter");
  const [buttonStyle, setButtonStyle] = useState("rounded-lg");
  const [layoutWidth, setLayoutWidth] = useState("1200px");
  const [navbarStyle, setNavbarStyle] = useState("fixed");
  const [darkMode, setDarkMode] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store?.theme) {
      setPrimaryColor(store.theme.primaryColor || "#2563eb");
      setSecondaryColor(store.theme.secondaryColor || "#0f172a");
      setFont(store.theme.font || "Inter");
      setButtonStyle(store.theme.buttonStyle || "rounded-lg");
      setLayoutWidth(store.theme.layoutWidth || "1200px");
      setNavbarStyle(store.theme.navbarStyle || "fixed");
      setDarkMode(store.theme.darkMode || false);
    }
    if (store?.selectedTemplateId && typeof store.selectedTemplateId === "object") {
      setTemplateId(store.selectedTemplateId._id);
    }
  }, [store]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await changeTheme({
        id: storeId,
        data: {
          templateId: templateId || undefined,
          theme: { primaryColor, secondaryColor, font, buttonStyle, layoutWidth, darkMode, navbarStyle },
        },
      }).unwrap();
      toast.success("Theme updated");
    } catch {
      toast.error("Failed to update theme");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {/* Template */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Template</h3>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
            className="h-10 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 text-sm">
            <option value="">Current template</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Colors */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Colors</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-white p-1 cursor-pointer" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-white p-1 cursor-pointer" />
                <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-mono" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Typography & Layout */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Typography & Layout</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Font</label>
              <select value={font} onChange={(e) => setFont(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                {["Inter", "Roboto", "Open Sans", "Poppins", "Playfair Display", "Space Grotesk", "Montserrat"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Button Style</label>
              <select value={buttonStyle} onChange={(e) => setButtonStyle(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                <option value="rounded-lg">Rounded</option>
                <option value="rounded-full">Pill</option>
                <option value="rounded-none">Square</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Layout Width</label>
              <select value={layoutWidth} onChange={(e) => setLayoutWidth(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                <option value="1000px">Narrow (1000px)</option>
                <option value="1200px">Standard (1200px)</option>
                <option value="1400px">Wide (1400px)</option>
                <option value="100%">Full Width</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Navbar Style</label>
              <select value={navbarStyle} onChange={(e) => setNavbarStyle(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                <option value="fixed">Fixed</option>
                <option value="sticky">Sticky</option>
                <option value="static">Static</option>
                <option value="floating">Floating</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Dark Mode */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Dark Mode</h3>
              <p className="text-sm text-zinc-500">Enable dark mode for your storefront.</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                darkMode ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
              }`}>
              {darkMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {darkMode ? "On" : "Off"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Preview</h3>
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-zinc-200" />
                <div className="h-3 w-24 rounded" style={{ backgroundColor: primaryColor }} />
              </div>
              <div className="h-3 w-full rounded" style={{ backgroundColor: secondaryColor }} />
              <div className="h-3 w-3/4 rounded bg-zinc-200" />
              <button className="h-8 w-full text-xs font-semibold text-white" style={{ backgroundColor: primaryColor, borderRadius: buttonStyle === "rounded-full" ? "999px" : buttonStyle === "rounded-none" ? "0" : "8px" }}>
                Shop Now
              </button>
              <p className="text-[10px] text-zinc-400" style={{ fontFamily: font }}>Preview with {font} font</p>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Theme
        </button>
      </div>
    </div>
  );
}
