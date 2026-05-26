"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/redux/api/store-settings-api";
import type { StoreSettings } from "@/redux/api/store-settings-api";
import { setStoreSettings } from "@/redux/slices/store-settings-slice";
import { toast } from "sonner";
import {
  Store, Globe, DollarSign, Calendar, Clock, Languages,
  Save, Loader2, RefreshCw, CheckCircle, ChevronDown, ToggleLeft, ToggleRight
} from "lucide-react";

const currencyOptions = [
  { value: "USD", label: "USD ($)", symbol: "$", locale: "en-US", decimal: 2, position: "before" },
  { value: "BDT", label: "BDT (\u09f3)", symbol: "\u09f3", locale: "bn-BD", decimal: 0, position: "before" },
  { value: "EUR", label: "EUR (\u20ac)", symbol: "\u20ac", locale: "de-DE", decimal: 2, position: "before" },
  { value: "GBP", label: "GBP (\u00a3)", symbol: "\u00a3", locale: "en-GB", decimal: 2, position: "before" },
  { value: "INR", label: "INR (\u20b9)", symbol: "\u20b9", locale: "en-IN", decimal: 2, position: "before" },
];

const dateFormatOptions = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const timezoneOptions = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (BST, +06:00)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, +05:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, +04:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, +08:00)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, +09:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST/NZDT)" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla / Bengali" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

function Select({ value, onChange, options, label }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { currentStoreId, currentStore, stores, selectStore, clearStore } = useCurrentStore();

  const { data: settingsData, isLoading: settingsLoading, refetch } = useGetStoreSettingsQuery(currentStoreId, { skip: !currentStoreId });
  const [updateSettings, { isLoading: saving }] = useUpdateStoreSettingsMutation();

  const dbSettings = settingsData?.data?.settings;

  const [currencyCode, setCurrencyCode] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [taxRate, setTaxRate] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxIncluded, setTaxIncluded] = useState(false);

  useEffect(() => {
    if (dbSettings) {
      setCurrencyCode(dbSettings.currencyCode ?? "USD");
      setDateFormat(dbSettings.dateFormat ?? "MM/DD/YYYY");
      setTimezone(dbSettings.timezone ?? "UTC");
      setLanguage(dbSettings.language ?? "en");
      setTaxRate(dbSettings.taxRate ?? 0);
      setTaxEnabled(dbSettings.taxEnabled ?? false);
      setTaxIncluded(dbSettings.taxIncluded ?? false);
    }
  }, [dbSettings]);

  const hasChanges = useCallback(() => {
    if (!dbSettings) return true;
    return (
      currencyCode !== dbSettings.currencyCode ||
      dateFormat !== (dbSettings.dateFormat ?? "MM/DD/YYYY") ||
      timezone !== (dbSettings.timezone ?? "UTC") ||
      language !== (dbSettings.language ?? "en") ||
      taxRate !== (dbSettings.taxRate ?? 0) ||
      taxEnabled !== (dbSettings.taxEnabled ?? false) ||
      taxIncluded !== (dbSettings.taxIncluded ?? false)
    );
  }, [dbSettings, currencyCode, dateFormat, timezone, language, taxRate, taxEnabled, taxIncluded]);

  const handleSave = async () => {
    if (!currentStoreId) return;
    const cur = currencyOptions.find((c) => c.value === currencyCode);
    try {
      await updateSettings({
        storeId: currentStoreId,
        data: {
          currencyCode: currencyCode as StoreSettings["currencyCode"],
          currencySymbol: cur?.symbol ?? "$",
          currencyPosition: (cur?.position ?? "before") as "before" | "after",
          locale: cur?.locale ?? "en-US",
          decimalPlaces: cur?.decimal ?? 2,
          dateFormat,
          timezone,
          language,
          taxRate,
          taxEnabled,
          taxIncluded,
        },
      }).unwrap();
      dispatch(setStoreSettings({
        currencyCode: currencyCode as "USD" | "BDT" | "EUR" | "GBP" | "INR",
        currencySymbol: cur?.symbol ?? "$",
        currencyPosition: (cur?.position ?? "before") as "before" | "after",
        locale: cur?.locale ?? "en-US",
        decimalPlaces: cur?.decimal ?? 2,
        taxRate,
        taxEnabled,
        taxIncluded,
        dateFormat,
        timezone,
        language,
      }));
      toast.success("Settings saved successfully");
      refetch();
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (!currentStoreId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Store Settings</h2>
            <p className="mt-1 text-sm text-zinc-500">Configure your store preferences, currency, and localization.</p>
          </div>
        </div>
        {stores.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Store className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store to configure settings.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s, i) => (
              <motion.button key={s._id} onClick={() => selectStore(s)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.bornoland.com</p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Store Settings</h2>
            <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{currentStore?.name}</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Configure your store preferences, currency, and localization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => clearStore()} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            <Store className="h-4 w-4" /> Change Store
          </button>
          <button
            onClick={handleSave}
            disabled={saving || settingsLoading || !hasChanges()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Settings Content */}
      {settingsLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-20 animate-pulse rounded-xl bg-zinc-100" />
                <div className="h-20 animate-pulse rounded-xl bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Currency Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Currency</h3>
                <p className="text-sm text-zinc-500">Set the currency for your storefront pricing.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Currency</label>
                <Select value={currencyCode} onChange={setCurrencyCode} options={currencyOptions.map((c) => ({ value: c.value, label: c.label }))} label="Currency" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Preview</label>
                <div className="flex h-10 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-600">
                  {(() => {
                    const cur = currencyOptions.find((c) => c.value === currencyCode);
                    if (!cur) return "$100.00";
                    const formatted = new Intl.NumberFormat(cur.locale, { minimumFractionDigits: cur.decimal, maximumFractionDigits: cur.decimal }).format(1234.56);
                    return cur.position === "after" ? `${formatted} ${cur.symbol}` : `${cur.symbol}${formatted}`;
                  })()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Localization Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Localization</h3>
                <p className="text-sm text-zinc-500">Configure date format, timezone, and language preferences.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Date Format
                </label>
                <Select value={dateFormat} onChange={setDateFormat} options={dateFormatOptions} label="Date Format" />
                <p className="text-xs text-zinc-400">Preview: {(() => {
                  const d = new Date();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  const yyyy = d.getFullYear();
                  switch (dateFormat) {
                    case "DD/MM/YYYY": return `${dd}/${mm}/${yyyy}`;
                    case "YYYY-MM-DD": return `${yyyy}-${mm}-${dd}`;
                    default: return `${mm}/${dd}/${yyyy}`;
                  }
                })()}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" /> Timezone
                </label>
                <Select value={timezone} onChange={setTimezone} options={timezoneOptions} label="Timezone" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-zinc-400" /> Language
                </label>
                <Select value={language} onChange={setLanguage} options={languageOptions} label="Language" />
              </div>
            </div>
          </motion.div>

          {/* Tax & Checkout Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Checkout & Tax</h3>
                <p className="text-sm text-zinc-500">Configure tax rate applied to orders.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  taxEnabled ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {taxEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {taxEnabled ? "Tax Enabled" : "Tax Disabled"}
              </button>
            </div>

            {taxEnabled && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Tax Rate (%)</label>
                  <input type="number" min="0" max="100" step="0.01" value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-xs text-zinc-400">Applied as a percentage to the order subtotal.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Tax Inclusion</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTaxIncluded(false)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        !taxIncluded ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      Tax Excluded
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxIncluded(true)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        taxIncluded ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      Tax Included
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {taxIncluded
                      ? "Prices already include tax. No extra tax added at checkout."
                      : "Tax is added on top of the subtotal at checkout."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
