import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreSettingsQuery, useUpdateStoreSettingsMutation,
} from "@/redux/api/store-settings-api";
import { Loader2, Check, DollarSign, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, type Language } from "@/providers/language-provider";

type SettingsTabProps = { storeId: string };

export function SettingsTab({ storeId }: SettingsTabProps) {
  const { language: currentGlobalLang, setLanguage: setGlobalLanguage, t } = useLanguage();
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
  const [language, setLanguage] = useState<string>(currentGlobalLang);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setCurrencyCode(settings.currencyCode || "BDT");
      setCurrencySymbol(settings.currencySymbol || "৳");
      setCurrencyPosition(settings.currencyPosition || "before");
      setLocale(settings.locale || "bn-BD");
      setDecimalPlaces(settings.decimalPlaces ?? 0);
      setTaxRate(settings.taxRate ?? 0);
      setDateFormat(settings.dateFormat || "MM/DD/YYYY");
      setTimezone(settings.timezone || "UTC");
      setLanguage(settings.language || currentGlobalLang);
    }
  }, [settings, currentGlobalLang]);

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

  const handleLanguageSelect = (selectedLang: string) => {
    setLanguage(selectedLang);
    if (selectedLang === "en") {
      setGlobalLanguage("en");
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
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-ink">{t.settings.currency.title}</h3>
            <p className="text-sm text-apple-ink-muted-48">{t.settings.currency.subtitle}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.currency.code}</label>
            <select value={currencyCode} onChange={(e) => handleCurrencyChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm">
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.currency.symbol}</label>
            <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.currency.position}</label>
            <select value={currencyPosition} onChange={(e) => setCurrencyPosition(e.target.value as "before" | "after")}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm">
              <option value="before">{t.settings.currency.before}</option>
              <option value="after">{t.settings.currency.after}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.currency.decimalPlaces}</label>
            <input type="number" min={0} max={4} value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm" />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-apple-canvas-parchment">
          <p className="text-xs text-apple-ink-muted-48">{t.settings.currency.preview}</p>
          <p className="text-xl font-bold text-apple-ink font-mono">
            {currencyPosition === "before" ? `${currencySymbol}1,234${decimalPlaces > 0 ? "." + "0".repeat(decimalPlaces) : ""}` : `1,234${decimalPlaces > 0 ? "." + "0".repeat(decimalPlaces) : ""}${currencySymbol}`}
          </p>
        </div>
      </motion.div>

      {/* Localization */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-ink">{t.settings.localization.title}</h3>
            <p className="text-sm text-apple-ink-muted-48">{t.settings.localization.subtitle}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.localization.dateFormat}</label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.localization.timezone}</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm">
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Asia/Dhaka (BST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.localization.language}</label>
            <select value={language} onChange={(e) => handleLanguageSelect(e.target.value)}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm font-semibold">
              <option value="bn">বাংলা (Bengali)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tax */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-ink">{t.settings.tax.title}</h3>
            <p className="text-sm text-apple-ink-muted-48">{t.settings.tax.subtitle}</p>
          </div>
        </div>
        <div className="max-w-xs">
          <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">{t.settings.tax.rate}</label>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={100} step="0.1" value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm" />
            <span className="text-sm text-apple-ink-muted-48">%</span>
          </div>
        </div>
      </motion.div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-apple-ink-muted-80 disabled:opacity-50 transition-colors">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {t.common.save}
      </button>
    </div>
  );
}
