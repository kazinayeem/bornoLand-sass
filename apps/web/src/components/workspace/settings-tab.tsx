"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreSettingsQuery, useUpdateStoreSettingsMutation,
} from "@/redux/api/store-settings-api";
import { Loader2, Check, DollarSign, Globe, Clock } from "lucide-react";
import { toast } from "sonner";

type SettingsTabProps = { storeId: string };

export function SettingsTab({ storeId }: SettingsTabProps) {
  const { data, isLoading } = useGetStoreSettingsQuery(storeId);
  const [updateStoreSettings] = useUpdateStoreSettingsMutation();

  const settings = data?.data?.settings;

  const [currencyCode, setCurrencyCode] = useState<string>("BDT");
  const [currencySymbol, setCurrencySymbol] = useState("৳");
  const [currencyPosition, setCurrencyPosition] = useState<"before" | "after">("before");
  const [locale, setLocale] = useState("bn-BD");
  const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (settings) {
      setCurrencyCode(settings.currencyCode || "BDT");
      setCurrencySymbol(settings.currencySymbol || "৳");
      setCurrencyPosition(settings.currencyPosition || "before");
      setLocale(settings.locale || "bn-BD");
      setDecimalPlaces(settings.decimalPlaces ?? 0);
      setTaxRate(settings.taxRate ?? 0);
      setDateFormat(settings.dateFormat || "MM/DD/YYYY");
      setTimezone(settings.timezone || "UTC");
      setLanguage(settings.language || "en");
    }
  });

  const handleCurrencyChange = (code: string) => {
    setCurrencyCode(code);
    if (code === "BDT") {
      setCurrencySymbol("৳");
      setLocale("bn-BD");
      setDecimalPlaces(0);
    } else if (code === "USD") {
      setCurrencySymbol("$");
      setLocale("en-US");
      setDecimalPlaces(2);
    } else if (code === "EUR") {
      setCurrencySymbol("€");
      setLocale("de-DE");
      setDecimalPlaces(2);
    } else if (code === "INR") {
      setCurrencySymbol("₹");
      setLocale("en-IN");
      setDecimalPlaces(0);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettings({
        storeId,
        data: {
          currencyCode: currencyCode as "USD" | "BDT" | "EUR" | "INR",
          currencySymbol, currencyPosition, locale, decimalPlaces, taxRate,
          dateFormat, timezone, language,
        },
      }).unwrap();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Currency</h3>
            <p className="text-sm text-zinc-500">Manage store currency and localization.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Currency Code</label>
            <select value={currencyCode} onChange={(e) => handleCurrencyChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Symbol</label>
            <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Position</label>
            <select value={currencyPosition} onChange={(e) => setCurrencyPosition(e.target.value as "before" | "after")}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="before">Before ({currencySymbol}100)</option>
              <option value="after">After (100{currencySymbol})</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Decimal Places</label>
            <input type="number" min={0} max={4} value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-zinc-50">
          <p className="text-xs text-zinc-500">Preview:</p>
          <p className="text-xl font-bold text-zinc-900">
            {currencyPosition === "before" ? `${currencySymbol}1,234${decimalPlaces > 0 ? "." + "0".repeat(decimalPlaces) : ""}` : `1,234${decimalPlaces > 0 ? "." + "0".repeat(decimalPlaces) : ""}${currencySymbol}`}
          </p>
        </div>
      </motion.div>

      {/* Localization */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Localization</h3>
            <p className="text-sm text-zinc-500">Date format, timezone, and language settings.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Date Format</label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Asia/Dhaka (BST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tax */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Tax</h3>
            <p className="text-sm text-zinc-500">Default tax rate for products.</p>
          </div>
        </div>
        <div className="max-w-xs">
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">Tax Rate (%)</label>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={100} step="0.1" value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
            <span className="text-sm text-zinc-400">%</span>
          </div>
        </div>
      </motion.div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Save Settings
      </button>
    </div>
  );
}
