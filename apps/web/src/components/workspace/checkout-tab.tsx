"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreSettingsQuery, useUpdateStoreSettingsMutation,
} from "@/redux/api/store-settings-api";
import {
  ShoppingCart, Loader2, Check, X, ToggleLeft, ToggleRight,
  Users, Lock, DollarSign, Percent, Settings2,
} from "lucide-react";
import { toast } from "sonner";

import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";

type CheckoutTabProps = { storeId: string };

export function CheckoutTab({ storeId }: CheckoutTabProps) {
  const { data, isLoading } = useGetStoreSettingsQuery(storeId);
  const [updateStoreSettings] = useUpdateStoreSettingsMutation();

  const settings = data?.data?.settings;

  const [guestCheckout, setGuestCheckout] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const s = settings as any;
      setGuestCheckout(s.guestCheckoutEnabled ?? s.guestCheckout ?? true);
      setRequireLogin(s.requireLoginEnabled ?? s.requireLogin ?? false);
      setCodEnabled(s.paymentSettings?.codEnabled ?? s.codEnabled ?? s.cashOnDelivery ?? true);
      setAutoConfirm(s.autoConfirmOrders ?? s.autoConfirm ?? false);
      setMinOrderAmount(s.minimumOrderAmount ?? s.minOrderAmount ?? 0);
      setTaxRate(settings.taxRate ?? 0);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettings({
        storeId,
        data: {
          guestCheckoutEnabled: guestCheckout,
          guestCheckout,
          requireLoginEnabled: requireLogin,
          requireLogin,
          paymentSettings: {
            ...((settings as any)?.paymentSettings || {}),
            codEnabled,
          },
          codEnabled,
          cashOnDelivery: codEnabled,
          autoConfirmOrders: autoConfirm,
          autoConfirm,
          minimumOrderAmount: Number(minOrderAmount) || 0,
          minOrderAmount: Number(minOrderAmount) || 0,
          taxRate: Number(taxRate) || 0,
          taxEnabled: Number(taxRate) > 0,
        } as any,
      }).unwrap();

      try {
        await revalidateStorefrontForStore({ _id: storeId }, { scope: "all" });
      } catch {}

      toast.success("Checkout settings saved successfully");
    } catch {
      toast.error("Failed to save checkout settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }


  const Toggle = ({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between rounded-xl border border-apple-hairline p-4">
      <div>
        <p className="text-sm font-medium text-apple-ink">{label}</p>
        <p className="text-xs text-apple-ink-muted-48">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-zinc-200"}`}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-ink">Checkout Preferences</h3>
            <p className="text-sm text-apple-ink-muted-48">Configure how customers check out.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Toggle value={guestCheckout} onChange={setGuestCheckout}
            label="Guest Checkout" desc="Allow customers to checkout without an account." />
          <Toggle value={requireLogin} onChange={setRequireLogin}
            label="Require Login" desc="Customers must log in before checking out." />
          <Toggle value={codEnabled} onChange={setCodEnabled}
            label="Cash on Delivery" desc="Enable COD as a payment option." />
          <Toggle value={autoConfirm} onChange={setAutoConfirm}
            label="Auto Confirm Orders" desc="Automatically confirm new orders." />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-apple-lg border border-apple-hairline bg-white p-6 ">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <DollarSign className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-ink">Order Rules</h3>
            <p className="text-sm text-apple-ink-muted-48">Minimum amounts and tax configuration.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">Minimum Order Amount (BDT)</label>
            <input type="number" min={0} value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-apple-ink-muted-80">Tax Rate (%)</label>
            <input type="number" min={0} max={100} step="0.1" value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-apple-hairline bg-white px-3 text-sm" />
          </div>
        </div>
      </motion.div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-apple-ink-muted-80 disabled:opacity-50 transition-colors">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Save Checkout Settings
      </button>
    </div>
  );
}
