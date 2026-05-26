"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, PencilLine, Store, Image as ImageIcon, Globe, Shield, CreditCard, ToggleLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from "@/redux/api/admin-api";
import {
  useCreateHomepageSliderMutation,
  useDeleteHomepageSliderMutation,
  useGetHomepageSlidersQuery,
  useGetStoreSettingsQuery,
  useUpdateHomepageSliderMutation,
  useUpdateStoreSettingsMutation
} from "@/redux/api/store-settings-api";

type CurrencyFormData = {
  currencyCode: "USD" | "BDT" | "EUR" | "GBP" | "INR";
  currencySymbol: string;
  currencyPosition: "before" | "after";
  locale: string;
  decimalPlaces: number;
  taxRate: number;
};

type SliderFormData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
  isActive: boolean;
  overlayColor: string;
  textAlignment: "left" | "center" | "right";
};

const defaultCurrencyForm: CurrencyFormData = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "before",
  locale: "en-US",
  decimalPlaces: 2,
  taxRate: 0
};

const defaultSliderForm: SliderFormData = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  sortOrder: 0,
  isActive: true,
  overlayColor: "rgba(15, 23, 42, 0.45)",
  textAlignment: "left"
};

export default function SettingsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const { data: platformData } = useGetPlatformSettingsQuery();
  const [updatePlatform, { isLoading: savingPlatform }] = useUpdatePlatformSettingsMutation();
  const platformSettings = platformData?.data?.settings ?? {};

  const [platformForm, setPlatformForm] = useState<Record<string, any>>({});
  useEffect(() => {
    if (Object.keys(platformSettings).length > 0 && Object.keys(platformForm).length === 0) {
      setPlatformForm(platformSettings);
    }
  }, [platformSettings]);

  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const selectedStore = useMemo(() => stores.find((store) => store._id === selectedStoreId) ?? null, [stores, selectedStoreId]);
  const { data: settingsData } = useGetStoreSettingsQuery(selectedStoreId, { skip: !selectedStoreId });
  const { data: slidersData } = useGetHomepageSlidersQuery(selectedStoreId, { skip: !selectedStoreId });
  const [updateSettings, { isLoading: savingSettings }] = useUpdateStoreSettingsMutation();
  const [createSlider, { isLoading: creatingSlider }] = useCreateHomepageSliderMutation();
  const [updateSlider, { isLoading: updatingSlider }] = useUpdateHomepageSliderMutation();
  const [deleteSlider, { isLoading: deletingSlider }] = useDeleteHomepageSliderMutation();

  const [currencyForm, setCurrencyForm] = useState(defaultCurrencyForm);
  const [sliderForm, setSliderForm] = useState(defaultSliderForm);
  const [editingSliderId, setEditingSliderId] = useState("");

  useEffect(() => {
    if (!selectedStoreId && stores.length > 0) {
      setSelectedStoreId(stores[0]._id);
    }
  }, [stores, selectedStoreId]);

  useEffect(() => {
    const settings = settingsData?.data?.settings;
    if (settings) {
      setCurrencyForm({
        currencyCode: settings.currencyCode,
        currencySymbol: settings.currencySymbol,
        currencyPosition: settings.currencyPosition,
        locale: settings.locale,
        decimalPlaces: settings.decimalPlaces,
        taxRate: settings.taxRate
      });
    }
  }, [settingsData]);

  const sliders = slidersData?.data?.sliders ?? [];

  const resetSliderForm = () => {
    setSliderForm(defaultSliderForm);
    setEditingSliderId("");
  };

  const handleEditSlider = (slider: typeof sliders[number]) => {
    setEditingSliderId(slider._id);
    setSliderForm({
      title: slider.title,
      subtitle: slider.subtitle,
      imageUrl: slider.imageUrl,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      sortOrder: slider.sortOrder,
      isActive: slider.isActive,
      overlayColor: slider.overlayColor,
      textAlignment: slider.textAlignment
    });
  };

  const handleSaveSettings = async () => {
    if (!selectedStoreId) return;
    try {
      await updateSettings({ storeId: selectedStoreId, data: currencyForm }).unwrap();
      toast.success("Currency settings saved");
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to save settings");
    }
  };

  const handleSaveSlider = async () => {
    if (!selectedStoreId) return;
    try {
      if (editingSliderId) {
        await updateSlider({ storeId: selectedStoreId, sliderId: editingSliderId, data: sliderForm }).unwrap();
        toast.success("Slider updated");
      } else {
        await createSlider({ storeId: selectedStoreId, data: sliderForm }).unwrap();
        toast.success("Slider created");
      }
      resetSliderForm();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to save slider");
    }
  };

  const handleSavePlatform = async () => {
    try {
      await updatePlatform(platformForm).unwrap();
      toast.success("Platform settings saved");
    } catch {
      toast.error("Failed to save platform settings");
    }
  };

  const handleDeleteSlider = async (sliderId: string) => {
    if (!selectedStoreId) return;
    try {
      await deleteSlider({ storeId: selectedStoreId, sliderId }).unwrap();
      toast.success("Slider deleted");
      if (editingSliderId === sliderId) resetSliderForm();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to delete slider");
    }
  };

  if (stores.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <Store className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
        <p className="mt-2 text-sm text-zinc-500">Create a store first so currency and homepage sliders can be managed here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage platform settings and store-specific configuration.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <Globe className="h-5 w-5 text-blue-600" /> Platform Settings
            </CardTitle>
            <Button onClick={handleSavePlatform} disabled={savingPlatform} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Platform Name</label>
                <input value={platformForm.platformName ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, platformName: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Logo URL</label>
                <input value={platformForm.platformLogo ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, platformLogo: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Trial Days</label>
                <input type="number" min={0} value={platformForm.trialDays ?? 14} onChange={(e) => setPlatformForm((p) => ({ ...p, trialDays: Number(e.target.value) }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Platform Fee (%)</label>
                <input type="number" min={0} max={100} step={0.1} value={platformForm.platformFeePercent ?? 0} onChange={(e) => setPlatformForm((p) => ({ ...p, platformFeePercent: Number(e.target.value) }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Currency</label>
                <select value={platformForm.currencyCode ?? "BDT"} onChange={(e) => setPlatformForm((p) => ({ ...p, currencyCode: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Currency Symbol</label>
                <input value={platformForm.currencySymbol ?? "৳"} onChange={(e) => setPlatformForm((p) => ({ ...p, currencySymbol: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-zinc-700 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Methods</h4>
              <div className="flex flex-wrap gap-6">
                {["bkash", "nagad", "cod"].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!platformForm.enabledPaymentMethods?.[method]} onChange={(e) =>
                      setPlatformForm((p) => ({ ...p, enabledPaymentMethods: { ...(p.enabledPaymentMethods || {}), [method]: e.target.checked } }))
                    } className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-zinc-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-zinc-700 flex items-center gap-2"><Shield className="h-4 w-4" /> Maintenance</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <button onClick={() => setPlatformForm((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${platformForm.maintenanceMode ? "bg-red-500" : "bg-zinc-300"}`}>
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${platformForm.maintenanceMode ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-zinc-700">Enable Maintenance Mode</span>
              </label>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-zinc-700">SMTP Settings</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">SMTP Host</label>
                  <input value={platformForm.smtpHost ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpHost: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">SMTP Port</label>
                  <input type="number" value={platformForm.smtpPort ?? 587} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpPort: Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">SMTP User</label>
                  <input value={platformForm.smtpUser ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpUser: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">SMTP Password</label>
                  <input type="password" value={platformForm.smtpPass ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpPass: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">From Email</label>
                  <input value={platformForm.smtpFromEmail ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpFromEmail: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">From Name</label>
                  <input value={platformForm.smtpFromName ?? ""} onChange={(e) => setPlatformForm((p) => ({ ...p, smtpFromName: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-[240px]">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Store Settings</label>
          <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Select a store...</option>
            {stores.map((store) => <option key={store._id} value={store._id}>{store.name}</option>)}
          </select>
        </div>
      </div>

      {selectedStoreId && (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold text-zinc-900">Currency Settings</CardTitle>
              <Button onClick={handleSaveSettings} disabled={savingSettings} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Currency Code</label>
                <select value={currencyForm.currencyCode} onChange={(event) => setCurrencyForm((current) => ({ ...current, currencyCode: event.target.value as typeof defaultCurrencyForm.currencyCode }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                  <option value="USD">USD</option>
                  <option value="BDT">BDT</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Currency Symbol</label>
                <input value={currencyForm.currencySymbol} onChange={(event) => setCurrencyForm((current) => ({ ...current, currencySymbol: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Symbol Position</label>
                <select value={currencyForm.currencyPosition} onChange={(event) => setCurrencyForm((current) => ({ ...current, currencyPosition: event.target.value as typeof defaultCurrencyForm.currencyPosition }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                  <option value="before">Before price</option>
                  <option value="after">After price</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Locale</label>
                <input value={currencyForm.locale} onChange={(event) => setCurrencyForm((current) => ({ ...current, locale: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Decimal Places</label>
                <input type="number" min={0} max={4} value={currencyForm.decimalPlaces} onChange={(event) => setCurrencyForm((current) => ({ ...current, decimalPlaces: Number(event.target.value) }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Tax Rate %</label>
                <input type="number" min={0} max={100} value={currencyForm.taxRate} onChange={(event) => setCurrencyForm((current) => ({ ...current, taxRate: Number(event.target.value) }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold text-zinc-900">Homepage Slider</CardTitle>
              <Button onClick={handleSaveSlider} disabled={creatingSlider || updatingSlider} className="gap-2"><Plus className="h-4 w-4" /> {editingSliderId ? "Update" : "Add"}</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Title</label>
                  <input value={sliderForm.title} onChange={(event) => setSliderForm((current) => ({ ...current, title: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Subtitle</label>
                  <textarea value={sliderForm.subtitle} onChange={(event) => setSliderForm((current) => ({ ...current, subtitle: event.target.value }))} rows={3} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Image URL</label>
                  <input value={sliderForm.imageUrl} onChange={(event) => setSliderForm((current) => ({ ...current, imageUrl: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Button Text</label>
                    <input value={sliderForm.buttonText} onChange={(event) => setSliderForm((current) => ({ ...current, buttonText: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Button Link</label>
                    <input value={sliderForm.buttonLink} onChange={(event) => setSliderForm((current) => ({ ...current, buttonLink: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Sort Order</label>
                    <input type="number" min={0} value={sliderForm.sortOrder} onChange={(event) => setSliderForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Text Alignment</label>
                    <select value={sliderForm.textAlignment} onChange={(event) => setSliderForm((current) => ({ ...current, textAlignment: event.target.value as typeof sliderForm.textAlignment }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">Active</label>
                    <select value={sliderForm.isActive ? "yes" : "no"} onChange={(event) => setSliderForm((current) => ({ ...current, isActive: event.target.value === "yes" }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Overlay Color</label>
                  <input value={sliderForm.overlayColor} onChange={(event) => setSliderForm((current) => ({ ...current, overlayColor: event.target.value }))} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={resetSliderForm} className="gap-2"><ImageIcon className="h-4 w-4" /> Reset</Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {sliders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">No homepage sliders yet. Add the first banner above.</div>
                ) : sliders.map((slider) => (
                  <div key={slider._id} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                    <img src={slider.imageUrl} alt={slider.title} className="h-16 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-900">{slider.title}</p>
                      <p className="line-clamp-2 text-sm text-zinc-500">{slider.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditSlider(slider)} className="rounded-lg p-2 text-zinc-400 hover:bg-blue-50 hover:text-blue-600"><PencilLine className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteSlider(slider._id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}
    </div>
  );
}
